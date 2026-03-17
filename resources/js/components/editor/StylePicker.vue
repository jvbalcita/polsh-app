<script setup lang="ts">
import { onMounted } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useEditorStore, type SavedPreset } from '@/stores/editor';
import type { StyleConfig } from '@/types/style';
import StyleCard from './StyleCard.vue';

const store = useEditorStore();
const page = usePage();

function select(style: StyleConfig): void {
    store.applyStyle(style);
}

function applyToAll(): void {
    if (store.activeStyle) {
        store.applyStyle(store.activeStyle);
    }
}

function loadPreset(preset: SavedPreset): void {
    store.loadPreset(preset);
}

onMounted(() => {
    if (page.props.auth?.user) {
        store.fetchPresets();
    }
});
</script>

<template>
    <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="border-b border-white/8 px-3 py-3">
            <span class="text-[11px] font-semibold uppercase tracking-widest text-white/35"> Styles </span>
        </div>

        <!-- My presets (when logged in and presets exist) -->
        <template v-if="page.props.auth?.user && store.presets.length > 0">
            <div class="border-b border-white/8 px-3 pb-3 pt-3">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">My presets</p>
                <div class="flex flex-col gap-1">
                    <div
                        v-for="preset in store.presets"
                        :key="preset.id"
                        class="group flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-white/5"
                    >
                        <button type="button" class="min-w-0 flex-1 truncate text-left text-[11px] text-white/60" @click="loadPreset(preset)">
                            {{ preset.name }}
                        </button>
                        <button
                            type="button"
                            class="ml-1.5 shrink-0 text-[10px] text-white/25 opacity-0 transition-opacity hover:text-white/50 group-hover:opacity-100"
                            @click="store.deletePreset(preset.id)"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <!-- Team presets (when logged in and team presets exist) -->
        <template v-if="page.props.auth?.user && store.teamPresets.length > 0">
            <div class="border-b border-white/8 px-3 pb-3 pt-3">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">Team presets</p>
                <div class="flex flex-col gap-1">
                    <div
                        v-for="preset in store.teamPresets"
                        :key="preset.id"
                        class="flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-white/5"
                    >
                        <button type="button" class="min-w-0 flex-1 truncate text-left text-[11px] text-white/60" @click="loadPreset(preset)">
                            {{ preset.name }}
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <!-- Style grid -->
        <div class="flex-1 overflow-y-auto px-3 py-3">
            <div class="grid grid-cols-2 gap-2">
                <StyleCard
                    v-for="style in store.allStyles"
                    :key="style.slug"
                    :style="style"
                    :active="store.activeStyle?.slug === style.slug"
                    @select="select"
                />
            </div>
        </div>

        <!-- Apply to all button -->
        <div class="border-t border-white/8 p-3">
            <button
                type="button"
                class="w-full rounded-md border border-white/12 py-1.5 text-[11px] font-medium text-white/50 transition-colors hover:border-white/25 hover:text-white/70"
                @click="applyToAll"
            >
                Apply to all
            </button>
        </div>
    </div>
</template>
