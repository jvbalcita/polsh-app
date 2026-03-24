import { computed } from 'vue';
import type { Ref } from 'vue';
import {
    calculateFrameLayout,
    calculateImagePlacement,
    getDesktopWindowControls,
} from '@/composables/editorPresentation';
import {
    getIPhone15ProFrameConfig,
    getIPhone17ProFrameConfig,
    getIPadProFrameConfig,
    getIPadProM5FrameConfig,
} from '@/composables/useFrameRenderer';
import { useEditorStore } from '@/stores/editor';
import type { StyleConfig } from '@/types/style';

const ASPECT_RATIOS: Record<string, number> = {
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '1:1': 1,
    '3:2': 3 / 2,
    '21:9': 21 / 9,
};

export const CANVAS_SIZES: Record<
    string,
    { label: string; w: number; h: number }
> = {
    'twitter-landscape': { label: 'Twitter', w: 1200, h: 675 },
    'twitter-square': { label: 'Square', w: 1080, h: 1080 },
    linkedin: { label: 'LinkedIn', w: 1200, h: 627 },
    'og-image': { label: 'OG Image', w: 1200, h: 630 },
    dribbble: { label: 'Dribbble', w: 1600, h: 1200 },
    stories: { label: 'Stories', w: 1080, h: 1920 },
    'product-hunt': { label: 'Product Hunt', w: 1270, h: 760 },
    'github-social': { label: 'GitHub Social', w: 1280, h: 640 },
};

const CHROME_HEIGHT_MACOS = 28;
const CHROME_HEIGHT_BROWSER = 72;
const CHROME_HEIGHT_TERMINAL = 28;
const CHROME_HEIGHT_MINIMAL = 24;
const CHROME_HEIGHT_CODE_EDITOR_TAB = 36;
const CHROME_HEIGHT_IPHONE_STATUS = 44;
const CHROME_BOTTOM_IPHONE = 52;
const IPHONE_SIDE_BEZEL = 18;
const CHROME_HEIGHT_IPAD_STATUS = 28;
const CHROME_BOTTOM_IPAD = 32;
const IPAD_SIDE_BEZEL = 16;
const CHROME_HEIGHT_ARC_TOOLBAR = 40;
const ACTIVITY_BAR_WIDTH_ARC = 200;
const DEVICE_FRAME_RADIUS_FACTOR = 0.085;
const CANVAS_MARGIN = 64;

interface CanvasWindowControl {
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    fill: string;
    cornerRadius?: number;
    kind: 'close' | 'maximize' | 'minimize';
}

