export type DesktopPlatform = 'macos' | 'windows';

export interface ImagePlacementInput {
    viewportX: number;
    viewportY: number;
    viewportWidth: number;
    viewportHeight: number;
    imageWidth: number;
    imageHeight: number;
    zoom: number;
    offsetX: number;
    offsetY: number;
}

export interface ImagePlacement {
    x: number;
    y: number;
    width: number;
    height: number;
    isClipped: boolean;
}

export interface FrameLayoutInput {
    areaX: number;
    areaY: number;
    areaWidth: number;
    areaHeight: number;
    imageWidth: number;
    imageHeight: number;
    topInset: number;
    leftInset: number;
    bottomInset?: number;
    rightInset?: number;
}

export interface FrameLayout {
    frame: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface WindowControlButton {
    kind: 'close' | 'maximize' | 'minimize';
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WindowControlsLayout {
    platform: DesktopPlatform;
    alignment: 'left' | 'right';
    buttons: WindowControlButton[];
}

export interface WindowControlsInput {
    framePlatform: DesktopPlatform;
    width: number;
    height: number;
    inset?: number;
}

interface BasePreset {
    id: string;
    label: string;
}

export interface SolidPreset extends BasePreset {
    solidColor: string;
}

export interface GradientPreset extends BasePreset {
    gradientStart: string;
    gradientEnd: string;
    gradientAngle: number;
    gradientIsRadial: boolean;
}

export interface BackgroundPresetCollection {
    solid: SolidPreset[];
    gradient: GradientPreset[];
    mesh: GradientPreset[];
    abstract: GradientPreset[];
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function calculateImagePlacement(
    input: ImagePlacementInput,
): ImagePlacement {
    const safeZoom = Math.max(1, input.zoom);
    const baseScale = Math.min(
        input.viewportWidth / input.imageWidth,
        input.viewportHeight / input.imageHeight,
    );

    const width = input.imageWidth * baseScale * safeZoom;
    const height = input.imageHeight * baseScale * safeZoom;
    const centerX = input.viewportX + (input.viewportWidth - width) / 2;
    const centerY = input.viewportY + (input.viewportHeight - height) / 2;
    const maxOffsetX = Math.max(0, (width - input.viewportWidth) / 2);
    const maxOffsetY = Math.max(0, (height - input.viewportHeight) / 2);

    return {
        x: centerX - clamp(input.offsetX, -1, 1) * maxOffsetX,
        y: centerY - clamp(input.offsetY, -1, 1) * maxOffsetY,
        width,
        height,
        isClipped: width > input.viewportWidth || height > input.viewportHeight,
    };
}

export function calculateFrameLayout(input: FrameLayoutInput): FrameLayout {
    const bottomInset = input.bottomInset ?? 0;
    const rightInset = input.rightInset ?? 0;
    const safeImageAspect =
        input.imageWidth > 0 && input.imageHeight > 0
            ? input.imageWidth / input.imageHeight
            : 16 / 9;
    const maxViewportWidth = Math.max(
        0,
        input.areaWidth - input.leftInset - rightInset,
    );
    const maxViewportHeight = Math.max(
        0,
        input.areaHeight - input.topInset - bottomInset,
    );

    let viewportWidth = Math.max(
        0,
        Math.min(maxViewportWidth, maxViewportHeight * safeImageAspect),
    );
    let viewportHeight = Math.max(0, viewportWidth / safeImageAspect);

    if (viewportHeight + input.topInset + bottomInset > input.areaHeight) {
        viewportHeight = maxViewportHeight;
        viewportWidth = viewportHeight * safeImageAspect;
    }

    const frameWidth = viewportWidth + input.leftInset + rightInset;
    const frameHeight = viewportHeight + input.topInset + bottomInset;
    const frameX = input.areaX + (input.areaWidth - frameWidth) / 2;
    const frameY = input.areaY + (input.areaHeight - frameHeight) / 2;

    return {
        frame: {
            x: frameX,
            y: frameY,
            width: frameWidth,
            height: frameHeight,
        },
        viewport: {
            x: frameX + input.leftInset,
            y: frameY + input.topInset,
            width: viewportWidth,
            height: viewportHeight,
        },
    };
}

export function getDesktopWindowControls(
    input: WindowControlsInput,
): WindowControlsLayout {
    const inset = input.inset ?? 14;

    if (input.framePlatform === 'windows') {
        const minimizeWidth = 28;
        const maximizeWidth = 28;
        const closeWidth = 34;
        const buttonHeight = input.height;
        const firstButtonX =
            input.width - (minimizeWidth + maximizeWidth + closeWidth);

        return {
            platform: 'windows',
            alignment: 'right',
            buttons: [
                {
                    kind: 'minimize',
                    x: firstButtonX,
                    y: 0,
                    width: minimizeWidth,
                    height: buttonHeight,
                },
                {
                    kind: 'maximize',
                    x: firstButtonX + minimizeWidth,
                    y: 0,
                    width: maximizeWidth,
                    height: buttonHeight,
                },
                {
                    kind: 'close',
                    x: firstButtonX + minimizeWidth + maximizeWidth,
                    y: 0,
                    width: closeWidth,
                    height: buttonHeight,
                },
            ],
        };
    }

    return {
        platform: 'macos',
        alignment: 'left',
        buttons: [
            {
                kind: 'close',
                x: inset,
                y: input.height / 2,
                width: 10,
                height: 10,
            },
            {
                kind: 'minimize',
                x: inset + 16,
                y: input.height / 2,
                width: 10,
                height: 10,
            },
            {
                kind: 'maximize',
                x: inset + 32,
                y: input.height / 2,
                width: 10,
                height: 10,
            },
        ],
    };
}

export const BACKGROUND_PRESETS: BackgroundPresetCollection = {
    solid: [
        { id: 'solid-carbon', label: 'Carbon', solidColor: '#0b0d12' },
        { id: 'solid-paper', label: 'Paper', solidColor: '#f6efe5' },
        { id: 'solid-ocean', label: 'Ocean', solidColor: '#175cd3' },
        { id: 'solid-ember', label: 'Ember', solidColor: '#f25c2f' },
        { id: 'solid-sage', label: 'Sage', solidColor: '#7d9d87' },
        { id: 'solid-plum', label: 'Plum', solidColor: '#6d28d9' },
    ],
    gradient: [
        {
            id: 'gradient-midnight',
            label: 'Midnight',
            gradientStart: '#0b1020',
            gradientEnd: '#223055',
            gradientAngle: 135,
            gradientIsRadial: false,
        },
        {
            id: 'gradient-sunrise',
            label: 'Sunrise',
            gradientStart: '#ffedd5',
            gradientEnd: '#fb7185',
            gradientAngle: 120,
            gradientIsRadial: false,
        },
        {
            id: 'gradient-calm',
            label: 'Calm',
            gradientStart: '#dbeafe',
            gradientEnd: '#2563eb',
            gradientAngle: 135,
            gradientIsRadial: false,
        },
        {
            id: 'gradient-aurora',
            label: 'Aurora',
            gradientStart: '#115e59',
            gradientEnd: '#99f6e4',
            gradientAngle: 145,
            gradientIsRadial: false,
        },
        {
            id: 'gradient-cotton',
            label: 'Cotton',
            gradientStart: '#fff1f2',
            gradientEnd: '#f472b6',
            gradientAngle: 160,
            gradientIsRadial: false,
        },
        {
            id: 'gradient-glow',
            label: 'Glow',
            gradientStart: '#fff7ed',
            gradientEnd: '#fdba74',
            gradientAngle: 0,
            gradientIsRadial: true,
        },
    ],
    mesh: [
        {
            id: 'mesh-lagoon',
            label: 'Lagoon',
            gradientStart: '#0f172a',
            gradientEnd: '#38bdf8',
            gradientAngle: 210,
            gradientIsRadial: false,
        },
        {
            id: 'mesh-sherbet',
            label: 'Sherbet',
            gradientStart: '#ffe4e6',
            gradientEnd: '#fb7185',
            gradientAngle: 45,
            gradientIsRadial: false,
        },
        {
            id: 'mesh-mint',
            label: 'Mint',
            gradientStart: '#ecfccb',
            gradientEnd: '#14b8a6',
            gradientAngle: 300,
            gradientIsRadial: false,
        },
        {
            id: 'mesh-ink',
            label: 'Ink',
            gradientStart: '#111827',
            gradientEnd: '#6366f1',
            gradientAngle: 135,
            gradientIsRadial: false,
        },
        {
            id: 'mesh-peach',
            label: 'Peach',
            gradientStart: '#ffedd5',
            gradientEnd: '#f97316',
            gradientAngle: 24,
            gradientIsRadial: false,
        },
        {
            id: 'mesh-frost',
            label: 'Frost',
            gradientStart: '#e0f2fe',
            gradientEnd: '#9333ea',
            gradientAngle: 316,
            gradientIsRadial: false,
        },
    ],
    abstract: [
        {
            id: 'abstract-gallery',
            label: 'Gallery',
            gradientStart: '#f6efe5',
            gradientEnd: '#d9c2a3',
            gradientAngle: 145,
            gradientIsRadial: false,
        },
        {
            id: 'abstract-signal',
            label: 'Signal',
            gradientStart: '#131a38',
            gradientEnd: '#3056ff',
            gradientAngle: 135,
            gradientIsRadial: false,
        },
        {
            id: 'abstract-fresco',
            label: 'Fresco',
            gradientStart: '#fff7ed',
            gradientEnd: '#fdba74',
            gradientAngle: 125,
            gradientIsRadial: false,
        },
        {
            id: 'abstract-studio',
            label: 'Studio',
            gradientStart: '#0b0d12',
            gradientEnd: '#2b2f3a',
            gradientAngle: 135,
            gradientIsRadial: false,
        },
        {
            id: 'abstract-candy',
            label: 'Candy',
            gradientStart: '#fdf2f8',
            gradientEnd: '#ec4899',
            gradientAngle: 155,
            gradientIsRadial: false,
        },
        {
            id: 'abstract-verde',
            label: 'Verde',
            gradientStart: '#ecfdf5',
            gradientEnd: '#10b981',
            gradientAngle: 150,
            gradientIsRadial: false,
        },
        {
            id: 'abstract-editorial',
            label: 'Editorial',
            gradientStart: '#e2e8f0',
            gradientEnd: '#475569',
            gradientAngle: 160,
            gradientIsRadial: false,
        },
        {
            id: 'abstract-dusk',
            label: 'Dusk',
            gradientStart: '#312e81',
            gradientEnd: '#f472b6',
            gradientAngle: 130,
            gradientIsRadial: false,
        },
    ],
};
