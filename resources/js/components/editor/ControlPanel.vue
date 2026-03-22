<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import UpgradeModal from '@/components/editor/UpgradeModal.vue';
import { BACKGROUND_PRESETS } from '@/composables/editorPresentation';
import type {
    GradientPreset,
    SolidPreset,
} from '@/composables/editorPresentation';
import { useEditorStore } from '@/stores/editor';

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

function applySolidPreset(preset: SolidPreset): void {
    store.updateSetting('backgroundType', 'solid');
    store.updateSetting('solidColor', preset.solidColor);
}

function applyGradientPreset(
    type: 'gradient' | 'mesh' | 'abstract',
    preset: GradientPreset,
): void {
    store.updateSetting('backgroundType', type);
    store.updateSetting('gradientStart', preset.gradientStart);
    store.updateSetting('gradientEnd', preset.gradientEnd);
    store.updateSetting('gradientAngle', preset.gradientAngle);
    store.updateSetting('gradientIsRadial', preset.gradientIsRadial);
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
const supportsDesktopPlatform = computed(() => {
    const ft = s.value?.frameType;

    return ft === 'browser' || ft === 'terminal' || ft === 'window-minimal';
});
const hasTitle = computed(() => {
    const ft = s.value?.frameType;

    return (
        ft === 'browser' ||
        ft === 'macos-dark' ||
        ft === 'macos-light' ||
        ft === 'terminal' ||
        ft === 'window-minimal' ||
        ft === 'code-editor'
    );
});

function resetImageAdjustments(): void {
    store.updateSetting('imageZoom', 1);
    store.updateSetting('imageOffsetX', 0);
    store.updateSetting('imageOffsetY', 0);
}

// ── Adjust tab ─────────────────────────────────────────────────────────────
// Preset saving
const isSaving = ref(false);
const presetName = ref('');
const showNameInput = ref(false);
const showPresetLimit = ref(false);
const shareWithTeam = ref(false);

const FREE_PRESET_LIMIT = 5;
const userTeamId = computed(
    () => page.props.teamId as number | null | undefined,
);
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
    if (!presetName.value.trim()) {
        return;
    }

    isSaving.value = true;
    const teamId =
        shareWithTeam.value && userTeamId.value ? userTeamId.value : null;
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
                v-for="tab in ['background', 'frame', 'adjust'] as const"
                :key="tab"
                type="button"
                class="cp-tab"
                :class="{ 'cp-tab--active': activeTab === tab }"
                @click="activeTab = tab"
            >
                {{
                    tab === 'background'
                        ? 'BG'
                        : tab === 'frame'
                          ? 'Frame'
                          : 'Adjust'
                }}
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
                        :class="{
                            'bg-type-btn--active':
                                s?.backgroundType === type.id,
                        }"
                        @click="store.updateSetting('backgroundType', type.id)"
                    >
                        {{ type.label }}
                    </button>
                </div>

                <!-- Gradient controls -->
                <template v-if="s?.backgroundType === 'gradient'">
                    <div class="preset-section">
                        <div class="preset-grid preset-grid--wide">
                            <button
                                v-for="preset in BACKGROUND_PRESETS.gradient"
                                :key="preset.id"
                                type="button"
                                class="preset-swatch preset-swatch--wide"
                                :class="{
                                    'preset-swatch--active':
                                        s?.gradientStart ===
                                            preset.gradientStart &&
                                        s?.gradientEnd === preset.gradientEnd &&
                                        s?.gradientIsRadial ===
                                            preset.gradientIsRadial,
                                }"
                                :title="preset.label"
                                :style="{
                                    background: preset.gradientIsRadial
                                        ? `radial-gradient(circle at center, ${preset.gradientStart} 0%, ${preset.gradientEnd} 100%)`
                                        : `linear-gradient(${preset.gradientAngle}deg, ${preset.gradientStart} 0%, ${preset.gradientEnd} 100%)`,
                                }"
                                @click="applyGradientPreset('gradient', preset)"
                            >
                                <span class="preset-swatch-label">{{
                                    preset.label
                                }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="control-row">
                        <div class="color-pair">
                            <div class="color-field">
                                <label class="control-label">Start</label>
                                <label
                                    class="color-swatch-row color-swatch-row--picker"
                                >
                                    <span
                                        class="color-preview"
                                        :style="{
                                            background:
                                                s?.gradientStart ?? '#0a0a0c',
                                        }"
                                    />
                                    <input
                                        type="color"
                                        class="color-input"
                                        :value="s?.gradientStart ?? '#0a0a0c'"
                                        @input="
                                            store.updateSetting(
                                                'gradientStart',
                                                (
                                                    $event.target as HTMLInputElement
                                                ).value,
                                            )
                                        "
                                    />
                                    <span class="color-hex">{{
                                        s?.gradientStart ?? '#0a0a0c'
                                    }}</span>
                                </label>
                            </div>
                            <div class="color-field">
                                <label class="control-label">End</label>
                                <label
                                    class="color-swatch-row color-swatch-row--picker"
                                >
                                    <span
                                        class="color-preview"
                                        :style="{
                                            background:
                                                s?.gradientEnd ?? '#1a1a2e',
                                        }"
                                    />
                                    <input
                                        type="color"
                                        class="color-input"
                                        :value="s?.gradientEnd ?? '#1a1a2e'"
                                        @input="
                                            store.updateSetting(
                                                'gradientEnd',
                                                (
                                                    $event.target as HTMLInputElement
                                                ).value,
                                            )
                                        "
                                    />
                                    <span class="color-hex">{{
                                        s?.gradientEnd ?? '#1a1a2e'
                                    }}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="control-row">
                        <div class="control-header">
                            <label class="control-label">Angle</label>
                            <span class="value-badge"
                                >{{ s?.gradientAngle ?? 135 }}°</span
                            >
                        </div>
                        <input
                            :value="s?.gradientAngle ?? 135"
                            type="range"
                            min="0"
                            max="360"
                            step="5"
                            class="slider"
                            @input="
                                store.updateSetting(
                                    'gradientAngle',
                                    ($event.target as HTMLInputElement)
                                        .valueAsNumber,
                                )
                            "
                        />
                    </div>

                    <div class="control-row">
                        <div class="toggle-row">
                            <button
                                type="button"
                                class="toggle-btn"
                                :class="{
                                    'toggle-btn--active': !s?.gradientIsRadial,
                                }"
                                @click="
                                    store.updateSetting(
                                        'gradientIsRadial',
                                        false,
                                    )
                                "
                            >
                                Linear
                            </button>
                            <button
                                type="button"
                                class="toggle-btn"
                                :class="{
                                    'toggle-btn--active': s?.gradientIsRadial,
                                }"
                                @click="
                                    store.updateSetting(
                                        'gradientIsRadial',
                                        true,
                                    )
                                "
                            >
                                Radial
                            </button>
                        </div>
                    </div>
                </template>

                <!-- Solid color -->
                <template v-if="s?.backgroundType === 'solid'">
                    <div class="preset-section">
                        <div class="preset-grid preset-grid--wide">
                            <button
                                v-for="preset in BACKGROUND_PRESETS.solid"
                                :key="preset.id"
                                type="button"
                                class="preset-swatch preset-swatch--wide"
                                :class="{
                                    'preset-swatch--active':
                                        s?.solidColor === preset.solidColor,
                                }"
                                :title="preset.label"
                                :style="{ background: preset.solidColor }"
                                @click="applySolidPreset(preset)"
                            >
                                <span class="preset-swatch-label">{{
                                    preset.label
                                }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="control-row">
                        <label class="control-label">Color</label>
                        <label
                            class="color-swatch-row color-swatch-row--picker mt-2"
                        >
                            <span
                                class="color-preview color-preview--lg"
                                :style="{
                                    background: s?.solidColor ?? '#1a1a2e',
                                }"
                            />
                            <input
                                type="color"
                                class="color-input color-input--lg"
                                :value="s?.solidColor ?? '#1a1a2e'"
                                @input="
                                    store.updateSetting(
                                        'solidColor',
                                        ($event.target as HTMLInputElement)
                                            .value,
                                    )
                                "
                            />
                            <span class="color-hex">{{
                                s?.solidColor ?? '#1a1a2e'
                            }}</span>
                        </label>
                    </div>
                </template>

                <!-- Mesh (4 color points) -->
                <template v-if="s?.backgroundType === 'mesh'">
                    <div class="preset-section">
                        <div class="preset-grid preset-grid--wide">
                            <button
                                v-for="preset in BACKGROUND_PRESETS.mesh"
                                :key="preset.id"
                                type="button"
                                class="preset-swatch preset-swatch--wide"
                                :class="{
                                    'preset-swatch--active':
                                        s?.gradientStart ===
                                            preset.gradientStart &&
                                        s?.gradientEnd === preset.gradientEnd,
                                }"
                                :title="preset.label"
                                :style="{
                                    background: `linear-gradient(${preset.gradientAngle}deg, ${preset.gradientStart} 0%, ${preset.gradientEnd} 100%)`,
                                }"
                                @click="applyGradientPreset('mesh', preset)"
                            >
                                <span class="preset-swatch-label">{{
                                    preset.label
                                }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="control-row">
                        <p class="section-note">
                            Mesh blends four corner colors together.
                        </p>
                        <div class="color-pair">
                            <div class="color-field">
                                <label class="control-label">TL</label>
                                <label
                                    class="color-swatch-row color-swatch-row--picker color-swatch-row--compact"
                                >
                                    <span
                                        class="color-preview"
                                        :style="{
                                            background:
                                                s?.gradientStart ?? '#0a0a0c',
                                        }"
                                    />
                                    <input
                                        type="color"
                                        class="color-input"
                                        :value="s?.gradientStart ?? '#0a0a0c'"
                                        @input="
                                            store.updateSetting(
                                                'gradientStart',
                                                (
                                                    $event.target as HTMLInputElement
                                                ).value,
                                            )
                                        "
                                    />
                                </label>
                            </div>
                            <div class="color-field">
                                <label class="control-label">BR</label>
                                <label
                                    class="color-swatch-row color-swatch-row--picker color-swatch-row--compact"
                                >
                                    <span
                                        class="color-preview"
                                        :style="{
                                            background:
                                                s?.gradientEnd ?? '#1a1a2e',
                                        }"
                                    />
                                    <input
                                        type="color"
                                        class="color-input"
                                        :value="s?.gradientEnd ?? '#1a1a2e'"
                                        @input="
                                            store.updateSetting(
                                                'gradientEnd',
                                                (
                                                    $event.target as HTMLInputElement
                                                ).value,
                                            )
                                        "
                                    />
                                </label>
                            </div>
                        </div>
                        <div class="control-header mt-3">
                            <label class="control-label">Blend</label>
                            <span class="value-badge">{{
                                s?.gradientAngle ?? 135
                            }}</span>
                        </div>
                        <input
                            :value="s?.gradientAngle ?? 135"
                            type="range"
                            min="0"
                            max="360"
                            step="5"
                            class="slider"
                            @input="
                                store.updateSetting(
                                    'gradientAngle',
                                    ($event.target as HTMLInputElement)
                                        .valueAsNumber,
                                )
                            "
                        />
                    </div>
                </template>

                <!-- Abstract options -->
                <template v-if="s?.backgroundType === 'abstract'">
                    <div class="preset-grid">
                        <button
                            v-for="preset in BACKGROUND_PRESETS.abstract"
                            :key="preset.id"
                            type="button"
                            class="preset-swatch"
                            :style="{
                                background: `linear-gradient(135deg, ${preset.gradientStart} 0%, ${preset.gradientEnd} 100%)`,
                            }"
                            :title="preset.label"
                            :class="{
                                'preset-swatch--active':
                                    s?.gradientStart === preset.gradientStart &&
                                    s?.gradientEnd === preset.gradientEnd,
                            }"
                            @click="applyGradientPreset('abstract', preset)"
                        >
                            <span class="preset-swatch-label">{{
                                preset.label
                            }}</span>
                        </button>
                    </div>
                </template>

                <!-- Transparent -->
                <template v-if="s?.backgroundType === 'transparent'">
                    <div class="transparent-preview">
                        <div class="checker" />
                        <p class="checker-note">
                            Transparent — PNG export only
                        </p>
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
                        :class="{
                            'frame-btn--active': s?.frameType === frame.id,
                        }"
                        @click="store.updateSetting('frameType', frame.id)"
                    >
                        {{ frame.label }}
                    </button>
                    <button
                        v-for="frame in PRO_FRAMES"
                        :key="frame.id"
                        type="button"
                        class="frame-btn frame-btn--pro"
                        @click="
                            !isPro
                                ? (showUpgrade = true)
                                : store.updateSetting('frameType', frame.id)
                        "
                    >
                        <span class="frame-pro-label">PRO</span>
                        {{ frame.label }}
                    </button>
                </div>

                <!-- Frame options (when a frame is selected) -->
                <template v-if="hasFrame">
                    <div class="frame-options">
                        <div v-if="supportsDesktopPlatform" class="control-row">
                            <label class="control-label">Platform</label>
                            <div class="toggle-row mt-2">
                                <button
                                    type="button"
                                    class="toggle-btn"
                                    :class="{
                                        'toggle-btn--active':
                                            s?.framePlatform === 'macos',
                                    }"
                                    @click="store.setFramePlatform('macos')"
                                >
                                    macOS
                                </button>
                                <button
                                    type="button"
                                    class="toggle-btn"
                                    :class="{
                                        'toggle-btn--active':
                                            s?.framePlatform === 'windows',
                                    }"
                                    @click="store.setFramePlatform('windows')"
                                >
                                    Windows
                                </button>
                            </div>
                        </div>

                        <!-- Title text (macOS, Terminal, Minimal, Code Editor) -->
                        <div v-if="hasTitle" class="control-row">
                            <label class="control-label">Title</label>
                            <input
                                :value="s?.frameTitle ?? 'My App'"
                                type="text"
                                maxlength="60"
                                class="frame-text-input"
                                placeholder="My App"
                                @input="
                                    store.updateSetting(
                                        'frameTitle',
                                        ($event.target as HTMLInputElement)
                                            .value,
                                    )
                                "
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
                                @input="
                                    store.updateSetting(
                                        'frameUrl',
                                        ($event.target as HTMLInputElement)
                                            .value,
                                    )
                                "
                            />
                        </div>

                        <!-- Window buttons toggle -->
                        <div class="control-row">
                            <div class="toggle-label-row">
                                <label class="control-label"
                                    >Window buttons</label
                                >
                                <button
                                    type="button"
                                    class="toggle-pill"
                                    :class="{
                                        'toggle-pill--on': s?.frameShowButtons,
                                    }"
                                    @click="
                                        store.updateSetting(
                                            'frameShowButtons',
                                            !s?.frameShowButtons,
                                        )
                                    "
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
                        <label class="control-label" for="cp-image-zoom"
                            >Zoom</label
                        >
                        <span class="value-badge"
                            >{{ (s?.imageZoom ?? 1).toFixed(2) }}x</span
                        >
                    </div>
                    <input
                        id="cp-image-zoom"
                        :value="s?.imageZoom ?? 1"
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.01"
                        class="slider"
                        aria-label="Image zoom"
                        @input="
                            store.updateSetting(
                                'imageZoom',
                                ($event.target as HTMLInputElement)
                                    .valueAsNumber,
                            )
                        "
                    />
                </div>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-image-offset-x"
                            >Horizontal</label
                        >
                        <span class="value-badge"
                            >{{
                                Math.round((s?.imageOffsetX ?? 0) * 100)
                            }}%</span
                        >
                    </div>
                    <input
                        id="cp-image-offset-x"
                        :value="s?.imageOffsetX ?? 0"
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        class="slider"
                        aria-label="Horizontal image offset"
                        @input="
                            store.updateSetting(
                                'imageOffsetX',
                                ($event.target as HTMLInputElement)
                                    .valueAsNumber,
                            )
                        "
                    />
                </div>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-image-offset-y"
                            >Vertical</label
                        >
                        <span class="value-badge"
                            >{{
                                Math.round((s?.imageOffsetY ?? 0) * 100)
                            }}%</span
                        >
                    </div>
                    <input
                        id="cp-image-offset-y"
                        :value="s?.imageOffsetY ?? 0"
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        class="slider"
                        aria-label="Vertical image offset"
                        @input="
                            store.updateSetting(
                                'imageOffsetY',
                                ($event.target as HTMLInputElement)
                                    .valueAsNumber,
                            )
                        "
                    />
                </div>

                <div class="control-row">
                    <button
                        type="button"
                        class="adjust-reset-btn"
                        @click="resetImageAdjustments"
                    >
                        Reset image framing
                    </button>
                </div>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-padding">
                            {{
                                hasFrame
                                    ? 'Padding — around frame'
                                    : 'Padding — around screenshot'
                            }}
                        </label>
                        <span class="value-badge"
                            >{{ s?.padding ?? 48 }}px</span
                        >
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
                        @input="
                            store.updateSetting(
                                'padding',
                                ($event.target as HTMLInputElement)
                                    .valueAsNumber,
                            )
                        "
                    />
                </div>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-radius"
                            >Radius</label
                        >
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
                        @input="
                            store.updateSetting(
                                'radius',
                                ($event.target as HTMLInputElement)
                                    .valueAsNumber,
                            )
                        "
                    />
                </div>

                <!-- SHADOW ──────────────────────────────── -->
                <p class="section-label">SHADOW</p>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-shadow"
                            >Shadow</label
                        >
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
                        @input="
                            store.updateSetting(
                                'shadow',
                                ($event.target as HTMLInputElement)
                                    .valueAsNumber,
                            )
                        "
                    />
                </div>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-shadow-blur"
                            >Shadow Blur</label
                        >
                        <span class="value-badge"
                            >{{ s?.shadowBlur ?? 40 }}px</span
                        >
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
                        @input="
                            store.updateSetting(
                                'shadowBlur',
                                ($event.target as HTMLInputElement)
                                    .valueAsNumber,
                            )
                        "
                    />
                </div>

                <!-- BORDER ──────────────────────────────── -->
                <p class="section-label">BORDER</p>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-border"
                            >Border</label
                        >
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
                        @input="
                            store.updateSetting(
                                'border',
                                ($event.target as HTMLInputElement)
                                    .valueAsNumber,
                            )
                        "
                    />
                </div>

                <!-- TEXTURE ─────────────────────────────── -->
                <p class="section-label">TEXTURE</p>

                <div class="control-row">
                    <div class="control-header">
                        <label class="control-label" for="cp-noise"
                            >Noise Grain</label
                        >
                        <span class="value-badge"
                            >{{
                                Math.round((s?.noiseGrain ?? 0.03) * 100)
                            }}%</span
                        >
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
                        @input="
                            store.updateSetting(
                                'noiseGrain',
                                ($event.target as HTMLInputElement)
                                    .valueAsNumber,
                            )
                        "
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
                                    @click="
                                        showUpgrade = true;
                                        showPresetLimit = false;
                                    "
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
                                <input
                                    v-model="shareWithTeam"
                                    type="checkbox"
                                    class="accent-[#e0ff4f]"
                                />
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
    background:
        radial-gradient(
            circle at top,
            rgba(224, 255, 79, 0.06),
            transparent 32%
        ),
        linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 22%),
        #111111;
}

