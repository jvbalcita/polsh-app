<script setup lang="ts">
import { ref, watch } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import billing from '@/routes/billing';

const props = defineProps<{
    open: boolean;
}>();

defineEmits<{
    'update:open': [value: boolean];
}>();

const checkoutLoading = ref(false);

function trackEvent(name: string): void {
    if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(name);
    }
}

watch(
    () => props.open,
    (value) => {
        if (value) {
            trackEvent('upgrade_modal_shown');
        }
    },
);

async function checkout(plan: string): Promise<void> {
    checkoutLoading.value = true;

    try {
        const token =
            document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.content ?? '';

        const response = await fetch(billing.checkout.url(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
            },
            body: JSON.stringify({ plan }),
        });

        const { url } = await response.json();
        (window as any).LemonSqueezy.Url.Open(url);
    } finally {
        checkoutLoading.value = false;
    }
}
</script>

<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
        <DialogContent class="max-w-md border-[#1f1f1f] bg-[#111] text-white">
            <DialogHeader>
                <DialogTitle class="text-xl">Upgrade to Pro</DialogTitle>
                <DialogDescription class="text-[#888]">
                    Unlock 4× exports, SVG, 10 images, and unlimited presets.
                </DialogDescription>
            </DialogHeader>

            <div class="mt-2 space-y-3">
                <!-- Pro features -->
                <ul class="space-y-1.5 text-sm text-[#aaa]">
                    <li class="flex items-center gap-2">
                        <span class="text-[#e0ff4f]">✓</span> 4× resolution
                        exports
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-[#e0ff4f]">✓</span> SVG vector export
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-[#e0ff4f]">✓</span> Up to 10
                        screenshots
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-[#e0ff4f]">✓</span> Unlimited presets
                    </li>
                </ul>

                <!-- Plan buttons -->
                <div class="grid grid-cols-2 gap-3 pt-2">
                    <button
                        class="rounded-lg border border-[#333] px-4 py-3 text-left transition-colors hover:border-[#e0ff4f]/40 disabled:opacity-50"
                        :disabled="checkoutLoading"
                        @click="checkout('pro_monthly')"
                    >
                        <p class="text-xs text-[#888]">Monthly</p>
                        <p class="mt-0.5 text-lg font-bold">
                            $5<span class="text-xs font-normal text-[#888]"
                                >/mo</span
                            >
                        </p>
                    </button>
                    <button
                        class="rounded-lg border border-[#e0ff4f]/30 bg-[#e0ff4f]/5 px-4 py-3 text-left transition-colors hover:bg-[#e0ff4f]/10 disabled:opacity-50"
                        :disabled="checkoutLoading"
                        @click="checkout('pro_yearly')"
                    >
                        <p class="text-xs text-[#888]">
                            Yearly <span class="text-[#e0ff4f]">-18%</span>
                        </p>
                        <p class="mt-0.5 text-lg font-bold">
                            $49<span class="text-xs font-normal text-[#888]"
                                >/yr</span
                            >
                        </p>
                    </button>
                </div>

                <p class="text-center text-xs text-[#555]">
                    Visa · Mastercard · PayPal · Secure via Lemon Squeezy
                </p>
            </div>
        </DialogContent>
    </Dialog>
</template>
