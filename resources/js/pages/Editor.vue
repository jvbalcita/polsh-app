<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Head, usePage } from '@inertiajs/vue3';
import CanvasStage from '@/components/editor/CanvasStage.vue';
import ControlPanel from '@/components/editor/ControlPanel.vue';
import ExportPanel from '@/components/editor/ExportPanel.vue';
import ImageStrip from '@/components/editor/ImageStrip.vue';
import StylePicker from '@/components/editor/StylePicker.vue';
import UserMenu from '@/components/UserMenu.vue';
import { useHistory } from '@/composables/useHistory';
import { useKeyboard } from '@/composables/useKeyboard';
import { useEditorStore } from '@/stores/editor';
import allStyles from '@/styles';
import type { EditorSettings } from '@/types/editor';

// Initialize history tracking and global keyboard shortcuts for this page
useHistory();
useKeyboard();

const page = usePage();
const store = useEditorStore();

const activeStyleName = computed(() => store.activeStyle?.name ?? '');
const hasImages = computed(() => store.images.length > 0);

// Restore editor state from a previous export session (when ?session= is in the URL)
onMounted(() => {
    const sessionData = page.props.sessionData as { style_slug: string; settings: EditorSettings } | null;
    if (!sessionData) return;

    const style = allStyles.find((s) => s.slug === sessionData.style_slug);
    if (style) {
        store.applyStyle(style);
    }
    Object.assign(store.settings, sessionData.settings);
});
</script>

<template>
    <Head title="Editor" />

    <!--
        Full-viewport dark editor — no AppLayout wrapper.
        Three-column layout: StylePicker | CanvasStage | ControlPanel
    -->
    <div
        class="flex h-screen w-screen select-none flex-col overflow-hidden"
        style="background: #080808"
    >
        <!-- Topbar: 3-column grid (wordmark | style name | user menu) -->
        <header class="editor-topbar shrink-0">
            <!-- Left: wordmark -->
            <div class="flex items-center gap-1.5">
                <span class="topbar-wordmark">polsh</span>
                <span class="topbar-slash">/ editor</span>
            </div>

            <!-- Center: active style name (fades in when an image is loaded) -->
            <div
                class="topbar-style-name"
                :style="{ opacity: hasImages ? 1 : 0 }"
            >
                {{ activeStyleName }}
            </div>

            <!-- Right: user menu -->
            <div class="flex items-center justify-end">
                <UserMenu />
            </div>
        </header>

        <!-- Main workspace -->
        <div class="flex min-h-0 flex-1">
            <!-- Left panel: Style Picker (164px) -->
            <aside
                class="flex w-[164px] shrink-0 flex-col border-r border-white/8"
                style="background: #111111"
            >
                <StylePicker />
            </aside>

            <!-- Center: Canvas + Image Strip -->
            <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
                <!-- Canvas stage (fills remaining height minus strip) -->
                <div class="min-h-0 flex-1">
                    <CanvasStage />
                </div>
                <!-- Image strip (auto-hides when empty) -->
                <ImageStrip />
            </main>

            <!-- Right panel: Controls + Export (280px) -->
            <aside
                class="flex w-[280px] shrink-0 flex-col border-l border-white/8"
                style="background: #111111"
            >
                <ControlPanel>
                    <ExportPanel />
                </ControlPanel>
            </aside>
        </div>
    </div>
</template>

<style scoped>
.editor-topbar {
    height: 48px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(10, 10, 12, 0.85);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 50;
}

.topbar-wordmark {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    font-weight: 500;
    color: #f0f0f2;
}

.topbar-slash {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    color: #4a4a58;
}

.topbar-style-name {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #8a8a9a;
    transition: opacity 300ms ease;
    white-space: nowrap;
}
</style>