/* ── Tab strip ── */
.cp-tabs {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
    background: rgba(9, 10, 12, 0.88);
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(14px);
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
    transition:
        color 150ms ease,
        border-color 150ms ease,
        background 150ms ease;
    margin-bottom: -1px;
}

.cp-tab:hover {
    color: #8a8a9a;
    background: rgba(255, 255, 255, 0.025);
}

.cp-tab--active {
    color: #e0ff4f;
    border-bottom-color: #e0ff4f;
    background: linear-gradient(
        180deg,
        rgba(224, 255, 79, 0.09),
        rgba(224, 255, 79, 0.02)
    );
}

/* ── Scrollable body ── */
.cp-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 14px 14px 8px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.07) transparent;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.02),
        transparent 16%
    );
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

.preset-section {
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
    background: linear-gradient(
        180deg,
        rgba(224, 255, 79, 0.14),
        rgba(224, 255, 79, 0.05)
    );
    border: 1px solid rgba(224, 255, 79, 0.22);
    padding: 2px 7px;
    border-radius: 999px;
    min-width: 36px;
    text-align: right;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* ── Slider ── */
.slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: linear-gradient(
        90deg,
        rgba(224, 255, 79, 0.18),
        rgba(255, 255, 255, 0.08)
    );
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
    background: linear-gradient(180deg, #f1ff96, #d7ff3f);
    cursor: pointer;
    border: none;
    box-shadow:
        0 0 0 3px rgba(224, 255, 79, 0.15),
        0 4px 12px rgba(224, 255, 79, 0.28);
    transition:
        transform 150ms ease,
        box-shadow 150ms ease;
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
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    margin-bottom: 14px;
}

.bg-type-btn {
    padding: 5px 4px;
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    background: transparent;
    color: #8a8a9a;
    cursor: pointer;
    transition:
        border-color 150ms,
        color 150ms,
        background 150ms;
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

.color-swatch-row--picker {
    position: relative;
    padding: 6px 8px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0.03)
    );
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    transition:
        border-color 150ms ease,
        transform 150ms ease,
        box-shadow 150ms ease;
}

