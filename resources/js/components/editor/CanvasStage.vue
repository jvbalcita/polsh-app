<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import type Konva from 'konva';
import { ref, watch, computed } from 'vue';
import type { VueKonvaRef } from 'vue-konva';
import { useCanvas, createNoiseCanvas } from '@/composables/useCanvas';
import { registerStage } from '@/composables/useExport';
import { useEditorStore } from '@/stores/editor';

const store = useEditorStore();

// Container measurement
const containerRef = ref<HTMLDivElement | null>(null);
const { width: containerWidth, height: containerHeight } =
    useElementSize(containerRef);

const canvas = useCanvas(containerWidth, containerHeight);

// Noise canvas — regenerated when grain intensity changes
const noiseCanvas = ref<HTMLCanvasElement | null>(null);

watch(
    () => store.activeSettings?.noiseGrain,
    (grain) => {
        noiseCanvas.value =
            grain && grain > 0 ? createNoiseCanvas(grain) : null;
    },
    { immediate: true },
);

const noiseConfig = computed(() => {
    if (
        !noiseCanvas.value ||
        !store.activeSettings ||
        store.activeSettings.noiseGrain <= 0
    ) {
        return null;
    }

    const { width: w, height: h } = canvas.frameBounds.value;

    return {
        x: 0,
        y: 0,
        width: w,
        height: h,
        fillPatternImage: noiseCanvas.value,
        fillPatternRepeat: 'repeat',
        globalCompositeOperation: 'overlay',
        opacity: Math.min(1, store.activeSettings.noiseGrain * 2),
        listening: false,
    };
});

// Konva stage ref — used by useExport to call toDataURL.
const stageRef = ref<VueKonvaRef<Konva.Stage> | null>(null);

watch(
    [stageRef, canvas.exportBounds],
    ([ref, exportBounds]) => {
        const stage = ref?.getNode();

        if (stage) {
            registerStage(stage, exportBounds);
        }
    },
    { flush: 'post' },
);

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
        Array.from(input.files ?? []).forEach((f) =>
            store.addImage(f).catch(() => {}),
        );
    };
    input.click();
}
</script>

