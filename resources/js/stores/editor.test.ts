import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditorStore } from '@/stores/editor';
import { DEFAULT_SETTINGS } from '@/types/editor';

const { fetchMock, toastErrorMock } = vi.hoisted(() => ({
    fetchMock: vi.fn(),
    toastErrorMock: vi.fn(),
}));

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({
        props: {
            auth: { user: null },
            imageLimit: 3,
            isPro: false,
        },
    }),
}));

vi.mock('vue-sonner', () => ({
    toast: {
        error: toastErrorMock,
    },
}));

describe('editor store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        fetchMock.mockReset();
        toastErrorMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
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

    it('throws the validation message when preset save returns 422', async () => {
        const store = useEditorStore();

        store.images = [
            {
                id: 'image-3',
                src: 'data:image/png;base64,test',
                element: {} as HTMLImageElement,
                naturalWidth: 1600,
                naturalHeight: 900,
                locked: false,
                settings: {
                    ...DEFAULT_SETTINGS,
                    styleSlug: 'obsidian-glass',
                },
            },
        ];

        fetchMock.mockResolvedValue({
            ok: false,
            json: async () => ({
                errors: {
                    style_slug: ['The style slug field is required.'],
                },
            }),
        });

        await expect(store.savePreset('Broken preset')).rejects.toThrow(
            'The style slug field is required.',
        );

        expect(toastErrorMock).toHaveBeenCalledWith(
            'The style slug field is required.',
        );
    });

    it('does not send a preset request when no active style slug is available', async () => {
        const store = useEditorStore();

        store.images = [
            {
                id: 'image-4',
                src: 'data:image/png;base64,test',
                element: {} as HTMLImageElement,
                naturalWidth: 1600,
                naturalHeight: 900,
                locked: false,
                settings: {
                    ...DEFAULT_SETTINGS,
                    styleSlug: '',
                },
            },
        ];

        await expect(store.savePreset('Broken preset')).rejects.toThrow(
            'Choose an image and style before saving a preset.',
        );

        expect(fetchMock).not.toHaveBeenCalled();
        expect(toastErrorMock).toHaveBeenCalledWith(
            'Choose an image and style before saving a preset.',
        );
    });
});
