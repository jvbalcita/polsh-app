import { usePage } from '@inertiajs/vue3';
import JSZip from 'jszip';
import type Konva from 'konva';
import { markRaw, ref } from 'vue';
import {
    calculateFrameLayout,
    calculateImagePlacement,
    getDesktopWindowControls,
} from '@/composables/editorPresentation';
import { CANVAS_SIZES } from '@/composables/useCanvas';
import { useEditorStore } from '@/stores/editor';
import type { ImageSettings } from '@/types/editor';
import type { StyleConfig } from '@/types/style';

interface ExportBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

// ---------------------------------------------------------------------------
// Module-level Konva Stage singleton — written by CanvasStage on mount
// ---------------------------------------------------------------------------
const stageInstance = ref<Konva.Stage | null>(null);
const exportBounds = ref<ExportBounds | null>(null);

export function registerStage(stage: Konva.Stage, bounds?: ExportBounds): void {
    stageInstance.value = markRaw(stage);

    if (bounds) {
        exportBounds.value = bounds;
    }
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

function withSquareCardCorners<T>(stage: Konva.Stage, callback: () => T): T {
    type KonvaRect = { cornerRadius: (r?: number) => number | void };
    type KonvaGroup = { clipFunc: (fn?: (() => void) | null) => (() => void) | void };

    const shadow = stage.findOne('.card-shadow') as KonvaRect | undefined;
    const group = stage.findOne('.card-clip-group') as KonvaGroup | undefined;
    const border = stage.findOne('.card-border') as KonvaRect | undefined;

    const origShadowRadius = shadow?.cornerRadius();
    const origClipFunc = group?.clipFunc();
    const origBorderRadius = border?.cornerRadius();

    shadow?.cornerRadius(0);
    group?.clipFunc(null);
    border?.cornerRadius(0);

    try {
        return callback();
    } finally {
        if (origShadowRadius !== undefined) {
            shadow?.cornerRadius(origShadowRadius as number);
        }

        group?.clipFunc(origClipFunc as () => void);

        if (origBorderRadius !== undefined) {
            border?.cornerRadius(origBorderRadius as number);
        }
    }
}

function waitFrame(): Promise<void> {
    return new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
}

function rasterExportConfig(
    format: 'png' | 'webp' | 'jpeg',
    scale: number,
): {
    mimeType: string;
    pixelRatio: number;
    quality?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
} {
    return {
        ...(exportBounds.value ?? {}),
        mimeType: mimeFromFormat(format),
        pixelRatio: scale,
        quality: format === 'jpeg' ? 0.92 : undefined,
    };
}

function withWorkspaceBackgroundHidden<T>(
    stage: { getLayers: () => Array<{ getChildren: () => unknown[] }> },
    callback: () => T,
): T {
    const workspaceBackground = stage.getLayers()[0]?.getChildren()[0] as
        | { visible?: (value: boolean) => void }
        | undefined;

    workspaceBackground?.visible?.(false);

    try {
        return callback();
    } finally {
        workspaceBackground?.visible?.(true);
    }
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
    const thumbnail = withWorkspaceBackgroundHidden(stage, () =>
        stage.toDataURL(rasterExportConfig('png', 0.25)),
    );
    const xsrf = decodeURIComponent(
        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
    );

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

function frameInsetsForSettings(settings: ImageSettings): {
    top: number;
    left: number;
} {
    return {
        top: CHROME_HEIGHTS[settings.frameType] ?? 0,
        left: settings.frameType === 'code-editor' ? 40 : 0,
    };
}

function buildWindowControlsSvg(
    framePlatform: 'macos' | 'windows',
    width: number,
    height: number,
    offsetX: number,
    offsetY: number,
): string {
    const layout = getDesktopWindowControls({
        framePlatform,
        width,
        height,
    });

    if (layout.platform === 'macos') {
        const fills = {
            close: '#ff5f57',
            minimize: '#febc2e',
            maximize: '#28c840',
        } as const;

        return layout.buttons
            .map(
                (button) =>
                    `<circle cx="${offsetX + button.x}" cy="${offsetY + button.y}" r="${button.width / 2}" fill="${fills[button.kind]}"/>`,
            )
            .join('');
    }

    return layout.buttons
        .map((button) => {
            const fill =
                button.kind === 'close'
                    ? 'rgba(232, 70, 88, 0.95)'
                    : 'rgba(255,255,255,0.04)';
            const symbol =
                button.kind === 'minimize'
                    ? `<line x1="${offsetX + button.x + 7}" y1="${offsetY + button.height / 2 + 4}" x2="${offsetX + button.x + button.width - 7}" y2="${offsetY + button.height / 2 + 4}" stroke="rgba(255,255,255,0.78)" stroke-width="1.25"/>`
                    : button.kind === 'maximize'
                      ? `<rect x="${offsetX + button.x + 7}" y="${offsetY + button.height / 2 - 5}" width="${button.width - 14}" height="10" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="1.25"/>`
                      : `<line x1="${offsetX + button.x + 11}" y1="${offsetY + button.height / 2 - 5}" x2="${offsetX + button.x + button.width - 11}" y2="${offsetY + button.height / 2 + 5}" stroke="#ffffff" stroke-width="1.25"/><line x1="${offsetX + button.x + button.width - 11}" y1="${offsetY + button.height / 2 - 5}" x2="${offsetX + button.x + 11}" y2="${offsetY + button.height / 2 + 5}" stroke="#ffffff" stroke-width="1.25"/>`;

            return `<g data-platform="windows" data-window-control="${button.kind}"><rect x="${offsetX + button.x}" y="${offsetY + button.y}" width="${button.width}" height="${button.height}" fill="${fill}"/>${symbol}</g>`;
        })
        .join('');
}

function roundedRectPath(
    x: number,
    y: number,
    width: number,
    height: number,
    corners: {
        topLeft: number;
        topRight: number;
        bottomRight: number;
        bottomLeft: number;
    },
): string {
    const topLeft = Math.min(corners.topLeft, width / 2, height / 2);
    const topRight = Math.min(corners.topRight, width / 2, height / 2);
    const bottomRight = Math.min(corners.bottomRight, width / 2, height / 2);
    const bottomLeft = Math.min(corners.bottomLeft, width / 2, height / 2);

    return [
        `M ${x + topLeft} ${y}`,
        `H ${x + width - topRight}`,
        topRight > 0
            ? `A ${topRight} ${topRight} 0 0 1 ${x + width} ${y + topRight}`
            : `L ${x + width} ${y}`,
        `V ${y + height - bottomRight}`,
        bottomRight > 0
            ? `A ${bottomRight} ${bottomRight} 0 0 1 ${x + width - bottomRight} ${y + height}`
            : `L ${x + width} ${y + height}`,
        `H ${x + bottomLeft}`,
        bottomLeft > 0
            ? `A ${bottomLeft} ${bottomLeft} 0 0 1 ${x} ${y + height - bottomLeft}`
            : `L ${x} ${y + height}`,
        `V ${y + topLeft}`,
        topLeft > 0
            ? `A ${topLeft} ${topLeft} 0 0 1 ${x + topLeft} ${y}`
            : `L ${x} ${y}`,
        'Z',
    ].join(' ');
}

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

function resolveSvgDimensions(settings: ImageSettings): {
    width: number;
    height: number;
} {
    if (settings.canvasSize.startsWith('custom-')) {
        const [width, height] = settings.canvasSize
            .slice(7)
            .split('x')
            .map(Number);

        if (width && height) {
            return { width, height };
        }
    }

    const size = CANVAS_SIZES[settings.canvasSize];

    if (size) {
        return { width: size.w, height: size.h };
    }

    const ratio = ASPECT_RATIOS[settings.aspectRatio] ?? 16 / 9;
    const width = 1920;

    return { width, height: Math.round(width / ratio) };
}

function escapeXml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

function borderStrokeColorFromStyle(
    style: StyleConfig,
    borderColor: string,
): string {
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

function buildSVG(
    style: StyleConfig,
    settings: ImageSettings,
    imageWidth: number,
    imageHeight: number,
    screenshotSrc: string,
): string {
    const { width: cardWidth, height: cardHeight } =
        resolveSvgDimensions(settings);
    const W = cardWidth;
    const H = cardHeight;
    const pad = settings.padding;
    const r = settings.radius;
    const bw = settings.border;
    const strokeColor =
        style.border.type !== 'none'
            ? borderStrokeColorFromStyle(style, settings.borderColor)
            : 'none';
    const hasFrame = settings.frameType !== 'none';
    const artifactRadius = hasFrame ? style.radius : settings.radius;
    const insets = frameInsetsForSettings(settings);
    const frameLayout = hasFrame
        ? calculateFrameLayout({
              areaX: pad,
              areaY: pad,
              areaWidth: Math.max(0, cardWidth - pad * 2),
              areaHeight: Math.max(0, cardHeight - pad * 2),
              imageWidth,
              imageHeight,
              topInset: insets.top,
              leftInset: insets.left,
          })
        : null;
    const frameX = hasFrame ? frameLayout!.frame.x : 0;
    const frameY = hasFrame ? frameLayout!.frame.y : 0;
    const frameWidth = hasFrame ? frameLayout!.frame.width : cardWidth;
    const frameHeight = hasFrame ? frameLayout!.frame.height : cardHeight;
    const visualX = hasFrame ? frameX : 0;
    const visualY = hasFrame ? frameY : 0;
    const visualWidth = hasFrame ? frameWidth : cardWidth;
    const visualHeight = hasFrame ? frameHeight : cardHeight;
    const viewportX = hasFrame ? frameLayout!.viewport.x : pad;
    const viewportY = hasFrame ? frameLayout!.viewport.y : pad;
    const viewportWidth = hasFrame
        ? frameLayout!.viewport.width
        : cardWidth - pad * 2;
    const viewportHeight = hasFrame
        ? frameLayout!.viewport.height
        : cardHeight - pad * 2;
    const viewportRadius = Math.max(0, r - 2);
    const viewportClipPath = roundedRectPath(
        viewportX,
        viewportY,
        viewportWidth,
        viewportHeight,
        {
            topLeft: insets.top > 0 ? 0 : viewportRadius,
            topRight: insets.top > 0 ? 0 : viewportRadius,
            bottomRight: viewportRadius,
            bottomLeft: viewportRadius,
        },
    );
    const imagePlacement = calculateImagePlacement({
        viewportX,
        viewportY,
        viewportWidth,
        viewportHeight,
        imageWidth,
        imageHeight,
        zoom: settings.imageZoom,
        offsetX: settings.imageOffsetX,
        offsetY: settings.imageOffsetY,
    });
    const preserveAspectRatio = imagePlacement.isClipped
        ? 'none'
        : 'xMidYMid meet';

    // Background fill
    let bgFill = '';
    let gradientDef = '';

    if (settings.backgroundType === 'solid') {
        bgFill = settings.solidColor;
    } else if (settings.backgroundType === 'transparent') {
        bgFill = 'transparent';
    } else {
        // gradient
        const pts = angleToSVGGradient(
            settings.gradientAngle,
            cardWidth,
            cardHeight,
        );
        gradientDef = settings.gradientIsRadial
            ? `
  <radialGradient id="bg-grad" gradientUnits="userSpaceOnUse"
    cx="${cardWidth / 2}" cy="${cardHeight / 2}" r="${Math.max(cardWidth, cardHeight) / 2}">
    <stop offset="0%" stop-color="${settings.gradientStart}"/>
    <stop offset="100%" stop-color="${settings.gradientEnd}"/>
  </radialGradient>`
            : `
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

    const borderGlowDef =
        strokeColor !== 'none' &&
        bw > 0 &&
        (style.border.type === 'neon' || style.border.type === 'glow')
            ? `
  <filter id="border-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="0" stdDeviation="${style.border.blur / 2}"
      flood-color="${strokeColor}" flood-opacity="${style.border.opacity}"/>
  </filter>`
            : '';

    const noiseDef =
        settings.noiseGrain > 0
            ? `
  <filter id="noise-filter" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer>
      <feFuncA type="table" tableValues="0 ${Math.min(1, settings.noiseGrain * 2)}"/>
    </feComponentTransfer>
  </filter>`
            : '';

    const shadowAttr = sOpacity > 0 ? ' filter="url(#shadow)"' : '';
    const chromeH = CHROME_HEIGHTS[settings.frameType] ?? 0;

    // macOS chrome
    const ismacos =
        settings.frameType === 'macos-dark' ||
        settings.frameType === 'macos-light';
    const macosDots = ismacos
        ? `
  <rect x="${frameX}" y="${frameY}" width="${frameWidth}" height="${chromeH}" fill="${settings.frameType === 'macos-dark' ? '#2d2d2d' : '#e8e8e8'}"/>
  <line x1="${frameX}" y1="${frameY + 27.5}" x2="${frameX + frameWidth}" y2="${frameY + 27.5}" stroke="${settings.frameType === 'macos-dark' ? '#3a3a3a' : '#d0d0d0'}" stroke-width="1"/>
  ${settings.frameTitle ? `<text x="${frameX + frameWidth / 2}" y="${frameY + 17}" text-anchor="middle" font-size="11" font-family="DM Mono, monospace" fill="${settings.frameType === 'macos-dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}">${escapeXml(settings.frameTitle)}</text>` : ''}
  ${settings.frameShowButtons ? `<circle cx="${frameX + 14}" cy="${frameY + 14}" r="5" fill="#ff5f57"/><circle cx="${frameX + 30}" cy="${frameY + 14}" r="5" fill="#febc2e"/><circle cx="${frameX + 46}" cy="${frameY + 14}" r="5" fill="#28c840"/>` : ''}`
        : '';

    // Browser chrome
    const browserChrome =
        settings.frameType === 'browser'
            ? (() => {
                  const isWindows = settings.framePlatform === 'windows';
                  const urlBoxW = Math.min(260, frameWidth * 0.4);
                  const browserControls = settings.frameShowButtons
                      ? buildWindowControlsSvg(
                            settings.framePlatform,
                            frameWidth,
                            36,
                            frameX,
                            frameY,
                        )
                      : '';
                  const controlsWidth = isWindows
                      ? getDesktopWindowControls({
                            framePlatform: settings.framePlatform,
                            width: frameWidth,
                            height: 36,
                        }).buttons.reduce(
                            (sum, button) => sum + button.width,
                            0,
                        )
                      : 0;
                  const tabX = isWindows ? 18 : 76;
                  const tabWidth = isWindows
                      ? Math.max(
                            74,
                            Math.min(
                                164,
                                frameWidth - controlsWidth - tabX - 12,
                            ),
                        )
                      : 140;

                  return `
  <rect x="${frameX}" y="${frameY}" width="${frameWidth}" height="36" fill="${isWindows ? '#20242d' : '#17181d'}"/>
  <rect x="${frameX + tabX}" y="${frameY + 6}" width="${tabWidth}" height="30" rx="8" fill="${isWindows ? '#313846' : '#2d3038'}"/>
  <text x="${frameX + (isWindows ? tabX + 16 : 92)}" y="${frameY + 24}" font-size="11" fill="${isWindows ? 'rgba(245,248,255,0.68)' : 'rgba(255,255,255,0.46)'}">${escapeXml(settings.frameTitle || 'Tab')}</text>
  <rect x="${frameX}" y="${frameY + 36}" width="${frameWidth}" height="36" fill="${isWindows ? '#2b313c' : '#262932'}"/>
  <rect x="${frameX + (frameWidth - urlBoxW) / 2}" y="${frameY + 44}" width="${urlBoxW}" height="20" rx="10" fill="${isWindows ? '#161b24' : '#14171e'}"/>
  <text x="${frameX + (frameWidth - urlBoxW) / 2 + 12}" y="${frameY + 58}" font-size="10.5" fill="${isWindows ? 'rgba(213,221,235,0.72)' : 'rgba(255,255,255,0.46)'}">${escapeXml(settings.frameUrl || 'example.com')}</text>
  ${browserControls}`;
              })()
            : '';

    // Terminal chrome
    const terminalChrome =
        settings.frameType === 'terminal'
            ? `
  <rect x="${frameX}" y="${frameY}" width="${frameWidth}" height="${chromeH}" fill="${settings.framePlatform === 'windows' ? '#111827' : '#12161d'}"/>
  <line x1="${frameX}" y1="${frameY + 27.5}" x2="${frameX + frameWidth}" y2="${frameY + 27.5}" stroke="${settings.framePlatform === 'windows' ? '#314158' : '#27303b'}" stroke-width="1"/>
  <text x="${frameX + (settings.framePlatform === 'windows' ? 20 : 74)}" y="${frameY + 18}" font-size="9" font-family="DM Mono, monospace" fill="rgba(255,255,255,0.34)">${escapeXml(settings.framePlatform === 'windows' ? 'PS C:\\workspace' : '~/workspace')}</text>
  <text x="${frameX + frameWidth / 2}" y="${frameY + 17}" text-anchor="middle" font-size="11" font-family="DM Mono, monospace" fill="rgba(255,255,255,0.62)">${escapeXml(settings.frameTitle || 'zsh')}</text>
  ${settings.frameShowButtons ? buildWindowControlsSvg(settings.framePlatform, frameWidth, chromeH, frameX, frameY) : ''}`
            : '';

    const minimalWindowChrome =
        settings.frameType === 'window-minimal'
            ? `
  <rect x="${frameX}" y="${frameY}" width="${frameWidth}" height="24" fill="${settings.framePlatform === 'windows' ? '#1b2330' : '#20242b'}"/>
  <line x1="${frameX}" y1="${frameY + 23.5}" x2="${frameX + frameWidth}" y2="${frameY + 23.5}" stroke="${settings.framePlatform === 'windows' ? '#334155' : '#3a404b'}" stroke-width="1"/>
  <text x="${frameX + frameWidth / 2}" y="${frameY + 15}" text-anchor="middle" font-size="10" font-family="DM Mono, monospace" fill="rgba(255,255,255,0.5)">${escapeXml(settings.frameTitle || 'Window')}</text>
  ${settings.frameShowButtons ? buildWindowControlsSvg(settings.framePlatform, frameWidth, 24, frameX, frameY) : ''}`
            : '';

    const codeEditorChrome =
        settings.frameType === 'code-editor'
            ? `
  <rect x="${frameX}" y="${frameY}" width="40" height="${frameHeight}" fill="#1e1e1e"/>
  <line x1="${frameX + 39.5}" y1="${frameY}" x2="${frameX + 39.5}" y2="${frameY + frameHeight}" stroke="#333333" stroke-width="1"/>
  <rect x="${frameX + 40}" y="${frameY}" width="${frameWidth - 40}" height="36" fill="#252526"/>
  <line x1="${frameX + 40}" y1="${frameY + 35.5}" x2="${frameX + frameWidth}" y2="${frameY + 35.5}" stroke="#3c3c3c" stroke-width="1"/>
  <rect x="${frameX + 40}" y="${frameY}" width="140" height="36" fill="#1e1e1e"/>
  <line x1="${frameX + 40}" y1="${frameY}" x2="${frameX + 180}" y2="${frameY}" stroke="#007acc" stroke-width="2"/>
  <text x="${frameX + 52}" y="${frameY + 23}" font-size="11" font-family="DM Mono, monospace" fill="rgba(255,255,255,0.75)">${escapeXml(settings.frameTitle || 'index.ts')}</text>
            `
            : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${gradientDef}${shadowDef}${borderGlowDef}${noiseDef}
  </defs>

  <!-- Background -->
  <rect width="${cardWidth}" height="${cardHeight}" rx="${artifactRadius}" fill="${bgFill}"/>

  <!-- Shadow -->
  <rect x="${visualX}" y="${visualY}" width="${visualWidth}" height="${visualHeight}" rx="${r}" fill="transparent"${shadowAttr}/>

  <!-- Chrome -->
  <g clip-path="url(#card-clip)">
    <clipPath id="card-clip">
      <rect x="${visualX}" y="${visualY}" width="${visualWidth}" height="${visualHeight}" rx="${r}"/>
    </clipPath>

    <!-- Screenshot -->
    <clipPath id="image-clip">
      <path d="${viewportClipPath}"/>
    </clipPath>

    <image x="${imagePlacement.x}" y="${imagePlacement.y}" width="${imagePlacement.width}" height="${imagePlacement.height}"
      clip-path="url(#image-clip)"
      preserveAspectRatio="${preserveAspectRatio}"
      xlink:href="${screenshotSrc}"/>

    ${macosDots}${browserChrome}${terminalChrome}${minimalWindowChrome}${codeEditorChrome}

    ${settings.noiseGrain > 0 ? `<rect x="${visualX}" y="${visualY}" width="${visualWidth}" height="${visualHeight}" rx="${r}" filter="url(#noise-filter)" opacity="${Math.min(1, settings.noiseGrain * 2)}" style="mix-blend-mode: overlay"/>` : ''}
  </g>

  <!-- Border -->
  ${strokeColor !== 'none' && bw > 0 ? `<rect x="${visualX + bw / 2}" y="${visualY + bw / 2}" width="${visualWidth - bw}" height="${visualHeight - bw}" rx="${r}" fill="none" stroke="${strokeColor}" stroke-width="${bw}"${borderGlowDef ? ' filter="url(#border-glow)"' : ''}/>` : ''}
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

        const dataUrl = withWorkspaceBackgroundHidden(stage, () =>
            withSquareCardCorners(stage, () =>
                stage.toDataURL(rasterExportConfig(format, scale)),
            ),
        );

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

                const dataUrl = withWorkspaceBackgroundHidden(stage, () =>
                    withSquareCardCorners(stage, () =>
                        stage.toDataURL(
                            rasterExportConfig(
                                format as 'png' | 'webp' | 'jpeg',
                                scale,
                            ),
                        ),
                    ),
                );

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

        const svgString = buildSVG(
            style,
            settings,
            image.naturalWidth,
            image.naturalHeight,
            image.src,
        );
        const blob = new Blob([svgString], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `polsh-${style.slug}.svg`);
        URL.revokeObjectURL(url);
        saveSession(1);
    }

    return { exportSingle, exportAll, exportSVG, isExporting };
}
