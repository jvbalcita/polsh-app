<script setup lang="ts">
import { onMounted } from 'vue';
import { Head, Link, usePage } from '@inertiajs/vue3';
import CanvasStage from '@/components/editor/CanvasStage.vue';
import ControlPanel from '@/components/editor/ControlPanel.vue';
import ExportPanel from '@/components/editor/ExportPanel.vue';
import ImageStrip from '@/components/editor/ImageStrip.vue';
import StylePicker from '@/components/editor/StylePicker.vue';
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
        style="background: #080808; font-family: 'Geist', sans-serif"
    >
        <!-- Topbar -->
        <header
            class="flex h-11 shrink-0 items-center justify-between border-b border-white/8 px-4"
            style="background: #111111"
        >
            <div class="flex items-center gap-2">
                <span
                    class="text-sm font-semibold tracking-tight"
                    style="color: #e0ff4f"
                >
                    polsh
                </span>
                <span class="text-xs text-white/20">/ editor</span>
            </div>
            <div class="flex items-center gap-3">
                <!-- Auth-conditional nav links -->
                <template v-if="page.props.auth?.user">
                    <!-- History -->
                    <Link
                        href="/history"
                        title="Export history"
                        class="text-white/30 transition-colors hover:text-white/60"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </Link>
                    <!-- Team -->
                    <Link
                        href="/teams/settings"
                        title="Team"
                        class="text-white/30 transition-colors hover:text-white/60"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </Link>
                    <!-- API Docs (Pro only) -->
                    <Link
                        v-if="page.props.isPro"
                        href="/docs/api"
                        title="API docs"
                        class="text-white/30 transition-colors hover:text-white/60"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                    </Link>
                </template>
                <span v-else class="text-[11px] text-white/25">
                    Screenshot styling for developers
                </span>
            </div>
        </header>

        <!-- Main workspace -->
        <div class="flex min-h-0 flex-1">
            <!-- Left panel: Style Picker (212px) -->
            <aside
                class="flex w-[212px] shrink-0 flex-col border-r border-white/8"
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

            <!-- Right panel: Controls + Export (236px) -->
            <aside
                class="flex w-[236px] shrink-0 flex-col border-l border-white/8"
                style="background: #111111"
            >
                <ControlPanel>
                    <ExportPanel />
                </ControlPanel>
            </aside>
        </div>
    </div>
</template>
