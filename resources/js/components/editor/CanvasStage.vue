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
                        <!-- Device body (phone/tablet bezel — drawn before image) -->
                        <v-rect
                            v-if="canvas.deviceBodyConfig.value"
                            :config="canvas.deviceBodyConfig.value"
                        />

                        <!-- iPhone 17 Pro — body, bevel, screen bg (before image) -->
                        <template v-if="canvas.iphone17ProFrameConfig.value">
                            <v-rect :config="canvas.iphone17ProFrameConfig.value.bodyConfig" />
                            <v-rect :config="canvas.iphone17ProFrameConfig.value.bevelConfig" />
                            <v-rect :config="canvas.iphone17ProFrameConfig.value.screenBgConfig" />
                        </template>

                        <!-- iPad Pro M5 — body, bevel, screen bg (before image) -->
                        <template v-if="canvas.ipadProM5FrameConfig.value">
                            <v-rect :config="canvas.ipadProM5FrameConfig.value.bodyConfig" />
                            <v-rect :config="canvas.ipadProM5FrameConfig.value.bevelConfig" />
                            <v-rect :config="canvas.ipadProM5FrameConfig.value.screenBgConfig" />
                        </template>

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
                            <v-line
                                v-for="(icon, index) in canvas
                                    .browserChromeConfig.value.windowControls
                                    .iconLines"
                                :key="`browser-icon-line-${icon.kind}-${index}`"
                                :config="{ ...icon, listening: false }"
                            />
                            <v-rect
                                v-for="icon in canvas.browserChromeConfig.value
                                    .windowControls.iconRects"
                                :key="`browser-icon-rect-${icon.kind}-${icon.x}`"
                                :config="{ ...icon, listening: false }"
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
                            <v-line
                                v-for="(icon, index) in canvas
                                    .terminalChromeConfig.value.windowControls
                                    .iconLines"
                                :key="`terminal-icon-line-${icon.kind}-${index}`"
                                :config="{ ...icon, listening: false }"
                            />
                            <v-rect
                                v-for="icon in canvas.terminalChromeConfig.value
                                    .windowControls.iconRects"
                                :key="`terminal-icon-rect-${icon.kind}-${icon.x}`"
                                :config="{ ...icon, listening: false }"
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
                            <v-line
                                v-for="(icon, index) in canvas
                                    .minimalWindowChromeConfig.value
                                    .windowControls.iconLines"
                                :key="`minimal-icon-line-${icon.kind}-${index}`"
                                :config="{ ...icon, listening: false }"
                            />
                            <v-rect
                                v-for="icon in canvas.minimalWindowChromeConfig
                                    .value.windowControls.iconRects"
                                :key="`minimal-icon-rect-${icon.kind}-${icon.x}`"
                                :config="{ ...icon, listening: false }"
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
                        <!-- iPhone 15 chrome (Dynamic Island + buttons + home bar) -->
                        <template v-if="canvas.iphoneFrameConfig.value">
                            <v-rect
                                :config="
                                    canvas.iphoneFrameConfig.value
                                        .dynamicIslandConfig
                                "
                            />
                            <v-rect
                                v-for="(btn, i) in canvas.iphoneFrameConfig
                                    .value.leftButtons"
                                :key="`iphone-left-${i}`"
                                :config="btn"
                            />
                            <v-rect
                                v-for="(btn, i) in canvas.iphoneFrameConfig
                                    .value.rightButtons"
                                :key="`iphone-right-${i}`"
                                :config="btn"
                            />
                            <v-rect
                                :config="
                                    canvas.iphoneFrameConfig.value
                                        .homeIndicatorConfig
                                "
                            />
                        </template>

                        <!-- iPad Pro chrome (camera + buttons + home bar) -->
                        <template v-if="canvas.ipadFrameConfig.value">
                            <v-rect
                                :config="
                                    canvas.ipadFrameConfig.value.cameraConfig
                                "
                            />
                            <v-rect
                                v-for="(btn, i) in canvas.ipadFrameConfig.value
                                    .leftButtons"
                                :key="`ipad-left-${i}`"
                                :config="btn"
                            />
                            <v-rect
                                v-for="(btn, i) in canvas.ipadFrameConfig.value
                                    .rightButtons"
                                :key="`ipad-right-${i}`"
                                :config="btn"
                            />
                            <v-rect
                                :config="
                                    canvas.ipadFrameConfig.value
                                        .homeIndicatorConfig
                                "
                            />
                        </template>

                        <!-- iPhone 17 Pro — screen ring, DI, camera (after image; inside clip) -->
                        <template v-if="canvas.iphone17ProFrameConfig.value">
                            <v-rect :config="canvas.iphone17ProFrameConfig.value.screenRingConfig" />
                            <v-rect :config="canvas.iphone17ProFrameConfig.value.dynamicIslandConfig" />
                            <v-circle :config="canvas.iphone17ProFrameConfig.value.cameraDotConfig" />
                        </template>

                        <!-- iPad Pro M5 — screen ring, Face ID sensor (after image; inside clip) -->
                        <template v-if="canvas.ipadProM5FrameConfig.value">
                            <v-rect :config="canvas.ipadProM5FrameConfig.value.screenRingConfig" />
                            <v-rect :config="canvas.ipadProM5FrameConfig.value.sensorConfig" />
                        </template>

                        <!-- Arc Browser chrome -->
                        <template v-if="canvas.arcBrowserFrameConfig.value">
                            <v-rect
                                :config="
                                    canvas.arcBrowserFrameConfig.value
                                        .sidebarBgConfig
                                "
                            />
                            <v-line
                                :config="
                                    canvas.arcBrowserFrameConfig.value
                                        .sidebarBorderConfig
                                "
                            />
                            <v-rect
                                v-for="(tab, i) in canvas.arcBrowserFrameConfig
                                    .value.tabItems"
                                :key="`arc-tab-${i}`"
                                :config="tab"
                            />
                            <v-rect
                                :config="
                                    canvas.arcBrowserFrameConfig.value
                                        .toolbarBgConfig
                                "
                            />
                            <v-line
                                :config="
                                    canvas.arcBrowserFrameConfig.value
                                        .toolbarBorderConfig
                                "
                            />
                            <v-rect
                                :config="
                                    canvas.arcBrowserFrameConfig.value
                                        .urlPillConfig
                                "
                            />
                            <v-text
                                v-if="
                                    canvas.arcBrowserFrameConfig.value
                                        .urlTextConfig
                                "
                                :config="
                                    canvas.arcBrowserFrameConfig.value
                                        .urlTextConfig
                                "
                            />
                        </template>

                        <!-- Noise overlay -->
                        <v-rect v-if="noiseConfig" :config="noiseConfig" />
                    </v-group>

                    <!-- Device side/top buttons — rendered OUTSIDE the body clip group
                         so they protrude visibly beyond the frame body edges. -->
                    <v-group :config="canvas.frameButtonsGroupConfig.value">
                        <!-- iPhone 17 Pro buttons -->
                        <template v-if="canvas.iphone17ProFrameConfig.value">
                            <v-rect
                                v-for="(btn, i) in canvas.iphone17ProFrameConfig.value.leftButtons"
                                :key="`i17-left-${i}`"
                                :config="btn"
                            />
                            <v-rect
                                v-for="(btn, i) in canvas.iphone17ProFrameConfig.value.rightButtons"
                                :key="`i17-right-${i}`"
                                :config="btn"
                            />
                        </template>

                        <!-- iPad Pro M5 buttons -->
                        <template v-if="canvas.ipadProM5FrameConfig.value">
                            <v-rect
                                v-for="(btn, i) in canvas.ipadProM5FrameConfig.value.leftButtons"
                                :key="`m5-left-${i}`"
                                :config="btn"
                            />
                            <v-rect
                                v-for="(btn, i) in canvas.ipadProM5FrameConfig.value.rightButtons"
                                :key="`m5-right-${i}`"
                                :config="btn"
                            />
                        </template>
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

                <div
                    class="canvas-empty"
                    :class="{ 'drag-over': isDragOver }"
                >
                    <!-- Glowing circular icon -->
                    <div class="empty-icon-ring">
                        <div class="empty-icon-circle">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <polyline points="16 16 12 12 8 16" />
                                <line x1="12" y1="12" x2="12" y2="21" />
                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                            </svg>
                        </div>
                    </div>

                    <div class="empty-body">
                        <p class="empty-title">Drop screenshots here</p>
                        <p class="empty-hint">
                            Style and export your screenshots in seconds.<br />
                            Drop anywhere or click the button below.
                        </p>
                    </div>

                    <div class="empty-formats">
                        <span>PNG</span>
                        <span>JPG</span>
                        <span>WebP</span>
                    </div>

                    <button
                        type="button"
                        class="empty-cta"
                        @click="onClickUpload"
                    >
                        Select Files
                    </button>
                </div>
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
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 48px 52px 40px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 28px;
    background: #13131a;
    text-align: center;
    transition: border-color 250ms ease, box-shadow 250ms ease;
    box-shadow:
        0 2px 0 0 rgba(255, 255, 255, 0.04) inset,
        0 24px 80px rgba(0, 0, 0, 0.8);
}

