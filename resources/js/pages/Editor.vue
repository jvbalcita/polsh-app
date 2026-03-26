<script setup lang="ts">
import { Head, usePage } from '@inertiajs/vue3';
import { useWindowSize } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';
import CanvasStage from '@/components/editor/CanvasStage.vue';
import ControlPanel from '@/components/editor/ControlPanel.vue';
import ExportPanel from '@/components/editor/ExportPanel.vue';
import ImageStrip from '@/components/editor/ImageStrip.vue';
import StylePicker from '@/components/editor/StylePicker.vue';
import { Toaster } from '@/components/ui/sonner';
import UserMenu from '@/components/UserMenu.vue';
import { CANVAS_SIZES } from '@/composables/useCanvas';
import { useHistory } from '@/composables/useHistory';
import { useKeyboard } from '@/composables/useKeyboard';
import { useEditorStore } from '@/stores/editor';
import allStyles from '@/styles';
// Initialize history tracking and global keyboard shortcuts for this page
useHistory();
useKeyboard();

const page = usePage();
const store = useEditorStore();

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

const activeStyleName = computed(() => store.activeStyle?.name ?? '');
const hasImages = computed(() => store.images.length > 0);

// ── Canvas size bar ─────────────────────────────────────────────────────────
// Quick-access pills shown above the canvas
const QUICK_SIZES = [
    'twitter-landscape',
    'linkedin',
    'og-image',
    'stories',
    'twitter-square',
] as const;

const activeCanvasSize = computed(
    () => store.activeSettings?.canvasSize ?? 'twitter-landscape',
);

function selectSize(key: string): void {
    store.updateSetting('canvasSize', key);
    showSizePopover.value = false;
}

const showSizePopover = ref(false);

// Custom size state
const customW = ref(1200);
const customH = ref(675);

function applyCustomSize(): void {
    const w = Math.max(100, Math.min(4000, customW.value));
    const h = Math.max(100, Math.min(4000, customH.value));
    // Store as a virtual key encoding the dimensions
    store.updateSetting('canvasSize', `custom-${w}x${h}`);
    showSizePopover.value = false;
}

// Restore editor state from a previous export session (when ?session= is in the URL)
// Session data restore is skipped in Phase 7.6+ since per-image settings require
// an active image to be present; this feature will be revisited in Phase 8.
onMounted(() => {
    const sessionData = page.props.sessionData as { style_slug: string } | null;

    if (!sessionData) {
        return;
    }

    const style = allStyles.find((s) => s.slug === sessionData.style_slug);

    if (style) {
        store.setPendingStyleFromSession(style.slug);
    }
});
</script>

<template>
    <Head title="Editor" />

    <!--
        Full-viewport dark editor — no AppLayout wrapper.
        Three-column layout: StylePicker | CanvasStage | ControlPanel
    -->
    <div
        class="flex h-screen w-screen flex-col overflow-hidden select-none"
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
                <!-- Canvas size bar -->
                <div class="canvas-size-bar">
                    <button
                        v-for="key in QUICK_SIZES"
                        :key="key"
                        type="button"
                        class="csb-pill"
                        :class="{
                            'csb-pill--active': activeCanvasSize === key,
                        }"
                        @click="selectSize(key)"
                    >
                        {{ CANVAS_SIZES[key].label }}
                    </button>

                    <!-- More sizes (···) -->
                    <div class="csb-more-wrap">
                        <button
                            type="button"
                            class="csb-pill"
                            :class="{
                                'csb-pill--active': !QUICK_SIZES.includes(
                                    activeCanvasSize as any,
                                ),
                            }"
                            @click="showSizePopover = !showSizePopover"
                        >
                            ···
                        </button>

                        <!-- Popover -->
                        <div
                            v-if="showSizePopover"
                            class="csb-popover"
                            @click.stop
                        >
                            <p class="csb-popover-label">All sizes</p>
                            <button
                                v-for="(meta, key) in CANVAS_SIZES"
                                :key="key"
                                type="button"
                                class="csb-popover-row"
                                :class="{
                                    'csb-popover-row--active':
                                        activeCanvasSize === key,
                                }"
                                @click="selectSize(key)"
                            >
                                <span class="csb-popover-name">{{
                                    meta.label
                                }}</span>
                                <span class="csb-popover-dim"
                                    >{{ meta.w }}×{{ meta.h }}</span
                                >
                            </button>

                            <div class="csb-popover-divider"></div>
                            <p class="csb-popover-label">Custom</p>
                            <div class="csb-custom-row">
                                <input
                                    v-model.number="customW"
                                    type="number"
                                    min="100"
                                    max="4000"
                                    class="csb-custom-input"
                                    placeholder="W"
                                />
                                <span class="csb-custom-sep">×</span>
                                <input
                                    v-model.number="customH"
                                    type="number"
                                    min="100"
                                    max="4000"
                                    class="csb-custom-input"
                                    placeholder="H"
                                />
                                <span class="csb-custom-unit">px</span>
                                <button
                                    type="button"
                                    class="csb-custom-apply"
                                    @click="applyCustomSize"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Canvas stage (fills remaining height minus strip) -->
                <div
                    class="canvas-workspace min-h-0 flex-1"
                    @click.self="showSizePopover = false"
                >
                    <CanvasStage @click="showSizePopover = false" />
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

    <Teleport to="body">
        <Toaster rich-colors theme="dark" position="bottom-right" />
    </Teleport>

    <Teleport to="body">
        <div v-if="isMobile" class="mobile-overlay">
            <div class="mobile-overlay-content">
                <span class="mobile-overlay-wordmark">polsh</span>
                <h1 class="mobile-overlay-heading">Designed for desktop</h1>
                <p class="mobile-overlay-body">
                    The Polsh editor requires a larger screen. Open it on a
                    desktop or laptop to get started.
                </p>
                <a href="/" class="mobile-overlay-cta">Back to home</a>
            </div>
        </div>
    </Teleport>
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