interface CanvasWindowControlIcon {
    points?: number[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    stroke: string;
    strokeWidth?: number;
    kind: 'close' | 'maximize' | 'minimize';
}

function angleToGradientPoints(
    angle: number,
    width: number,
    height: number,
): { start: { x: number; y: number }; end: { x: number; y: number } } {
    const rad = ((angle - 90) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const mag = Math.abs((cos * width) / 2) + Math.abs((sin * height) / 2);
    const cx = width / 2;
    const cy = height / 2;

    return {
        start: { x: cx - cos * mag, y: cy - sin * mag },
        end: { x: cx + cos * mag, y: cy + sin * mag },
    };
}

export function createNoiseCanvas(intensity: number): HTMLCanvasElement {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = Math.round(intensity * 255);
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas;
}

function getBorderStrokeColor(style: StyleConfig, borderColor: string): string {
    switch (style.border.type) {
        case 'glass':
        case 'subtle':
            return borderColor;
        case 'neon':
            return '#a855f7';
        case 'glow':
            return '#06b6d4';
        default:
            return 'transparent';
    }
}

function chromeHeightForFrame(frameType: string): number {
    if (frameType === 'macos-dark' || frameType === 'macos-light') {
        return CHROME_HEIGHT_MACOS;
    }

    if (frameType === 'browser') {
        return CHROME_HEIGHT_BROWSER;
    }

    if (frameType === 'terminal') {
        return CHROME_HEIGHT_TERMINAL;
    }

    if (frameType === 'window-minimal') {
        return CHROME_HEIGHT_MINIMAL;
    }

    if (frameType === 'code-editor') {
        return CHROME_HEIGHT_CODE_EDITOR_TAB;
    }

    if (frameType === 'iphone-15') {
        return CHROME_HEIGHT_IPHONE_STATUS;
    }

    if (frameType === 'ipad-pro') {
        return CHROME_HEIGHT_IPAD_STATUS;
    }

    // Pro frames: 0 here — insets are computed proportionally in frameOverlayBounds
    // using the actual rendered frameBounds so bezels scale at every canvas size.
    if (
        frameType === 'iphone_15_pro' ||
        frameType === 'iphone_17_pro' ||
        frameType === 'ipad_pro' ||
        frameType === 'ipad_pro_m5'
    ) {
        return 0;
    }

    if (frameType === 'arc-browser') {
        return CHROME_HEIGHT_ARC_TOOLBAR;
    }

    return 0;
}

function bottomChromeHeightForFrame(frameType: string): number {
    if (frameType === 'iphone-15') {
        return CHROME_BOTTOM_IPHONE;
    }

    if (frameType === 'ipad-pro') {
        return CHROME_BOTTOM_IPAD;
    }

    // Pro frames: 0 — proportional insets live in frameOverlayBounds.
    if (
        frameType === 'iphone_15_pro' ||
        frameType === 'iphone_17_pro' ||
        frameType === 'ipad_pro' ||
        frameType === 'ipad_pro_m5'
    ) {
        return 0;
    }

    return 0;
}

function rightBezelForFrame(frameType: string): number {
    if (frameType === 'iphone-15') {
        return IPHONE_SIDE_BEZEL;
    }

    if (frameType === 'ipad-pro') {
        return IPAD_SIDE_BEZEL;
    }

    // Pro frames: 0 — proportional insets live in frameOverlayBounds.
    if (
        frameType === 'iphone_15_pro' ||
        frameType === 'iphone_17_pro' ||
        frameType === 'ipad_pro' ||
        frameType === 'ipad_pro_m5'
    ) {
        return 0;
    }

    return 0;
}

/**
 * Returns forced portrait screen dimensions for device frames so the phone
 * body always renders in portrait regardless of the uploaded image's aspect
 * ratio. Returns null for non-device frames (use image dimensions instead).
 */
function deviceScreenDimensions(
    frameType: string,
): { w: number; h: number } | null {
    if (frameType === 'iphone-15') {
        return { w: 390, h: 844 }; // iPhone 15 logical points
    }

    if (frameType === 'ipad-pro') {
        return { w: 834, h: 1194 }; // iPad Pro 11" logical points
    }

    // Pro frames: return BODY dimensions (screen + bezels) so calculateFrameLayout
    // sizes the full device body. Proportional bezels are then computed in
    // frameOverlayBounds using the actual rendered frameBounds dimensions — this
    // ensures bezels scale correctly at every canvas size / export resolution.
    if (frameType === 'iphone_15_pro') {
        return { w: 417, h: 878 }; // body: 393+24 × 852+26 (12px sides, 13px top/bottom)
    }

    if (frameType === 'iphone_17_pro') {
        return { w: 424, h: 898 }; // body: 402+22 × 874+24 (11px sides, 12px top/bottom)
    }

    if (frameType === 'ipad_pro') {
        return { w: 1024, h: 1366 }; // body (16px sides, 20px top/bottom)
    }

    if (frameType === 'ipad_pro_m5') {
        return { w: 1024, h: 1366 }; // body (14px sides, 18px top/bottom)
    }

    return null;
}

function buildWindowControlsConfig(
    framePlatform: 'macos' | 'windows',
    width: number,
    height: number,
    showButtons: boolean,
): {
    platform: 'macos' | 'windows';
    circles: CanvasWindowControl[];
    buttons: CanvasWindowControl[];
    iconLines: CanvasWindowControlIcon[];
    iconRects: CanvasWindowControlIcon[];
} {
    if (!showButtons) {
        return {
            platform: framePlatform,
            circles: [],
            buttons: [],
            iconLines: [],
            iconRects: [],
        };
    }

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

        return {
            platform: 'macos',
            circles: layout.buttons.map((button) => ({
                x: button.x,
                y: button.y,
                radius: button.width / 2,
                fill: fills[button.kind],
                kind: button.kind,
            })),
            buttons: [],
            iconLines: [],
            iconRects: [],
        };
    }

    const minimizeButton = layout.buttons[0]!;
    const maximizeButton = layout.buttons[1]!;
    const closeButton = layout.buttons[2]!;

    return {
        platform: 'windows',
        circles: [],
        buttons: layout.buttons.map((button) => ({
            x: button.x,
            y: button.y,
            width: button.width,
            height: button.height,
            cornerRadius: 0,
            fill: 'rgba(255,255,255,0.04)',
            kind: button.kind,
        })),
        iconLines: [
            {
                kind: 'minimize',
                points: [
                    minimizeButton.x + 9,
                    minimizeButton.height / 2,
                    minimizeButton.x + minimizeButton.width - 9,
                    minimizeButton.height / 2,
                ],
                stroke: 'rgba(255,255,255,0.78)',
                strokeWidth: 1.25,
            },
            {
                kind: 'close',
                points: [
                    closeButton.x + 12,
                    closeButton.height / 2 - 5,
                    closeButton.x + closeButton.width - 12,
                    closeButton.height / 2 + 5,
                ],
                stroke: 'rgba(255,255,255,0.78)',
                strokeWidth: 1.25,
            },
            {
                kind: 'close',
                points: [
                    closeButton.x + closeButton.width - 12,
                    closeButton.height / 2 - 5,
                    closeButton.x + 12,
                    closeButton.height / 2 + 5,
                ],
                stroke: 'rgba(255,255,255,0.78)',
                strokeWidth: 1.25,
            },
        ],
        iconRects: [
            {
                kind: 'maximize',
                x: maximizeButton.x + 9,
                y: maximizeButton.height / 2 - 4,
                width: maximizeButton.width - 18,
                height: 8,
                stroke: 'rgba(255,255,255,0.78)',
                strokeWidth: 1.25,
            },
        ],
    };
}

export function useCanvas(
    containerWidth: Ref<number>,
    containerHeight: Ref<number>,
) {
    const store = useEditorStore();

    const chromeHeight = computed<number>(() =>
        chromeHeightForFrame(store.activeSettings?.frameType ?? 'none'),
    );

    const activityBarWidth = computed<number>(() => {
        const ft = store.activeSettings?.frameType;

        if (ft === 'code-editor') {
            return 40;
        }

        if (ft === 'arc-browser') {
            return ACTIVITY_BAR_WIDTH_ARC;
        }

        if (ft === 'iphone-15') {
            return IPHONE_SIDE_BEZEL;
        }

        if (ft === 'ipad-pro') {
            return IPAD_SIDE_BEZEL;
        }

        // Pro frames: 0 — proportional insets live in frameOverlayBounds.
        if (
            ft === 'iphone_15_pro' ||
            ft === 'iphone_17_pro' ||
            ft === 'ipad_pro' ||
            ft === 'ipad_pro_m5'
        ) {
            return 0;
        }

        return 0;
    });

    const bottomChromeHeight = computed<number>(() =>
        bottomChromeHeightForFrame(store.activeSettings?.frameType ?? 'none'),
    );

    const rightBezelWidth = computed<number>(() =>
        rightBezelForFrame(store.activeSettings?.frameType ?? 'none'),
    );

    const hasFrameOverlay = computed<boolean>(
        () => (store.activeSettings?.frameType ?? 'none') !== 'none',
    );

    const artifactRadius = computed<number>(() => {
        const ft = store.activeSettings?.frameType;
        const { width: fw } = frameBounds.value;

        // Pro frames: exact body cornerRadius — no rounding so it matches
        // frameGroupConfig.clipFunc exactly (avoids sub-pixel border artifacts).
        if (ft === 'iphone_15_pro') {
            return fw * 54 / 417;
        }

        if (ft === 'iphone_17_pro') {
            return fw * 56 / 424;
        }

        if (ft === 'ipad_pro') {
            return fw * 20 / 1024;
        }

        if (ft === 'ipad_pro_m5') {
            return fw * 22 / 1024;
        }

        if (ft === 'iphone-15' || ft === 'ipad-pro') {
            const { height: fh } = frameBounds.value;

            return Math.min(fw, fh) * DEVICE_FRAME_RADIUS_FACTOR;
        }

        if (hasFrameOverlay.value) {
            return (
                store.activeStyle?.radius ?? store.activeSettings?.radius ?? 12
            );
        }

        return store.activeSettings?.radius ?? 12;
    });

    const cardDimensions = computed<{ w: number; h: number }>(() => {
        const sizeKey = store.activeSettings?.canvasSize ?? '';
        let ratio: number;

        if (sizeKey.startsWith('custom-')) {
            const [cw, ch] = sizeKey.slice(7).split('x').map(Number);
            ratio = cw && ch ? cw / ch : 16 / 9;
        } else {
            const size = CANVAS_SIZES[sizeKey];
            ratio = size
                ? size.w / size.h
                : (ASPECT_RATIOS[store.activeSettings?.aspectRatio ?? '16:9'] ??
                  16 / 9);
        }

        const maxW = containerWidth.value - CANVAS_MARGIN * 2;
        const maxH = containerHeight.value - CANVAS_MARGIN * 2;
        let w = maxW;
        let h = w / ratio;

        if (h > maxH) {
            h = maxH;
            w = h * ratio;
        }

        return { w: Math.floor(w), h: Math.floor(h) };
    });

    const cardX = computed<number>(
        () => (containerWidth.value - cardDimensions.value.w) / 2,
    );

    const cardY = computed<number>(
        () => (containerHeight.value - cardDimensions.value.h) / 2,
    );

    const cardBounds = computed(() => ({
        x: cardX.value,
        y: cardY.value,
        width: cardDimensions.value.w,
        height: cardDimensions.value.h,
    }));

    const frameBounds = computed(() => {
        const s = store.activeSettings;
        const pad = s?.padding ?? 48;
        const { w, h } = cardDimensions.value;
        const activeImage = store.activeImage;

        if (!hasFrameOverlay.value) {
            return {
                x: 0,
                y: 0,
                width: w,
                height: h,
            };
        }

        if (activeImage) {
            const ft = s?.frameType ?? 'none';
            const screenDims = deviceScreenDimensions(ft);
            const imgW = screenDims?.w ?? activeImage.naturalWidth;
            const imgH = screenDims?.h ?? activeImage.naturalHeight;

            const layout = calculateFrameLayout({
                areaX: pad,
                areaY: pad,
                areaWidth: Math.max(0, w - pad * 2),
                areaHeight: Math.max(0, h - pad * 2),
                imageWidth: imgW,
                imageHeight: imgH,
                topInset: chromeHeight.value,
                leftInset: activityBarWidth.value,
                bottomInset: bottomChromeHeight.value,
                rightInset: rightBezelWidth.value,
            });

            return {
                x: layout.frame.x,
                y: layout.frame.y,
                width: layout.frame.width,
                height: layout.frame.height,
            };
        }

        return {
            x: pad,
            y: pad,
            width: Math.max(0, w - pad * 2),
            height: Math.max(0, h - pad * 2),
        };
    });

    const frameAbsoluteBounds = computed(() => ({
        x: cardBounds.value.x + frameBounds.value.x,
        y: cardBounds.value.y + frameBounds.value.y,
        width: frameBounds.value.width,
        height: frameBounds.value.height,
    }));

    const frameOverlayBounds = computed(() => {
        const ft = store.activeSettings?.frameType;
        const fw = frameBounds.value.width;
        const fh = frameBounds.value.height;

        // Pro frames compute bezels proportionally from the rendered frame
        // dimensions so they scale correctly at every canvas size / export res.
        let topInset: number;
        let leftInset: number;
        let bottomInset: number;
        let rightInset: number;

        if (ft === 'iphone_15_pro') {
            topInset = Math.round(fh * 13 / 878);
            leftInset = Math.round(fw * 12 / 417);
            bottomInset = topInset;
            rightInset = leftInset;
        } else if (ft === 'iphone_17_pro') {
            topInset = Math.round(fh * 12 / 898);
            leftInset = Math.round(fw * 11 / 424);
            bottomInset = topInset;
            rightInset = leftInset;
        } else if (ft === 'ipad_pro') {
            topInset = Math.round(fh * 20 / 1366);
            leftInset = Math.round(fw * 16 / 1024);
            bottomInset = topInset;
            rightInset = leftInset;
        } else if (ft === 'ipad_pro_m5') {
            topInset = Math.round(fh * 18 / 1366);
            leftInset = Math.round(fw * 14 / 1024);
            bottomInset = topInset;
            rightInset = leftInset;
        } else {
            topInset = chromeHeight.value;
            leftInset = activityBarWidth.value;
            bottomInset = bottomChromeHeight.value;
            rightInset = rightBezelWidth.value;
        }

        return {
            x: frameBounds.value.x,
            y: frameBounds.value.y,
            width: fw,
            height: fh,
            topInset,
            leftInset,
            bottomInset,
            rightInset,
            hasFrame: hasFrameOverlay.value,
        };
    });

    const imageBounds = computed(() => {
        const s = store.activeSettings;
        const pad = s?.padding ?? 48;
        const { w, h } = cardDimensions.value;

        if (hasFrameOverlay.value) {
            return {
                x: frameOverlayBounds.value.leftInset,
                y: frameOverlayBounds.value.topInset,
                width: Math.max(
                    0,
                    frameBounds.value.width -
                        frameOverlayBounds.value.leftInset -
                        frameOverlayBounds.value.rightInset,
                ),
                height: Math.max(
                    0,
                    frameBounds.value.height -
                        frameOverlayBounds.value.topInset -
                        frameOverlayBounds.value.bottomInset,
                ),
                fit: 'contain' as const,
            };
        }

        return {
            x: pad,
            y: pad,
            width: Math.max(0, w - pad * 2),
            height: Math.max(0, h - pad * 2),
            fit: 'contain' as const,
        };
    });

    const exportBounds = computed(() => {
        return { ...cardBounds.value };
    });

    const stageConfig = computed(() => ({
        width: containerWidth.value,
        height: containerHeight.value,
    }));

    // Fill is transparent so the Konva <canvas> element passes through to the
    // CSS background-image grid on the container div. The workspace dark colour
    // is already supplied by the editor root div (background: #080808).
    const canvasBgConfig = computed(() => ({
        x: 0,
        y: 0,
        width: containerWidth.value,
        height: containerHeight.value,
        fill: 'transparent',
        listening: false,
    }));

    const shadowRectConfig = computed(() => {
        const s = store.activeSettings;
        const bounds = hasFrameOverlay.value
            ? frameAbsoluteBounds.value
            : cardBounds.value;

        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            cornerRadius: artifactRadius.value,
            fill: 'transparent',
            shadowColor: s?.shadowColor ?? '#000000',
            shadowBlur: s?.shadowBlur ?? 40,
            shadowOpacity: (s?.shadow ?? 50) / 100,
            shadowOffsetY: 4,
            listening: false,
        };
    });

