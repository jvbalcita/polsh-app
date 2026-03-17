<script setup lang="ts">
import { watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/vue3'
import billing from '@/routes/billing'

const props = defineProps<{
    open: boolean
}>()

defineEmits<{
    'update:open': [value: boolean]
}>()

const checkoutForm = useForm({ plan: '' })

function trackEvent(name: string): void {
    if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(name)
    }
}

watch(
    () => props.open,
    (value) => {
        if (value) {
            trackEvent('upgrade_modal_shown')
        }
    },
)

function checkout(plan: string) {
    checkoutForm.plan = plan
    checkoutForm.post(billing.checkout.url())
}
</script>

<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
        <DialogContent class="bg-[#111] border-[#1f1f1f] text-white max-w-md">
            <DialogHeader>
                <DialogTitle class="text-xl">Upgrade to Pro</DialogTitle>
                <DialogDescription class="text-[#888]">
                    Unlock 4× exports, SVG, 10 images, and unlimited presets.
                </DialogDescription>
            </DialogHeader>

            <div class="mt-2 space-y-3">
                <!-- Pro features -->
                <ul class="space-y-1.5 text-sm text-[#aaa]">
                    <li class="flex items-center gap-2"><span class="text-[#e0ff4f]">✓</span> 4× resolution exports</li>
                    <li class="flex items-center gap-2"><span class="text-[#e0ff4f]">✓</span> SVG vector export</li>
                    <li class="flex items-center gap-2"><span class="text-[#e0ff4f]">✓</span> Up to 10 screenshots</li>
                    <li class="flex items-center gap-2"><span class="text-[#e0ff4f]">✓</span> Unlimited presets</li>
                </ul>

                <!-- Plan buttons -->
                <div class="grid grid-cols-2 gap-3 pt-2">
                    <button
                        class="rounded-lg border border-[#333] px-4 py-3 text-left hover:border-[#e0ff4f]/40 transition-colors disabled:opacity-50"
                        :disabled="checkoutForm.processing"
                        @click="checkout('pro_monthly')"
                    >
                        <p class="text-xs text-[#888]">Monthly</p>
                        <p class="mt-0.5 text-lg font-bold">₱500<span class="text-xs font-normal text-[#888]">/mo</span></p>
                    </button>
                    <button
                        class="rounded-lg border border-[#e0ff4f]/30 bg-[#e0ff4f]/5 px-4 py-3 text-left hover:bg-[#e0ff4f]/10 transition-colors disabled:opacity-50"
                        :disabled="checkoutForm.processing"
                        @click="checkout('pro_yearly')"
                    >
                        <p class="text-xs text-[#888]">Yearly <span class="text-[#e0ff4f]">-25%</span></p>
                        <p class="mt-0.5 text-lg font-bold">₱4,500<span class="text-xs font-normal text-[#888]">/yr</span></p>
                    </button>
                </div>

                <p class="text-center text-xs text-[#555]">GCash · Maya · Visa · Mastercard</p>
            </div>
        </DialogContent>
    </Dialog>
</template>
