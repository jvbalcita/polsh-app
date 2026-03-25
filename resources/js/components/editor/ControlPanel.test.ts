import { describe, expect, it, vi } from 'vitest';
import { createApp, nextTick } from 'vue';
import ControlPanel from '@/components/editor/ControlPanel.vue';

const pageProps = vi.hoisted(() => ({
    auth: { user: { id: 1 } },
    isPro: false,
    teamId: null,
}));

const savePresetMock = vi.hoisted(() => vi.fn());

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({ props: pageProps }),
}));

vi.mock('@/components/editor/UpgradeModal.vue', () => ({
    default: { template: '<div data-test="upgrade-modal" />' },
}));

vi.mock('@/stores/editor', () => ({
    useEditorStore: () => ({
        activeSettings: {
            backgroundType: 'gradient',
            frameType: 'none',
            framePlatform: 'macos',
            frameTitle: 'My App',
            frameUrl: 'example.com',
            frameShowButtons: true,
            gradientStart: '#000000',
            gradientEnd: '#ffffff',
            gradientAngle: 90,
            gradientIsRadial: false,
            solidColor: '#000000',
            imageZoom: 1,
            imageOffsetX: 0,
            imageOffsetY: 0,
            padding: 48,
            radius: 12,
            shadow: 50,
            shadowBlur: 40,
            shadowColor: '#000000',
            border: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            noiseGrain: 0.03,
            aspectRatio: '16:9',
            canvasSize: 'twitter-landscape',
        },
        activeStyle: { name: 'My Preset' },
        presets: [],
        updateSetting: vi.fn(),
        setFramePlatform: vi.fn(),
        savePreset: savePresetMock,
    }),
}));

vi.mock('@/composables/editorPresentation', () => ({
    BACKGROUND_PRESETS: {
        gradient: [],
        mesh: [],
        abstract: [],
        solid: [],
    },
}));

async function renderPanel() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    createApp(ControlPanel as never).mount(container);
    await nextTick();

    return container;
}

describe('control panel preset save', () => {
    it('keeps the form open without rendering an inline error after a failed save', async () => {
        savePresetMock.mockRejectedValueOnce(
            new Error('Choose an image and style before saving a preset.'),
        );

        const container = await renderPanel();

        const adjustTab = Array.from(container.querySelectorAll('button')).find(
            (button) => button.textContent?.trim() === 'Adjust',
        );

        adjustTab?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await nextTick();

        const openButton = Array.from(
            container.querySelectorAll('button'),
        ).find(
            (button) => button.textContent?.trim() === 'Save current as preset',
        );

        openButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await nextTick();

        const saveButton = Array.from(
            container.querySelectorAll('button'),
        ).find((button) => button.textContent?.trim() === 'Save');

        saveButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
        await nextTick();

        expect(container.textContent).toContain('Save');
        expect(container.textContent).not.toContain(
            'Choose an image and style before saving a preset.',
        );
    });
});