    const cardGroupConfig = computed(() => ({
        x: cardX.value,
        y: cardY.value,
        clipFunc: (ctx: CanvasRenderingContext2D) => {
            const r = artifactRadius.value;
            const w = cardDimensions.value.w;
            const h = cardDimensions.value.h;
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(w - r, 0);
            ctx.arcTo(w, 0, w, r, r);
            ctx.lineTo(w, h - r);
            ctx.arcTo(w, h, w - r, h, r);
            ctx.lineTo(r, h);
            ctx.arcTo(0, h, 0, h - r, r);
            ctx.lineTo(0, r);
            ctx.arcTo(0, 0, r, 0, r);
            ctx.closePath();
        },
    }));

    const frameGroupConfig = computed(() => ({
        x: frameBounds.value.x,
        y: frameBounds.value.y,
        clipFunc: (ctx: CanvasRenderingContext2D) => {
            const ft = store.activeSettings?.frameType;
            const fw = frameBounds.value.width;
            const fh = frameBounds.value.height;
            // Use the exact body cornerRadius for each Pro frame so the clip
            // matches the body shape — prevents the body stroke from showing
            // in the corner gap between clip and body.
            let r: number;

            if (ft === 'iphone_15_pro') {
                r = fw * 54 / 417;
            } else if (ft === 'iphone_17_pro') {
                r = fw * 56 / 424;
            } else if (ft === 'ipad_pro') {
                r = fw * 20 / 1024;
            } else if (ft === 'ipad_pro_m5') {
                r = fw * 22 / 1024;
            } else if (ft === 'iphone-15' || ft === 'ipad-pro') {
                r = Math.round(Math.min(fw, fh) * DEVICE_FRAME_RADIUS_FACTOR);
            } else {
                r = store.activeSettings?.radius ?? 12;
            }

            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(fw - r, 0);
            ctx.arcTo(fw, 0, fw, r, r);
            ctx.lineTo(fw, fh - r);
            ctx.arcTo(fw, fh, fw - r, fh, r);
            ctx.lineTo(r, fh);
            ctx.arcTo(0, fh, 0, fh - r, r);
            ctx.lineTo(0, r);
            ctx.arcTo(0, 0, r, 0, r);
            ctx.closePath();
        },
    }));