.color-swatch-row--picker:hover,
.color-swatch-row--picker:focus-within {
    border-color: rgba(224, 255, 79, 0.3);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.04),
        0 0 0 1px rgba(224, 255, 79, 0.08);
    transform: translateY(-1px);
}

.color-swatch-row--compact {
    justify-content: flex-start;
}

.color-preview {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15) inset;
    flex-shrink: 0;
}

.color-preview--lg {
    width: 32px;
    height: 32px;
}

.mt-2 {
    margin-top: 6px;
}
.mt-3 {
    margin-top: 10px;
}

.color-input {
    -webkit-appearance: none;
    appearance: none;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    padding: 0;
    background: transparent;
    opacity: 0;
}

.color-input--lg {
    border-radius: 12px;
}

.color-input::-webkit-color-swatch-wrapper {
    padding: 0;
}
.color-input::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
}

.color-hex {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #d4d8df;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.preset-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.preset-grid--wide {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.preset-swatch {
    position: relative;
    min-height: 64px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
    cursor: pointer;
    transition:
        transform 150ms ease,
        border-color 150ms ease,
        box-shadow 150ms ease;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.preset-swatch::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(0, 0, 0, 0.38) 100%
    );
}

.preset-swatch:hover {
    transform: translateY(-2px) scale(1.01);
    border-color: rgba(255, 255, 255, 0.24);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.24);
}

