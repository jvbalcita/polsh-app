<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { editor } from '@/routes';
import billing from '@/routes/billing';

interface Subscription {
    id: number;
    plan: 'pro_monthly' | 'pro_yearly';
    status: string;
    current_period_end: string;
    cancelled_at: string | null;
}

const props = defineProps<{
    subscription: Subscription | null;
    isPro: boolean;
}>();

// State A — free (no sub)  State B — active  State C — cancelled but paid  State D — expired (same as A)
const billingState = computed<'free' | 'active' | 'cancelled'>(() => {
    if (!props.subscription) {
return 'free';
}

    if (props.subscription.status === 'active') {
return 'active';
}

    return 'cancelled';
});

const cycle = ref<'monthly' | 'yearly'>('yearly');
const showCancelDialog = ref(false);
const checkoutLoading = ref(false);

const cancelForm = useForm({});
const reactivateForm = useForm({});

function trackEvent(name: string): void {
    if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(name);
    }
}

function checkout(plan: string): void {
    trackEvent('billing_checkout_started');
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

function checkoutSelected(): void {
    checkout(cycle.value === 'monthly' ? 'pro_monthly' : 'pro_yearly');
}

function confirmCancel(): void {
    cancelForm.post(billing.cancel.url(), {
        onSuccess: () => {
            showCancelDialog.value = false;
        },
    });
}

function confirmReactivate(): void {
    reactivateForm.post(billing.reactivate.url());
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const planLabel: Record<string, string> = {
    pro_monthly: 'Pro Monthly',
    pro_yearly: 'Pro Yearly',
};

const FREE_FEATURES = [
    { included: true, text: 'All 18 styles' },
    { included: true, text: 'PNG, WebP, JPEG export' },
    { included: true, text: '1× & 2× resolution' },
    { included: true, text: 'Up to 3 screenshots per canvas' },
    { included: true, text: '5 saved presets' },
    { included: false, text: 'SVG vector export' },
    { included: false, text: '4× resolution (4096px)' },
    { included: false, text: 'Up to 10 screenshots' },
    { included: false, text: 'Unlimited saved presets' },
];

const PRO_FEATURES = [
    { included: true, text: 'Everything in Free' },
    { included: true, text: 'SVG vector export' },
    { included: true, text: '4× resolution (4096px)' },
    { included: true, text: 'Up to 10 screenshots per canvas' },
    { included: true, text: 'Unlimited saved presets' },
    { included: true, text: 'Team preset sharing' },
    { included: true, text: 'Priority support' },
];
</script>

<template>
    <div class="billing-page">
        <div class="billing-wrap">
            <!-- Page header -->
            <div class="billing-header">
                <Link :href="editor.url()" class="back-link"
                    >← Back to editor</Link
                >
                <h1 class="billing-title">Billing &amp; Plan</h1>
                <p class="billing-subtitle">Simple pricing. No surprises.</p>
            </div>

            <!-- State B: Active Pro subscription -->
            <div v-if="billingState === 'active'" class="current-plan-card">
                <div class="current-plan-row">
                    <div>
                        <p class="current-plan-eyebrow">Current Plan</p>
                        <p class="current-plan-name">
                            {{ planLabel[props.subscription!.plan] }}
                        </p>
                        <p class="current-plan-renew">
                            Renews on
                            {{ formatDate(props.subscription!.current_period_end) }}
                        </p>
                    </div>
                    <span class="plan-active-badge">Active</span>
                </div>
                <button
                    type="button"
                    class="cancel-link"
                    @click="showCancelDialog = true"
                >
                    Cancel subscription
                </button>
            </div>

            <!-- Switch to yearly — only for active monthly subscribers -->
            <div
                v-if="billingState === 'active' && props.subscription!.plan === 'pro_monthly'"
                class="switch-yearly-card"
            >
                <div class="switch-yearly-row">
                    <div>
                        <p class="switch-yearly-eyebrow">Save more</p>
                        <p class="switch-yearly-title">Switch to Yearly</p>
                        <p class="switch-yearly-desc">
                            ₱3,990/yr · save ₱798 vs monthly. Your current
                            monthly plan continues until
                            {{ formatDate(props.subscription!.current_period_end) }},
                            then your yearly plan takes over.
                        </p>
                    </div>
                    <button
                        type="button"
                        class="switch-yearly-btn"
                        :disabled="checkoutLoading"
                        @click="checkout('pro_yearly')"
                    >
                        {{
                            checkoutLoading ? 'Redirecting…' : 'Switch — ₱3,990'
                        }}
                    </button>
                </div>
            </div>

            <!-- State C: Cancelled but still within paid period -->
            <div
                v-else-if="billingState === 'cancelled'"
                class="current-plan-card current-plan-card--cancelled"
            >
                <div class="current-plan-row">
                    <div>
                        <p class="current-plan-eyebrow">
                            Subscription cancelled
                        </p>
                        <p class="current-plan-name">
                            {{ planLabel[props.subscription!.plan] }}
                        </p>
                        <p class="current-plan-renew">
                            Pro access ends on
                            {{ formatDate(props.subscription!.current_period_end) }}
                        </p>
                    </div>
                    <span class="plan-active-badge plan-active-badge--cancelled"
                        >Cancelled</span
                    >
                </div>
                <button
                    type="button"
                    class="reactivate-btn"
                    :disabled="reactivateForm.processing"
                    @click="confirmReactivate"
                >
                    {{
                        reactivateForm.processing
                            ? 'Reactivating…'
                            : 'Reactivate subscription'
                    }}
                </button>
            </div>

            <!-- Billing cycle toggle -->
            <div class="toggle-wrap">
                <div class="plan-toggle">
                    <button
                        type="button"
                        :class="{ active: cycle === 'monthly' }"
                        @click="cycle = 'monthly'"
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        :class="{ active: cycle === 'yearly' }"
                        @click="cycle = 'yearly'"
                    >
                        Yearly
                        <span class="save-pill">Save 17%</span>
                    </button>
                </div>
            </div>

            <!-- Plan cards -->
            <div class="plans-grid">
                <!-- Free card -->
                <div class="plan-card">
                    <div class="plan-tier">Free</div>
                    <div class="plan-price">
                        <span class="price-currency">₱</span>
                        <span class="price-amount">0</span>
                        <span class="price-period">/mo</span>
                    </div>
                    <p class="plan-description">
                        Start styling screenshots today. No card required.
                    </p>

                    <ul class="feature-list">
                        <li
                            v-for="feature in FREE_FEATURES"
                            :key="feature.text"
                            class="feature-item"
                        >
                            <span
                                :class="
                                    feature.included
                                        ? 'feature-check'
                                        : 'feature-dash'
                                "
                            >
                                {{ feature.included ? '✓' : '—' }}
                            </span>
                            <span
                                class="feature-text"
                                :class="{
                                    'feature-text--dim': !feature.included,
                                }"
                            >
                                {{ feature.text }}
                            </span>
                        </li>
                    </ul>

                    <div v-if="!isPro" class="plan-cta">
                        <div class="current-plan-chip">Current plan</div>
                    </div>
                </div>

                <!-- Pro card -->
                <div class="plan-card plan-card--pro">
                    <div class="plan-tier">Pro</div>
                    <div class="plan-price">
                        <span class="price-currency">₱</span>
                        <span class="price-amount">{{
                            cycle === 'monthly' ? '399' : '3,990'
                        }}</span>
                        <span class="price-period">{{
                            cycle === 'monthly' ? '/mo' : '/yr'
                        }}</span>
                    </div>
                    <p class="plan-description">
                        {{
                            cycle === 'monthly'
                                ? 'Full access, billed monthly.'
                                : '₱332/mo · best value, billed yearly.'
                        }}
                    </p>

                    <ul class="feature-list">
                        <li
                            v-for="feature in PRO_FEATURES"
                            :key="feature.text"
                            class="feature-item"
                        >
                            <span class="feature-check">✓</span>
                            <span class="feature-text">{{ feature.text }}</span>
                        </li>
                    </ul>

                    <div class="plan-cta">
                        <button
                            v-if="billingState !== 'active'"
                            type="button"
                            class="pro-btn"
                            :disabled="checkoutLoading"
                            @click="checkoutSelected"
                        >
                            {{ checkoutLoading ? 'Redirecting…' : 'Get Pro' }}
                        </button>
                        <div
                            v-else
                            class="current-plan-chip current-plan-chip--pro"
                        >
                            Current plan
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payment methods -->
            <div class="payment-row">
                <span class="payment-label">Pay with</span>
                <span class="payment-pill">Visa</span>
                <span class="payment-pill">Mastercard</span>
                <span class="payment-pill">GCash</span>
                <span class="payment-pill">Maya</span>
                <span class="payment-powered">· Secure payments</span>
            </div>
            <p class="trust-line">No contracts. Cancel anytime.</p>
        </div>

        <!-- Cancel confirmation dialog -->
        <Dialog
            :open="showCancelDialog"
            @update:open="showCancelDialog = $event"
        >
            <DialogContent class="billing-dialog">
                <DialogHeader>
                    <DialogTitle class="dialog-title"
                        >Cancel subscription?</DialogTitle
                    >
                    <DialogDescription class="dialog-desc">
                        You'll keep Pro access until your current period ends.
                        After that, you'll be downgraded to the free plan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter class="dialog-footer">
                    <button
                        type="button"
                        class="dialog-btn-keep"
                        @click="showCancelDialog = false"
                    >
                        Keep subscription
                    </button>
                    <button
                        type="button"
                        class="dialog-btn-cancel"
                        :disabled="cancelForm.processing"
                        @click="confirmCancel"
                    >
                        {{
                            cancelForm.processing
                                ? 'Cancelling…'
                                : 'Yes, cancel'
                        }}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<style scoped>
/* ── Page shell ─────────────────────────────────────────────────── */
.billing-page {
    min-height: 100dvh;
    background: #0a0a0c;
    color: #f0f0f2;
    font-family: 'DM Sans', sans-serif;
}

.billing-wrap {
    max-width: 760px;
    margin: 0 auto;
    padding: 80px 24px 80px;
}

/* ── Header ── */
.billing-header {
    text-align: center;
    margin-bottom: 4px;
}

.back-link {
    display: inline-block;
    margin-bottom: 24px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #4a4a58;
    text-decoration: none;
    transition: color 150ms ease;
}

.back-link:hover {
    color: #8a8a9a;
}

.billing-title {
    font-family: 'DM Mono', monospace;
    font-size: 28px;
    font-weight: 500;
    color: #f0f0f2;
    margin: 0 0 10px;
}

.billing-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    color: #8a8a9a;
    margin: 0;
}

