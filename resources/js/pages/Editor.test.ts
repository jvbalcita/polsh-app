import { describe, expect, it, vi } from 'vitest';
import { createApp, nextTick } from 'vue';
import EditorPage from '@/pages/Editor.vue';

const pageProps = vi.hoisted(() => ({
    auth: { user: { id: 1 } },
    isPro: false,
    sessionData: null,
}));

vi.mock('@inertiajs/vue3', () => ({
    Head: { template: '<div><slot /></div>' },
    usePage: () => ({ props: pageProps }),
}));

vi.mock('@/components/editor/CanvasStage.vue', () => ({
    default: { template: '<div data-test="canvas-stage" />' },
}));

vi.mock('@/components/editor/ControlPanel.vue', () => ({
    default: { template: '<div data-test="control-panel"><slot /></div>' },
}));

vi.mock('@/components/editor/ExportPanel.vue', () => ({
    default: { template: '<div data-test="export-panel" />' },
}));

vi.mock('@/components/editor/ImageStrip.vue', () => ({
    default: { template: '<div data-test="image-strip" />' },
}));

vi.mock('@/components/editor/StylePicker.vue', () => ({
    default: { template: '<div data-test="style-picker" />' },
}));

vi.mock('@/components/UserMenu.vue', () => ({
    default: { template: '<div data-test="user-menu" />' },
}));

vi.mock('@/components/ui/sonner', () => ({
    Toaster: { template: '<div data-test="toaster" />' },
}));

vi.mock('@/composables/useHistory', () => ({
    useHistory: vi.fn(),
}));

vi.mock('@/composables/useKeyboard', () => ({
    useKeyboard: vi.fn(),
}));

vi.mock('@/composables/useCanvas', () => ({
    CANVAS_SIZES: {
        'twitter-landscape': { label: 'Twitter Landscape', w: 1200, h: 675 },
        linkedin: { label: 'LinkedIn', w: 1200, h: 627 },
        'og-image': { label: 'OG Image', w: 1200, h: 630 },
        stories: { label: 'Stories', w: 1080, h: 1920 },
        'twitter-square': { label: 'Twitter Square', w: 1200, h: 1200 },
    },
}));

vi.mock('@/stores/editor', () => ({
    useEditorStore: () => ({
        activeStyle: null,
        images: [],
        activeSettings: null,
        updateSetting: vi.fn(),
        applyStyle: vi.fn(),
    }),
}));

vi.mock('@/styles', () => ({ default: [] }));

async function renderPage() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    createApp(EditorPage as never).mount(container);

    await nextTick();

    return container;
}

describe('editor page', () => {
    it('mounts the shared toaster for page-level toast feedback', async () => {
        await renderPage();

        expect(
            document.body.querySelector('[data-test="toaster"]'),
        ).not.toBeNull();
    });
});
