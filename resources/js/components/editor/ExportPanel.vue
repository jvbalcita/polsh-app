<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import UpgradeModal from '@/components/editor/UpgradeModal.vue';
import { useExport } from '@/composables/useExport';
import { useEditorStore } from '@/stores/editor';

const store = useEditorStore();
const { exportSingle, exportAll, exportSVG, isExporting } = useExport();
const page = usePage();

const isPro = computed(() => page.props.isPro as boolean);
const showUpgrade = ref(false);

const FORMATS: { key: string; label: string; pro?: boolean }[] = [
    { key: 'png', label: 'PNG' },
    { key: 'webp', label: 'WEBP' },
    { key: 'jpeg', label: 'JPEG' },
    { key: 'svg', label: 'SVG', pro: true },
];

const RESOLUTIONS = [
    { label: '1×', value: 1 },
    { label: '2×', value: 2 },
    { label: '4×', value: 4, pro: true },
] as const;

const isSVG = computed(() => store.exportSettings.exportFormat === 'svg');
const hasImages = computed(() => store.images.length > 0);
const hasMultiple = computed(() => store.images.length > 1);

function onDownload(): void {
    if (!hasImages.value) {
return;
}

    if (isSVG.value) {
        exportSVG();
    } else {
        const fmt = store.exportSettings.exportFormat as 'png' | 'webp' | 'jpeg';
        const scale = store.exportSettings.exportResolution as 1 | 2 | 4;
        exportSingle(fmt, scale);
    }
}

function onExportAll(): void {
    if (!hasImages.value) {
return;
}

    const fmt = isSVG.value ? 'png' : store.exportSettings.exportFormat;
    exportAll(fmt, store.exportSettings.exportResolution);
}
</script>

<template>
    <div class="border-t border-white/8 px-4 pb-5 pt-3">
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Export
        </p>

        <!-- Format selector -->
        <div class="mb-2 grid grid-cols-4 gap-1">
            <button
                v-for="fmt in FORMATS"
                :key="fmt.key"
                type="button"
                class="relative rounded border py-1 text-[10px] font-semibold transition-colors"
                :class="[
                    store.exportSettings.exportFormat === fmt.key
                        ? 'border-[#e0ff4f]/40 bg-[#e0ff4f]/10 text-[#e0ff4f]'
                        : 'border-white/10 text-white/35 hover:border-white/20 hover:text-white/55',
                ]"
                @click="fmt.key === 'svg' && !isPro ? (showUpgrade = true) : (store.exportSettings.exportFormat = fmt.key)"
            >
                {{ fmt.label }}
                <span
                    v-if="fmt.pro"
                    class="absolute -right-1 -top-1.5 rounded-sm bg-[#e0ff4f]/90 px-[3px] py-px text-[7px] font-bold leading-none text-black"
                >PRO</span>
            </button>
        </div>

        <!-- Resolution selector (hidden for SVG) -->
        <Transition name="slide">
            <div v-if="!isSVG" class="mb-3 flex gap-1">
                <button
                    v-for="res in RESOLUTIONS"
                    :key="res.value"
                    type="button"
                    class="relative flex-1 rounded border py-1.5 text-[10px] font-semibold transition-colors"
                    :class="[
                        store.exportSettings.exportResolution === res.value
                            ? 'border-[#e0ff4f]/40 bg-[#e0ff4f]/10 text-[#e0ff4f]'
                            : 'border-white/10 text-white/35 hover:border-white/20 hover:text-white/55',
                    ]"
                    @click="'pro' in res && res.pro && !isPro ? (showUpgrade = true) : (store.exportSettings.exportResolution = res.value)"
                >
                    {{ res.label }}
                    <!-- Pro badge -->
                    <span
                        v-if="'pro' in res && res.pro"
                        class="absolute -right-1 -top-1.5 rounded-sm bg-[#e0ff4f]/90 px-[3px] py-px text-[7px] font-bold leading-none text-black"
                    >
                        PRO
                    </span>
                </button>
            </div>
            <div v-else class="mb-3">
                <p class="text-[10px] text-white/25">
                    SVG exports are resolution-independent
                </p>
            </div>
        </Transition>

        <!-- Primary: Download -->
        <button
            type="button"
            class="mb-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#e0ff4f] py-2 text-[12px] font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            :disabled="!hasImages || isExporting"
            @click="onDownload"
        >
            <svg
                v-if="isExporting"
                class="animate-spin"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-dasharray="31.4"
                    stroke-dashoffset="10"
                />
            </svg>
            <svg
                v-else
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {{ isExporting ? 'Exporting…' : 'Download' }}
        </button>

        <!-- Secondary: Export all as ZIP -->
        <button
            type="button"
            class="flex w-full items-center justify-center gap-1.5 rounded-md border border-white/12 py-1.5 text-[11px] font-medium text-white/45 transition-colors hover:border-white/22 hover:text-white/65 disabled:cursor-not-allowed disabled:opacity-35"
            :disabled="!hasImages || isExporting"
            @click="onExportAll"
        >
            <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8M8 12l4 4 4-4" />
            </svg>
            Export all as ZIP
            <span
                v-if="hasMultiple"
                class="rounded bg-white/8 px-1 py-px text-[9px] tabular-nums text-white/35"
            >
                {{ store.images.length }}
            </span>
        </button>

        <!-- Keyboard hint -->
        <p class="mt-2.5 text-center text-[10px] text-white/18">
            <kbd class="font-mono">⌘S</kbd> to quick-save
        </p>
    </div>

    <UpgradeModal v-model:open="showUpgrade" />
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition:
        opacity 0.15s ease,
        max-height 0.2s ease;
    max-height: 40px;
    overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    max-height: 0;
}
</style>
