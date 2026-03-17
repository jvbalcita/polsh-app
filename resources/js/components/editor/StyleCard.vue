<script setup lang="ts">
import type { StyleConfig } from '@/types/style';

const props = defineProps<{
    style: StyleConfig;
    active: boolean;
}>();

const emit = defineEmits<{
    select: [style: StyleConfig];
}>();

const backgroundStyle = (() => {
    const bg = props.style.background;
    if (bg.type === 'solid') {
        return { background: bg.colors[0] };
    }
    return {
        background: `linear-gradient(${bg.angle}deg, ${bg.colors[0]}, ${bg.colors[1]})`,
    };
})();

const chromeColor = (() => {
    const bg = props.style.background.colors[0];
    const hex = bg.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) || 0;
    const g = parseInt(hex.slice(2, 4), 16) || 0;
    const b = parseInt(hex.slice(4, 6), 16) || 0;
    const isDark = r * 0.299 + g * 0.587 + b * 0.114 < 128;
    return isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
})();
</script>

<template>
    <button
        type="button"
        class="group relative w-full overflow-hidden rounded-lg border transition-all duration-150 focus:outline-none"
        :class="[
            active
                ? 'border-[#e0ff4f] ring-1 ring-[#e0ff4f]/40'
                : 'border-white/8 hover:border-white/20',
        ]"
        :style="{ aspectRatio: '16/9' }"
        @click="emit('select', style)"
    >
        <!-- Background preview -->
        <div class="absolute inset-0" :style="backgroundStyle" />

        <!-- Chrome hint -->
        <div
            v-if="style.chrome"
            class="absolute inset-x-0 top-0 flex items-center gap-1 px-2"
            :style="{ height: '10px', background: chromeColor }"
        >
            <span
                v-for="color in ['#ff5f57', '#febc2e', '#28c840']"
                :key="color"
                class="block rounded-full"
                :style="{ width: '3px', height: '3px', background: color }"
            />
        </div>

        <!-- Inner screenshot placeholder -->
        <div
            class="absolute rounded-sm"
            :style="{
                inset: `${style.padding * 0.18}px`,
                top: style.chrome ? `${style.padding * 0.18 + 10}px` : `${style.padding * 0.18}px`,
                background: 'rgba(255,255,255,0.12)',
                borderRadius: `${style.radius * 0.3}px`,
            }"
        />

        <!-- Active indicator -->
        <div
            v-if="active"
            class="absolute right-1.5 top-1.5 rounded-full bg-[#e0ff4f]"
            style="width: 6px; height: 6px"
        />

        <!-- Style name tooltip on hover -->
        <div
            class="absolute inset-x-0 bottom-0 translate-y-full bg-black/80 px-2 py-1 text-center text-[10px] font-medium text-white/70 transition-transform duration-150 group-hover:translate-y-0"
        >
            {{ style.name }}
        </div>
    </button>
</template>
