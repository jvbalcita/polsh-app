<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useEditorStore } from '@/stores/editor';
import UpgradeModal from '@/components/editor/UpgradeModal.vue';

const store = useEditorStore();
const page = usePage();

// ── Tab state ──────────────────────────────────────────────────────────────
type Tab = 'background' | 'frame' | 'adjust';
const activeTab = ref<Tab>('background');

// ── Active settings shorthand ──────────────────────────────────────────────
const s = computed(() => store.activeSettings);

// ── Background tab ─────────────────────────────────────────────────────────
type BgType = 'gradient' | 'solid' | 'mesh' | 'abstract' | 'transparent';

const BG_TYPES: { id: BgType; label: string }[] = [
    { id: 'gradient', label: 'Gradient' },
    { id: 'solid', label: 'Solid' },
    { id: 'mesh', label: 'Mesh' },
    { id: 'abstract', label: 'Abstract' },
    { id: 'transparent', label: 'None' },
];

// Placeholder abstract background options (12 named colours as SVG data URLs)
const ABSTRACT_PRESETS = [
    { id: 'ab1', gradientStart: '#0d0d1a', gradientEnd: '#2a1a4a', label: 'Deep Violet' },
    { id: 'ab2', gradientStart: '#001a0d', gradientEnd: '#003322', label: 'Forest' },
    { id: 'ab3', gradientStart: '#1a0d00', gradientEnd: '#3d1f00', label: 'Ember' },
    { id: 'ab4', gradientStart: '#000d1a', gradientEnd: '#001a33', label: 'Ocean' },
    { id: 'ab5', gradientStart: '#1a001a', gradientEnd: '#33003d', label: 'Magenta' },
    { id: 'ab6', gradientStart: '#001a1a', gradientEnd: '#003333', label: 'Teal' },
    { id: 'ab7', gradientStart: '#0a0a0c', gradientEnd: '#1a1a2e', label: 'Midnight' },
    { id: 'ab8', gradientStart: '#1a0a00', gradientEnd: '#2e1a00', label: 'Rust' },
    { id: 'ab9', gradientStart: '#0a1a0a', gradientEnd: '#1a2e1a', label: 'Moss' },
    { id: 'ab10', gradientStart: '#0a0a1a', gradientEnd: '#1a1a3d', label: 'Navy' },
    { id: 'ab11', gradientStart: '#1a0a1a', gradientEnd: '#2e1a2e', label: 'Plum' },
    { id: 'ab12', gradientStart: '#0a1a1a', gradientEnd: '#1a2e2e', label: 'Slate' },
];

function applyAbstract(preset: (typeof ABSTRACT_PRESETS)[0]): void {
    store.updateSetting('backgroundType', 'abstract');
    store.updateSetting('gradientStart', preset.gradientStart);
    store.updateSetting('gradientEnd', preset.gradientEnd);
    store.updateSetting('gradientAngle', 135);
    store.updateSetting('gradientIsRadial', false);
}

// ── Frame tab ──────────────────────────────────────────────────────────────
const FREE_FRAMES = [
    { id: 'none', label: 'None' },
    { id: 'macos-dark', label: 'macOS Dark' },
    { id: 'macos-light', label: 'macOS Light' },
    { id: 'browser', label: 'Browser' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'window-minimal', label: 'Minimal' },
    { id: 'code-editor', label: 'Code Editor' },
];

const PRO_FRAMES = [
    { id: 'iphone-15', label: 'iPhone 15' },
    { id: 'ipad-pro', label: 'iPad Pro' },
    { id: 'arc-browser', label: 'Arc Browser' },
];

const isPro = computed(() => page.props.isPro as boolean);
const showUpgrade = ref(false);

const hasFrame = computed(() => s.value?.frameType !== 'none');
const isBrowserFrame = computed(() => s.value?.frameType === 'browser');
const hasTitle = computed(() => {
    const ft = s.value?.frameType;
    return ft === 'macos-dark' || ft === 'macos-light' || ft === 'terminal' || ft === 'window-minimal' || ft === 'code-editor';
});

