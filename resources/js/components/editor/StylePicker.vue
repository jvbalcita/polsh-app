<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useEditorStore, type SavedPreset } from '@/stores/editor';
import type { StyleConfig } from '@/types/style';
import { loadDemoImage, renderStyleFrame } from '@/composables/useStyleCanvas';

const store = useEditorStore();
const page = usePage();

const styleFilter = ref('');

const filteredStyles = computed(() =>
    styleFilter.value.trim() === ''
        ? store.allStyles
        : store.allStyles.filter((s) =>
              s.name.toLowerCase().includes(styleFilter.value.toLowerCase()),
          ),
);

function select(style: StyleConfig): void {
    store.applyStyle(style);
}

function applyToAll(): void {
    store.applyToAll();
}

function loadPreset(preset: SavedPreset): void {
    store.loadPreset(preset);
}

// ── Canvas thumbnails ─────────────────────────────────────────────────────────
// We keep all 18 canvas elements in the DOM (v-show for filtering) so we only
// need to render once on mount instead of re-rendering whenever filter changes.
const canvasRefs = ref<(HTMLCanvasElement | null)[]>(
    new Array(store.allStyles.length).fill(null) as (HTMLCanvasElement | null)[],
);

function setCanvasRef(el: HTMLCanvasElement | null, i: number): void {
    canvasRefs.value[i] = el;
}

onMounted(async () => {
    if (page.props.auth?.user) {
        store.fetchPresets();
    }

    const img = await loadDemoImage();
    store.allStyles.forEach((style, i) => {
        const canvas = canvasRefs.value[i];
        if (canvas) renderStyleFrame(canvas, style, img);
    });
});
</script>

<template>
    <div class="sp-root">
        <!-- Search -->
        <div class="sp-search-wrap">
            <input
                v-model="styleFilter"
                type="search"
                placeholder="Filter styles…"
                class="sp-search"
                aria-label="Filter styles"
            />
        </div>

        <!-- My presets -->
        <template v-if="page.props.auth?.user && store.presets.length > 0">
            <div class="sp-section">
                <p class="sp-section-label">My presets</p>
                <div class="sp-preset-list">
                    <div
                        v-for="preset in store.presets"
                        :key="preset.id"
                        class="sp-preset-row group"
                    >
                        <button
                            type="button"
                            class="sp-preset-name"
                            @click="loadPreset(preset)"
                        >
                            {{ preset.name }}
                        </button>
                        <button
                            type="button"
                            class="sp-preset-delete"
                            aria-label="Delete preset"
                            @click="store.deletePreset(preset.id)"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <!-- Team presets -->
        <template v-if="page.props.auth?.user && store.teamPresets.length > 0">
            <div class="sp-section">
                <p class="sp-section-label">Team presets</p>
                <div class="sp-preset-list">
                    <div
                        v-for="preset in store.teamPresets"
                        :key="preset.id"
                        class="sp-preset-row"
                    >
                        <button
                            type="button"
                            class="sp-preset-name"
                            @click="loadPreset(preset)"
                        >
                            {{ preset.name }}
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <!-- Styles section header -->
        <div class="sp-styles-header">
            <p class="sp-section-label" style="margin: 0">PRESETS</p>
            <p class="sp-styles-sublabel">Quick-start combinations</p>
        </div>

        <!-- Style grid — all canvases stay in the DOM; v-show for filtering -->
        <div class="sp-grid-wrap">
            <div class="sp-grid">
                <button
                    v-for="(style, i) in store.allStyles"
                    :key="style.slug"
                    v-show="filteredStyles.includes(style)"
                    type="button"
                    class="style-card"
                    :class="{ 'style-card--active': store.activeStyle?.slug === style.slug }"
                    :title="style.name"
                    :aria-pressed="store.activeStyle?.slug === style.slug"
                    @click="select(style)"
                >
                    <canvas
                        :ref="(el) => setCanvasRef(el as HTMLCanvasElement | null, i)"
                        class="style-card-canvas"
                    />
                    <div class="style-card-name">{{ style.name }}</div>
                </button>

                <!-- Empty filter result -->
                <p v-if="filteredStyles.length === 0" class="sp-no-results">
                    No styles match "{{ styleFilter }}"
                </p>
            </div>
        </div>

        <!-- Apply to all -->
        <div class="sp-footer">
            <button type="button" class="sp-apply-all" @click="applyToAll">
                Apply to all
            </button>
        </div>
    </div>
</template>

<style scoped>
.sp-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

/* ── Search ── */
.sp-search-wrap {
    padding: 10px 10px 8px;
    flex-shrink: 0;
}

.sp-search {
    width: 100%;
    padding: 6px 10px;
    background: #1a1a1f;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #f0f0f2;
    outline: none;
    box-sizing: border-box;
    transition: border-color 150ms ease;
}

.sp-search::placeholder { color: #4a4a58; }
.sp-search:focus { border-color: rgba(224, 255, 79, 0.4); }

/* Hide webkit search cancel button */
.sp-search::-webkit-search-cancel-button { display: none; }

/* ── Preset sections ── */
.sp-section {
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding: 8px 10px;
    flex-shrink: 0;
}

.sp-section-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 500;
    color: #4a4a58;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 6px;
}

.sp-preset-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.sp-preset-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    padding: 3px 4px;
    transition: background 100ms ease;
}

.sp-preset-row:hover { background: rgba(255, 255, 255, 0.05); }

.sp-preset-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #8a8a9a;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 100ms ease;
}

.sp-preset-name:hover { color: #f0f0f2; }

.sp-preset-delete {
    flex-shrink: 0;
    font-size: 9px;
    color: #4a4a58;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    opacity: 0;
    transition: opacity 100ms ease, color 100ms ease;
}

.sp-preset-row:hover .sp-preset-delete { opacity: 1; }
.sp-preset-delete:hover { color: #ff4f4f; }

/* ── Styles section header ── */
.sp-styles-header {
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding: 8px 10px 4px;
    flex-shrink: 0;
}

.sp-styles-sublabel {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: #4a4a58;
    margin: 2px 0 0;
}

/* ── Style grid ── */
.sp-grid-wrap {
    flex: 1;
    overflow-y: auto;
    padding: 8px 10px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.08) transparent;
}

.sp-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
}

.sp-no-results {
    grid-column: 1 / -1;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #4a4a58;
    padding: 16px 0;
    margin: 0;
}

/* ── Style card ── */
.style-card {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    border: 1.5px solid rgba(255, 255, 255, 0.07);
    cursor: pointer;
    aspect-ratio: 16 / 10;
    background: #0a0a0c;
    transition: border-color 150ms ease;
    padding: 0;
}

.style-card:hover { border-color: rgba(255, 255, 255, 0.2); }
.style-card--active { border-color: #e0ff4f; }

.style-card-canvas {
    width: 100%;
    height: 100%;
    display: block;
}

.style-card-name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 5px 4px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
    font-family: 'DM Mono', monospace;
    font-size: 8px;
    color: rgba(255, 255, 255, 0.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
}

/* ── Apply to all footer ── */
.sp-footer {
    flex-shrink: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding: 8px 10px;
}

.sp-apply-all {
    width: 100%;
    padding: 7px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #8a8a9a;
    cursor: pointer;
    text-align: center;
    transition: border-color 150ms ease, color 150ms ease;
}

.sp-apply-all:hover {
    border-color: rgba(224, 255, 79, 0.35);
    color: #e0ff4f;
}

.sp-apply-all:focus-visible {
    outline: 2px solid #e0ff4f;
    outline-offset: 2px;
}
</style>