/* ── Canvas size bar ── */
.canvas-size-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: #0d0d10;
    flex-shrink: 0;
}

.csb-pill {
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #8a8a9a;
    cursor: pointer;
    transition:
        border-color 120ms ease,
        color 120ms ease,
        background 120ms ease;
    white-space: nowrap;
}

.csb-pill:hover {
    border-color: rgba(255, 255, 255, 0.22);
    color: #f0f0f2;
}

.csb-pill--active {
    border-color: #e0ff4f;
    color: #e0ff4f;
    background: rgba(224, 255, 79, 0.06);
}

.csb-more-wrap {
    position: relative;
}

.csb-popover {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 200;
    background: #1a1a1f;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px;
    min-width: 200px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.csb-popover-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 500;
    color: #4a4a58;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 4px 4px;
}

.csb-popover-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 5px 8px;
    border-radius: 5px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 100ms ease;
}

.csb-popover-row:hover {
    background: rgba(255, 255, 255, 0.05);
}

.csb-popover-row--active .csb-popover-name {
    color: #e0ff4f;
}

.csb-popover-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #f0f0f2;
}

.csb-popover-dim {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #4a4a58;
}

.csb-popover-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.07);
    margin: 6px 0;
}

.csb-custom-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
}

.csb-custom-input {
    width: 60px;
    padding: 4px 6px;
    background: #111114;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #f0f0f2;
    outline: none;
    text-align: center;
}

.csb-custom-input:focus {
    border-color: rgba(224, 255, 79, 0.4);
}

.csb-custom-sep,
.csb-custom-unit {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #4a4a58;
}

.csb-custom-apply {
    margin-left: 4px;
    padding: 4px 8px;
    background: rgba(224, 255, 79, 0.1);
    border: 1px solid rgba(224, 255, 79, 0.35);
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #e0ff4f;
    cursor: pointer;
    transition: background 120ms ease;
}

.csb-custom-apply:hover {
    background: rgba(224, 255, 79, 0.18);
}

/* ── Mobile overlay ── */
.mobile-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #080808;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

.mobile-overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    max-width: 320px;
}

.mobile-overlay-wordmark {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    font-weight: 500;
    color: #f0f0f2;
    margin-bottom: 8px;
}

.mobile-overlay-heading {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
}

.mobile-overlay-body {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.6;
    margin: 0;
}

.mobile-overlay-cta {
    margin-top: 8px;
    display: inline-block;
    padding: 10px 20px;
    background: #e0ff4f;
    color: #0a0a0c;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    text-decoration: none;
    transition: opacity 120ms ease;
}

.mobile-overlay-cta:hover {
    opacity: 0.85;
}

/* ── Canvas workspace grid background ── */
/* Applied via :deep to canvas-stage-container so it sits behind the transparent
   Konva <canvas> element, rendering wherever Konva hasn't explicitly painted. */
:deep(.canvas-stage-container) {
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(
        ellipse 80% 80% at 50% 50%,
        black 40%,
        transparent 100%
    );
    -webkit-mask-image: radial-gradient(
        ellipse 80% 80% at 50% 50%,
        black 40%,
        transparent 100%
    );
}
</style>
