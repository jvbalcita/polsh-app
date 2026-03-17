import { computed, ref, watch } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { EditorSettings } from '@/types/editor';

const MAX_HISTORY = 20;
const DEBOUNCE_MS = 400;

// Module-level state — history persists across the editor session
const stack = ref<EditorSettings[]>([]);
const cursor = ref<number>(-1);
let isApplying = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

function deepEqual(a: EditorSettings, b: EditorSettings): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

function snapshot(settings: EditorSettings): void {
    if (isApplying) return;

    const entry: EditorSettings = { ...settings };

    // Skip if the value is identical to the current cursor position
    if (cursor.value >= 0 && deepEqual(stack.value[cursor.value], entry)) {
        return;
    }

    // Discard any "future" states that were created before the current edit
    stack.value.splice(cursor.value + 1);

    // Enforce max history length by dropping the oldest entries
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

        // Seed the stack with the current state on first call
        stack.value = [{ ...store.settings }];
        cursor.value = 0;

        // Debounced watcher — records a snapshot 400ms after the last change
        watch(
            () => store.settings,
            (settings) => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => snapshot({ ...settings }), DEBOUNCE_MS);
            },
            { deep: true },
        );
    }

    const canUndo = computed(() => cursor.value > 0);
    const canRedo = computed(() => cursor.value < stack.value.length - 1);

    function applyEntry(entry: EditorSettings): void {
        isApplying = true;
        Object.assign(store.settings, entry);
        // Allow one watcher tick before re-enabling snapshots
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