/* ── Current plan card (Pro subscribers) ── */
.current-plan-card {
    background: #111114;
    border: 1px solid rgba(224, 255, 79, 0.25);
    border-radius: 10px;
    padding: 20px 24px;
    margin-top: 32px;
}

.current-plan-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.current-plan-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: #4a4a58;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 4px;
}

.current-plan-name {
    font-family: 'DM Mono', monospace;
    font-size: 16px;
    color: #f0f0f2;
    margin: 0 0 4px;
}

.current-plan-renew {
    font-size: 13px;
    color: #8a8a9a;
    margin: 0;
}

.plan-active-badge {
    flex-shrink: 0;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    background: rgba(79, 255, 138, 0.12);
    border: 1px solid rgba(79, 255, 138, 0.3);
    color: #4fff8a;
    padding: 3px 10px;
    border-radius: 999px;
}

.plan-active-badge--cancelled {
    background: rgba(255, 79, 79, 0.1);
    border-color: rgba(255, 79, 79, 0.25);
    color: #ff4f4f;
}

.current-plan-card--cancelled {
    border-color: rgba(255, 79, 79, 0.2);
}

.cancel-link {
    margin-top: 14px;
    background: transparent;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #4a4a58;
    cursor: pointer;
    padding: 0;
    transition: color 150ms ease;
}

