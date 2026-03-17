<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useElementSize } from '@vueuse/core';
import type { VueKonvaRef } from 'vue-konva';
import type Konva from 'konva';
import { useEditorStore } from '@/stores/editor';
import { useCanvas, createNoiseCanvas } from '@/composables/useCanvas';
import { registerStage } from '@/composables/useExport';

const store = useEditorStore();

// Container measurement
const containerRef = ref<HTMLDivElement | null>(null);
const { width: containerWidth, height: containerHeight } = useElementSize(containerRef);

const canvas = useCanvas(containerWidth, containerHeight);

// Noise canvas — regenerated when grain intensity changes
const noiseCanvas = ref<HTMLCanvasElement | null>(null);

watch(
    () => store.settings.noiseGrain,
    (grain) => {
        noiseCanvas.value = grain > 0 ? createNoiseCanvas(grain) : null;
    },
    { immediate: true },
);

const noiseConfig = computed(() => {
    if (!noiseCanvas.value || store.settings.noiseGrain <= 0) return null;
    const { w, h } = canvas.cardDimensions.value;
    return {
        x: 0,
        y: 0,
        width: w,
        height: h,
        fillPatternImage: noiseCanvas.value,
        fillPatternRepeat: 'repeat',
        globalCompositeOperation: 'overlay',
        opacity: Math.min(1, store.settings.noiseGrain * 2),
        listening: false,
    };
});

// Konva stage ref — used by useExport to call toDataURL
const stageRef = ref<VueKonvaRef<Konva.Stage> | null>(null);

onMounted(() => {
    const stage = stageRef.value?.getNode();
    if (stage) registerStage(stage);
});

// Drag-and-drop / click-to-upload
const isDragOver = ref(false);

function onDrop(e: DragEvent): void {
    e.preventDefault();
    isDragOver.value = false;
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
        f.type.startsWith('image/'),
    );
    files.forEach((f) => store.addImage(f).catch(() => {}));
}

function onDragOver(e: DragEvent): void {
    e.preventDefault();
    isDragOver.value = true;
}

function onDragLeave(): void {
    isDragOver.value = false;
}

function onClickUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = () => {
        Array.from(input.files ?? []).forEach((f) => store.addImage(f).catch(() => {}));
    };
    input.click();
}
</script>

<template>
    <div
        ref="containerRef"
        class="relative h-full w-full overflow-hidden"
        style="background: #080808"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
    >
        <!-- Konva stage (always mounted; hidden behind upload prompt when no images) -->
        <v-stage v-if="containerWidth > 0" ref="stageRef" :config="canvas.stageConfig.value">
            <v-layer>
                <!-- Canvas background -->
                <v-rect :config="canvas.canvasBgConfig.value" />

                <!-- Shadow rect (outside clip group so shadow renders fully) -->
                <v-rect
                    v-if="store.images.length > 0"
                    :config="canvas.shadowRectConfig.value"
                />

                <!-- Card group — clipped to rounded rect -->
                <v-group
                    v-if="store.images.length > 0"
                    :config="canvas.cardGroupConfig.value"
                >
                    <!-- Card background (gradient or solid) -->
                    <v-rect :config="canvas.cardBgConfig.value" />

                    <!-- macOS chrome -->
                    <template v-if="canvas.macosDotsConfig.value">
                        <v-rect :config="canvas.macosDotsConfig.value.barConfig" />
                        <v-line :config="canvas.macosDotsConfig.value.separatorConfig" />
                        <v-circle
                            v-for="dot in canvas.macosDotsConfig.value.dots"
                            :key="dot.fill"
                            :config="dot"
                        />
                    </template>

                    <!-- Browser chrome -->
                    <template v-if="canvas.browserChromeConfig.value">
                        <v-rect :config="canvas.browserChromeConfig.value.tabBarConfig" />
                        <v-rect :config="canvas.browserChromeConfig.value.activeTabConfig" />
                        <v-text :config="canvas.browserChromeConfig.value.tabTextConfig" />
                        <v-rect :config="canvas.browserChromeConfig.value.addressBarConfig" />
                        <v-rect :config="canvas.browserChromeConfig.value.urlBoxConfig" />
                        <v-text :config="canvas.browserChromeConfig.value.urlTextConfig" />
                        <v-circle
                            v-for="dot in canvas.browserChromeConfig.value.dots"
                            :key="dot.fill"
                            :config="dot"
                        />
                    </template>

                    <!-- User image -->
                    <v-image
                        v-if="canvas.imageConfig.value"
                        :config="canvas.imageConfig.value"
                    />

                    <!-- Noise overlay -->
                    <v-rect v-if="noiseConfig" :config="noiseConfig" />
                </v-group>

                <!-- Border (outside clip group so it renders cleanly on top) -->
                <v-rect
                    v-if="store.images.length > 0 && canvas.borderConfig.value"
                    :config="canvas.borderConfig.value"
                />
            </v-layer>
        </v-stage>

        <!-- Upload prompt — shown when no images -->
        <Transition name="fade">
            <div
                v-if="store.images.length === 0"
                class="absolute inset-0 flex flex-col items-center justify-center gap-4"
                :class="isDragOver ? 'pointer-events-none' : ''"
            >
                <!-- Drag overlay ring -->
                <div
                    v-if="isDragOver"
                    class="absolute inset-8 rounded-2xl border-2 border-dashed border-[#e0ff4f]/50 bg-[#e0ff4f]/5"
                />

                <button
                    type="button"
                    class="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-10 py-8 text-center transition-all hover:border-white/20 hover:bg-white/6"
                    @click="onClickUpload"
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        class="text-white/30"
                    >
                        <path
                            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <polyline
                            points="17 8 12 3 7 8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <line
                            x1="12"
                            y1="3"
                            x2="12"
                            y2="15"
                            stroke-linecap="round"
                        />
                    </svg>
                    <div>
                        <p class="text-sm font-medium text-white/60">
                            Drop screenshots here
                        </p>
                        <p class="mt-1 text-xs text-white/30">
                            or click to upload · PNG, JPG, WebP
                        </p>
                    </div>
                </button>
            </div>
        </Transition>

        <!-- Drop overlay when dragging over a canvas that already has images -->
        <Transition name="fade">
            <div
                v-if="isDragOver && store.images.length > 0"
                class="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
                <div class="absolute inset-4 rounded-2xl border-2 border-dashed border-[#e0ff4f]/60 bg-[#e0ff4f]/5" />
                <p class="relative text-sm font-medium text-[#e0ff4f]">
                    Drop to add image
                </p>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
