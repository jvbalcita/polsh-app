<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useEditorStore } from '@/stores/editor';
import UpgradeModal from '@/components/editor/UpgradeModal.vue';

const store = useEditorStore();
const page = usePage();

const ASPECT_RATIOS = ['16:9', '4:3', '1:1', '3:2', '21:9'];

const COLOR_PRESETS = [
    '#e0ff4f', // lime
    '#a855f7', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#ec4899', // pink
    '#10b981', // emerald
    '#3b82f6', // blue
    '#f43f5e', // rose
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
    <div class="flex h-full flex-col overflow-hidden">
        <!-- Header -->
        <div class="border-b border-white/8 px-4 py-3">
            <span class="text-[11px] font-semibold uppercase tracking-widest text-white/35">
                Controls
            </span>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-3">
            <!-- Aspect Ratio -->
            <section class="mb-5">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Aspect Ratio
                </p>
                <div class="flex flex-wrap gap-1.5">
                    <button
                        v-for="ratio in ASPECT_RATIOS"
                        :key="ratio"
                        type="button"
                        class="rounded border px-2 py-0.5 text-[11px] font-medium transition-colors"
                        :class="[
                            store.settings.aspectRatio === ratio
                                ? 'border-[#e0ff4f] bg-[#e0ff4f]/10 text-[#e0ff4f]'
                                : 'border-white/12 text-white/40 hover:border-white/25 hover:text-white/60',
                        ]"
                        @click="store.settings.aspectRatio = ratio"
                    >
                        {{ ratio }}
                    </button>
                </div>
            </section>

            <!-- Color presets -->
            <section class="mb-5">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Color Presets
                </p>
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="color in COLOR_PRESETS"
                        :key="color"
                        type="button"
                        class="h-6 w-6 rounded-full border border-white/15 transition-transform hover:scale-110"
                        :style="{ background: color }"
                        :title="color"
                        @click="applyBgColor(color)"
                    />
                </div>
            </section>

            <!-- Sliders -->
            <section class="space-y-4">
                <p class="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Adjustments
                </p>

                <!-- Padding -->
                <div>
                    <div class="mb-1 flex justify-between">
                        <label class="text-[11px] text-white/45">Padding</label>
                        <span class="text-[11px] tabular-nums text-white/30">
                            {{ store.settings.padding }}px
                        </span>
                    </div>
                    <input
                        v-model.number="store.settings.padding"
                        type="range"
                        min="0"
                        max="120"
                        step="2"
                        class="slider w-full"
                    />
                </div>

                <!-- Radius -->
                <div>
                    <div class="mb-1 flex justify-between">
                        <label class="text-[11px] text-white/45">Radius</label>
                        <span class="text-[11px] tabular-nums text-white/30">
                            {{ store.settings.radius }}px
                        </span>
                    </div>
                    <input
                        v-model.number="store.settings.radius"
                        type="range"
                        min="0"
                        max="40"
                        step="1"
                        class="slider w-full"
                    />
                </div>

                <!-- Shadow Opacity -->
                <div>
                    <div class="mb-1 flex justify-between">
                        <label class="text-[11px] text-white/45">Shadow</label>
                        <span class="text-[11px] tabular-nums text-white/30">
                            {{ Math.round(store.settings.shadowOpacity * 100) }}%
                        </span>
                    </div>
                    <input
                        v-model.number="store.settings.shadowOpacity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        class="slider w-full"
                    />
                </div>

                <!-- Shadow Blur -->
                <div>
                    <div class="mb-1 flex justify-between">
                        <label class="text-[11px] text-white/45">Shadow Blur</label>
                        <span class="text-[11px] tabular-nums text-white/30">
                            {{ store.settings.shadowBlur }}px
                        </span>
                    </div>
                    <input
                        v-model.number="store.settings.shadowBlur"
                        type="range"
                        min="0"
                        max="120"
                        step="1"
                        class="slider w-full"
                    />
                </div>

                <!-- Border Width -->
                <div>
                    <div class="mb-1 flex justify-between">
                        <label class="text-[11px] text-white/45">Border</label>
                        <span class="text-[11px] tabular-nums text-white/30">
                            {{ store.settings.borderWidth }}px
                        </span>
                    </div>
                    <input
                        v-model.number="store.settings.borderWidth"
                        type="range"
                        min="0"
                        max="4"
                        step="0.5"
                        class="slider w-full"
                    />
                </div>

                <!-- Noise Grain -->
                <div>
                    <div class="mb-1 flex justify-between">
                        <label class="text-[11px] text-white/45">Noise Grain</label>
                        <span class="text-[11px] tabular-nums text-white/30">
                            {{ Math.round(store.settings.noiseGrain * 100) }}%
                        </span>
                    </div>
                    <input
                        v-model.number="store.settings.noiseGrain"
                        type="range"
                        min="0"
                        max="0.3"
                        step="0.005"
                        class="slider w-full"
                    />
                </div>
            </section>
        </div>

        <!-- Save Preset (auth-gated) -->
        <div v-if="page.props.auth?.user" class="border-t border-white/8 px-4 py-3">
            <div v-if="!showNameInput">
                <button
                    type="button"
                    class="w-full rounded-md border py-1.5 text-[11px] font-medium transition-colors"
                    style="border-color: rgba(224,255,79,0.25); color: rgba(224,255,79,0.7)"
                    @click="openSavePreset"
                >
                    Save preset
                </button>
                <!-- Free tier preset limit nudge -->
                <p v-if="showPresetLimit" class="mt-1.5 text-[10px] text-white/40">
                    Free tier: 5 presets max.
                    <button
                        type="button"
                        class="text-[#e0ff4f]/70 hover:text-[#e0ff4f] transition-colors"
                        @click="showUpgrade = true; showPresetLimit = false"
                    >
                        Upgrade to Pro →
                    </button>
                </p>
            </div>
            <div v-else>
                <div class="flex items-center gap-1.5">
                    <input
                        v-model="presetName"
                        type="text"
                        maxlength="80"
                        placeholder="Preset name"
                        class="min-w-0 flex-1 rounded border px-2 py-1 text-[11px] outline-none"
                        style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #e0e0e0"
                        @keydown.enter="confirmSavePreset"
                        @keydown.escape="cancelSavePreset"
                    />
                    <button
                        type="button"
                        :disabled="isSaving"
                        class="shrink-0 rounded px-2 py-1 text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                        style="background: #e0ff4f; color: #080808"
                        @click="confirmSavePreset"
                    >
                        {{ isSaving ? '…' : 'Save' }}
                    </button>
                    <button
                        type="button"
                        class="shrink-0 rounded px-2 py-1 text-[11px] transition-opacity hover:opacity-80"
                        style="color: rgba(255,255,255,0.35)"
                        @click="cancelSavePreset"
                    >
                        ✕
                    </button>
                </div>
                <!-- Share with team checkbox -->
                <label
                    v-if="userHasTeam"
                    class="mt-2 flex cursor-pointer items-center gap-1.5 text-[10px] text-white/40 hover:text-white/60"
                >
                    <input v-model="shareWithTeam" type="checkbox" class="accent-[#e0ff4f]" />
                    Share with team
                </label>
            </div>
        </div>

        <!-- Export panel pinned at bottom -->
        <slot />
    </div>

    <UpgradeModal v-model:open="showUpgrade" />
</template>

<style scoped>
.slider {
    -webkit-appearance: none;
    appearance: none;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
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
    transition: box-shadow 0.1s;
}

.slider::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 5px rgba(224, 255, 79, 0.25);
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
</style>