.preset-swatch--wide {
    min-height: 56px;
}

.preset-swatch--active {
    border-color: rgba(224, 255, 79, 0.8);
    box-shadow:
        0 0 0 1px rgba(224, 255, 79, 0.35),
        0 8px 18px rgba(224, 255, 79, 0.12);
}

.preset-swatch-label {
    position: absolute;
    right: 8px;
    bottom: 8px;
    z-index: 1;
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: #f8fafc;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

/* ── Toggle (Linear/Radial) ── */
.toggle-row {
    display: flex;
    gap: 6px;
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

.toggle-btn:hover {
    border-color: rgba(255, 255, 255, 0.22);
    color: #f0f0f2;
}

.toggle-btn--active {
    border-color: rgba(224, 255, 79, 0.4);
    background: rgba(224, 255, 79, 0.08);
    color: #e0ff4f;
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
    gap: 6px;
    margin-bottom: 14px;
}

.frame-btn {
    position: relative;
    padding: 9px 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.02)
    );
    color: #8a8a9a;
    cursor: pointer;
    transition:
        border-color 150ms,
        color 150ms,
        background 150ms,
        transform 150ms ease,
        box-shadow 150ms ease;
    text-align: center;
}

.frame-btn:hover {
    border-color: rgba(255, 255, 255, 0.22);
    color: #f0f0f2;
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.16);
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
    margin-top: 2px;
    padding-left: 2px;
    padding-right: 2px;
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