<template>
    <div
        ref="containerRef"
        class="canvas-stage-container relative h-full w-full overflow-hidden"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
    >
        <!-- Konva stage (always mounted; hidden behind upload prompt when no images) -->
        <v-stage
            v-if="containerWidth > 0"
            ref="stageRef"
            :config="canvas.stageConfig.value"
        >
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

                    <v-group :config="canvas.frameGroupConfig.value">
                        <!-- User image -->
                        <v-group
                            v-if="canvas.imageConfig.value"
                            :config="canvas.imageClipGroupConfig.value"
                        >
                            <v-image :config="canvas.imageConfig.value" />
                        </v-group>

                        <!-- macOS chrome (dark or light) -->
                        <template v-if="canvas.macosDotsConfig.value">
                            <v-rect
                                :config="canvas.macosDotsConfig.value.barConfig"
                            />
                            <v-line
                                :config="
                                    canvas.macosDotsConfig.value.separatorConfig
                                "
                            />
                            <v-text
                                v-if="canvas.macosDotsConfig.value.titleConfig"
                                :config="
                                    canvas.macosDotsConfig.value.titleConfig
                                "
                            />
                            <v-circle
                                v-for="dot in canvas.macosDotsConfig.value.dots"
                                :key="dot.fill"
                                :config="dot"
                            />
                        </template>

                        <!-- Browser chrome -->
                        <template v-if="canvas.browserChromeConfig.value">
                            <v-rect
                                :config="
                                    canvas.browserChromeConfig.value
                                        .tabBarConfig
                                "
                            />
                            <v-rect
                                :config="
                                    canvas.browserChromeConfig.value
                                        .activeTabConfig
                                "
                            />
                            <v-text
                                :config="
                                    canvas.browserChromeConfig.value
                                        .tabTextConfig
                                "
                            />
                            <v-rect
                                :config="
                                    canvas.browserChromeConfig.value
                                        .addressBarConfig
                                "
                            />
                            <v-rect
                                :config="
                                    canvas.browserChromeConfig.value
                                        .urlBoxConfig
                                "
                            />
                            <v-text
                                :config="
                                    canvas.browserChromeConfig.value
                                        .urlTextConfig
                                "
                            />
                            <v-circle
                                v-for="control in canvas.browserChromeConfig
                                    .value.windowControls.circles"
                                :key="`browser-circle-${control.kind}`"
                                :config="control"
                            />
                            <v-rect
                                v-for="control in canvas.browserChromeConfig
                                    .value.windowControls.buttons"
                                :key="`browser-button-${control.kind}`"
                                :config="control"
                            />
                            <v-text
                                v-for="icon in canvas.browserChromeConfig.value
                                    .windowControls.icons"
                                :key="`browser-icon-${icon.text}-${icon.x}`"
                                :config="{
                                    ...icon,
                                    x: icon.x - 14,
                                    width: 28,
                                    fontSize: 11,
                                    fontFamily: 'DM Mono, monospace',
                                    align: 'center',
                                    listening: false,
                                }"
                            />
                        </template>

                        <!-- Terminal chrome -->
                        <template v-if="canvas.terminalChromeConfig.value">
                            <v-rect
                                :config="
                                    canvas.terminalChromeConfig.value.barConfig
                                "
                            />
                            <v-line
                                :config="
                                    canvas.terminalChromeConfig.value
                                        .separatorConfig
                                "
                            />
                            <v-text
                                :config="
                                    canvas.terminalChromeConfig.value
                                        .shellLabelConfig
                                "
                            />
                            <v-text
                                :config="
                                    canvas.terminalChromeConfig.value
                                        .titleConfig
                                "
                            />
                            <v-circle
                                v-for="control in canvas.terminalChromeConfig
                                    .value.windowControls.circles"
                                :key="`terminal-circle-${control.kind}`"
                                :config="control"
                            />
                            <v-rect
                                v-for="control in canvas.terminalChromeConfig
                                    .value.windowControls.buttons"
                                :key="`terminal-button-${control.kind}`"
                                :config="control"
                            />
                            <v-text
                                v-for="icon in canvas.terminalChromeConfig.value
                                    .windowControls.icons"
                                :key="`terminal-icon-${icon.text}-${icon.x}`"
                                :config="{
                                    ...icon,
                                    x: icon.x - 14,
                                    width: 28,
                                    fontSize: 11,
                                    fontFamily: 'DM Mono, monospace',
                                    align: 'center',
                                    listening: false,
                                }"
                            />
                        </template>

                        <!-- Minimal window chrome -->
                        <template v-if="canvas.minimalWindowChromeConfig.value">
                            <v-rect
                                :config="
                                    canvas.minimalWindowChromeConfig.value
                                        .barConfig
                                "
                            />
                            <v-line
                                :config="
                                    canvas.minimalWindowChromeConfig.value
                                        .separatorConfig
                                "
                            />
                            <v-text
                                :config="
                                    canvas.minimalWindowChromeConfig.value
                                        .titleConfig
                                "
                            />
                            <v-circle
                                v-for="control in canvas
                                    .minimalWindowChromeConfig.value
                                    .windowControls.circles"
                                :key="`minimal-circle-${control.kind}`"
                                :config="control"
                            />
                            <v-rect
                                v-for="control in canvas
                                    .minimalWindowChromeConfig.value
                                    .windowControls.buttons"
                                :key="`minimal-button-${control.kind}`"
                                :config="control"
                            />
                            <v-text
                                v-for="icon in canvas.minimalWindowChromeConfig
                                    .value.windowControls.icons"
                                :key="`minimal-icon-${icon.text}-${icon.x}`"
                                :config="{
                                    ...icon,
                                    x: icon.x - 14,
                                    width: 28,
                                    fontSize: 10,
                                    fontFamily: 'DM Mono, monospace',
                                    align: 'center',
                                    listening: false,
                                }"
                            />
                        </template>

                        <!-- Code editor chrome -->
                        <template v-if="canvas.codeEditorChromeConfig.value">
                            <v-rect
                                :config="
                                    canvas.codeEditorChromeConfig.value
                                        .activityBarConfig
                                "
                            />
                            <v-line
                                :config="
                                    canvas.codeEditorChromeConfig.value
                                        .activityBarBorderConfig
                                "
                            />
                            <v-rect
                                :config="
                                    canvas.codeEditorChromeConfig.value
                                        .tabBarConfig
                                "
                            />
                            <v-line
                                :config="
                                    canvas.codeEditorChromeConfig.value
                                        .tabBarBorderConfig
                                "
                            />
                            <v-rect
                                :config="
                                    canvas.codeEditorChromeConfig.value
                                        .activeTabConfig
                                "
                            />
                            <v-line
                                :config="
                                    canvas.codeEditorChromeConfig.value
                                        .activeTabBorderTopConfig
                                "
                            />
                            <v-text
                                :config="
                                    canvas.codeEditorChromeConfig.value
                                        .tabTextConfig
                                "
                            />
                        </template>
                        <!-- Noise overlay -->
                        <v-rect v-if="noiseConfig" :config="noiseConfig" />
                    </v-group>
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
                class="absolute inset-0 flex flex-col items-center justify-center"
                :class="isDragOver ? 'pointer-events-none' : ''"
            >
                <!-- Drag overlay -->
                <div
                    v-if="isDragOver"
                    class="absolute inset-6 rounded-2xl border-2 border-dashed border-[#e0ff4f]/60 bg-[#e0ff4f]/4"
                />

                <button
                    type="button"
                    class="canvas-empty"
                    :class="{ 'drag-over': isDragOver }"
                    @click="onClickUpload"
                >
                    <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="empty-icon"
                        aria-hidden="true"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p class="empty-title">Drop screenshots here</p>
                    <p class="empty-hint">
                        or click to upload · PNG, JPG, WebP
                    </p>
                </button>
            </div>
        </Transition>

        <!-- Drop overlay when dragging over a canvas that already has images -->
        <Transition name="fade">
            <div
                v-if="isDragOver && store.images.length > 0"
                class="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
                <div
                    class="absolute inset-4 rounded-2xl border-2 border-dashed border-[#e0ff4f]/50 bg-[#e0ff4f]/4"
                />
                <p class="relative text-sm font-medium text-[#e0ff4f]">
                    Drop to add image
                </p>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.canvas-stage-container {
    background-color: #0a0a0c;
    background-image: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.05) 1px,
        transparent 1px
    );
    background-size: 20px 20px;
}

.canvas-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 48px 56px;
    border: 1.5px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: transparent;
    cursor: pointer;
    text-align: center;
    transition:
        border-color 200ms ease,
        background 200ms ease;
}

.canvas-empty:hover,
.canvas-empty.drag-over {
    border-color: rgba(224, 255, 79, 0.4);
    background: rgba(224, 255, 79, 0.03);
}

.empty-icon {
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 4px;
}

.empty-title {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    color: #8a8a9a;
    margin: 0;
}

.empty-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #4a4a5a;
    margin: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
