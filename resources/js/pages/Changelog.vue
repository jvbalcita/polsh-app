<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import ProductPageHeader from '@/components/ProductPageHeader.vue';
import { editor, home } from '@/routes';
</script>

<template>
    <Head title="Changelog — Polsh">
        <meta name="description" content="What's new in Polsh — version history and release notes." />
        <meta property="og:title" content="Changelog — Polsh" />
        <meta property="og:description" content="What's new in Polsh — version history and release notes." />
        <meta property="og:type" content="website" />
    </Head>

    <div class="polsh-page-shell min-h-screen" style="color: #e8e8e8">
        <ProductPageHeader
            context="/ changelog"
            :home-href="home()"
            :trailing-href="editor()"
            trailing-label="Open editor →"
            trailing-variant="link"
        />

        <div class="mx-auto max-w-2xl px-6 py-14">
            <h1 class="mb-2 text-2xl font-semibold tracking-tight" style="color: #f0f0f0">Changelog</h1>
            <p class="mb-12 text-sm" style="color: rgba(255,255,255,0.35)">A record of all notable Polsh releases.</p>

            <!-- v1.2.1 -->
            <section class="mb-12">
                <div class="mb-4 flex items-baseline gap-3">
                    <h2 class="polsh-brand text-base font-semibold">v1.2.1</h2>
                    <span class="text-[11px]" style="color: rgba(255,255,255,0.25)">March 18, 2026</span>
                    <span class="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#e0ff4f]/12 text-[#e0ff4f]">Latest</span>
                </div>
                <p class="mb-3 text-[13px] font-medium" style="color: rgba(255,255,255,0.55)">Gap Fixes & Pre-Marketplace Polish</p>
                <ul class="space-y-1.5 text-[13px]" style="color: rgba(255,255,255,0.45)">
                    <li>• 6 new built-in styles (18 total): Warm Studio, Cyber Pink, Slate Card, Forest Dark, Paper White, Retro Amber</li>
                    <li>• Font system migrated to DM Mono (headings) + DM Sans (UI)</li>
                    <li>• Google OAuth login alongside GitHub</li>
                    <li>• <code class="rounded bg-white/8 px-1 text-[11px]" style="color: rgba(255,255,255,0.6)">plan</code> column on users for fast Pro lookup</li>
                    <li>• Webhook support for async API jobs — set a <code class="rounded bg-white/8 px-1 text-[11px]" style="color: rgba(255,255,255,0.6)">webhook_url</code> on your API key</li>
                    <li>• Export history corrected to 10 sessions (free) / 50 sessions (Pro)</li>
                    <li>• Team invitations now expire in 48 hours</li>
                    <li>• <code class="rounded bg-white/8 px-1 text-[11px]" style="color: rgba(255,255,255,0.6)">polsh/laravel-polsh</code> Composer package scaffolded</li>
                </ul>
            </section>

            <!-- v1.2.0 -->
            <section class="mb-12">
                <div class="mb-4 flex items-baseline gap-3">
                    <h2 class="text-base font-semibold" style="color: rgba(255,255,255,0.75)">v1.2.0</h2>
                    <span class="text-[11px]" style="color: rgba(255,255,255,0.25)">March 17, 2026</span>
                </div>
                <p class="mb-3 text-[13px] font-medium" style="color: rgba(255,255,255,0.55)">API & CLI</p>
                <ul class="space-y-1.5 text-[13px]" style="color: rgba(255,255,255,0.45)">
                    <li>• REST API: <code class="rounded bg-white/8 px-1 text-[11px]" style="color: rgba(255,255,255,0.6)">POST /api/v1/polish</code> with 12 styles, 4 formats, custom padding, radius, shadows</li>
                    <li>• API key management dashboard — generate, view, revoke keys</li>
                    <li>• Async 4× resolution export via job queue (202 Accepted + status polling)</li>
                    <li>• Rate limits: 500 req/day (Pro), 5,000 req/day (Team)</li>
                    <li>• API documentation page at /docs/api</li>
                </ul>
            </section>

            <!-- v1.1.0 -->
            <section class="mb-12">
                <div class="mb-4 flex items-baseline gap-3">
                    <h2 class="text-base font-semibold" style="color: rgba(255,255,255,0.75)">v1.1.0</h2>
                    <span class="text-[11px]" style="color: rgba(255,255,255,0.25)">March 17, 2026</span>
                </div>
                <p class="mb-3 text-[13px] font-medium" style="color: rgba(255,255,255,0.55)">Billing & Teams</p>
                <ul class="space-y-1.5 text-[13px]" style="color: rgba(255,255,255,0.45)">
                    <li>• Billing — Pro monthly (₱399/mo) and yearly (₱3,990/yr) plans</li>
                    <li>• Team workspaces — create a team, invite members via email</li>
                    <li>• Team-shared style presets</li>
                    <li>• Billing portal with subscription management and cancellation</li>
                    <li>• Upgrade modal in editor for free users at limits</li>
                </ul>
            </section>

            <!-- v1.0.0 -->
            <section class="mb-12">
                <div class="mb-4 flex items-baseline gap-3">
                    <h2 class="text-base font-semibold" style="color: rgba(255,255,255,0.75)">v1.0.0</h2>
                    <span class="text-[11px]" style="color: rgba(255,255,255,0.25)">March 16, 2026</span>
                </div>
                <p class="mb-3 text-[13px] font-medium" style="color: rgba(255,255,255,0.55)">MVP Launch</p>
                <ul class="space-y-1.5 text-[13px]" style="color: rgba(255,255,255,0.45)">
                    <li>• Screenshot editor with 12 built-in styles</li>
                    <li>• Style controls: padding, radius, shadow, border, noise, aspect ratio</li>
                    <li>• Batch export: ZIP of styled PNGs, WebP, or SVG</li>
                    <li>• Export history — save and restore editor sessions</li>
                    <li>• GitHub OAuth login</li>
                    <li>• Named style presets (save your favourite settings)</li>
                    <li>• Keyboard shortcuts: ⌘S save preset, ⌘Z undo, ⌘⇧Z redo</li>
                </ul>
            </section>

            <div class="border-t pt-8 text-[12px]" style="border-color: rgba(255,255,255,0.06); color: rgba(255,255,255,0.2)">
                <Link :href="home()" class="transition-colors hover:text-white/40">← Back to home</Link>
            </div>
        </div>
    </div>
</template>
