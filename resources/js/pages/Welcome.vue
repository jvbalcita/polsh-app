<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { editor } from '@/routes';
import { github as githubRoute } from '@/routes/auth';
import styles from '@/styles';

const page = usePage();
const user = computed(() => page.props.auth?.user);

const features = [
    {
        icon: '✦',
        title: 'Named Styles',
        desc: '12 hand-crafted presets from minimal white to neon-halo dark. Pick one, go.',
    },
    {
        icon: '◈',
        title: 'Brand Sessions',
        desc: 'Save your padding, radius, and color combos as presets. Reuse in seconds.',
    },
    {
        icon: '⬡',
        title: 'SVG Export',
        desc: 'Export lossless vector frames — perfect for Notion, Figma, and docs.',
    },
    {
        icon: '⤢',
        title: '4× Resolution',
        desc: 'Ship print-quality 4× PNGs for Retina displays and marketing assets.',
    },
    {
        icon: '⧉',
        title: 'Batch ZIP',
        desc: 'Style a full screenshot set and export all as a ZIP in one click.',
    },
    {
        icon: '⌘',
        title: 'Keyboard-first',
        desc: '⌘S to save, ⌘Z to undo, ⌘V to paste from clipboard. No clicks required.',
    },
];

type CompRow = { feature: string; polsh: boolean | string; shotframe: boolean | string; pika: boolean | string; screely: boolean | string };

const compTable: CompRow[] = [
    { feature: 'Named style presets', polsh: true, shotframe: true, pika: true, screely: false },
    { feature: 'SVG export', polsh: true, shotframe: false, pika: false, screely: false },
    { feature: '4× resolution PNG', polsh: true, shotframe: false, pika: true, screely: false },
    { feature: 'Batch ZIP export', polsh: true, shotframe: false, pika: false, screely: false },
    { feature: 'Saved presets', polsh: true, shotframe: false, pika: false, screely: false },
    { feature: 'Undo / redo', polsh: true, shotframe: false, pika: false, screely: false },
    { feature: 'macOS / browser chrome', polsh: true, shotframe: true, pika: true, screely: true },
    { feature: 'Open source / self-host', polsh: true, shotframe: false, pika: false, screely: false },
];