    // Same position as frameGroupConfig but NO clipFunc — used to render
    // device buttons that protrude beyond the body edge (negative x/y coords).
    const frameButtonsGroupConfig = computed(() => ({
        x: frameBounds.value.x,
        y: frameBounds.value.y,
    }));

    const cardBgConfig = computed(() => {
        const s = store.activeSettings;
        const { w, h } = cardDimensions.value;
        const base = { x: 0, y: 0, width: w, height: h, listening: false };

        if (!s) {
            return { ...base, fill: '#0a0a0c' };
        }

        if (s.backgroundType === 'solid') {
            return { ...base, fill: s.solidColor };
        }

        if (s.backgroundType === 'transparent') {
            return { ...base, fill: 'transparent' };
        }

        // gradient (default); mesh uses gradient fallback
        if (s.gradientIsRadial) {
            const cx = w / 2;
            const cy = h / 2;

            return {
                ...base,
                fillRadialGradientStartPoint: { x: cx, y: cy },
                fillRadialGradientStartRadius: 0,
                fillRadialGradientEndPoint: { x: cx, y: cy },
                fillRadialGradientEndRadius: Math.max(w, h) / 2,
                fillRadialGradientColorStops: [
                    0,
                    s.gradientStart,
                    1,
                    s.gradientEnd,
                ],
            };
        }

        const pts = angleToGradientPoints(s.gradientAngle, w, h);

        return {
            ...base,
            fillLinearGradientStartPoint: pts.start,
            fillLinearGradientEndPoint: pts.end,
            fillLinearGradientColorStops: [
                0,
                s.gradientStart,
                1,
                s.gradientEnd,
            ],
        };
    });

