import { computed, ref, watch } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { ImageSettings } from '@/types/editor';

const MAX_HISTORY = 20;
const DEBOUNCE_MS = 400;

// Module-level state — history persists across the editor session
const stack = ref<ImageSettings[]>([]);
const cursor = ref<number>(-1);
let isApplying = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

function deepEqual(a: ImageSettings, b: ImageSettings): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

function snapshot(settings: ImageSettings): void {
    if (isApplying) return;

    const entry: ImageSettings = { ...settings };

    if (cursor.value >= 0 && deepEqual(stack.value[cursor.value], entry)) {
        return;
    }

    stack.value.splice(cursor.value + 1);

    if (stack.value.length >= MAX_HISTORY) {
        stack.value.shift();
    }

    stack.value.push(entry);
    cursor.value = stack.value.length - 1;
}

export function useHistory() {
    const store = useEditorStore();

    if (!initialized) {
        initialized = true;

        // Seed the stack once settings become available
        watch(
            () => store.activeSettings,
            (settings) => {
                if (settings && cursor.value === -1) {
                    stack.value = [{ ...settings }];
                    cursor.value = 0;
                }
            },
            { immediate: true },
        );

        // Debounced watcher — records a snapshot 400ms after the last change
        watch(
            () => store.activeSettings,
            (settings) => {
                if (!settings) return;
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => snapshot({ ...settings }), DEBOUNCE_MS);
            },
            { deep: true },
        );
    }

    const canUndo = computed(() => cursor.value > 0);
    const canRedo = computed(() => cursor.value < stack.value.length - 1);

    function applyEntry(entry: ImageSettings): void {
        const img = store.images[store.activeIndex];
        if (!img) return;
        isApplying = true;
        img.settings = { ...entry };
        setTimeout(() => {
            isApplying = false;
        }, 0);
    }

    function undo(): void {
        if (!canUndo.value) return;
        cursor.value -= 1;
        applyEntry(stack.value[cursor.value]);
    }

    function redo(): void {
        if (!canRedo.value) return;
        cursor.value += 1;
        applyEntry(stack.value[cursor.value]);
    }

    return { undo, redo, canUndo, canRedo };
}
