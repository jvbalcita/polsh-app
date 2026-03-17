export interface StyleBackground {
    type: 'gradient' | 'solid';
    colors: [string, string];
    angle: number;
}

export interface StyleBorder {
    type: 'glass' | 'neon' | 'glow' | 'subtle' | 'none';
    width: number;
    opacity: number;
    blur: number;
}

export interface StyleShadow {
    opacity: number;
    blur: number;
    offsetY: number;
    color: string;
}

export interface StyleConfig {
    slug: string;
    name: string;
    background: StyleBackground;
    border: StyleBorder;
    shadow: StyleShadow;
    radius: number;
    noise: number;
    padding: number;
    chrome: null | 'macos' | 'browser';
}