    const imageConfig = computed(() => {
        const img = store.activeImage;
        const settings = store.activeSettings;

        if (!img || !settings) {
            return null;
        }

        const { x, y, width, height } = imageBounds.value;

        if (width <= 0 || height <= 0) {
            return null;
        }

        // Device frames use COVER — scale to fill the screen area while
        // preserving the image's aspect ratio. The imageClipGroupConfig clips
        // any overflow to the rounded screen shape so no distortion occurs.
        const ft = settings.frameType;
        const isDeviceFrame =
            ft === 'iphone-15' ||
            ft === 'ipad-pro' ||
            ft === 'iphone_15_pro' ||
            ft === 'iphone_17_pro' ||
            ft === 'ipad_pro' ||
            ft === 'ipad_pro_m5';

        if (isDeviceFrame) {
            const scaleX = width / img.naturalWidth;
            const scaleY = height / img.naturalHeight;
            const scale = Math.max(scaleX, scaleY);
            const scaledW = img.naturalWidth * scale;
            const scaledH = img.naturalHeight * scale;

            return {
                image: img.element,
                x: x + (width - scaledW) / 2,
                y: y + (height - scaledH) / 2,
                width: scaledW,
                height: scaledH,
                listening: false,
            };
        }

        const placement = calculateImagePlacement({
            viewportX: x,
            viewportY: y,
            viewportWidth: width,
            viewportHeight: height,
            imageWidth: img.naturalWidth,
            imageHeight: img.naturalHeight,
            zoom: settings.imageZoom,
            offsetX: settings.imageOffsetX,
            offsetY: settings.imageOffsetY,
        });

        return {
            image: img.element,
            x: placement.x,
            y: placement.y,
            width: placement.width,
            height: placement.height,
            listening: false,
        };
    });

    const imageClipConfig = computed(() => {
        const { x, y, width, height } = imageBounds.value;
        const radius = Math.max(0, (store.activeSettings?.radius ?? 12) - 2);
        const ft = store.activeSettings?.frameType;

        let topRadius: number;
        let bottomRadius: number;

        if (ft === 'iphone-15' || ft === 'ipad-pro') {
            const { width: fw, height: fh } = frameBounds.value;
            const screenR = Math.max(
                Math.round(Math.min(fw, fh) * DEVICE_FRAME_RADIUS_FACTOR) - 10,
                4,
            );
            topRadius = screenR;
            bottomRadius = screenR;
        } else if (ft === 'iphone_15_pro') {
            // screen rx=46 at BASE_W=417
            const screenR = Math.max(
                Math.round((frameBounds.value.width / 417) * 46),
                4,
            );
            topRadius = screenR;
            bottomRadius = screenR;
        } else if (ft === 'iphone_17_pro') {
            // screen rx=48 at BASE_W=424
            const screenR = Math.max(
                Math.round((frameBounds.value.width / 424) * 48),
                4,
            );
            topRadius = screenR;
            bottomRadius = screenR;
        } else if (ft === 'ipad_pro') {
            // rx=14 proportional to frame width (base 1024, BEZEL_V=16, BEZEL_H=20)
            const screenR = Math.max(
                Math.round((frameBounds.value.width / 1024) * 14),
                2,
            );
            topRadius = screenR;
            bottomRadius = screenR;
        } else if (ft === 'ipad_pro_m5') {
            // rx=16 proportional to frame width (base 1024, BEZEL_V=14, BEZEL_H=18)
            const screenR = Math.max(
                Math.round((frameBounds.value.width / 1024) * 16),
                2,
            );
            topRadius = screenR;
            bottomRadius = screenR;
        } else {
            topRadius = frameOverlayBounds.value.topInset > 0 ? 0 : radius;
            bottomRadius =
                frameOverlayBounds.value.bottomInset > 0 ? 0 : radius;
        }

        return {
            x,
            y,
            width,
            height,
            cornerRadii: {
                topLeft: topRadius,
                topRight: topRadius,
                bottomRight: bottomRadius,
                bottomLeft: bottomRadius,
            },
        };
    });

    const imageClipGroupConfig = computed(() => ({
        clipFunc: (ctx: CanvasRenderingContext2D) => {
            const { x, y, width, height, cornerRadii } = imageClipConfig.value;
            const topLeft = Math.min(
                cornerRadii.topLeft,
                width / 2,
                height / 2,
            );
            const topRight = Math.min(
                cornerRadii.topRight,
                width / 2,
                height / 2,
            );
            const bottomRight = Math.min(
                cornerRadii.bottomRight,
                width / 2,
                height / 2,
            );
            const bottomLeft = Math.min(
                cornerRadii.bottomLeft,
                width / 2,
                height / 2,
            );

            ctx.beginPath();
            ctx.moveTo(x + topLeft, y);
            ctx.lineTo(x + width - topRight, y);
            ctx.arcTo(x + width, y, x + width, y + topRight, topRight);
            ctx.lineTo(x + width, y + height - bottomRight);
            ctx.arcTo(
                x + width,
                y + height,
                x + width - bottomRight,
                y + height,
                bottomRight,
            );
            ctx.lineTo(x + bottomLeft, y + height);
            ctx.arcTo(x, y + height, x, y + height - bottomLeft, bottomLeft);
            ctx.lineTo(x, y + topLeft);
            ctx.arcTo(x, y, x + topLeft, y, topLeft);
            ctx.closePath();
        },
    }));

    const borderConfig = computed(() => {
        const s = store.activeSettings;
        const style = store.activeStyle;

        if (!s || !style || style.border.type === 'none' || s.border <= 0) {
            return null;
        }

        const bounds = hasFrameOverlay.value
            ? frameAbsoluteBounds.value
            : cardBounds.value;
        const bw = s.border;
        const strokeColor = getBorderStrokeColor(style, s.borderColor);
        const isShadowBorder =
            style.border.type === 'neon' || style.border.type === 'glow';

        return {
            x: bounds.x + bw / 2,
            y: bounds.y + bw / 2,
            width: bounds.width - bw,
            height: bounds.height - bw,
            cornerRadius: artifactRadius.value,
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: bw,
            shadowColor: isShadowBorder ? strokeColor : 'transparent',
            shadowBlur: isShadowBorder ? style.border.blur : 0,
            shadowOpacity: isShadowBorder ? style.border.opacity : 0,
            listening: false,
        };
    });