.cancel-link:hover {
    color: #ff4f4f;
}

.reactivate-btn {
    margin-top: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid rgba(224, 255, 79, 0.4);
    background: rgba(224, 255, 79, 0.08);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #e0ff4f;
    cursor: pointer;
    transition:
        background 150ms ease,
        border-color 150ms ease;
}

.reactivate-btn:hover:not(:disabled) {
    background: rgba(224, 255, 79, 0.14);
    border-color: rgba(224, 255, 79, 0.6);
}

.reactivate-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* ── Switch to yearly card ── */
.switch-yearly-card {
    background: #111114;
    border: 1px solid rgba(224, 255, 79, 0.15);
    border-radius: 10px;
    padding: 20px 24px;
    margin-top: 12px;
}

.switch-yearly-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
}

.switch-yearly-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: #e0ff4f;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 4px;
    opacity: 0.7;
}

.switch-yearly-title {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    color: #f0f0f2;
    margin: 0 0 6px;
}

.switch-yearly-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #4a4a58;
    margin: 0;
    max-width: 400px;
}

.switch-yearly-btn {
    flex-shrink: 0;
    padding: 9px 20px;
    border-radius: 8px;
    border: 1px solid rgba(224, 255, 79, 0.4);
    background: rgba(224, 255, 79, 0.08);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #e0ff4f;
    cursor: pointer;
    white-space: nowrap;
    transition:
        background 150ms ease,
        border-color 150ms ease;
}

.switch-yearly-btn:hover:not(:disabled) {
    background: rgba(224, 255, 79, 0.14);
    border-color: rgba(224, 255, 79, 0.6);
}

.switch-yearly-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* ── Cycle toggle ── */
.toggle-wrap {
    display: flex;
    justify-content: center;
    margin: 32px 0;
}

.plan-toggle {
    display: flex;
    gap: 4px;
    background: #1a1a1f;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    padding: 4px;
}

