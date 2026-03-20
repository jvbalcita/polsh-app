import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useCanvas } from '@/composables/useCanvas';
import { useEditorStore } from '@/stores/editor';
import { DEFAULT_SETTINGS } from '@/types/editor';

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({
        props: {
            auth: { user: null },
            imageLimit: 3,
            isPro: false,
        },
    }),
}));

describe('useCanvas', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('fits framed images inside browser chrome and targets adjust effects to the frame', () => {
        const store = useEditorStore();
        store.images = [
            {
                id: 'image-1',
                src: 'data:image/png;base64,test',
                element: {} as HTMLImageElement,
                naturalWidth: 1600,
                naturalHeight: 900,
                locked: false,
                settings: {
                    ...DEFAULT_SETTINGS,
                    frameType: 'browser',
                    canvasSize: 'twitter-landscape',
                },
            },
        ];

        const canvas = useCanvas(ref(1400), ref(900)) as Record<string, any>;

        expect(canvas.frameBounds.value.x).toBeGreaterThan(48);
        expect(canvas.frameBounds.value.y).toBe(48);
        expect(canvas.imageBounds.value).toMatchObject({
            x: 0,
            y: 72,
            width: canvas.frameBounds.value.width,
            height: canvas.frameBounds.value.height - 72,
        });
        expect(canvas.frameBounds.value.width).toBeLessThan(1200 - 96);
        expect(canvas.shadowRectConfig.value).toMatchObject({
            x: canvas.frameAbsoluteBounds.value.x,
            y: canvas.frameAbsoluteBounds.value.y,
            width: canvas.frameAbsoluteBounds.value.width,
            height: canvas.frameAbsoluteBounds.value.height,
        });
        expect(canvas.borderConfig.value).toMatchObject({
            x: canvas.frameAbsoluteBounds.value.x + 0.5,
            y: canvas.frameAbsoluteBounds.value.y + 0.5,
        });
        expect(canvas.exportBounds.value).toEqual(canvas.cardBounds.value);
        expect(canvas.imageConfig.value.crop).toBeUndefined();
        expect(canvas.imageConfig.value.y).toBe(72);
        expect(canvas.imageConfig.value.width).toBeCloseTo(
            canvas.imageBounds.value.width,
            6,
        );
    });

    it('supports zooming and panning the framed image without losing the viewport bounds', () => {
        const store = useEditorStore();
        store.images = [
            {
                id: 'image-2',
                src: 'data:image/png;base64,test',
                element: {} as HTMLImageElement,
                naturalWidth: 1600,
                naturalHeight: 900,
                locked: false,
                settings: {
                    ...DEFAULT_SETTINGS,
                    frameType: 'browser',
                    canvasSize: 'twitter-landscape',
                    imageZoom: 1.8,
                    imageOffsetX: 1,
                    imageOffsetY: -1,
                } as typeof DEFAULT_SETTINGS & {
                    imageZoom: number;
                    imageOffsetX: number;
                    imageOffsetY: number;
                },
            },
        ];

        const canvas = useCanvas(ref(1400), ref(900)) as Record<string, any>;

        expect(canvas.imageConfig.value.width).toBeGreaterThan(
            canvas.imageBounds.value.width,
        );
        expect(canvas.imageConfig.value.x).toBeLessThan(
            canvas.imageBounds.value.x,
        );
        expect(canvas.imageConfig.value.y).toBe(canvas.imageBounds.value.y);
        expect(canvas.imageClipConfig.value).toEqual({
            x: canvas.imageBounds.value.x,
            y: canvas.imageBounds.value.y,
            width: canvas.imageBounds.value.width,
            height: canvas.imageBounds.value.height,
            cornerRadii: {
                topLeft: 0,
                topRight: 0,
                bottomRight: 10,
                bottomLeft: 10,
            },
        });
    });
});