.canvas-empty.drag-over {
    border-color: rgba(224, 255, 79, 0.4);
    box-shadow:
        0 0 0 1px rgba(224, 255, 79, 0.15),
        0 0 80px rgba(224, 255, 79, 0.1),
        0 24px 80px rgba(0, 0, 0, 0.8);
}

/* ── Glowing ring + circle icon ── */
.empty-icon-ring {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(224, 255, 79, 0.18) 0%, transparent 70%);
    display: flex;
    align-items: center;
    justify-content: center;
    /* The glow ring */
    box-shadow:
        0 0 0 2px rgba(224, 255, 79, 0.5),
        0 0 24px rgba(224, 255, 79, 0.35),
        0 0 60px rgba(224, 255, 79, 0.15);
    transition: box-shadow 250ms ease;
}

.canvas-empty.drag-over .empty-icon-ring {
    box-shadow:
        0 0 0 2px rgba(224, 255, 79, 0.8),
        0 0 32px rgba(224, 255, 79, 0.5),
        0 0 80px rgba(224, 255, 79, 0.25);
}

.empty-icon-circle {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #1c1c24;
    border: 1px solid rgba(224, 255, 79, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e0ff4f;
}

/* ── Text ── */
.empty-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 280px;
}

.empty-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #f0f0f4;
    margin: 0;
    letter-spacing: -0.025em;
}

.empty-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    line-height: 1.6;
    color: #52526a;
    margin: 0;
}

/* ── Format badges ── */
.empty-formats {
    display: flex;
    gap: 6px;
}

.empty-formats span {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.07em;
    color: #4a4a5a;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 4px 10px;
    border-radius: 6px;
}

/* ── CTA button ── */
.empty-cta {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    border: none;
    background: #e0ff4f;
    color: #0a0a0c;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: opacity 200ms ease, box-shadow 200ms ease;
    box-shadow: 0 4px 20px rgba(224, 255, 79, 0.25);
}

.empty-cta:hover {
    opacity: 0.9;
    box-shadow: 0 4px 28px rgba(224, 255, 79, 0.4);
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
