<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import { home } from '@/routes';

defineProps<{
    title?: string;
    description?: string;
}>();
</script>

<template>
    <div class="auth-root">
        <!-- Grid background -->
        <div class="auth-grid" aria-hidden="true" />

        <!-- Ambient glow top-center -->
        <div class="auth-ambient" aria-hidden="true" />

        <div class="auth-center">
            <!-- Logo link -->
            <Link :href="home()" class="auth-brand">
                <AppLogoIcon class="auth-logo-icon" />
                <span class="auth-wordmark">polsh</span>
            </Link>

            <!-- Card -->
            <div class="auth-card">
                <div class="auth-card-header">
                    <h1 class="auth-title">{{ title }}</h1>
                    <p v-if="description" class="auth-desc">{{ description }}</p>
                </div>

                <slot />
            </div>

            <p class="auth-footer-note">
                By continuing, you agree to our
                <a href="/terms-of-service" class="auth-legal-link">Terms</a>
                and
                <a href="/privacy-policy" class="auth-legal-link">Privacy Policy</a>.
            </p>
        </div>
    </div>
</template>

<style scoped>
.auth-root {
    min-height: 100svh;
    background: #0a0a0c;
    color: #f0f0f2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    position: relative;
    overflow: hidden;
}

.auth-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 0%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 0%, transparent 100%);
}

.auth-ambient {
    position: absolute;
    top: -120px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse at 50% 0%, rgba(224, 255, 79, 0.07) 0%, transparent 70%);
    pointer-events: none;
    filter: blur(40px);
}

.auth-center {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 26rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}

.auth-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    margin-bottom: 0.25rem;
}

.auth-logo-icon {
    width: 22px;
    height: 22px;
    color: #e0ff4f;
}

.auth-wordmark {
    font-family: 'DM Mono', monospace;
    font-size: 1.125rem;
    font-weight: 500;
    color: #fff;
    letter-spacing: -0.03em;
    line-height: 1;
}

.auth-card {
    width: 100%;
    background: #111114;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 2rem;
    box-shadow:
        0 0 0 1px rgba(224, 255, 79, 0.04),
        0 24px 64px rgba(0, 0, 0, 0.5);
}

.auth-card-header {
    margin-bottom: 1.75rem;
    text-align: center;
}

.auth-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: #f0f0f2;
    letter-spacing: -0.025em;
    margin: 0 0 0.375rem;
}

.auth-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: #6a6a7a;
    margin: 0;
    line-height: 1.5;
}

.auth-footer-note {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    color: #3a3a4a;
    text-align: center;
    margin: 0;
    line-height: 1.6;
}

.auth-legal-link {
    color: #5a5a6a;
    text-decoration: none;
    transition: color 0.15s ease;
}

.auth-legal-link:hover {
    color: #8a8a9a;
}
</style>
