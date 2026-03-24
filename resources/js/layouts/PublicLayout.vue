<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import UserMenu from '@/components/UserMenu.vue';
import { Toaster } from '@/components/ui/sonner';
import { useFlashToast } from '@/composables/useFlashToast';
import { editor } from '@/routes';
import { api as apiDocs } from '@/routes/docs';
import { terms, privacy, refund } from '@/routes/legal';

useFlashToast();
</script>

<template>
    <div class="pub-root">
        <!-- ── Nav ── -->
        <nav class="pub-nav">
            <div class="pub-nav-inner">
                <Link href="/" class="pub-brand">
                    <AppLogoIcon class="pub-logo-icon" />
                    <span class="pub-wordmark">polsh</span>
                </Link>

                <div class="pub-nav-right">
                    <Link :href="editor()" class="pub-btn-cta">Open editor →</Link>
                    <UserMenu />
                </div>
            </div>
        </nav>

        <!-- ── Page content ── -->
        <main>
            <slot />
        </main>

        <!-- ── Footer ── -->
        <footer class="pub-footer">
            <div class="pub-footer-inner">
                <div class="pub-footer-brand">
                    <Link href="/" class="pub-footer-brand-link">
                        <AppLogoIcon class="pub-footer-logo-icon" />
                        <span class="pub-wordmark pub-wordmark--footer">polsh</span>
                    </Link>
                    <p class="pub-footer-tagline">Polish your screenshots.</p>
                </div>

                <div class="pub-footer-cols">
                    <div class="pub-footer-col">
                        <p class="pub-footer-col-title">Product</p>
                        <Link :href="editor()" class="pub-footer-link">Editor</Link>
                        <Link :href="apiDocs()" class="pub-footer-link">API Docs</Link>
                    </div>
                    <div class="pub-footer-col">
                        <p class="pub-footer-col-title">Legal</p>
                        <Link href="/support" class="pub-footer-link">Support</Link>
                        <Link :href="terms()" class="pub-footer-link">Terms of Service</Link>
                        <Link :href="privacy()" class="pub-footer-link">Privacy Policy</Link>
                        <Link :href="refund()" class="pub-footer-link">Refund Policy</Link>
                    </div>
                </div>

                <p class="pub-footer-copy">© 2026 Polsh · Made with ♥ in the Philippines</p>
            </div>
        </footer>
    </div>
    <Teleport to="body">
        <Toaster rich-colors theme="dark" position="bottom-right" />
    </Teleport>
</template>

<style scoped>
.pub-root {
    min-height: 100vh;
    background: #0a0a0c;
    color: #f0f0f2;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
}

/* ── Nav ── */
.pub-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(10, 10, 12, 0.88);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.pub-nav-inner {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
}

.pub-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    flex-shrink: 0;
}

.pub-logo-icon {
    width: 20px;
    height: 20px;
    color: #e0ff4f;
}

.pub-wordmark {
    font-family: 'DM Mono', monospace;
    font-size: 1.0625rem;
    font-weight: 500;
    color: #fff;
    letter-spacing: -0.02em;
    text-decoration: none;
    line-height: 1;
}

.pub-wordmark--footer {
    font-size: 1rem;
}

.pub-nav-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
}

.pub-btn-cta {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #0a0a0c;
    background: #e0ff4f;
    padding: 0.4375rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    letter-spacing: -0.01em;
    transition: opacity 0.15s ease;
    white-space: nowrap;
}

.pub-btn-cta:hover {
    opacity: 0.88;
}

main {
    flex: 1;
}

/* ── Footer ── */
.pub-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    background: #0a0a0c;
}

.pub-footer-inner {
    max-width: 72rem;
    margin: 0 auto;
    padding: 3rem 1.5rem 2.5rem;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 2.5rem 4rem;
    align-items: start;
}

.pub-footer-brand {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.pub-footer-brand-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    width: fit-content;
}

.pub-footer-logo-icon {
    width: 16px;
    height: 16px;
    color: #4a4a5a;
}

.pub-footer-tagline {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8125rem;
    color: #4a4a5a;
    margin: 0;
}

.pub-footer-cols {
    display: flex;
    gap: 3.5rem;
    grid-row: 1;
}

.pub-footer-col {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
}

.pub-footer-col-title {
    font-family: 'DM Mono', monospace;
    font-size: 0.6875rem;
    color: #4a4a5a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 0.375rem;
}

.pub-footer-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: #8a8a9a;
    text-decoration: none;
    transition: color 0.15s ease;
}

.pub-footer-link:hover {
    color: #f0f0f2;
}

.pub-footer-copy {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    color: #4a4a5a;
    margin: 0;
    grid-column: 1 / -1;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 1.5rem;
}

@media (max-width: 768px) {
    .pub-footer-inner {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .pub-footer-cols {
        gap: 2.5rem;
    }
}
</style>
