<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="empty-action"
    :class="cn('flex items-center justify-center gap-2 pt-1', props.class)"
  >
    <slot />
  </div>
</template>
