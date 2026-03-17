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

const CHROME_HEIGHT_MACOS = 36;
const CHROME_HEIGHT_BROWSER = 72;
const CANVAS_MARGIN = 64;

function angleToGradientPoints(
    angle: number,
    width: number,
    height: number,
): { start: { x: number; y: number }; end: { x: number; y: number } } {
    const rad = ((angle - 90) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const mag = Math.abs(cos * width / 2) + Math.abs(sin * height / 2);
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

function getBorderStrokeColor(style: StyleConfig): string {
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
            return 'transparent';
    }
}

export function useCanvas(containerWidth: Ref<number>, containerHeight: Ref<number>) {
    const store = useEditorStore();

    const chromeHeight = computed<number>(() => {
        const c = store.activeStyle?.chrome;
        if (c === 'macos') return CHROME_HEIGHT_MACOS;
        if (c === 'browser') return CHROME_HEIGHT_BROWSER;
        return 0;
    });

    const cardDimensions = computed<{ w: number; h: number }>(() => {
        const ratio = ASPECT_RATIOS[store.settings.aspectRatio] ?? 16 / 9;
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

    const contentArea = computed(() => {
        const pad = store.settings.padding;
        const { w, h } = cardDimensions.value;
        const ch = chromeHeight.value;
        return {
            x: pad,
            y: pad + ch,
            width: Math.max(0, w - pad * 2),
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
        const style = store.activeStyle;
        const { w, h } = cardDimensions.value;
        return {
            x: cardX.value,
            y: cardY.value,
            width: w,
            height: h,
            cornerRadius: store.settings.radius,
            fill: 'transparent',
            shadowColor: style.shadow.color,
            shadowBlur: store.settings.shadowBlur,
            shadowOpacity: store.settings.shadowOpacity,
            shadowOffsetY: store.settings.shadowOffsetY,
            listening: false,
        };
    });

    const cardGroupConfig = computed(() => ({
        x: cardX.value,
        y: cardY.value,
        clipFunc: (ctx: CanvasRenderingContext2D) => {
            const r = store.settings.radius;
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
        const style = store.activeStyle;
        const { w, h } = cardDimensions.value;
        const { colors, type, angle } = style.background;

        const base = { x: 0, y: 0, width: w, height: h, listening: false };

        if (type === 'solid') {
            return { ...base, fill: colors[0] };
        }

        const pts = angleToGradientPoints(angle, w, h);
        return {
            ...base,
            fillLinearGradientStartPoint: pts.start,
            fillLinearGradientEndPoint: pts.end,
            fillLinearGradientColorStops: [0, colors[0], 1, colors[1]],
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
        const style = store.activeStyle;
        if (style.border.type === 'none' || store.settings.borderWidth <= 0) {
            return null;
        }
        const { w, h } = cardDimensions.value;
        const bw = store.settings.borderWidth;
        const strokeColor = getBorderStrokeColor(style);
        const isShadowBorder = style.border.type === 'neon' || style.border.type === 'glow';

        return {
            x: cardX.value + bw / 2,
            y: cardY.value + bw / 2,
            width: w - bw,
            height: h - bw,
            cornerRadius: store.settings.radius,
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
        if (store.activeStyle?.chrome !== 'macos') return null;
        const { w } = cardDimensions.value;
        const isDark = isStyleDark(store.activeStyle);
        return {
            barConfig: {
                x: 0,
                y: 0,
                width: w,
                height: CHROME_HEIGHT_MACOS,
                fill: isDark ? '#2d2d2d' : '#e8e8e8',
                listening: false,
            },
            separatorConfig: {
                points: [0, CHROME_HEIGHT_MACOS - 0.5, w, CHROME_HEIGHT_MACOS - 0.5],
                stroke: isDark ? '#3a3a3a' : '#d0d0d0',
                strokeWidth: 1,
                listening: false,
            },
            dots: [
                { x: 14, y: 18, radius: 6, fill: '#ff5f57' },
                { x: 34, y: 18, radius: 6, fill: '#febc2e' },
                { x: 54, y: 18, radius: 6, fill: '#28c840' },
            ],
        };
    });

    const browserChromeConfig = computed(() => {
        if (store.activeStyle?.chrome !== 'browser') return null;
        const { w } = cardDimensions.value;
        const isDark = isStyleDark(store.activeStyle);
        const tabBg = isDark ? '#1a1a1a' : '#dee1e6';
        const barBg = isDark ? '#2d2d2d' : '#f0f0f0';
        const urlBoxBg = isDark ? '#1a1a1a' : '#ffffff';
        const tabActiveBg = isDark ? '#2d2d2d' : '#f8f8f8';
        const textColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
        const urlBoxW = Math.min(260, w * 0.4);
        return {
            tabBarConfig: { x: 0, y: 0, width: w, height: 36, fill: tabBg, listening: false },
            activeTabConfig: { x: 76, y: 6, width: 140, height: 30, fill: tabActiveBg, cornerRadius: [6, 6, 0, 0], listening: false },
            tabTextConfig: { x: 92, y: 15, text: 'Tab', fontSize: 11, fill: textColor, listening: false },
            addressBarConfig: { x: 0, y: 36, width: w, height: 36, fill: barBg, listening: false },
            urlBoxConfig: { x: (w - urlBoxW) / 2, y: 44, width: urlBoxW, height: 20, fill: urlBoxBg, cornerRadius: 10, listening: false },
            urlTextConfig: { x: (w - urlBoxW) / 2 + 12, y: 48, text: 'example.com', fontSize: 11, fill: textColor, listening: false },
            dots: [
                { x: 14, y: 18, radius: 5, fill: '#ff5f57' },
                { x: 30, y: 18, radius: 5, fill: '#febc2e' },
                { x: 46, y: 18, radius: 5, fill: '#28c840' },
            ],
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
        cardDimensions,
        cardX,
        cardY,
        contentArea,
        chromeHeight,
    };
}

function isStyleDark(style: StyleConfig): boolean {
    const bg = style.background.colors[0];
    const hex = bg.replace('#', '');
    if (hex.length < 6) return true;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    // Perceived luminance
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}
