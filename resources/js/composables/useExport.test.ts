import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExport, registerStage } from '@/composables/useExport';
import { useEditorStore } from '@/stores/editor';
import { DEFAULT_SETTINGS } from '@/types/editor';

function mockAnchorCreation(): void {
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation(
        (tagName: string) => {
            if (tagName === 'a') {
                const anchor = originalCreateElement('a');
                anchor.click = vi.fn();

                return anchor;
            }

            return originalCreateElement(tagName);
        },
    );
}

function readBlobAsText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
    });
}

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({
        props: {
            auth: { user: null },
            imageLimit: 3,
            isPro: false,
        },
    }),
}));

describe('useExport', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.restoreAllMocks();
        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(() => 'blob:mock'),
            revokeObjectURL: vi.fn(),
        });
        mockAnchorCreation();
    });

    it('crops raster exports to the edited artifact without workspace padding', async () => {
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
                },
            },
        ];

        const workspaceBackground = {
            visible: vi.fn(),
        };
        const toDataURL = vi.fn(() => 'data:image/png;base64,export');
        (registerStage as any)(
            {
                toDataURL,
                getLayers: () => [
                    {
                        getChildren: () => [workspaceBackground],
                    },
                ],
            },
            { x: 64, y: 149, width: 1272, height: 715 },
        );

        const appendChild = vi.spyOn(document.body, 'appendChild');
        const removeChild = vi.spyOn(document.body, 'removeChild');
        const originalCreateElement = document.createElement.bind(document);
        const createElement = vi.spyOn(document, 'createElement');
        let click: ReturnType<typeof vi.fn> | null = null;
        createElement.mockImplementation((tagName: string) => {
            if (tagName === 'a') {
                const anchor = originalCreateElement('a');
                click = vi.fn();
                anchor.click = click;

                return anchor;
            }

            return originalCreateElement(tagName);
        });

        const { exportSingle } = useExport();

        await exportSingle('png', 2);

        expect(toDataURL).toHaveBeenCalledWith(
            expect.objectContaining({
                x: 64,
                y: 149,
                width: 1272,
                height: 715,
                mimeType: 'image/png',
                pixelRatio: 2,
            }),
        );
        expect(workspaceBackground.visible).toHaveBeenNthCalledWith(1, false);
        expect(workspaceBackground.visible).toHaveBeenNthCalledWith(2, true);
        expect(click).not.toBeNull();
        expect(click).toHaveBeenCalledOnce();
        expect(appendChild).toHaveBeenCalledOnce();
        expect(removeChild).toHaveBeenCalledOnce();
    });

    it('includes code editor overlays in SVG exports', async () => {
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
                    frameTitle: 'editor.ts',
                },
            },
        ];

        let exportedBlob: Blob | null = null;
        vi.mocked(URL.createObjectURL).mockImplementation(
            (blob: Blob | MediaSource) => {
                exportedBlob = blob as Blob;

                return 'blob:svg-export';
            },
        );
        vi.mocked(URL.revokeObjectURL).mockImplementation(() => {});

        const { exportSVG } = useExport();

        exportSVG();

        expect(exportedBlob).not.toBeNull();
        const svg = await readBlobAsText(exportedBlob!);
        expect(svg).toContain('#007acc');
        expect(svg).toContain('editor.ts');
        expect(svg).toContain('noise-filter');
        expect(svg).toContain('mix-blend-mode: overlay');
    });

    it('includes browser frame title and URL in SVG exports', async () => {
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
                    frameType: 'browser',
                    frameTitle: 'Launch & Notes',
                    frameUrl: 'polsh.app?a=1&b=2',
                    canvasSize: 'stories',
                    gradientIsRadial: true,
                },
            },
        ];

        let exportedBlob: Blob | null = null;
        vi.mocked(URL.createObjectURL).mockImplementation(
            (blob: Blob | MediaSource) => {
                exportedBlob = blob as Blob;

                return 'blob:svg-export';
            },
        );

        const { exportSVG } = useExport();

        exportSVG();

        expect(exportedBlob).not.toBeNull();
        const svg = await readBlobAsText(exportedBlob!);
        expect(svg).toContain('width="1080" height="1920"');
        expect(svg).toContain('<radialGradient id="bg-grad"');
        expect(svg).toContain('Launch &amp; Notes');
        expect(svg).toContain('polsh.app?a=1&amp;b=2');
        expect(svg).toContain('<rect x="124" y="54" width="140"');
        expect(svg).toContain('<rect x="410" y="92" width="260"');
    });

    it('sizes browser SVG chrome from the card width on small canvases', async () => {
        const store = useEditorStore();
        store.images = [
            {
                id: 'image-4',
                src: 'data:image/png;base64,test',
                element: {} as HTMLImageElement,
                naturalWidth: 1200,
                naturalHeight: 1200,
                locked: false,
                settings: {
                    ...DEFAULT_SETTINGS,
                    frameType: 'browser',
                    canvasSize: 'custom-400x400',
                },
            },
        ];

        let exportedBlob: Blob | null = null;
        vi.mocked(URL.createObjectURL).mockImplementation(
            (blob: Blob | MediaSource) => {
                exportedBlob = blob as Blob;

                return 'blob:svg-export';
            },
        );

        const { exportSVG } = useExport();

        exportSVG();

        expect(exportedBlob).not.toBeNull();
        const svg = await readBlobAsText(exportedBlob!);
        expect(svg).toContain(
            '<rect x="139.2" y="92" width="121.60000000000001"',
        );
    });

    it('exports windows browser chrome and transformed image placement in SVG', async () => {
        const store = useEditorStore();
        store.images = [
            {
                id: 'image-5',
                src: 'data:image/png;base64,test',
                element: {} as HTMLImageElement,
                naturalWidth: 1600,
                naturalHeight: 900,
                locked: false,
                settings: {
                    ...DEFAULT_SETTINGS,
                    frameType: 'browser',
                    framePlatform: 'windows',
                    frameTitle: 'Windows Preview',
                    frameUrl: 'polsh.app/editor',
                    imageZoom: 1.8,
                    imageOffsetX: 1,
                    imageOffsetY: -1,
                } as typeof DEFAULT_SETTINGS & {
                    framePlatform: 'windows';
                    imageZoom: number;
                    imageOffsetX: number;
                    imageOffsetY: number;
                },
            },
        ];

        let exportedBlob: Blob | null = null;
        vi.mocked(URL.createObjectURL).mockImplementation(
            (blob: Blob | MediaSource) => {
                exportedBlob = blob as Blob;

                return 'blob:svg-export';
            },
        );

        const { exportSVG } = useExport();

        exportSVG();

        expect(exportedBlob).not.toBeNull();
        const svg = await readBlobAsText(exportedBlob!);
        expect(svg).toContain('data-platform="windows"');
        expect(svg).toContain('data-window-control="close"');
        expect(svg).toContain('Windows Preview');
        expect(svg).toContain('preserveAspectRatio="none"');
    });
});
