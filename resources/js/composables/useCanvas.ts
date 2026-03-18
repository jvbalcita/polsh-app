import { computed, type Ref } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { StyleConfig } from '@/types/style';

const ASPECT_RATIOS: Record<string, number> = {
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '1:1': 1,
    '3:2': 3 / 2,
    '21:9': 21 / 9,
};

export const CANVAS_SIZES: Record<string, { label: string; w: number; h: number }> = {
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
const CANVAS_MARGIN = 64;

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
    if (frameType === 'macos-dark' || frameType === 'macos-light') return CHROME_HEIGHT_MACOS;
    if (frameType === 'browser') return CHROME_HEIGHT_BROWSER;
    if (frameType === 'terminal') return CHROME_HEIGHT_TERMINAL;
    if (frameType === 'window-minimal') return CHROME_HEIGHT_MINIMAL;
    if (frameType === 'code-editor') return CHROME_HEIGHT_CODE_EDITOR_TAB;
    return 0;
}

export function useCanvas(containerWidth: Ref<number>, containerHeight: Ref<number>) {
    const store = useEditorStore();

    const chromeHeight = computed<number>(() => chromeHeightForFrame(store.activeSettings?.frameType ?? 'none'));

    const activityBarWidth = computed<number>(() => (store.activeSettings?.frameType === 'code-editor' ? 40 : 0));

    const cardDimensions = computed<{ w: number; h: number }>(() => {
        const sizeKey = store.activeSettings?.canvasSize ?? '';
        let ratio: number;
        if (sizeKey.startsWith('custom-')) {
            const [cw, ch] = sizeKey.slice(7).split('x').map(Number);
            ratio = (cw && ch) ? cw / ch : 16 / 9;
        } else {
            const size = CANVAS_SIZES[sizeKey];
            ratio = size ? size.w / size.h : (ASPECT_RATIOS[store.activeSettings?.aspectRatio ?? '16:9'] ?? 16 / 9);
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

    const cardX = computed<number>(() => (containerWidth.value - cardDimensions.value.w) / 2);

    const cardY = computed<number>(() => (containerHeight.value - cardDimensions.value.h) / 2);

    const contentArea = computed(() => {
        const s = store.activeSettings;
        const pad = s?.padding ?? 48;
        const { w, h } = cardDimensions.value;
        const ch = chromeHeight.value;
        const aw = activityBarWidth.value;
        return {
            x: pad + aw,
            y: pad + ch,
            width: Math.max(0, w - pad * 2 - aw),
            height: Math.max(0, h - pad * 2 - ch),
        };
    });

    const stageConfig = computed(() => ({
        width: containerWidth.value,
        height: containerHeight.value,
    }));

    const canvasBgConfig = computed(() => ({
        x: 0,
        y: 0,
        width: containerWidth.value,
        height: containerHeight.value,
        fill: '#080808',
        listening: false,
    }));

    const shadowRectConfig = computed(() => {
        const s = store.activeSettings;
        const { w, h } = cardDimensions.value;
        return {
            x: cardX.value,
            y: cardY.value,
            width: w,
            height: h,
            cornerRadius: s?.radius ?? 12,
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
            const r = store.activeSettings?.radius ?? 12;
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

    const cardBgConfig = computed(() => {
        const s = store.activeSettings;
        const { w, h } = cardDimensions.value;
        const base = { x: 0, y: 0, width: w, height: h, listening: false };

        if (!s) return { ...base, fill: '#0a0a0c' };

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
                fillRadialGradientColorStops: [0, s.gradientStart, 1, s.gradientEnd],
            };
        }

        const pts = angleToGradientPoints(s.gradientAngle, w, h);
        return {
            ...base,
            fillLinearGradientStartPoint: pts.start,
            fillLinearGradientEndPoint: pts.end,
            fillLinearGradientColorStops: [0, s.gradientStart, 1, s.gradientEnd],
        };
    });

    const imageConfig = computed(() => {
        const img = store.activeImage;
        if (!img) return null;
        const { x, y, width, height } = contentArea.value;
        if (width <= 0 || height <= 0) return null;

        const imgAspect = img.naturalWidth / img.naturalHeight;
        const areaAspect = width / height;

        let displayW = width;
        let displayH = height;
        let displayX = x;
        let displayY = y;

        if (imgAspect > areaAspect) {
            displayH = displayW / imgAspect;
            displayY += (height - displayH) / 2;
        } else {
            displayW = displayH * imgAspect;
            displayX += (width - displayW) / 2;
        }

        return {
            image: img.element,
            x: displayX,
            y: displayY,
            width: displayW,
            height: displayH,
            listening: false,
        };
    });

    const borderConfig = computed(() => {
        const s = store.activeSettings;
        const style = store.activeStyle;
        if (!s || !style || style.border.type === 'none' || s.border <= 0) {
            return null;
        }
        const { w, h } = cardDimensions.value;
        const bw = s.border;
        const strokeColor = getBorderStrokeColor(style, s.borderColor);
        const isShadowBorder = style.border.type === 'neon' || style.border.type === 'glow';

        return {
            x: cardX.value + bw / 2,
            y: cardY.value + bw / 2,
            width: w - bw,
            height: h - bw,
            cornerRadius: s.radius,
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
        if (!s) return null;
        const ft = s.frameType;
        if (ft !== 'macos-dark' && ft !== 'macos-light') return null;
        const { w } = cardDimensions.value;
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
            barConfig: { x: 0, y: 0, width: w, height: CHROME_HEIGHT_MACOS, fill: barFill, listening: false },
            separatorConfig: {
                points: [0, CHROME_HEIGHT_MACOS - 0.5, w, CHROME_HEIGHT_MACOS - 0.5],
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
        if (!s || s.frameType !== 'browser') return null;
        const { w } = cardDimensions.value;
        const tabBg = '#1a1a1a';
        const barBg = '#2d2d2d';
        const urlBoxBg = '#1a1a1a';
        const tabActiveBg = '#2d2d2d';
        const textColor = 'rgba(255,255,255,0.4)';
        const urlBoxW = Math.min(260, w * 0.4);
        const url = s.frameUrl || 'example.com';
        const dots = s.frameShowButtons
            ? [
                  { x: 14, y: 18, radius: 5, fill: '#ff5f57' },
                  { x: 30, y: 18, radius: 5, fill: '#febc2e' },
                  { x: 46, y: 18, radius: 5, fill: '#28c840' },
              ]
            : [];
        return {
            tabBarConfig: { x: 0, y: 0, width: w, height: 36, fill: tabBg, listening: false },
            activeTabConfig: { x: 76, y: 6, width: 140, height: 30, fill: tabActiveBg, cornerRadius: [6, 6, 0, 0], listening: false },
            tabTextConfig: { x: 92, y: 15, text: s.frameTitle || 'Tab', fontSize: 11, fill: textColor, listening: false },
            addressBarConfig: { x: 0, y: 36, width: w, height: 36, fill: barBg, listening: false },
            urlBoxConfig: { x: (w - urlBoxW) / 2, y: 44, width: urlBoxW, height: 20, fill: urlBoxBg, cornerRadius: 10, listening: false },
            urlTextConfig: { x: (w - urlBoxW) / 2 + 12, y: 48, text: url, fontSize: 11, fill: textColor, listening: false },
            dots,
        };
    });

    const terminalChromeConfig = computed(() => {
        const s = store.activeSettings;
        if (!s || s.frameType !== 'terminal') return null;
        const { w } = cardDimensions.value;
        const dots = s.frameShowButtons
            ? [
                  { x: 14, y: 14, radius: 5, fill: '#ff5f57' },
                  { x: 30, y: 14, radius: 5, fill: '#febc2e' },
                  { x: 46, y: 14, radius: 5, fill: '#28c840' },
              ]
            : [];
        return {
            barConfig: { x: 0, y: 0, width: w, height: CHROME_HEIGHT_TERMINAL, fill: '#1e1e1e', listening: false },
            separatorConfig: {
                points: [0, CHROME_HEIGHT_TERMINAL - 0.5, w, CHROME_HEIGHT_TERMINAL - 0.5],
                stroke: '#333333',
                strokeWidth: 1,
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
                fill: 'rgba(255,255,255,0.45)',
                align: 'center',
                verticalAlign: 'middle',
                listening: false,
            },
            dots,
        };
    });

    const minimalWindowChromeConfig = computed(() => {
        const s = store.activeSettings;
        if (!s || s.frameType !== 'window-minimal') return null;
        const { w } = cardDimensions.value;
        const dots = s.frameShowButtons
            ? [
                  { x: 14, y: 12, radius: 5, fill: '#ff5f57' },
                  { x: 30, y: 12, radius: 5, fill: '#febc2e' },
                  { x: 46, y: 12, radius: 5, fill: '#28c840' },
              ]
            : [];
        return {
            barConfig: { x: 0, y: 0, width: w, height: CHROME_HEIGHT_MINIMAL, fill: '#2a2a2a', listening: false },
            separatorConfig: {
                points: [0, CHROME_HEIGHT_MINIMAL - 0.5, w, CHROME_HEIGHT_MINIMAL - 0.5],
                stroke: '#363636',
                strokeWidth: 1,
                listening: false,
            },
            dots,
        };
    });

    const codeEditorChromeConfig = computed(() => {
        const s = store.activeSettings;
        if (!s || s.frameType !== 'code-editor') return null;
        const { w, h } = cardDimensions.value;
        const tabH = CHROME_HEIGHT_CODE_EDITOR_TAB;
        const aw = 40;
        const filename = s.frameTitle || 'index.ts';
        return {
            activityBarConfig: { x: 0, y: 0, width: aw, height: h, fill: '#1e1e1e', listening: false },
            activityBarBorderConfig: {
                points: [aw - 0.5, 0, aw - 0.5, h],
                stroke: '#333333',
                strokeWidth: 1,
                listening: false,
            },
            tabBarConfig: { x: aw, y: 0, width: w - aw, height: tabH, fill: '#252526', listening: false },
            tabBarBorderConfig: {
                points: [aw, tabH - 0.5, w, tabH - 0.5],
                stroke: '#3c3c3c',
                strokeWidth: 1,
                listening: false,
            },
            activeTabConfig: { x: aw, y: 0, width: 140, height: tabH, fill: '#1e1e1e', listening: false },
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

    return {
        stageConfig,
        canvasBgConfig,
        shadowRectConfig,
        cardGroupConfig,
        cardBgConfig,
        imageConfig,
        borderConfig,
        macosDotsConfig,
        browserChromeConfig,
        terminalChromeConfig,
        minimalWindowChromeConfig,
        codeEditorChromeConfig,
        cardDimensions,
        cardX,
        cardY,
        contentArea,
        chromeHeight,
        activityBarWidth,
    };
}