.frame-text-input:focus {
    border-color: rgba(224, 255, 79, 0.4);
}
.frame-text-input::placeholder {
    color: #4a4a58;
}

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
    background: rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition:
        background 150ms ease,
        border-color 150ms ease;
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
    transition:
        transform 150ms ease,
        background 150ms ease;
}

.toggle-pill--on .toggle-pill-thumb {
    transform: translateX(16px);
    background: #e0ff4f;
}

.adjust-reset-btn {
    width: 100%;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.06),
        rgba(255, 255, 255, 0.03)
    );
    color: #d4d8df;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    transition:
        border-color 150ms ease,
        color 150ms ease,
        background 150ms ease;
}

.adjust-reset-btn:hover {
    border-color: rgba(224, 255, 79, 0.35);
    color: #e0ff4f;
    background: rgba(224, 255, 79, 0.06);
}

/* ── Preset saving ── */
.preset-save-btn {
    width: 100%;
    padding: 7px;
    border-radius: 6px;
    border: 1px solid rgba(224, 255, 79, 0.25);
    background: linear-gradient(
        180deg,
        rgba(224, 255, 79, 0.1),
        rgba(224, 255, 79, 0.03)
    );
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(224, 255, 79, 0.7);
    cursor: pointer;
    text-align: center;
    transition:
        border-color 150ms ease,
        color 150ms ease;
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

.upgrade-link:hover {
    color: #e0ff4f;
}

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
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.06),
        rgba(255, 255, 255, 0.03)
    );
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #e0e0e0;
    outline: none;
    box-sizing: border-box;
}

.preset-name-input:focus {
    border-color: rgba(224, 255, 79, 0.4);
}

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

.preset-confirm-btn:disabled {
    opacity: 0.4;
}
.preset-confirm-btn:hover:not(:disabled) {
    opacity: 0.88;
}

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

.preset-cancel-btn:hover {
    color: #f0f0f2;
}

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

.share-team-label input {
    accent-color: #d7ff3f;
}

.share-team-label:hover {
    color: #8a8a9a;
}
</style>