.plan-toggle button {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 8px 20px;
    border-radius: 6px;
    border: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #8a8a9a;
    cursor: pointer;
    transition:
        background 150ms ease,
        color 150ms ease;
}

.plan-toggle button.active {
    background: #222228;
    color: #f0f0f2;
}

.save-pill {
    display: inline-block;
    background: #e0ff4f;
    color: #0a0a0c;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 999px;
    margin-left: 8px;
    vertical-align: middle;
}

/* ── Plans grid ── */
.plans-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.plan-card {
    background: #111114;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 12px;
    padding: 28px 28px 24px;
}

.plan-card--pro {
    border-color: #e0ff4f;
    background: linear-gradient(
        160deg,
        rgba(224, 255, 79, 0.05) 0%,
        #111114 55%
    );
    position: relative;
}

.plan-card--pro::before {
    content: 'Most popular';
    position: absolute;
    top: -13px;
    left: 50%;
    transform: translateX(-50%);
    background: #e0ff4f;
    color: #0a0a0c;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 14px;
    border-radius: 999px;
    white-space: nowrap;
}

.plan-tier {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: #4a4a58;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 12px;
}

.plan-price {
    display: flex;
    align-items: baseline;
    gap: 2px;
    margin-bottom: 8px;
}

.price-currency {
    font-family: 'DM Sans', sans-serif;
    font-size: 17px;
    color: #8a8a9a;
    margin-bottom: 2px;
}

.price-amount {
    font-family: 'DM Mono', monospace;
    font-size: 40px;
    font-weight: 500;
    color: #f0f0f2;
    line-height: 1;
}

.price-period {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #8a8a9a;
    margin-left: 2px;
}

.plan-description {
    font-size: 13px;
    color: #4a4a58;
    margin: 0 0 20px;
    min-height: 36px;
}

/* ── Feature checklist ── */
.feature-list {
    list-style: none;
    margin: 0 0 24px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.feature-item {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 5px 0;
    font-size: 13px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.feature-item:last-child {
    border-bottom: none;
}

.feature-check {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #e0ff4f;
    flex-shrink: 0;
    width: 14px;
    text-align: center;
}

.feature-dash {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #2a2a35;
    flex-shrink: 0;
    width: 14px;
    text-align: center;
}

.feature-text {
    font-family: 'DM Sans', sans-serif;
    color: #8a8a9a;
}

.feature-text--dim {
    color: #4a4a58;
}

/* ── Plan CTA ── */
.plan-cta {
    margin-top: auto;
}

.pro-btn {
    width: 100%;
    padding: 11px;
    border-radius: 8px;
    border: none;
    background: #e0ff4f;
    color: #0a0a0c;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 150ms ease;
}

.pro-btn:hover:not(:disabled) {
    opacity: 0.88;
}
.pro-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.current-plan-chip {
    width: 100%;
    padding: 11px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #4a4a58;
    text-align: center;
}

.current-plan-chip--pro {
    border-color: rgba(224, 255, 79, 0.25);
    color: rgba(224, 255, 79, 0.5);
}

/* ── Payment methods & trust ── */
.payment-row {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 32px;
    font-size: 13px;
    color: #4a4a58;
}

.payment-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #4a4a58;
    margin-right: 2px;
}

.payment-pill {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #8a8a9a;
    background: #1a1a1f;
    border: 1px solid rgba(255, 255, 255, 0.07);
    padding: 3px 9px;
    border-radius: 999px;
}

.payment-powered {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #2a2a35;
}

.trust-line {
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #4a4a58;
    margin: 10px 0 0;
}

/* ── Cancel dialog ── */
.billing-dialog {
    background: #111114 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: #f0f0f2 !important;
}

.dialog-title {
    color: #f0f0f2;
}

.dialog-desc {
    color: #8a8a9a;
}

.dialog-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 4px;
}

.dialog-btn-keep {
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #8a8a9a;
    cursor: pointer;
    transition:
        border-color 150ms ease,
        color 150ms ease;
}

.dialog-btn-keep:hover {
    border-color: rgba(255, 255, 255, 0.25);
    color: #f0f0f2;
}

.dialog-btn-cancel {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    background: rgba(255, 79, 79, 0.15);
    border: 1px solid rgba(255, 79, 79, 0.35);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #ff4f4f;
    cursor: pointer;
    transition: background 150ms ease;
}

.dialog-btn-cancel:hover:not(:disabled) {
    background: rgba(255, 79, 79, 0.22);
}
.dialog-btn-cancel:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* ── Responsive ── */
@media (max-width: 600px) {
    .plans-grid {
        grid-template-columns: 1fr;
    }

    .plan-card--pro {
        margin-top: 16px;
    }
}
</style>
