<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';
import { useSeo } from '@/composables/useSeo';

const { fullTitle, description, ogImage, twitterCard } = useSeo({
    title: 'Privacy Policy',
    description: 'Learn how Polsh collects, uses, and protects your personal information in accordance with the Philippine Data Privacy Act (RA 10173).',
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
        <meta name="robots" content="noindex, follow" />
    </Head>

    <PublicLayout>
        <div class="legal-page">
            <div class="legal-container">
                <header class="legal-header">
                    <div class="legal-label">Legal</div>
                    <h1 class="legal-title">Privacy Policy</h1>
                    <p class="legal-meta">Effective date: March 24, 2026 · Republic of the Philippines (RA 10173)</p>
                </header>

                <div class="legal-body">
                    <section>
                        <h2>1. Overview</h2>
                        <p>Polsh ("we," "our," or "us") is committed to protecting your personal information in accordance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and its Implementing Rules and Regulations. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use polsh.work.</p>
                    </section>

                    <section>
                        <h2>2. Information We Collect</h2>
                        <p><strong>Account information:</strong> When you register via Google or GitHub OAuth, we receive your name, email address, and profile avatar from those providers. We store this information to maintain your account.</p>
                        <p><strong>Usage data:</strong> We may collect information about how you use the Service, including pages visited, features used, export history, and browser/device type. This is used to improve the Service.</p>
                        <p><strong>Payment data:</strong> If you subscribe to Pro, payment is processed by PayMongo, Inc. We do not store your full card details — only a payment reference and subscription status.</p>
                        <p><strong>Uploaded content:</strong> Screenshots and images you upload are processed in your browser. They may be temporarily held server-side during export generation and are not permanently stored beyond what is needed for the Service.</p>
                    </section>

                    <section>
                        <h2>3. How We Use Your Information</h2>
                        <p>We use your personal information to:</p>
                        <ul>
                            <li>Provide, maintain, and improve the Service.</li>
                            <li>Manage your account and Pro subscription.</li>
                            <li>Send transactional emails (account verification, password reset, billing receipts).</li>
                            <li>Respond to your inquiries and support requests.</li>
                            <li>Comply with legal obligations.</li>
                        </ul>
                        <p>We do not sell your personal data to third parties. We do not use your uploaded screenshots for advertising, AI training, or any purpose unrelated to rendering your requested output.</p>
                    </section>

                    <section>
                        <h2>4. Third-Party Services</h2>
                        <p>We use the following third-party services that may process your data:</p>
                        <ul>
                            <li><strong>Google OAuth / GitHub OAuth</strong> — for account authentication. Subject to Google's and GitHub's respective privacy policies.</li>
                            <li><strong>PayMongo, Inc.</strong> — for payment processing. Subject to PayMongo's Privacy Policy.</li>
                            <li><strong>Cloudflare</strong> — for CDN, security, and DDoS protection. Cloudflare may process IP addresses and request metadata.</li>
                        </ul>
                        <p>These providers are bound by their own privacy policies and data processing agreements. We only share the minimum necessary data with each provider.</p>
                    </section>

                    <section>
                        <h2>5. Data Retention</h2>
                        <p>We retain your account information for as long as your account remains active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law.</p>
                        <p>Export history and session data are retained for up to 90 days after creation, after which they are automatically deleted.</p>
                    </section>

                    <section>
                        <h2>6. Your Rights Under RA 10173</h2>
                        <p>As a data subject under the Data Privacy Act of 2012, you have the right to:</p>
                        <ul>
                            <li><strong>Access</strong> — Request a copy of the personal data we hold about you.</li>
                            <li><strong>Rectification</strong> — Request correction of inaccurate or incomplete data.</li>
                            <li><strong>Erasure</strong> — Request deletion of your personal data, subject to legal exceptions.</li>
                            <li><strong>Object</strong> — Object to processing of your personal data for legitimate purposes.</li>
                            <li><strong>Data Portability</strong> — Request your data in a structured, machine-readable format.</li>
                            <li><strong>Lodge a Complaint</strong> — File a complaint with the <strong>National Privacy Commission (NPC)</strong> of the Philippines at <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer">privacy.gov.ph</a>.</li>
                        </ul>
                        <p>To exercise any of these rights, contact our Data Privacy Officer at <a href="mailto:privacy@polsh.work">privacy@polsh.work</a>.</p>
                    </section>

                    <section>
                        <h2>7. Security</h2>
                        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, disclosure, alteration, or destruction. These include HTTPS encryption, access controls, and regular security reviews.</p>
                        <p>No method of transmission over the internet is 100% secure. If you believe your account has been compromised, contact us immediately.</p>
                    </section>

                    <section>
                        <h2>8. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on the Service. Your continued use of the Service after changes constitutes acceptance of the updated policy.</p>
                    </section>

                    <section>
                        <h2>9. Contact / Data Privacy Officer</h2>
                        <p>For privacy-related inquiries, requests, or complaints, contact our Data Privacy Officer:</p>
                        <p>
                            <strong>Email:</strong> <a href="mailto:privacy@polsh.work">privacy@polsh.work</a><br />
                            <strong>Address:</strong> Philippines
                        </p>
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
