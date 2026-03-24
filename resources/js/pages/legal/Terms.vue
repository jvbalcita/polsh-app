<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { useSeo } from '@/composables/useSeo';
import PublicLayout from '@/layouts/PublicLayout.vue';

const { fullTitle, description, ogImage, twitterCard } = useSeo({
    title: 'Terms of Service',
    description: 'Read the Polsh Terms of Service. Learn about your rights and responsibilities when using Polsh.',
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
                    <h1 class="legal-title">Terms of Service</h1>
                    <p class="legal-meta">Effective date: March 24, 2026</p>
                </header>

                <div class="legal-body">
                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing or using Polsh ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. These Terms constitute a legally binding agreement between you and Polsh.</p>
                    </section>

                    <section>
                        <h2>2. Description of Service</h2>
                        <p>Polsh is a browser-based screenshot styling and export tool. The Service allows you to upload screenshots, apply visual styles and frames, and export the result as PNG, WebP, or SVG files. Polsh offers a Free plan and a paid Pro plan with expanded capabilities.</p>
                        <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.</p>
                    </section>

                    <section>
                        <h2>3. Account Registration</h2>
                        <p>Some features require you to create an account. You may register using your Google or GitHub account via OAuth. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
                        <p>You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. You must be at least 18 years old to use the Service.</p>
                    </section>

                    <section>
                        <h2>4. Acceptable Use</h2>
                        <p>You agree not to use the Service to:</p>
                        <ul>
                            <li>Upload, process, or distribute content that is illegal, harmful, abusive, defamatory, or infringes on any third party's intellectual property rights.</li>
                            <li>Attempt to gain unauthorized access to the Service, other accounts, or related systems.</li>
                            <li>Use automated means (bots, scrapers) to access the Service beyond what is permitted by our API.</li>
                            <li>Reverse-engineer or attempt to extract the source code of the Service.</li>
                            <li>Use the Service in a way that disrupts or impairs its functionality for other users.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Pro Subscription and Payments</h2>
                        <p>Polsh offers a Pro subscription with additional features. Payments are processed by a licensed third-party payment service provider. By subscribing to the Pro plan, you authorize us to charge your chosen payment method on a recurring basis according to your selected billing cycle.</p>
                        <p>Subscriptions automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. Please refer to our <a href="/refund-policy">Refund Policy</a> for information on refunds.</p>
                        <p>We reserve the right to change subscription pricing with at least 30 days' notice to current subscribers.</p>
                    </section>

                    <section>
                        <h2>6. Intellectual Property</h2>
                        <p><strong>Your content:</strong> You retain full ownership of the screenshots and images you upload to Polsh. By using the Service, you grant Polsh a limited, non-exclusive, royalty-free license to process your content solely for the purpose of providing the Service to you. We do not claim ownership of your content and do not use it for training AI models or for any purpose other than rendering your requested output.</p>
                        <p><strong>Our content:</strong> The Polsh name, logo, design, software, and visual styles are the intellectual property of Polsh. You may not copy, reproduce, distribute, or create derivative works from our proprietary assets without our written permission.</p>
                    </section>

                    <section>
                        <h2>7. Disclaimer of Warranties</h2>
                        <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
                    </section>

                    <section>
                        <h2>8. Limitation of Liability</h2>
                        <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, POLSH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF POLSH HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
                        <p>Our total liability to you for any claim arising out of or relating to these Terms or the Service shall not exceed the amount you paid to Polsh in the six (6) months preceding the claim.</p>
                    </section>

                    <section>
                        <h2>9. Changes to These Terms</h2>
                        <p>We may update these Terms from time to time. If we make material changes, we will notify you by email or by posting a notice on the Service at least 7 days before the changes take effect. Your continued use of the Service after the effective date of any changes constitutes your acceptance of the updated Terms.</p>
                    </section>

                    <section>
                        <h2>10. Governing Law</h2>
                        <p>These Terms are governed by and construed in accordance with the laws of the <strong>Republic of the Philippines</strong>, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of the Philippines.</p>
                    </section>

                    <section>
                        <h2>11. Contact</h2>
                        <p>If you have questions about these Terms, please contact us via <Link href="/support">our support page</Link>.</p>
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

.legal-body section ul {
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
