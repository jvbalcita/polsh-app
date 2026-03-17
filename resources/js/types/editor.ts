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

export interface EditorImage {
    id: string;
    src: string;
    element: HTMLImageElement;
    naturalWidth: number;
    naturalHeight: number;
}
