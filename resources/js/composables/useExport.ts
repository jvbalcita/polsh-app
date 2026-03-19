import { usePage } from '@inertiajs/vue3';
import JSZip from 'jszip';
import type Konva from 'konva';
import { markRaw, ref } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { ImageSettings } from '@/types/editor';
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
    if (format === 'jpeg') {
return 'image/jpeg';
}

    if (format === 'webp') {
return 'image/webp';
}

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

    if (!stage || !page.props.auth?.user) {
return;
}

    const store = useEditorStore();
    const thumbnail = stage.toDataURL({ pixelRatio: 0.25, mimeType: 'image/png' });
    const xsrf = decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');

    fetch('/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrf },
        body: JSON.stringify({
            style_slug: store.activeSettings?.styleSlug ?? '',
            settings: store.activeSettings,
            image_count: imageCount,
            thumbnail_url: thumbnail,
        }),
    }).catch(() => {
        // Fire-and-forget
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
    'macos-dark': 28,
    'macos-light': 28,
    browser: 72,
    terminal: 28,
    'window-minimal': 24,
    'code-editor': 36,
};

function angleToSVGGradient(
    angle: number,
    w: number,
    h: number,
): { x1: number; y1: number; x2: number; y2: number } {
    const rad = ((angle - 90) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const mag = Math.abs((cos * w) / 2) + Math.abs((sin * h) / 2);
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

function borderStrokeColorFromStyle(style: StyleConfig, borderColor: string): string {
    switch (style.border.type) {
        case 'glass':
        case 'subtle':
            return borderColor;
        case 'neon':
            return '#a855f7';
        case 'glow':
            return '#06b6d4';
        default:
            return 'none';
    }
}

function buildSVG(style: StyleConfig, settings: ImageSettings, screenshotSrc: string): string {
    const ratio = ASPECT_RATIOS[settings.aspectRatio] ?? 16 / 9;
    const W = 1920;
    const H = Math.round(W / ratio);
    const chromeH = CHROME_HEIGHTS[settings.frameType] ?? 0;
    const activityBarW = settings.frameType === 'code-editor' ? 40 : 0;
    const pad = settings.padding;
    const r = settings.radius;
    const bw = settings.border;
    const strokeColor = style.border.type !== 'none' ? borderStrokeColorFromStyle(style, settings.borderColor) : 'none';

    const imgX = pad + activityBarW;
    const imgY = pad + chromeH;
    const imgW = W - pad * 2 - activityBarW;
    const imgH = H - pad * 2 - chromeH;

    // Background fill
    let bgFill = '';
    let gradientDef = '';

    if (settings.backgroundType === 'solid') {
        bgFill = settings.solidColor;
    } else if (settings.backgroundType === 'transparent') {
        bgFill = 'transparent';
    } else {
        // gradient
        const pts = angleToSVGGradient(settings.gradientAngle, W, H);
        gradientDef = `
  <linearGradient id="bg-grad" gradientUnits="userSpaceOnUse"
    x1="${pts.x1}%" y1="${pts.y1}%" x2="${pts.x2}%" y2="${pts.y2}%">
    <stop offset="0%" stop-color="${settings.gradientStart}"/>
    <stop offset="100%" stop-color="${settings.gradientEnd}"/>
  </linearGradient>`;
        bgFill = 'url(#bg-grad)';
    }

    const sOpacity = settings.shadow / 100;
    const shadowDef =
        sOpacity > 0
            ? `
  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="4" stdDeviation="${settings.shadowBlur / 2}"
      flood-color="${settings.shadowColor}" flood-opacity="${sOpacity}"/>
  </filter>`
            : '';

    const shadowAttr = sOpacity > 0 ? ' filter="url(#shadow)"' : '';

    // macOS chrome
    const ismacos = settings.frameType === 'macos-dark' || settings.frameType === 'macos-light';
    const macosDots = ismacos
        ? `
  <rect x="0" y="0" width="${W}" height="${chromeH}" fill="${settings.frameType === 'macos-dark' ? '#2d2d2d' : '#e8e8e8'}"/>
  ${settings.frameShowButtons ? `<circle cx="14" cy="14" r="5" fill="#ff5f57"/><circle cx="30" cy="14" r="5" fill="#febc2e"/><circle cx="46" cy="14" r="5" fill="#28c840"/>` : ''}`
        : '';

    // Browser chrome
    const browserChrome =
        settings.frameType === 'browser'
            ? (() => {
                  const urlBoxW = Math.min(400, W * 0.3);

                  return `
  <rect x="0" y="0" width="${W}" height="36" fill="#1a1a1a"/>
  <rect x="76" y="6" width="200" height="30" rx="6" fill="#2d2d2d"/>
  <rect x="0" y="36" width="${W}" height="36" fill="#2d2d2d"/>
  <rect x="${(W - urlBoxW) / 2}" y="44" width="${urlBoxW}" height="20" rx="10" fill="#1a1a1a"/>
  ${settings.frameShowButtons ? `<circle cx="14" cy="18" r="5" fill="#ff5f57"/><circle cx="30" cy="18" r="5" fill="#febc2e"/><circle cx="46" cy="18" r="5" fill="#28c840"/>` : ''}`;
              })()
            : '';

    // Terminal chrome
    const terminalChrome =
        settings.frameType === 'terminal'
            ? `
  <rect x="0" y="0" width="${W}" height="${chromeH}" fill="#1e1e1e"/>
  ${settings.frameShowButtons ? `<circle cx="14" cy="14" r="5" fill="#ff5f57"/><circle cx="30" cy="14" r="5" fill="#febc2e"/><circle cx="46" cy="14" r="5" fill="#28c840"/>` : ''}`
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
    ${macosDots}${browserChrome}${terminalChrome}

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

function trackEvent(name: string): void {
    if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(name);
    }
}

export function useExport() {
    const store = useEditorStore();
    const isExporting = ref(false);

    async function exportSingle(
        format: 'png' | 'webp' | 'jpeg',
        scale: 1 | 2 | 4,
    ): Promise<void> {
        const stage = stageInstance.value;

        if (!stage || store.images.length === 0) {
return;
}

        trackEvent('export_single');

        const slug = store.activeSettings?.styleSlug ?? 'polsh';
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

        if (!stage || store.images.length === 0) {
return;
}

        trackEvent('export_zip');

        isExporting.value = true;
        const savedIndex = store.activeIndex;
        const imageCount = store.images.length;
        const zip = new JSZip();
        const ext = extFromFormat(format);

        try {
            for (let i = 0; i < store.images.length; i++) {
                store.setActiveIndex(i);
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
        const style = store.activeStyle;
        const image = store.activeImage;
        const settings = store.activeSettings;

        if (!style || !image || !settings) {
return;
}

        const svgString = buildSVG(style, settings, image.src);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `polsh-${style.slug}.svg`);
        URL.revokeObjectURL(url);
        saveSession(1);
    }

    return { exportSingle, exportAll, exportSVG, isExporting };
}
