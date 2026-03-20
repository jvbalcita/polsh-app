import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('editor store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('defaults windows desktop frames to zero radius when switching platform', () => {
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
                    radius: 12,
                    framePlatform: 'macos',
                },
            },
        ];

        store.setFramePlatform('windows');

        expect(store.activeSettings?.framePlatform).toBe('windows');
        expect(store.activeSettings?.radius).toBe(0);
    });

    it('does not force zero radius for non-desktop frames when switching platform', () => {
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
                    frameType: 'code-editor',
                    radius: 12,
                    framePlatform: 'macos',
                },
            },
        ];

        store.setFramePlatform('windows');

        expect(store.activeSettings?.radius).toBe(12);
    });
});
