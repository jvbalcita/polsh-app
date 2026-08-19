export interface ImageSettings {
    styleSlug: string;
    backgroundType: 'gradient' | 'solid' | 'mesh' | 'abstract' | 'transparent';
    gradientStart: string;
    gradientEnd: string;
    gradientAngle: number;
    gradientIsRadial: boolean;
    solidColor: string;
    frameType: string;
    framePlatform: 'macos' | 'windows';
    frameTitle: string;
    frameUrl: string;
    frameShowButtons: boolean;
    imageZoom: number;
    imageOffsetX: number;
    imageOffsetY: number;
    padding: number;
    radius: number;
    shadow: number; // 0–100 percent
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetY: number;
    border: number;
    borderColor: string;
    noiseGrain: number; // 0–0.3 decimal fraction
    aspectRatio: string;
    canvasSize: string;
}

export const DEFAULT_SETTINGS: ImageSettings = {
    styleSlug: 'obsidian-glass',
    backgroundType: 'gradient',
    gradientStart: '#0a0a0c',
    gradientEnd: '#1a1a2e',
    gradientAngle: 135,
    gradientIsRadial: false,
    solidColor: '#1a1a2e',
    frameType: 'none',
    framePlatform: 'macos',
    frameTitle: 'My App',
    frameUrl: 'example.com',
    frameShowButtons: true,
    imageZoom: 1,
    imageOffsetX: 0,
    imageOffsetY: 0,
    padding: 48,
    radius: 12,
    shadow: 50,
    shadowBlur: 40,
    shadowColor: '#000000',
    shadowOffsetY: 4,
    border: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    noiseGrain: 0.03,
    aspectRatio: '16:9',
    canvasSize: 'twitter-landscape',
};

export interface SessionImage {
    id: string;
    src: string;
    element: HTMLImageElement;
    naturalWidth: number;
    naturalHeight: number;
    locked: boolean;
    settings: ImageSettings;
}

/** Global export settings — not per-image */
export interface ExportSettings {
    exportFormat: string;
    exportResolution: number;
}

/** @deprecated Use SessionImage */
export type EditorImage = SessionImage;

/** @deprecated Use ImageSettings + ExportSettings */
export interface EditorSettings {
    padding: number;
    radius: number;
    shadowOpacity: number;
    shadowBlur: number;
    shadowOffsetY: number;
    borderWidth: number;
    noiseGrain: number;
    aspectRatio: string;
    exportFormat: string;
    exportResolution: number;
}
