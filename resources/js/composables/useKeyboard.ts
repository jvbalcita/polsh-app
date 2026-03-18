import { useEventListener } from '@vueuse/core';
import { useEditorStore } from '@/stores/editor';
import { useExport } from './useExport';
import { useHistory } from './useHistory';

export function useKeyboard(): void {
    const store = useEditorStore();
    const { exportSingle } = useExport();
    const { undo, redo } = useHistory();

    useEventListener(window, 'keydown', async (e: KeyboardEvent) => {
        const meta = e.metaKey || e.ctrlKey;

        // Ignore shortcuts when the user is typing in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        // Cmd+S → export single
        if (meta && !e.shiftKey && e.key === 's') {
            e.preventDefault();
            const fmt = store.exportSettings.exportFormat as 'png' | 'webp' | 'jpeg' | 'svg';
            const scale = store.exportSettings.exportResolution as 1 | 2 | 4;
            await exportSingle(fmt === 'svg' ? 'png' : fmt, scale);
            return;
        }

        // Cmd+Shift+Z → redo
        if (meta && e.shiftKey && e.key === 'z') {
            e.preventDefault();
            redo();
            return;
        }

        // Cmd+Z → undo
        if (meta && !e.shiftKey && e.key === 'z') {
            e.preventDefault();
            undo();
            return;
        }

        // Cmd+V → paste image from clipboard
        if (meta && !e.shiftKey && e.key === 'v') {
            // Only intercept if there's no focused text input; native paste should still work normally
            if (document.activeElement === document.body || document.activeElement === null) {
                e.preventDefault();
                await pasteImageFromClipboard();
            }
        }
    });

    async function pasteImageFromClipboard(): Promise<void> {
        if (!navigator.clipboard?.read) {
            // Fallback for browsers without clipboard API support
            return;
        }

        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                const imageType = item.types.find((t) => t.startsWith('image/'));
                if (!imageType) continue;
                const blob = await item.getType(imageType);
                const ext = imageType.split('/')[1] ?? 'png';
                const file = new File([blob], `paste.${ext}`, { type: imageType });
                await store.addImage(file);
                break;
            }
        } catch {
            // Clipboard access may be denied — fail silently
        }
    }
}
