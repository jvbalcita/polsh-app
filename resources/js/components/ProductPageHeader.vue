<script setup lang="ts">
import type { LinkComponentBaseProps } from '@inertiajs/core';
import { Link } from '@inertiajs/vue3';

type Props = {
    context: string;
    homeHref: LinkComponentBaseProps['href'];
    trailingHref: LinkComponentBaseProps['href'];
    trailingLabel: string;
    trailingVariant?: 'back' | 'link';
};

withDefaults(defineProps<Props>(), {
    trailingVariant: 'back',
});
</script>

<template>
    <header class="polsh-header-shell flex h-11 items-center justify-between border-b border-white/8 px-6">
        <div class="flex items-center gap-3">
            <Link :href="homeHref" class="polsh-brand text-sm font-semibold tracking-tight">
                polsh
            </Link>
            <span class="text-xs text-white/20">{{ context }}</span>
        </div>

        <Link
            :href="trailingHref"
            class="flex items-center gap-1.5 text-[11px] text-white/35 transition-colors hover:text-white/60"
        >
            <svg
                v-if="trailingVariant === 'back'"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            >
                <polyline points="15 18 9 12 15 6" />
            </svg>
            {{ trailingLabel }}
        </Link>
    </header>
</template>