function styleGradient(s: (typeof styles)[0]): string {
    const { type, colors, angle } = s.background;
    if (type === 'solid') {
        return colors[0];
    }
    return `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
}
</script>

<template>
    <Head title="Polsh — Polish your screenshots" />

    <div class="min-h-screen select-none overflow-x-hidden" style="background: #080808; color: #e8e8e8">
        <!-- Nav -->
        <nav
            class="flex h-12 items-center justify-between border-b px-6 md:px-10"
            style="border-color: rgba(255,255,255,0.07); background: #0d0d0d"
        >
            <span class="text-sm font-semibold tracking-tight" style="color: #e0ff4f">polsh</span>

            <div class="flex items-center gap-4">
                <template v-if="user">
                    <Link
                        :href="editor()"
                        class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                        style="color: #e0ff4f; border: 1px solid rgba(224,255,79,0.3)"
                    >
                        Open editor →
                    </Link>
                    <img
                        v-if="user.avatar"
                        :src="user.avatar"
                        :alt="user.name"
                        class="h-7 w-7 rounded-full border"
                        style="border-color: rgba(255,255,255,0.15)"
                    />
                </template>
                <template v-else>
                    <a
                        :href="githubRoute.url()"
                        class="flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-semibold transition-opacity hover:opacity-85"
                        style="background: #e0ff4f; color: #080808"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                            />
                        </svg>
                        Sign in with GitHub
                    </a>
                </template>
            </div>
        </nav>

        <!-- Hero -->
        <section class="flex flex-col items-center px-6 pb-24 pt-24 text-center md:pt-32">
            <div
                class="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                style="background: rgba(224,255,79,0.08); color: #e0ff4f; border: 1px solid rgba(224,255,79,0.2)"
            >
                Open beta · Free while we build
            </div>

            <h1
                class="mb-5 max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-7xl"
                style="font-family: Georgia, 'Times New Roman', serif; color: #f0f0f0"
            >
                Polish your<br />
                <span style="color: #e0ff4f">screenshots.</span>
            </h1>

            <p class="mb-10 max-w-lg text-base leading-relaxed" style="color: rgba(255,255,255,0.45)">
                Drop in a screenshot. Pick a style. Export a stunning PNG, WebP, or SVG frame in seconds — no Figma plugins, no subscriptions.
            </p>

            <div class="flex flex-wrap items-center justify-center gap-4">
                <Link
                    :href="editor()"
                    class="rounded-md px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                    style="background: #e0ff4f; color: #080808"
                >
                    Open the editor →
                </Link>
                <a
                    :href="githubRoute.url()"
                    class="flex items-center gap-2 rounded-md px-7 py-3 text-sm font-medium transition-all"
                    style="border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.6)"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                        />
                    </svg>
                    Save presets with GitHub
                </a>
            </div>
        </section>

        <!-- Style Showcase Strip -->
        <section class="pb-24">
            <p
                class="mb-6 text-center text-[11px] font-semibold uppercase tracking-widest"
                style="color: rgba(255,255,255,0.25)"
            >
                18 ready-to-use styles
            </p>
            <div class="flex gap-3 overflow-x-auto px-6 pb-2" style="scrollbar-width: none">
                <div
                    v-for="s in styles"
                    :key="s.slug"
                    class="group relative shrink-0 overflow-hidden rounded-xl transition-transform duration-200 hover:-translate-y-1"
                    style="width: 156px; height: 96px; border: 1px solid rgba(255,255,255,0.08)"
                    :style="{ background: styleGradient(s) }"
                >
                    <!-- Hover overlay -->
                    <div
                        class="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        style="background: rgba(0,0,0,0.4)"
                    >
                        <span class="text-[10px] font-semibold" style="color: rgba(255,255,255,0.9)">{{ s.name }}</span>
                    </div>
                    <!-- Bottom label -->
                    <div
                        class="absolute bottom-0 left-0 right-0 rounded-b-xl px-2 py-1.5"
                        style="background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)"
                    >
                        <span class="text-[9px] font-medium" style="color: rgba(255,255,255,0.6)">{{ s.name }}</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Grid -->
        <section class="mx-auto max-w-5xl px-6 pb-24">
            <h2 class="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl" style="color: #f0f0f0">
                Everything you need, nothing you don't
            </h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div
                    v-for="f in features"
                    :key="f.title"
                    class="rounded-xl p-5"
                    style="background: #111111; border: 1px solid rgba(255,255,255,0.07)"
                >
                    <div class="mb-3 text-lg" style="color: #e0ff4f">{{ f.icon }}</div>
                    <h3 class="mb-1.5 text-sm font-semibold" style="color: #f0f0f0">{{ f.title }}</h3>
                    <p class="text-xs leading-relaxed" style="color: rgba(255,255,255,0.4)">{{ f.desc }}</p>
                </div>
            </div>
        </section>

        <!-- Competitive Table -->
        <section class="mx-auto max-w-4xl px-6 pb-24">
            <h2 class="mb-10 text-center text-2xl font-bold tracking-tight" style="color: #f0f0f0">How we compare</h2>
            <div class="overflow-hidden rounded-xl" style="border: 1px solid rgba(255,255,255,0.08)">
                <table class="w-full text-sm">
                    <thead>
                        <tr style="background: #111111; border-bottom: 1px solid rgba(255,255,255,0.08)">
                            <th
                                class="py-3.5 pl-5 text-left text-[11px] font-semibold uppercase tracking-wider"
                                style="color: rgba(255,255,255,0.35); width: 40%"
                            >
                                Feature
                            </th>
                            <th class="py-3.5 text-center text-[11px] font-bold uppercase tracking-wider" style="color: #e0ff4f">Polsh</th>
                            <th class="py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style="color: rgba(255,255,255,0.3)">
                                ShotFrame
                            </th>
                            <th class="py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style="color: rgba(255,255,255,0.3)">Pika</th>
                            <th
                                class="py-3.5 pr-5 text-center text-[11px] font-semibold uppercase tracking-wider"
                                style="color: rgba(255,255,255,0.3)"
                            >
                                Screely
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(row, i) in compTable"
                            :key="row.feature"
                            :style="{ background: i % 2 === 0 ? '#0d0d0d' : '#111111' }"
                        >
                            <td class="py-3 pl-5 text-xs" style="color: rgba(255,255,255,0.55)">{{ row.feature }}</td>
                            <td class="py-3 text-center">
                                <span v-if="row.polsh === true" style="color: #e0ff4f; font-size: 15px">✓</span>
                                <span v-else-if="row.polsh === false" style="color: rgba(255,255,255,0.15)">—</span>
                                <span v-else class="text-[11px]" style="color: rgba(255,255,255,0.5)">{{ row.polsh }}</span>
                            </td>
                            <td class="py-3 text-center">
                                <span v-if="row.shotframe === true" style="color: rgba(255,255,255,0.45); font-size: 15px">✓</span>
                                <span v-else-if="row.shotframe === false" style="color: rgba(255,255,255,0.15)">—</span>
                                <span v-else class="text-[11px]" style="color: rgba(255,255,255,0.4)">{{ row.shotframe }}</span>
                            </td>
                            <td class="py-3 text-center">
                                <span v-if="row.pika === true" style="color: rgba(255,255,255,0.45); font-size: 15px">✓</span>
                                <span v-else-if="row.pika === false" style="color: rgba(255,255,255,0.15)">—</span>
                                <span v-else class="text-[11px]" style="color: rgba(255,255,255,0.4)">{{ row.pika }}</span>
                            </td>
                            <td class="py-3 pr-5 text-center">
                                <span v-if="row.screely === true" style="color: rgba(255,255,255,0.45); font-size: 15px">✓</span>
                                <span v-else-if="row.screely === false" style="color: rgba(255,255,255,0.15)">—</span>
                                <span v-else class="text-[11px]" style="color: rgba(255,255,255,0.4)">{{ row.screely }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- CTA -->
        <section class="mb-24 flex flex-col items-center px-6 text-center">
            <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl" style="color: #f0f0f0">
                Ready to ship <span style="color: #e0ff4f">beautiful</span> screenshots?
            </h2>
            <p class="mb-8 max-w-sm text-sm leading-relaxed" style="color: rgba(255,255,255,0.4)">No account required. Drop a screenshot and go.</p>
            <Link
                :href="editor()"
                class="rounded-md px-8 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style="background: #e0ff4f; color: #080808"
            >
                Start for free →
            </Link>
        </section>

        <!-- Footer -->
        <footer class="border-t px-6 py-6 text-center text-xs" style="border-color: rgba(255,255,255,0.07); color: rgba(255,255,255,0.2)">
            <div class="mb-3 flex items-center justify-center gap-5">
                <a href="/changelog" class="transition-colors hover:text-white/60 text-[12px]" style="color: rgba(255,255,255,0.3)">Changelog</a>
                <a href="/docs/api" class="transition-colors hover:text-white/60 text-[12px]" style="color: rgba(255,255,255,0.3)">API Docs</a>
            </div>
            polsh.app — built for developers, by developers
        </footer>
    </div>
</template>
