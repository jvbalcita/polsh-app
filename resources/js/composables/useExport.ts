import JSZip from 'jszip';
import { markRaw, ref } from 'vue';
import type Konva from 'konva';
import { usePage } from '@inertiajs/vue3';
import { useEditorStore } from '@/stores/editor';
import type { EditorSettings } from '@/types/editor';
import type { StyleConfig } from '@/types/style';

// ---------------------------------------------------------------------------
// Module-level Konva Stage singleton — written by CanvasStage on mount
// ---------------------------------------------------------------------------
const stageInstance = ref<Konva.Stage | null>(null);

export function registerStage(stage: Konva.Stage): void {
    stageInstance.value = markRaw(stage);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function triggerDownload(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function mimeFromFormat(format: string): string {
    if (format === 'jpeg') return 'image/jpeg';
    if (format === 'webp') return 'image/webp';
    return 'image/png';
}

function extFromFormat(format: string): string {
    return format === 'jpeg' ? 'jpg' : format;
}

function waitFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

// ---------------------------------------------------------------------------
// Session persistence — fire-and-forget after each export
// ---------------------------------------------------------------------------

function saveSession(imageCount: number): void {
    const stage = stageInstance.value;
    const page = usePage();

    // Only save for authenticated users
    if (!stage || !page.props.auth?.user) return;

    const store = useEditorStore();
    const thumbnail = stage.toDataURL({ pixelRatio: 0.25, mimeType: 'image/png' });
    const xsrf = decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');

    fetch('/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrf },
        body: JSON.stringify({
            style_slug: store.activeStyle?.slug ?? '',
            settings: store.settings,
            image_count: imageCount,
            thumbnail_url: thumbnail,
        }),
    }).catch(() => {
        // Fire-and-forget — silently ignore network errors
    });
}

// ---------------------------------------------------------------------------
// SVG builder — produces a true SVG frame with raster screenshot embedded
// ---------------------------------------------------------------------------

const ASPECT_RATIOS: Record<string, number> = {
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '1:1': 1,
    '3:2': 3 / 2,
    '21:9': 21 / 9,
};

const CHROME_HEIGHTS: Record<string, number> = {
    macos: 36,
    browser: 72,
};

function angleToSVGGradient(
    angle: number,
    w: number,
    h: number,
): { x1: number; y1: number; x2: number; y2: number } {
    const rad = ((angle - 90) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const mag = Math.abs(cos * w / 2) + Math.abs(sin * h / 2);
    const cx = w / 2;
    const cy = h / 2;
    const x1 = cx - cos * mag;
    const y1 = cy - sin * mag;
    const x2 = cx + cos * mag;
    const y2 = cy + sin * mag;
    return {
        x1: Math.round((x1 / w) * 100),
        y1: Math.round((y1 / h) * 100),
        x2: Math.round((x2 / w) * 100),
        y2: Math.round((y2 / h) * 100),
    };
}

function hexToRgba(hex: string, opacity: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
}

function borderStrokeColor(style: StyleConfig): string {
    switch (style.border.type) {
        case 'glass':
            return `rgba(255,255,255,${style.border.opacity})`;
        case 'neon':
            return '#a855f7';
        case 'glow':
            return '#06b6d4';
        case 'subtle':
            return `rgba(255,255,255,${style.border.opacity})`;
        default:
            return 'none';
    }
}

function buildSVG(style: StyleConfig, settings: EditorSettings, screenshotSrc: string): string {
    const ratio = ASPECT_RATIOS[settings.aspectRatio] ?? 16 / 9;
    const W = 1920;
    const H = Math.round(W / ratio);
    const chrome = style.chrome ?? null;
    const chromeH = chrome ? (CHROME_HEIGHTS[chrome] ?? 0) : 0;
    const pad = settings.padding;
    const r = settings.radius;
    const bw = settings.borderWidth;
    const strokeColor = style.border.type !== 'none' ? borderStrokeColor(style) : 'none';

    // Content area for the embedded image
    const imgX = pad;
    const imgY = pad + chromeH;
    const imgW = W - pad * 2;
    const imgH = H - pad * 2 - chromeH;

    // Fit screenshot while preserving its aspect ratio
    // (We don't know the screenshot ratio here so we just fill the area — SVG preserveAspectRatio handles it)

    // Background fill
    const bg = style.background;
    let bgFill = '';
    let gradientDef = '';
    if (bg.type === 'solid') {
        bgFill = bg.colors[0];
    } else {
        const pts = angleToSVGGradient(bg.angle, W, H);
        gradientDef = `
  <linearGradient id="bg-grad" gradientUnits="userSpaceOnUse"
    x1="${pts.x1}%" y1="${pts.y1}%" x2="${pts.x2}%" y2="${pts.y2}%">
    <stop offset="0%" stop-color="${bg.colors[0]}"/>
    <stop offset="100%" stop-color="${bg.colors[1]}"/>
  </linearGradient>`;
        bgFill = 'url(#bg-grad)';
    }

    // Shadow filter
    const shadow = style.shadow;
    const sBlur = settings.shadowBlur;
    const sOpacity = settings.shadowOpacity;
    const sOffsetY = settings.shadowOffsetY;
    const shadowDef = sOpacity > 0 ? `
  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="${sOffsetY}" stdDeviation="${sBlur / 2}"
      flood-color="${shadow.color}" flood-opacity="${sOpacity}"/>
  </filter>` : '';

    const shadowAttr = sOpacity > 0 ? ' filter="url(#shadow)"' : '';

    // macOS chrome dots
    const macosDots =
        chrome === 'macos'
            ? `
  <rect x="0" y="0" width="${W}" height="${chromeH}" fill="#2d2d2d"/>
  <circle cx="14" cy="18" r="6" fill="#ff5f57"/>
  <circle cx="34" cy="18" r="6" fill="#febc2e"/>
  <circle cx="54" cy="18" r="6" fill="#28c840"/>`
            : '';

    // Browser chrome
    const browserChrome =
        chrome === 'browser'
            ? (() => {
                const urlBoxW = Math.min(400, W * 0.3);
                return `
  <rect x="0" y="0" width="${W}" height="36" fill="#1a1a1a"/>
  <rect x="76" y="6" width="200" height="30" rx="6" fill="#2d2d2d"/>
  <rect x="0" y="36" width="${W}" height="36" fill="#2d2d2d"/>
  <rect x="${(W - urlBoxW) / 2}" y="44" width="${urlBoxW}" height="20" rx="10" fill="#1a1a1a"/>
  <circle cx="14" cy="18" r="5" fill="#ff5f57"/>
  <circle cx="30" cy="18" r="5" fill="#febc2e"/>
  <circle cx="46" cy="18" r="5" fill="#28c840"/>`;
            })()
            : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${gradientDef}${shadowDef}
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" rx="${r}" fill="${bgFill}"${shadowAttr}/>

  <!-- Chrome -->
  <g clip-path="url(#card-clip)">
    <clipPath id="card-clip">
      <rect width="${W}" height="${H}" rx="${r}"/>
    </clipPath>
    ${macosDots}${browserChrome}

    <!-- Screenshot -->
    <image x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}"
      preserveAspectRatio="xMidYMid meet"
      xlink:href="${screenshotSrc}"/>
  </g>

  <!-- Border -->
  ${strokeColor !== 'none' && bw > 0 ? `<rect x="${bw / 2}" y="${bw / 2}" width="${W - bw}" height="${H - bw}" rx="${r}" fill="none" stroke="${strokeColor}" stroke-width="${bw}"/>` : ''}
</svg>`;
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useExport() {
    const store = useEditorStore();
    const isExporting = ref(false);

    async function exportSingle(
        format: 'png' | 'webp' | 'jpeg',
        scale: 1 | 2 | 4,
    ): Promise<void> {
        const stage = stageInstance.value;
        if (!stage || store.images.length === 0) return;

        const slug = store.activeStyle?.slug ?? 'polsh';
        const ext = extFromFormat(format);

        const dataUrl = stage.toDataURL({
            mimeType: mimeFromFormat(format),
            pixelRatio: scale,
            quality: format === 'jpeg' ? 0.92 : undefined,
        });

        triggerDownload(dataUrl, `polsh-${slug}-01.${ext}`);
        saveSession(1);
    }

    async function exportAll(format: string, scale: number): Promise<void> {
        const stage = stageInstance.value;
        if (!stage || store.images.length === 0) return;

        isExporting.value = true;
        const savedIndex = store.activeIndex;
        const imageCount = store.images.length;
        const zip = new JSZip();
        const ext = extFromFormat(format);

        try {
            for (let i = 0; i < store.images.length; i++) {
                store.setActiveIndex(i);
                // Two rAF passes: Vue reactive update → Konva draw cycle
                await waitFrame();

                const dataUrl = stage.toDataURL({
                    mimeType: mimeFromFormat(format),
                    pixelRatio: scale,
                    quality: format === 'jpeg' ? 0.92 : undefined,
                });

                const base64 = dataUrl.split(',')[1];
                const filename = `polsh-${String(i + 1).padStart(2, '0')}.${ext}`;
                zip.file(filename, base64, { base64: true });
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            triggerDownload(url, 'polsh-export.zip');
            URL.revokeObjectURL(url);
        } finally {
            store.setActiveIndex(savedIndex);
            isExporting.value = false;
            saveSession(imageCount);
        }
    }

    function exportSVG(): void {
        const store2 = useEditorStore();
        const style = store2.activeStyle;
        const image = store2.activeImage;
        if (!style || !image) return;

        const svgString = buildSVG(style, store2.settings, image.src);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `polsh-${style.slug}.svg`);
        URL.revokeObjectURL(url);
        saveSession(1);
    }

    return { exportSingle, exportAll, exportSVG, isExporting };
}