// ── Adjust tab ─────────────────────────────────────────────────────────────
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
        <!-- ── Tab strip ────────────────────────────────── -->
        <div class="cp-tabs">
            <button
                v-for="tab in (['background', 'frame', 'adjust'] as const)"
                :key="tab"
                type="button"
                class="cp-tab"
                :class="{ 'cp-tab--active': activeTab === tab }"
                @click="activeTab = tab"
            >
                {{ tab === 'background' ? 'BG' : tab === 'frame' ? 'Frame' : 'Adjust' }}
            </button>
        </div>

        <div class="cp-scroll">

            <!-- ══════════════════════════════════════════ -->
            <!-- BACKGROUND TAB                            -->
            <!-- ══════════════════════════════════════════ -->
            <template v-if="activeTab === 'background'">

                <!-- Type selector -->
                <div class="bg-type-row">
                    <button
                        v-for="type in BG_TYPES"
                        :key="type.id"
                        type="button"
                        class="bg-type-btn"
                        :class="{ 'bg-type-btn--active': s?.backgroundType === type.id }"
                        @click="store.updateSetting('backgroundType', type.id)"
                    >
                        {{ type.label }}
                    </button>
                </div>

                <!-- Gradient controls -->
                <template v-if="s?.backgroundType === 'gradient'">
                    <div class="control-row">
                        <div class="color-pair">
                            <div class="color-field">
                                <label class="control-label">Start</label>
                                <div class="color-swatch-row">
                                    <input
                                        type="color"
                                        class="color-input"
                                        :value="s?.gradientStart ?? '#0a0a0c'"
                                        @input="store.updateSetting('gradientStart', ($event.target as HTMLInputElement).value)"
                                    />
                                    <span class="color-hex">{{ s?.gradientStart ?? '#0a0a0c' }}</span>
                                </div>
                            </div>
                            <div class="color-field">
                                <label class="control-label">End</label>
                                <div class="color-swatch-row">
                                    <input
                                        type="color"
                                        class="color-input"
                                        :value="s?.gradientEnd ?? '#1a1a2e'"
                                        @input="store.updateSetting('gradientEnd', ($event.target as HTMLInputElement).value)"
                                    />
                                    <span class="color-hex">{{ s?.gradientEnd ?? '#1a1a2e' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="control-row">
                        <div class="control-header">
                            <label class="control-label">Angle</label>
                            <span class="value-badge">{{ s?.gradientAngle ?? 135 }}°</span>
                        </div>
                        <input
                            :value="s?.gradientAngle ?? 135"
                            type="range"
                            min="0"
                            max="360"
                            step="5"
                            class="slider"
                            @input="store.updateSetting('gradientAngle', ($event.target as HTMLInputElement).valueAsNumber)"
                        />
                    </div>

                    <div class="control-row">
                        <div class="toggle-row">
                            <button
                                type="button"
                                class="toggle-btn"
                                :class="{ 'toggle-btn--active': !(s?.gradientIsRadial) }"
                                @click="store.updateSetting('gradientIsRadial', false)"
                            >
                                Linear
                            </button>
                            <button
                                type="button"
                                class="toggle-btn"
                                :class="{ 'toggle-btn--active': s?.gradientIsRadial }"
                                @click="store.updateSetting('gradientIsRadial', true)"
                            >
                                Radial
                            </button>
                        </div>
                    </div>
                </template>

                <!-- Solid color -->
                <template v-if="s?.backgroundType === 'solid'">
                    <div class="control-row">
                        <label class="control-label">Color</label>
                        <div class="color-swatch-row mt-2">
                            <input
                                type="color"
                                class="color-input color-input--lg"
                                :value="s?.solidColor ?? '#1a1a2e'"
                                @input="store.updateSetting('solidColor', ($event.target as HTMLInputElement).value)"
                            />
                            <span class="color-hex">{{ s?.solidColor ?? '#1a1a2e' }}</span>
                        </div>
                    </div>
                </template>

                <!-- Mesh (4 color points) -->
                <template v-if="s?.backgroundType === 'mesh'">
                    <div class="control-row">
                        <p class="section-note">Mesh blends four corner colors together.</p>
                        <div class="color-pair">
                            <div class="color-field">
                                <label class="control-label">TL</label>
                                <input
                                    type="color"
                                    class="color-input"
                                    :value="s?.gradientStart ?? '#0a0a0c'"
                                    @input="store.updateSetting('gradientStart', ($event.target as HTMLInputElement).value)"
                                />
                            </div>
                            <div class="color-field">
                                <label class="control-label">BR</label>
                                <input
                                    type="color"
                                    class="color-input"
                                    :value="s?.gradientEnd ?? '#1a1a2e'"
                                    @input="store.updateSetting('gradientEnd', ($event.target as HTMLInputElement).value)"
                                />
                            </div>
                        </div>
                        <div class="control-header mt-3">
                            <label class="control-label">Blend</label>
                            <span class="value-badge">{{ s?.gradientAngle ?? 135 }}</span>
                        </div>
                        <input
                            :value="s?.gradientAngle ?? 135"
                            type="range"
                            min="0"
                            max="360"
                            step="5"
                            class="slider"
                            @input="store.updateSetting('gradientAngle', ($event.target as HTMLInputElement).valueAsNumber)"
                        />
                    </div>
                </template>

                <!-- Abstract options -->
                <template v-if="s?.backgroundType === 'abstract'">
                    <div class="abstract-grid">
                        <button
                            v-for="preset in ABSTRACT_PRESETS"
                            :key="preset.id"
                            type="button"
                            class="abstract-swatch"
                            :style="{
                                background: `linear-gradient(135deg, ${preset.gradientStart} 0%, ${preset.gradientEnd} 100%)`
                            }"
                            :title="preset.label"
                            :class="{
                                'abstract-swatch--active':
                                    s?.gradientStart === preset.gradientStart &&
                                    s?.gradientEnd === preset.gradientEnd
                            }"
                            @click="applyAbstract(preset)"
                        />
                    </div>
                </template>

                <!-- Transparent -->
                <template v-if="s?.backgroundType === 'transparent'">
                    <div class="transparent-preview">
                        <div class="checker" />
                        <p class="checker-note">Transparent — PNG export only</p>
                    </div>
                </template>

            </template>

            <!-- ══════════════════════════════════════════ -->
            <!-- FRAME TAB                                 -->
            <!-- ══════════════════════════════════════════ -->
            <template v-else-if="activeTab === 'frame'">

                <!-- Frame grid -->
                <div class="frame-grid">
                    <button
                        v-for="frame in FREE_FRAMES"
                        :key="frame.id"
                        type="button"
                        class="frame-btn"
                        :class="{ 'frame-btn--active': s?.frameType === frame.id }"
                        @click="store.updateSetting('frameType', frame.id)"
                    >
                        {{ frame.label }}
                    </button>
                    <button
                        v-for="frame in PRO_FRAMES"
                        :key="frame.id"
                        type="button"
                        class="frame-btn frame-btn--pro"
                        @click="!isPro ? (showUpgrade = true) : store.updateSetting('frameType', frame.id)"
                    >
                        <span class="frame-pro-label">PRO</span>
                        {{ frame.label }}
                    </button>
                </div>

                <!-- Frame options (when a frame is selected) -->
                <template v-if="hasFrame">
                    <div class="frame-options">

                        <!-- Title text (macOS, Terminal, Minimal, Code Editor) -->
                        <div v-if="hasTitle" class="control-row">
                            <label class="control-label">Title</label>
                            <input
                                :value="s?.frameTitle ?? 'My App'"
                                type="text"
                                maxlength="60"
                                class="frame-text-input"
                                placeholder="My App"
                                @input="store.updateSetting('frameTitle', ($event.target as HTMLInputElement).value)"
                            />
                        </div>

                        <!-- URL (Browser only) -->
                        <div v-if="isBrowserFrame" class="control-row">
                            <label class="control-label">URL</label>
                            <input
                                :value="s?.frameUrl ?? 'example.com'"
                                type="text"
                                maxlength="80"
                                class="frame-text-input"
                                placeholder="example.com"
                                @input="store.updateSetting('frameUrl', ($event.target as HTMLInputElement).value)"
                            />
                        </div>

                        <!-- Window buttons toggle -->
                        <div class="control-row">
                            <div class="toggle-label-row">
                                <label class="control-label">Window buttons</label>
                                <button
                                    type="button"
                                    class="toggle-pill"
                                    :class="{ 'toggle-pill--on': s?.frameShowButtons }"
                                    @click="store.updateSetting('frameShowButtons', !s?.frameShowButtons)"
                                >
                                    <span class="toggle-pill-thumb" />
                                </button>
                            </div>
                        </div>

                    </div>
                </template>

            </template>

            <!-- ══════════════════════════════════════════ -->
            <!-- ADJUST TAB                                -->
            <!-- ══════════════════════════════════════════ -->
            <template v-else>

                <!-- FRAME ─────────────────────────────── -->
                <p class="section-label first">FRAME</p>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-padding">
                            {{ hasFrame ? 'Padding — around frame' : 'Padding — around screenshot' }}
                        </label>
                        <span class="value-badge">{{ s?.padding ?? 48 }}px</span>
                    </div>
                    <input
                        id="cp-padding"
                        :value="s?.padding ?? 48"
                        type="range"
                        min="0"
                        max="120"
                        step="2"
                        class="slider"
                        aria-label="Padding"
                        @input="store.updateSetting('padding', ($event.target as HTMLInputElement).valueAsNumber)"
                    />
                </div>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-radius">Radius</label>
                        <span class="value-badge">{{ s?.radius ?? 12 }}px</span>
                    </div>
                    <input
                        id="cp-radius"
                        :value="s?.radius ?? 12"
                        type="range"
                        min="0"
                        max="40"
                        step="1"
                        class="slider"
                        aria-label="Radius"
                        @input="store.updateSetting('radius', ($event.target as HTMLInputElement).valueAsNumber)"
                    />
                </div>

                <!-- SHADOW ──────────────────────────────── -->
                <p class="section-label">SHADOW</p>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-shadow">Shadow</label>
                        <span class="value-badge">{{ s?.shadow ?? 50 }}%</span>
                    </div>
                    <input
                        id="cp-shadow"
                        :value="s?.shadow ?? 50"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        class="slider"
                        aria-label="Shadow opacity"
                        @input="store.updateSetting('shadow', ($event.target as HTMLInputElement).valueAsNumber)"
                    />
                </div>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-shadow-blur">Shadow Blur</label>
                        <span class="value-badge">{{ s?.shadowBlur ?? 40 }}px</span>
                    </div>
                    <input
                        id="cp-shadow-blur"
                        :value="s?.shadowBlur ?? 40"
                        type="range"
                        min="0"
                        max="120"
                        step="1"
                        class="slider"
                        aria-label="Shadow blur"
                        @input="store.updateSetting('shadowBlur', ($event.target as HTMLInputElement).valueAsNumber)"
                    />
                </div>

                <!-- BORDER ──────────────────────────────── -->
                <p class="section-label">BORDER</p>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-border">Border</label>
                        <span class="value-badge">{{ s?.border ?? 1 }}px</span>
                    </div>
                    <input
                        id="cp-border"
                        :value="s?.border ?? 1"
                        type="range"
                        min="0"
                        max="4"
                        step="0.5"
                        class="slider"
                        aria-label="Border width"
                        @input="store.updateSetting('border', ($event.target as HTMLInputElement).valueAsNumber)"
                    />
                </div>

                <!-- TEXTURE ─────────────────────────────── -->
                <p class="section-label">TEXTURE</p>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-noise">Noise Grain</label>
                        <span class="value-badge">{{ Math.round((s?.noiseGrain ?? 0.03) * 100) }}%</span>
                    </div>
                    <input
                        id="cp-noise"
                        :value="s?.noiseGrain ?? 0.03"
                        type="range"
                        min="0"
                        max="0.3"
                        step="0.005"
                        class="slider"
                        aria-label="Noise grain"
                        @input="store.updateSetting('noiseGrain', ($event.target as HTMLInputElement).valueAsNumber)"
                    />
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
                                Save current as preset
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

