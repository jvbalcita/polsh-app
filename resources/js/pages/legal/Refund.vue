<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { useSeo } from '@/composables/useSeo';
import PublicLayout from '@/layouts/PublicLayout.vue';

const { fullTitle, description, ogImage, twitterCard } = useSeo({
    title: 'Refund Policy',
    description: 'Learn about Polsh refund eligibility and how to request a refund for your Pro subscription.',
    type: 'website',
});
</script>

<template>
    <Head>
        <title>{{ fullTitle }}</title>
        <meta name="description" :content="description" />
        <meta property="og:title" :content="fullTitle" />
        <meta property="og:description" :content="description" />
        <meta property="og:image" :content="ogImage" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" :content="twitterCard" />
        <meta name="robots" content="index, follow" />
    </Head>

    <PublicLayout>
        <div class="legal-page">
            <div class="legal-container">
                <header class="legal-header">
                    <div class="legal-label">Legal</div>
                    <h1 class="legal-title">Refund Policy</h1>
                    <p class="legal-meta">Effective date: March 24, 2026</p>
                </header>

                <div class="legal-body">
                    <section>
                        <h2>1. Overview</h2>
                        <p>Polsh offers a Free plan with no billing and a paid Pro subscription. This policy applies only to paid Pro subscriptions. Free plan users are not billed and thus this policy does not apply to them.</p>
                    </section>

                    <section>
                        <h2>2. Refund Eligibility</h2>
                        <p>We offer a <strong>7-day refund window</strong> from the date of your first Pro subscription payment. If you are unsatisfied with the Pro plan within 7 days of subscribing and have not made significant use of Pro-only features (unlimited exports, brand sessions, REST API), you may request a full refund of your most recent payment.</p>
                        <p>After 7 days, or after substantial use of Pro features, subscription payments are <strong>non-refundable</strong>. This is consistent with standard digital subscription policies and is permitted under applicable Philippine consumer protection regulations for digital services.</p>
                    </section>

                    <section>
                        <h2>3. Subscription Renewals</h2>
                        <p>Subscriptions are billed monthly and renew automatically. We do not provide refunds for renewal charges if you failed to cancel before your renewal date. You may cancel at any time from your account settings — cancellation prevents future charges and takes effect at the end of your current billing period.</p>
                        <p>Partial months are not refunded. Your Pro access continues until the end of the paid period regardless of when you cancel.</p>
                    </section>

                    <section>
                        <h2>4. How to Request a Refund</h2>
                        <p>To request a refund within the eligible 7-day window:</p>
                        <ol>
                            <li>Submit a request via <Link href="/support">our support page</Link> from the email address associated with your account.</li>
                            <li>Include the subject line: <strong>"Refund Request — [your email]"</strong></li>
                            <li>Briefly describe why you are requesting a refund.</li>
                        </ol>
                        <p>We will review your request and respond within 2 business days. Approved refunds are processed back to your original payment method.</p>
                    </section>

                    <section>
                        <h2>5. Processing Time</h2>
                        <p>Once approved, refunds are typically reflected on your statement within <strong>7–14 business days</strong>, depending on your card issuer or bank. Polsh has no control over the processing time after the refund is initiated.</p>
                    </section>

                    <section>
                        <h2>6. Non-Refundable Cases</h2>
                        <p>Refunds will not be granted in the following situations:</p>
                        <ul>
                            <li>Requests made more than 7 days after the initial Pro subscription charge.</li>
                            <li>Renewal charges where cancellation was not made before the renewal date.</li>
                            <li>Accounts found to be in violation of our <a href="/terms-of-service">Terms of Service</a>.</li>
                            <li>Requests citing inability to use features that are clearly documented as included in the Free plan.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>7. Chargebacks</h2>
                        <p>Please contact us before initiating a chargeback with your bank. Chargebacks for legitimate charges may result in permanent suspension of your account. We are always willing to work with you to resolve billing issues directly.</p>
                    </section>

                    <section>
                        <h2>8. Contact</h2>
                        <p>For billing questions or refund requests, visit <Link href="/support">our support page</Link>. We typically respond within 1–2 business days.</p>
                    </section>
                </div>
            </div>
        </div>
    </PublicLayout>
</template>

<style scoped>
.legal-page {
    padding: 4rem 1.5rem 6rem;
}

.legal-container {
    max-width: 42rem;
    margin: 0 auto;
}

.legal-header {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.legal-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.6875rem;
    color: #e0ff4f;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
}

.legal-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    color: #f0f0f2;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin: 0 0 0.75rem;
}

.legal-meta {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: #4a4a5a;
    margin: 0;
}

.legal-body {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.legal-body section h2 {
    font-family: 'DM Mono', monospace;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #f0f0f2;
    letter-spacing: -0.01em;
    margin: 0 0 1rem;
}

.legal-body section p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9375rem;
    color: #8a8a9a;
    line-height: 1.75;
    margin: 0 0 0.875rem;
}

.legal-body section p:last-child {
    margin-bottom: 0;
}

.legal-body section ul,
.legal-body section ol {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9375rem;
    color: #8a8a9a;
    line-height: 1.75;
    padding-left: 1.5rem;
    margin: 0.5rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.legal-body section a {
    color: #e0ff4f;
    text-decoration: none;
    border-bottom: 1px solid rgba(224, 255, 79, 0.3);
    transition: border-color 0.15s ease;
}

.legal-body section a:hover {
    border-color: #e0ff4f;
}

.legal-body section strong {
    color: #f0f0f2;
    font-weight: 500;
}
</style>
