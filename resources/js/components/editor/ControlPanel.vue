<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useEditorStore } from '@/stores/editor';
import UpgradeModal from '@/components/editor/UpgradeModal.vue';

const store = useEditorStore();
const page = usePage();

const ASPECT_RATIOS = ['16:9', '4:3', '1:1', '3:2', '21:9'];

const COLOR_PRESETS = [
    { hex: '#e0ff4f', name: 'Lime' },
    { hex: '#ffffff', name: 'White' },
    { hex: '#0a0a0c', name: 'Black' },
    { hex: '#a855f7', name: 'Purple' },
    { hex: '#3b82f6', name: 'Blue' },
    { hex: '#f97316', name: 'Orange' },
    { hex: '#ec4899', name: 'Pink' },
    { hex: '#10b981', name: 'Emerald' },
    { hex: '#f43f5e', name: 'Rose' },
    { hex: '#06b6d4', name: 'Cyan' },
];

function applyBgColor(hex: string): void {
    if (!store.activeStyle) return;
    store.activeStyle = {
        ...store.activeStyle,
        background: {
            ...store.activeStyle.background,
            type: 'solid',
            colors: [hex, hex],
        },
    };
}

const isPro = computed(() => page.props.isPro as boolean);
const showUpgrade = ref(false);

// Preset saving
const isSaving = ref(false);
const presetName = ref('');
const showNameInput = ref(false);
const showPresetLimit = ref(false);
const shareWithTeam = ref(false);

const FREE_PRESET_LIMIT = 5;
const userTeamId = computed(() => page.props.teamId as number | null | undefined);
const userHasTeam = computed(() => !!userTeamId.value);

function openSavePreset(): void {
    if (!isPro.value && store.presets.length >= FREE_PRESET_LIMIT) {
        showPresetLimit.value = true;
        return;
    }
    showPresetLimit.value = false;
    presetName.value = store.activeStyle?.name ?? 'My Preset';
    showNameInput.value = true;
}

async function confirmSavePreset(): Promise<void> {
    if (!presetName.value.trim()) return;
    isSaving.value = true;
    const teamId = shareWithTeam.value && userTeamId.value ? userTeamId.value : null;
    await store.savePreset(presetName.value.trim(), teamId);
    isSaving.value = false;
    showNameInput.value = false;
    presetName.value = '';
    shareWithTeam.value = false;
}

function cancelSavePreset(): void {
    showNameInput.value = false;
    presetName.value = '';
    shareWithTeam.value = false;
}
</script>

