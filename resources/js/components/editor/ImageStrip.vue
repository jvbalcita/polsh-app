<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';

const store = useEditorStore();
</script>

<template>
    <div
        v-if="store.images.length > 0"
        class="flex h-[88px] items-center gap-2 overflow-x-auto border-t border-white/8 px-4"
        style="background: #0e0e0e"
    >
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
            style="width: 112px; height: 64px"
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
            class="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-white/15 text-white/30 transition-colors hover:border-white/30 hover:text-white/50"
            @click="
                () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = () => {
                        Array.from(input.files ?? []).forEach((f) => store.addImage(f).catch(() => {}));
                    };
                    input.click();
                }
            "
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
</template>