    const macosDotsConfig = computed(() => {
        const s = store.activeSettings;

        if (!s) {
            return null;
        }

        const ft = s.frameType;

        if (ft !== 'macos-dark' && ft !== 'macos-light') {
            return null;
        }

        const { width: w } = frameBounds.value;
        const isDark = ft === 'macos-dark';
        const barFill = isDark ? '#2d2d2d' : '#e8e8e8';
        const sepColor = isDark ? '#3a3a3a' : '#d0d0d0';
        const textColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
        const dots = s.frameShowButtons
            ? [
                  { x: 14, y: 14, radius: 5, fill: '#ff5f57' },
                  { x: 30, y: 14, radius: 5, fill: '#febc2e' },
                  { x: 46, y: 14, radius: 5, fill: '#28c840' },
              ]
            : [];

        return {
            barConfig: {
                x: 0,
                y: 0,
                width: w,
                height: CHROME_HEIGHT_MACOS,
                fill: barFill,
                listening: false,
            },
            separatorConfig: {
                points: [
                    0,
                    CHROME_HEIGHT_MACOS - 0.5,
                    w,
                    CHROME_HEIGHT_MACOS - 0.5,
                ],
                stroke: sepColor,
                strokeWidth: 1,
                listening: false,
            },
            titleConfig: s.frameTitle
                ? {
                      x: 0,
                      y: 0,
                      width: w,
                      height: CHROME_HEIGHT_MACOS,
                      text: s.frameTitle,
                      fontSize: 11,
                      fontFamily: 'DM Mono, monospace',
                      fill: textColor,
                      align: 'center',
                      verticalAlign: 'middle',
                      listening: false,
                  }
                : null,
            dots,
        };
    });

