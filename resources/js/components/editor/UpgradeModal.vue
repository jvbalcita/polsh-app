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

function checkout(plan: string) {
    checkoutLoading.value = true;

    // Use a native form POST so the server's redirect to PayMongo is followed
    // as a full page navigation. Inertia's XHR cannot follow cross-origin redirects.
    // Read the plaintext CSRF token from the meta tag (not the XSRF-TOKEN cookie,
    // which contains the encrypted token and is only valid via X-XSRF-TOKEN header).
    const token =
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? '';

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = billing.checkout.url();

    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = token;
    form.appendChild(csrfInput);

    const planInput = document.createElement('input');
    planInput.type = 'hidden';
    planInput.name = 'plan';
    planInput.value = plan;
    form.appendChild(planInput);

    document.body.appendChild(form);
    form.submit();
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
                            ₱500<span class="text-xs font-normal text-[#888]"
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
                            Yearly <span class="text-[#e0ff4f]">-25%</span>
                        </p>
                        <p class="mt-0.5 text-lg font-bold">
                            ₱4,500<span class="text-xs font-normal text-[#888]"
                                >/yr</span
                            >
                        </p>
                    </button>
                </div>

                <p class="text-center text-xs text-[#555]">
                    GCash · Maya · Visa · Mastercard
                </p>
            </div>
        </DialogContent>
    </Dialog>
</template>
