<script setup lang="ts">
import type { LinkComponentBaseProps } from '@inertiajs/core';
import { Link } from '@inertiajs/vue3';

type Props = {
    title: string;
    description: string;
    ctaHref: LinkComponentBaseProps['href'];
    ctaLabel: string;
};

defineProps<Props>();
</script>

<template>
    <div class="polsh-upgrade-shell rounded-xl border border-[#e0ff4f]/15 px-6 py-8 text-center">
        <slot name="icon" />
        <h2 class="text-base font-semibold text-white/70">{{ title }}</h2>
        <p class="mt-2 text-sm text-white/35">{{ description }}</p>
        <Link :href="ctaHref" class="polsh-cta mt-5 inline-block rounded-md px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80">
            {{ ctaLabel }}
        </Link>
    </div>
</template>