    const browserChromeConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'browser') {
            return null;
        }

        const { width: w } = frameBounds.value;
        const isWindows = s.framePlatform === 'windows';
        const tabBg = isWindows ? '#20242d' : '#17181d';
        const barBg = isWindows ? '#2b313c' : '#262932';
        const urlBoxBg = isWindows ? '#161b24' : '#14171e';
        const tabActiveBg = isWindows ? '#313846' : '#2d3038';
        const textColor = isWindows
            ? 'rgba(245,248,255,0.68)'
            : 'rgba(255,255,255,0.46)';
        const urlBoxW = Math.min(260, w * 0.4);
        const url = s.frameUrl || 'example.com';
        const windowControls = buildWindowControlsConfig(
            s.framePlatform,
            w,
            36,
            s.frameShowButtons,
        );
        const windowControlsWidth = isWindows
            ? windowControls.buttons.reduce(
                  (sum, button) => sum + (button.width ?? 0),
                  0,
              )
            : 0;
        const tabX = isWindows ? 18 : 76;
        const tabWidth = isWindows
            ? Math.max(74, Math.min(164, w - windowControlsWidth - tabX - 12))
            : 140;

        return {
            tabBarConfig: {
                x: 0,
                y: 0,
                width: w,
                height: 36,
                fill: tabBg,
                listening: false,
            },
            activeTabConfig: {
                x: tabX,
                y: 6,
                width: tabWidth,
                height: 30,
                fill: tabActiveBg,
                cornerRadius: [8, 8, 0, 0],
                listening: false,
            },
            tabTextConfig: {
                x: windowControls.platform === 'windows' ? tabX + 16 : 92,
                y: 15,
                text: s.frameTitle || 'Tab',
                fontSize: 11,
                fill: textColor,
                listening: false,
            },
            addressBarConfig: {
                x: 0,
                y: 36,
                width: w,
                height: 36,
                fill: barBg,
                listening: false,
            },
            urlBoxConfig: {
                x: (w - urlBoxW) / 2,
                y: 44,
                width: urlBoxW,
                height: 20,
                fill: urlBoxBg,
                cornerRadius: 10,
                listening: false,
            },
            urlTextConfig: {
                x: (w - urlBoxW) / 2 + 12,
                y: 48,
                text: url,
                fontSize: 10.5,
                fill: isWindows
                    ? 'rgba(213,221,235,0.72)'
                    : 'rgba(255,255,255,0.46)',
                listening: false,
            },
            windowControls,
        };
    });

    const terminalChromeConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'terminal') {
            return null;
        }

        const { width: w } = frameBounds.value;
        const windowControls = buildWindowControlsConfig(
            s.framePlatform,
            w,
            CHROME_HEIGHT_TERMINAL,
            s.frameShowButtons,
        );

        return {
            barConfig: {
                x: 0,
                y: 0,
                width: w,
                height: CHROME_HEIGHT_TERMINAL,
                fill: s.framePlatform === 'windows' ? '#111827' : '#12161d',
                listening: false,
            },
            separatorConfig: {
                points: [
                    0,
                    CHROME_HEIGHT_TERMINAL - 0.5,
                    w,
                    CHROME_HEIGHT_TERMINAL - 0.5,
                ],
                stroke: s.framePlatform === 'windows' ? '#314158' : '#27303b',
                strokeWidth: 1,
                listening: false,
            },
            shellLabelConfig: {
                x: windowControls.platform === 'windows' ? 20 : 74,
                y: 8,
                text:
                    s.framePlatform === 'windows'
                        ? 'PS C:\\workspace'
                        : '~/workspace',
                fontSize: 9,
                fontFamily: 'DM Mono, monospace',
                fill: 'rgba(255,255,255,0.34)',
                listening: false,
            },
            titleConfig: {
                x: 0,
                y: 0,
                width: w,
                height: CHROME_HEIGHT_TERMINAL,
                text: s.frameTitle || 'zsh',
                fontSize: 11,
                fontFamily: 'DM Mono, monospace',
                fill: 'rgba(255,255,255,0.62)',
                align: 'center',
                verticalAlign: 'middle',
                listening: false,
            },
            windowControls,
        };
    });

    const minimalWindowChromeConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'window-minimal') {
            return null;
        }

        const { width: w } = frameBounds.value;
        const windowControls = buildWindowControlsConfig(
            s.framePlatform,
            w,
            CHROME_HEIGHT_MINIMAL,
            s.frameShowButtons,
        );

        return {
            barConfig: {
                x: 0,
                y: 0,
                width: w,
                height: CHROME_HEIGHT_MINIMAL,
                fill: s.framePlatform === 'windows' ? '#1b2330' : '#20242b',
                listening: false,
            },
            separatorConfig: {
                points: [
                    0,
                    CHROME_HEIGHT_MINIMAL - 0.5,
                    w,
                    CHROME_HEIGHT_MINIMAL - 0.5,
                ],
                stroke: s.framePlatform === 'windows' ? '#334155' : '#3a404b',
                strokeWidth: 1,
                listening: false,
            },
            titleConfig: {
                x: 0,
                y: 0,
                width: w,
                height: CHROME_HEIGHT_MINIMAL,
                text: s.frameTitle || 'Window',
                fontSize: 10,
                fontFamily: 'DM Mono, monospace',
                fill: 'rgba(255,255,255,0.5)',
                align: 'center',
                verticalAlign: 'middle',
                listening: false,
            },
            windowControls,
        };
    });

    const codeEditorChromeConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'code-editor') {
            return null;
        }

        const { width: w, height: h } = frameBounds.value;
        const tabH = CHROME_HEIGHT_CODE_EDITOR_TAB;
        const aw = 40;
        const filename = s.frameTitle || 'index.ts';

        return {
            activityBarConfig: {
                x: 0,
                y: 0,
                width: aw,
                height: h,
                fill: '#1e1e1e',
                listening: false,
            },
            activityBarBorderConfig: {
                points: [aw - 0.5, 0, aw - 0.5, h],
                stroke: '#333333',
                strokeWidth: 1,
                listening: false,
            },
            tabBarConfig: {
                x: aw,
                y: 0,
                width: w - aw,
                height: tabH,
                fill: '#252526',
                listening: false,
            },
            tabBarBorderConfig: {
                points: [aw, tabH - 0.5, w, tabH - 0.5],
                stroke: '#3c3c3c',
                strokeWidth: 1,
                listening: false,
            },
            activeTabConfig: {
                x: aw,
                y: 0,
                width: 140,
                height: tabH,
                fill: '#1e1e1e',
                listening: false,
            },
            activeTabBorderTopConfig: {
                points: [aw, 0, aw + 140, 0],
                stroke: '#007acc',
                strokeWidth: 2,
                listening: false,
            },
            tabTextConfig: {
                x: aw + 12,
                y: 0,
                height: tabH,
                text: filename,
                fontSize: 11,
                fontFamily: 'DM Mono, monospace',
                fill: 'rgba(255,255,255,0.75)',
                verticalAlign: 'middle',
                listening: false,
            },
        };
    });

    /** Phone / tablet body — drawn before the image so chrome sits on top */
    const deviceBodyConfig = computed(() => {
        const ft = store.activeSettings?.frameType;

        // iphone_15_pro and ipad_pro render their own body via Pro frame configs
        if (
            ft !== 'iphone-15' &&
            ft !== 'ipad-pro'
        ) {
            return null;
        }

        const { width: w, height: h } = frameBounds.value;

        return {
            x: 0,
            y: 0,
            width: w,
            height: h,
            fill: '#1C1C1E',
            listening: false,
        };
    });

    const iphoneFrameConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'iphone-15') {
            return null;
        }

        const { width: w, height: h } = frameBounds.value;
        const side = IPHONE_SIDE_BEZEL;
        const top = CHROME_HEIGHT_IPHONE_STATUS;
        const bottom = CHROME_BOTTOM_IPHONE;
        const vW = w - side * 2;
        const vH = h - top - bottom;
        const btnColor = '#2D2D30';

        // Dynamic Island — centered within screen
        const diW = Math.round(vW * 0.28);
        const diH = 18;
        const dynamicIslandConfig = {
            x: side + Math.round((vW - diW) / 2),
            y: top + 10,
            width: diW,
            height: diH,
            cornerRadius: diH / 2,
            fill: '#000000',
            listening: false,
        };

        // Left side buttons (silent + volume up/down)
        const leftButtons = [
            {
                x: 0,
                y: Math.round(h * 0.13),
                width: 4,
                height: Math.round(h * 0.05),
                fill: btnColor,
                cornerRadius: 2,
                listening: false,
            },
            {
                x: 0,
                y: Math.round(h * 0.21),
                width: 4,
                height: Math.round(h * 0.10),
                fill: btnColor,
                cornerRadius: 2,
                listening: false,
            },
            {
                x: 0,
                y: Math.round(h * 0.34),
                width: 4,
                height: Math.round(h * 0.10),
                fill: btnColor,
                cornerRadius: 2,
                listening: false,
            },
        ];

        // Right side — power button
        const rightButtons = [
            {
                x: w - 4,
                y: Math.round(h * 0.27),
                width: 4,
                height: Math.round(h * 0.15),
                fill: btnColor,
                cornerRadius: 2,
                listening: false,
            },
        ];

        // Home indicator — centered in bottom bezel
        const homeW = Math.round(vW * 0.32);
        const homeIndicatorConfig = {
            x: side + Math.round((vW - homeW) / 2),
            y: top + vH + Math.round((bottom - 5) / 2),
            width: homeW,
            height: 5,
            cornerRadius: 3,
            fill: 'rgba(255,255,255,0.4)',
            listening: false,
        };

        return {
            dynamicIslandConfig,
            leftButtons,
            rightButtons,
            homeIndicatorConfig,
        };
    });

    const ipadFrameConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'ipad-pro') {
            return null;
        }

        const { width: w, height: h } = frameBounds.value;
        const side = IPAD_SIDE_BEZEL;
        const top = CHROME_HEIGHT_IPAD_STATUS;
        const bottom = CHROME_BOTTOM_IPAD;
        const vW = w - side * 2;
        const vH = h - top - bottom;
        const btnColor = '#2D2D30';

        // Front camera (small pill at top of screen, centered)
        const cameraConfig = {
            x: side + Math.round((vW - 14) / 2),
            y: top + 8,
            width: 14,
            height: 8,
            cornerRadius: 4,
            fill: '#0a0a0a',
            listening: false,
        };

        // Left side buttons (volume up/down)
        const leftButtons = [
            {
                x: 0,
                y: Math.round(h * 0.22),
                width: 4,
                height: Math.round(h * 0.09),
                fill: btnColor,
                cornerRadius: 2,
                listening: false,
            },
            {
                x: 0,
                y: Math.round(h * 0.34),
                width: 4,
                height: Math.round(h * 0.09),
                fill: btnColor,
                cornerRadius: 2,
                listening: false,
            },
        ];

        // Right side — power/Touch ID button
        const rightButtons = [
            {
                x: w - 4,
                y: Math.round(h * 0.28),
                width: 4,
                height: Math.round(h * 0.13),
                fill: btnColor,
                cornerRadius: 2,
                listening: false,
            },
        ];

        // Home indicator
        const homeW = Math.round(vW * 0.28);
        const homeIndicatorConfig = {
            x: side + Math.round((vW - homeW) / 2),
            y: top + vH + Math.round((bottom - 4) / 2),
            width: homeW,
            height: 4,
            cornerRadius: 2,
            fill: 'rgba(255,255,255,0.35)',
            listening: false,
        };

        return {
            cameraConfig,
            leftButtons,
            rightButtons,
            homeIndicatorConfig,
        };
    });

    const arcBrowserFrameConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'arc-browser') {
            return null;
        }

        const { width: w, height: h } = frameBounds.value;
        const sidebarW = ACTIVITY_BAR_WIDTH_ARC;
        const toolbarH = CHROME_HEIGHT_ARC_TOOLBAR;
        const contentW = w - sidebarW;

        const sidebarBgConfig = {
            x: 0,
            y: 0,
            width: sidebarW,
            height: h,
            fill: '#1A1A2E',
            listening: false,
        };

        const sidebarBorderConfig = {
            points: [sidebarW, 0, sidebarW, h],
            stroke: 'rgba(255,255,255,0.06)',
            strokeWidth: 1,
            listening: false,
        };

        const toolbarBgConfig = {
            x: sidebarW,
            y: 0,
            width: contentW,
            height: toolbarH,
            fill: '#1E1E3A',
            listening: false,
        };

        const toolbarBorderConfig = {
            points: [sidebarW, toolbarH, w, toolbarH],
            stroke: 'rgba(255,255,255,0.06)',
            strokeWidth: 1,
            listening: false,
        };

        const urlPillW = Math.min(220, contentW * 0.5);
        const urlPillConfig = {
            x: sidebarW + (contentW - urlPillW) / 2,
            y: (toolbarH - 22) / 2,
            width: urlPillW,
            height: 22,
            cornerRadius: 11,
            fill: 'rgba(255,255,255,0.08)',
            listening: false,
        };

        const urlText = s.frameUrl || '';
        const urlTextConfig = urlText
            ? {
                  x: sidebarW + (contentW - urlPillW) / 2 + 10,
                  y: (toolbarH - 22) / 2,
                  width: urlPillW - 20,
                  height: 22,
                  text: urlText,
                  fontSize: 11,
                  fontFamily: 'DM Mono, monospace',
                  fill: 'rgba(255,255,255,0.4)',
                  verticalAlign: 'middle',
                  listening: false,
              }
            : null;

        const tabItems = [
            {
                x: 12,
                y: 12,
                width: sidebarW - 24,
                height: 26,
                cornerRadius: 8,
                fill: 'rgba(255,255,255,0.12)',
                listening: false,
            },
            {
                x: 12,
                y: 46,
                width: sidebarW - 24,
                height: 26,
                cornerRadius: 8,
                fill: 'rgba(255,255,255,0.04)',
                listening: false,
            },
            {
                x: 12,
                y: 80,
                width: sidebarW - 24,
                height: 26,
                cornerRadius: 8,
                fill: 'rgba(255,255,255,0.04)',
                listening: false,
            },
        ];

        return {
            sidebarBgConfig,
            sidebarBorderConfig,
            toolbarBgConfig,
            toolbarBorderConfig,
            urlPillConfig,
            urlTextConfig,
            tabItems,
        };
    });

    /** iPhone 15 Pro — titanium device frame with Dynamic Island */
    const iphone15ProFrameConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'iphone_15_pro') {
            return null;
        }

        const { width: fw, height: fh } = frameBounds.value;

        return getIPhone15ProFrameConfig(fw, fh);
    });

    /** iPhone 17 Pro — warmer titanium, slightly thinner bezels */
    const iphone17ProFrameConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'iphone_17_pro') {
            return null;
        }

        const { width: fw, height: fh } = frameBounds.value;

        return getIPhone17ProFrameConfig(fw, fh);
    });

    /** iPad Pro — dark space gray device frame */
    const ipadProFrameConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'ipad_pro') {
            return null;
        }

        const { width: fw, height: fh } = frameBounds.value;

        return getIPadProFrameConfig(fw, fh);
    });

    /** iPad Pro M5 — Space Black, very thin bezels, Face ID sensor bar */
    const ipadProM5FrameConfig = computed(() => {
        const s = store.activeSettings;

        if (!s || s.frameType !== 'ipad_pro_m5') {
            return null;
        }

        const { width: fw, height: fh } = frameBounds.value;

        return getIPadProM5FrameConfig(fw, fh);
    });

    return {
        stageConfig,
        canvasBgConfig,
        shadowRectConfig,
        cardGroupConfig,
        cardBgConfig,
        imageConfig,
        imageClipConfig,
        imageClipGroupConfig,
        borderConfig,
        macosDotsConfig,
        browserChromeConfig,
        terminalChromeConfig,
        minimalWindowChromeConfig,
        codeEditorChromeConfig,
        deviceBodyConfig,
        iphoneFrameConfig,
        ipadFrameConfig,
        arcBrowserFrameConfig,
        iphone15ProFrameConfig,
        iphone17ProFrameConfig,
        ipadProFrameConfig,
        ipadProM5FrameConfig,
        cardDimensions,
        cardX,
        cardY,
        cardBounds,
        frameBounds,
        frameAbsoluteBounds,
        frameOverlayBounds,
        imageBounds,
        contentArea: imageBounds,
        exportBounds,
        frameGroupConfig,
        frameButtonsGroupConfig,
        chromeHeight,
        activityBarWidth,
        hasFrameOverlay,
    };
}
