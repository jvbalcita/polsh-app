<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

type Props = {
    className?: HTMLAttributes['class'];
};

defineProps<Props>();
</script>

<template>
    <span
        class="inline-block bg-current"
        style="
            mask-image: url('/images/favicon/favicon.svg');
            mask-size: contain;
            mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask-image: url('/images/favicon/favicon.svg');
            -webkit-mask-size: contain;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
        "
        :class="className"
        v-bind="$attrs"
    />
</template>