/* ── Tab strip ── */
.cp-tabs {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
}

.cp-tab {
    flex: 1;
    padding: 10px 4px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #4a4a5a;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 150ms ease, border-color 150ms ease;
    margin-bottom: -1px;
}

.cp-tab:hover { color: #8a8a9a; }

.cp-tab--active {
    color: #e0ff4f;
    border-bottom-color: #e0ff4f;
}

/* ── Scrollable body ── */
.cp-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 14px 14px 8px;
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

.section-note {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #4a4a58;
    margin: 0 0 8px;
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

/* ── Background type selector ── */
.bg-type-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 14px;
}

.bg-type-btn {
    flex: 1;
    min-width: 0;
    padding: 4px 6px;
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    background: transparent;
    color: #8a8a9a;
    cursor: pointer;
    transition: border-color 150ms, color 150ms, background 150ms;
    white-space: nowrap;
}

.bg-type-btn:hover {
    border-color: rgba(255, 255, 255, 0.22);
    color: #f0f0f2;
}

.bg-type-btn--active {
    border-color: rgba(224, 255, 79, 0.5);
    background: rgba(224, 255, 79, 0.08);
    color: #e0ff4f;
}

/* ── Color controls ── */
.color-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.color-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.color-swatch-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.mt-2 { margin-top: 6px; }
.mt-3 { margin-top: 10px; }

.color-input {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    cursor: pointer;
    padding: 2px;
    background: transparent;
    flex-shrink: 0;
}

.color-input--lg {
    width: 36px;
    height: 36px;
}

.color-input::-webkit-color-swatch-wrapper { padding: 0; }
.color-input::-webkit-color-swatch { border: none; border-radius: 4px; }

.color-hex {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: #4a4a58;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ── Toggle (Linear/Radial) ── */
.toggle-row {
    display: flex;
    gap: 4px;
}

.toggle-btn {
    flex: 1;
    padding: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    background: transparent;
    color: #8a8a9a;
    cursor: pointer;
    transition: all 150ms ease;
}

.toggle-btn:hover { border-color: rgba(255, 255, 255, 0.22); color: #f0f0f2; }

.toggle-btn--active {
    border-color: rgba(224, 255, 79, 0.4);
    background: rgba(224, 255, 79, 0.08);
    color: #e0ff4f;
}

/* ── Abstract grid ── */
.abstract-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    margin-bottom: 8px;
}

.abstract-swatch {
    aspect-ratio: 1;
    border-radius: 5px;
    border: 1.5px solid rgba(255, 255, 255, 0.07);
    cursor: pointer;
    transition: border-color 150ms ease, transform 100ms ease;
    padding: 0;
}

.abstract-swatch:hover {
    border-color: rgba(255, 255, 255, 0.25);
    transform: scale(1.06);
}

.abstract-swatch--active {
    border-color: #e0ff4f;
}

/* ── Transparent preview ── */
.transparent-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    margin-bottom: 8px;
}

.checker {
    width: 64px;
    height: 40px;
    border-radius: 4px;
    background-image: repeating-conic-gradient(#3a3a4a 0% 25%, #2a2a3a 0% 50%);
    background-size: 8px 8px;
}

.checker-note {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: #4a4a58;
    margin: 0;
    text-align: center;
}

/* ── Frame grid ── */
.frame-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-bottom: 12px;
}

.frame-btn {
    position: relative;
    padding: 7px 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    background: transparent;
    color: #8a8a9a;
    cursor: pointer;
    transition: border-color 150ms, color 150ms, background 150ms;
    text-align: center;
}

.frame-btn:hover {
    border-color: rgba(255, 255, 255, 0.22);
    color: #f0f0f2;
}

.frame-btn--active {
    border-color: rgba(224, 255, 79, 0.5);
    background: rgba(224, 255, 79, 0.08);
    color: #e0ff4f;
}

.frame-btn--pro {
    opacity: 0.5;
    cursor: pointer;
}

.frame-pro-label {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 7px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #e0ff4f;
    margin-bottom: 2px;
}

/* ── Frame options ── */
.frame-options {
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding-top: 12px;
}

.frame-text-input {
    width: 100%;
    margin-top: 4px;
    padding: 5px 8px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #f0f0f2;
    outline: none;
    box-sizing: border-box;
    transition: border-color 150ms ease;
}

.frame-text-input:focus { border-color: rgba(224, 255, 79, 0.4); }
.frame-text-input::placeholder { color: #4a4a58; }

/* ── Toggle pill ── */
.toggle-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.toggle-pill {
    position: relative;
    width: 34px;
    height: 18px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.06);
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
    padding: 0;
    flex-shrink: 0;
}

.toggle-pill--on {
    background: rgba(224, 255, 79, 0.15);
    border-color: rgba(224, 255, 79, 0.4);
}

.toggle-pill-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #4a4a5a;
    transition: transform 150ms ease, background 150ms ease;
}

.toggle-pill--on .toggle-pill-thumb {
    transform: translateX(16px);
    background: #e0ff4f;
}

/* ── Preset saving ── */
.preset-save-btn {
    width: 100%;
    padding: 7px;
    border-radius: 6px;
    border: 1px solid rgba(224, 255, 79, 0.25);
    background: transparent;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
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
