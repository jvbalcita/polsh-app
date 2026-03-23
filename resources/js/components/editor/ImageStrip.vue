<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import UpgradeModal from '@/components/editor/UpgradeModal.vue';
import { useEditorStore } from '@/stores/editor';

const store = useEditorStore();
const page = usePage();
const fileInputRef = ref<HTMLInputElement | null>(null);

const isPro = computed(() => page.props.isPro as boolean);
const imageLimit = computed(() => (page.props.imageLimit as number) ?? 3);
const atImageLimit = computed(() => store.images.length >= imageLimit.value);
const showUpgrade = ref(false);

function triggerFileInput(): void {
    fileInputRef.value?.click();
}

async function handleFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
return;
}

    for (const file of Array.from(input.files)) {
        await store.addImage(file).catch(() => {});
    }

    input.value = '';
}
</script>

<template>
    <!-- Screenshot counter — free users only, always visible -->
    <div
        v-if="!isPro"
        class="flex h-7 shrink-0 items-center gap-2 border-t border-white/[0.07] px-4"
        style="background: #111114"
    >
        <span
            class="text-[10px] tabular-nums"
            :style="atImageLimit ? 'color: #ffaa4f; font-family: DM Mono, monospace' : 'color: #4a4a58; font-family: DM Mono, monospace'"
        >{{ store.images.length }} / {{ imageLimit }} screenshots</span>
        <button
            v-if="atImageLimit"
            type="button"
            class="border-0 bg-transparent p-0 text-[10px] text-[#4a4a58] cursor-pointer transition-colors duration-150 hover:text-[#e0ff4f]"
            style="font-family: 'DM Sans', sans-serif"
            @click="showUpgrade = true"
        >Upgrade to Pro →</button>
    </div>

    <!-- Thumbnail strip — shown when images exist -->
    <div
        v-if="store.images.length > 0"
        class="flex h-[72px] items-center gap-2 overflow-x-auto border-t border-white/8 px-4"
        style="background: #111114; scrollbar-width: none"
    >
        <!-- Hidden file input — persistent ref so the browser never GC's it before change fires -->
        <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="handleFileSelect"
        />

        <!-- div instead of button to avoid invalid button-in-button nesting -->
        <div
            v-for="(image, index) in store.images"
            :key="image.id"
            role="button"
            tabindex="0"
            class="group relative shrink-0 cursor-pointer overflow-hidden rounded-md border transition-all duration-100"
            :class="[
                index === store.activeIndex
                    ? 'border-[#e0ff4f] ring-1 ring-[#e0ff4f]/40'
                    : 'border-white/12 hover:border-white/30',
            ]"
            style="width: 64px; height: 40px"
            @click="store.setActiveIndex(index)"
            @keydown.enter.space="store.setActiveIndex(index)"
        >
            <img
                :src="image.src"
                :alt="`Screenshot ${index + 1}`"
                class="h-full w-full object-cover"
            />

            <!-- Remove button -->
            <button
                type="button"
                class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white/60 opacity-0 transition-opacity hover:bg-black/90 hover:text-white group-hover:opacity-100"
                @click.stop="store.removeImage(image.id)"
            >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path
                        d="M1 1l6 6M7 1L1 7"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                    />
                </svg>
            </button>
        </div>

        <!-- Add more button -->
        <button
            type="button"
            class="flex shrink-0 flex-col items-center justify-center rounded-md border border-dashed border-white/15 text-white/30 transition-colors hover:border-[#e0ff4f]/40 hover:text-[#e0ff4f]/70"
            style="width: 64px; height: 40px"
            @click="triggerFileInput"
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                />
            </svg>
        </button>
    </div>

    <UpgradeModal v-model:open="showUpgrade" />
</template>