<template>
    <div class="cp-root">
        <div class="cp-scroll">
            <!-- FRAME ─────────────────────────────────── -->
            <p class="section-label first">FRAME</p>

            <!-- Padding -->
            <div class="control-row">
                <div class="control-header">
                    <label class="control-label" for="cp-padding">Padding</label>
                    <span class="value-badge">{{ store.settings.padding }}px</span>
                </div>
                <input
                    id="cp-padding"
                    v-model.number="store.settings.padding"
                    type="range"
                    min="0"
                    max="120"
                    step="2"
                    class="slider"
                    aria-label="Padding"
                    :aria-valuenow="store.settings.padding"
                    aria-valuemin="0"
                    aria-valuemax="120"
                />
            </div>

            <!-- Radius -->
            <div class="control-row">
                <div class="control-header">
                    <label class="control-label" for="cp-radius">Radius</label>
                    <span class="value-badge">{{ store.settings.radius }}px</span>
                </div>
                <input
                    id="cp-radius"
                    v-model.number="store.settings.radius"
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    class="slider"
                    aria-label="Radius"
                    :aria-valuenow="store.settings.radius"
                    aria-valuemin="0"
                    aria-valuemax="40"
                />
            </div>

            <!-- SHADOW ──────────────────────────────────── -->
            <p class="section-label">SHADOW</p>

            <!-- Shadow Opacity -->
            <div class="control-row">
                <div class="control-header">
                    <label class="control-label" for="cp-shadow">Shadow</label>
                    <span class="value-badge">{{ Math.round(store.settings.shadowOpacity * 100) }}%</span>
                </div>
                <input
                    id="cp-shadow"
                    v-model.number="store.settings.shadowOpacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    class="slider"
                    aria-label="Shadow opacity"
                    :aria-valuenow="store.settings.shadowOpacity"
                    aria-valuemin="0"
                    aria-valuemax="1"
                />
            </div>

            <!-- Shadow Blur -->
            <div class="control-row">
                <div class="control-header">
                    <label class="control-label" for="cp-shadow-blur">Blur</label>
                    <span class="value-badge">{{ store.settings.shadowBlur }}px</span>
                </div>
                <input
                    id="cp-shadow-blur"
                    v-model.number="store.settings.shadowBlur"
                    type="range"
                    min="0"
                    max="120"
                    step="1"
                    class="slider"
                    aria-label="Shadow blur"
                    :aria-valuenow="store.settings.shadowBlur"
                    aria-valuemin="0"
                    aria-valuemax="120"
                />
            </div>

            <!-- BORDER ──────────────────────────────────── -->
            <p class="section-label">BORDER</p>

            <!-- Border Width -->
            <div class="control-row">
                <div class="control-header">
                    <label class="control-label" for="cp-border">Border</label>
                    <span class="value-badge">{{ store.settings.borderWidth }}px</span>
                </div>
                <input
                    id="cp-border"
                    v-model.number="store.settings.borderWidth"
                    type="range"
                    min="0"
                    max="4"
                    step="0.5"
                    class="slider"
                    aria-label="Border width"
                    :aria-valuenow="store.settings.borderWidth"
                    aria-valuemin="0"
                    aria-valuemax="4"
                />
            </div>

            <!-- TEXTURE ─────────────────────────────────── -->
            <p class="section-label">TEXTURE</p>

            <!-- Noise Grain -->
            <div class="control-row">
                <div class="control-header">
                    <label class="control-label" for="cp-noise">Noise Grain</label>
                    <span class="value-badge">{{ Math.round(store.settings.noiseGrain * 100) }}%</span>
                </div>
                <input
                    id="cp-noise"
                    v-model.number="store.settings.noiseGrain"
                    type="range"
                    min="0"
                    max="0.3"
                    step="0.005"
                    class="slider"
                    aria-label="Noise grain"
                    :aria-valuenow="store.settings.noiseGrain"
                    aria-valuemin="0"
                    aria-valuemax="0.3"
                />
            </div>

            <!-- CANVAS ──────────────────────────────────── -->
            <p class="section-label">CANVAS</p>

            <div class="control-row">
                <label class="control-label">Aspect Ratio</label>
                <div class="ratio-group">
                    <button
                        v-for="ratio in ASPECT_RATIOS"
                        :key="ratio"
                        type="button"
                        class="ratio-btn"
                        :class="{ 'ratio-btn--active': store.settings.aspectRatio === ratio }"
                        @click="store.settings.aspectRatio = ratio"
                    >
                        {{ ratio }}
                    </button>
                </div>
            </div>

            <!-- BACKGROUND ──────────────────────────────── -->
            <p class="section-label">BACKGROUND</p>

            <div class="control-row">
                <div class="swatch-grid">
                    <button
                        v-for="preset in COLOR_PRESETS"
                        :key="preset.hex"
                        type="button"
                        class="swatch"
                        :style="{ background: preset.hex }"
                        :title="preset.name"
                        :aria-label="preset.name"
                        @click="applyBgColor(preset.hex)"
                    />
                </div>
            </div>

            <!-- Save Preset (auth-gated) ──────────────── -->
            <template v-if="page.props.auth?.user">
                <p class="section-label">PRESET</p>
                <div class="control-row">
                    <div v-if="!showNameInput">
                        <button
                            type="button"
                            class="preset-save-btn"
                            @click="openSavePreset"
                        >
                            Save preset
                        </button>
                        <p v-if="showPresetLimit" class="preset-limit-msg">
                            Free tier: 5 presets max.
                            <button
                                type="button"
                                class="upgrade-link"
                                @click="showUpgrade = true; showPresetLimit = false"
                            >
                                Upgrade to Pro →
                            </button>
                        </p>
                    </div>
                    <div v-else class="preset-name-form">
                        <input
                            v-model="presetName"
                            type="text"
                            maxlength="80"
                            placeholder="Preset name"
                            class="preset-name-input"
                            @keydown.enter="confirmSavePreset"
                            @keydown.escape="cancelSavePreset"
                        />
                        <div class="preset-form-actions">
                            <button
                                type="button"
                                :disabled="isSaving"
                                class="preset-confirm-btn"
                                @click="confirmSavePreset"
                            >
                                {{ isSaving ? '…' : 'Save' }}
                            </button>
                            <button
                                type="button"
                                class="preset-cancel-btn"
                                @click="cancelSavePreset"
                            >
                                ✕
                            </button>
                        </div>
                        <label v-if="userHasTeam" class="share-team-label">
                            <input v-model="shareWithTeam" type="checkbox" class="accent-[#e0ff4f]" />
                            Share with team
                        </label>
                    </div>
                </div>
            </template>
        </div>

        <!-- Export panel slot ───────────────────────── -->
        <slot />
    </div>

    <UpgradeModal v-model:open="showUpgrade" />
