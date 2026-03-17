<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/vue3'
import { ref } from 'vue'
import billing from '@/routes/billing'

interface Subscription {
    id: number
    plan: 'pro_monthly' | 'pro_yearly'
    status: string
    current_period_end: string
    cancelled_at: string | null
}

const props = defineProps<{
    subscription: Subscription | null
    isPro: boolean
}>()

const showCancelDialog = ref(false)

const checkoutForm = useForm({ plan: '' })
const cancelForm = useForm({})

function checkout(plan: string) {
    checkoutForm.plan = plan
    checkoutForm.post(billing.checkout.url())
}

function confirmCancel() {
    cancelForm.post(billing.cancel.url(), {
        onSuccess: () => {
            showCancelDialog.value = false
        },
    })
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

const planLabel: Record<string, string> = {
    pro_monthly: 'Pro Monthly',
    pro_yearly: 'Pro Yearly',
}
</script>

<template>
    <div class="min-h-screen bg-[#080808] text-white">
        <div class="mx-auto max-w-3xl px-6 py-16">
            <!-- Header -->
            <div class="mb-12">
                <h1 class="text-3xl font-semibold tracking-tight">Billing</h1>
                <p class="mt-2 text-[#888]">Manage your Polsh Pro subscription</p>
            </div>

            <!-- Current Plan (Pro users) -->
            <div v-if="isPro && subscription" class="mb-10 rounded-xl border border-[#1f1f1f] bg-[#111] p-6">
                <div class="mb-4 flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium uppercase tracking-widest text-[#888]">Current Plan</p>
                        <p class="mt-1 text-lg font-semibold">{{ planLabel[subscription.plan] }}</p>
                    </div>
                    <span class="rounded-full bg-[#e0ff4f]/10 px-3 py-1 text-xs font-medium text-[#e0ff4f]">Active</span>
                </div>
                <p class="text-sm text-[#888]">
                    Renews on {{ formatDate(subscription.current_period_end) }}
                </p>
                <button
                    class="mt-5 text-sm text-red-400 hover:text-red-300 transition-colors"
                    @click="showCancelDialog = true"
                >
                    Cancel subscription
                </button>
            </div>

            <!-- Pro features -->
            <div class="mb-10 rounded-xl border border-[#1f1f1f] bg-[#111] p-6">
                <p class="mb-4 text-xs font-medium uppercase tracking-widest text-[#888]">Pro includes</p>
                <ul class="space-y-2 text-sm">
                    <li class="flex items-center gap-2">
                        <span class="text-[#e0ff4f]">✓</span>
                        <span>4× resolution exports (4096px)</span>
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-[#e0ff4f]">✓</span>
                        <span>SVG vector export</span>
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-[#e0ff4f]">✓</span>
                        <span>Up to 10 screenshots per canvas</span>
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-[#e0ff4f]">✓</span>
                        <span>Unlimited saved presets</span>
                    </li>
                </ul>
            </div>

            <!-- Plan cards (upgrade options for free users, or alternative plan) -->
            <div v-if="!isPro" class="grid gap-4 sm:grid-cols-2">
                <!-- Monthly -->
                <div class="rounded-xl border border-[#1f1f1f] bg-[#111] p-6">
                    <p class="text-xs font-medium uppercase tracking-widest text-[#888]">Monthly</p>
                    <div class="mt-3 flex items-baseline gap-1">
                        <span class="text-3xl font-bold">₱500</span>
                        <span class="text-[#888]">/mo</span>
                    </div>
                    <p class="mt-2 text-sm text-[#888]">Billed monthly, cancel any time</p>
                    <button
                        class="mt-5 w-full rounded-lg bg-[#e0ff4f] py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                        :disabled="checkoutForm.processing"
                        @click="checkout('pro_monthly')"
                    >
                        Get Pro
                    </button>
                </div>

                <!-- Yearly -->
                <div class="rounded-xl border border-[#e0ff4f]/30 bg-[#111] p-6 ring-1 ring-[#e0ff4f]/20">
                    <div class="flex items-center justify-between">
                        <p class="text-xs font-medium uppercase tracking-widest text-[#888]">Yearly</p>
                        <span class="rounded-full bg-[#e0ff4f]/10 px-2 py-0.5 text-xs font-medium text-[#e0ff4f]">Save 25%</span>
                    </div>
                    <div class="mt-3 flex items-baseline gap-1">
                        <span class="text-3xl font-bold">₱4,500</span>
                        <span class="text-[#888]">/yr</span>
                    </div>
                    <p class="mt-2 text-sm text-[#888]">₱375/mo · best value</p>
                    <button
                        class="mt-5 w-full rounded-lg bg-[#e0ff4f] py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                        :disabled="checkoutForm.processing"
                        @click="checkout('pro_yearly')"
                    >
                        Get Pro Yearly
                    </button>
                </div>
            </div>

            <!-- Payment methods -->
            <p class="mt-6 text-center text-xs text-[#555]">
                Accepts GCash · Maya · Visa · Mastercard · Powered by PayMongo
            </p>
        </div>

        <!-- Cancel confirmation dialog -->
        <Dialog :open="showCancelDialog" @update:open="showCancelDialog = $event">
            <DialogContent class="bg-[#111] border-[#1f1f1f] text-white">
                <DialogHeader>
                    <DialogTitle>Cancel subscription?</DialogTitle>
                    <DialogDescription class="text-[#888]">
                        You'll keep Pro access until your current period ends.
                        After that you'll be downgraded to the free plan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter class="gap-2">
                    <button
                        class="rounded-lg border border-[#333] px-4 py-2 text-sm hover:border-[#555] transition-colors"
                        @click="showCancelDialog = false"
                    >
                        Keep subscription
                    </button>
                    <button
                        class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        :disabled="cancelForm.processing"
                        @click="confirmCancel"
                    >
                        Cancel subscription
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