</template>

<style scoped>
.cp-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.cp-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.07) transparent;
}

/* ── Section labels ── */
.section-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: #4a4a58;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 12px 0 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin-top: 4px;
    margin-bottom: 0;
}

.section-label.first {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
}

/* ── Control rows ── */
.control-row {
    margin-bottom: 12px;
}

.control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.control-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #8a8a9a;
}

.value-badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #e0ff4f;
    background: rgba(224, 255, 79, 0.1);
    border: 1px solid rgba(224, 255, 79, 0.25);
    padding: 1px 6px;
    border-radius: 999px;
    min-width: 36px;
    text-align: right;
}

/* ── Slider ── */
.slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    outline: none;
    cursor: pointer;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #e0ff4f;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 0 3px rgba(224, 255, 79, 0.15);
    transition: transform 150ms ease, box-shadow 150ms ease;
}

.slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 4px rgba(224, 255, 79, 0.22);
}

.slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #e0ff4f;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 0 3px rgba(224, 255, 79, 0.15);
}

/* ── Aspect ratio buttons ── */
.ratio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
}

.ratio-btn {
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 3px 7px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #8a8a9a;
    background: transparent;
    cursor: pointer;
    transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
}

.ratio-btn:hover {
    border-color: rgba(255, 255, 255, 0.22);
    color: #f0f0f2;
}

.ratio-btn--active {
    border-color: rgba(224, 255, 79, 0.5);
    background: rgba(224, 255, 79, 0.08);
    color: #e0ff4f;
}

/* ── Color swatches ── */
.swatch-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
}

.swatch {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    transition: transform 150ms ease, border-color 150ms ease;
    padding: 0;
}

.swatch:hover {
    transform: scale(1.18);
    border-color: rgba(255, 255, 255, 0.4);
}

.swatch:focus-visible {
    outline: 2px solid #e0ff4f;
    outline-offset: 2px;
}

/* ── Preset saving ── */
.preset-save-btn {
    width: 100%;
    padding: 7px;
    border-radius: 6px;
    border: 1px solid rgba(224, 255, 79, 0.25);
    background: transparent;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: rgba(224, 255, 79, 0.7);
    cursor: pointer;
    text-align: center;
    transition: border-color 150ms ease, color 150ms ease;
}

.preset-save-btn:hover {
    border-color: rgba(224, 255, 79, 0.5);
    color: #e0ff4f;
}

.preset-limit-msg {
    margin: 6px 0 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: #4a4a58;
}

.upgrade-link {
    background: transparent;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: rgba(224, 255, 79, 0.6);
    cursor: pointer;
    transition: color 150ms ease;
}

.upgrade-link:hover { color: #e0ff4f; }

.preset-name-form {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.preset-name-input {
    width: 100%;
    padding: 6px 8px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #e0e0e0;
    outline: none;
    box-sizing: border-box;
}

.preset-name-input:focus { border-color: rgba(224, 255, 79, 0.4); }

.preset-form-actions {
    display: flex;
    gap: 4px;
}

.preset-confirm-btn {
    flex: 1;
    padding: 5px 8px;
    border-radius: 4px;
    border: none;
    background: #e0ff4f;
    color: #080808;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 150ms ease;
}

.preset-confirm-btn:disabled { opacity: 0.4; }
.preset-confirm-btn:hover:not(:disabled) { opacity: 0.88; }

.preset-cancel-btn {
    padding: 5px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    color: #8a8a9a;
    font-size: 11px;
    cursor: pointer;
    transition: color 150ms ease;
}

.preset-cancel-btn:hover { color: #f0f0f2; }

.share-team-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: #4a4a58;
    cursor: pointer;
    transition: color 150ms ease;
}

.share-team-label:hover { color: #8a8a9a; }
</style>
