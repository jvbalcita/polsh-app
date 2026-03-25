<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { Layers, Palette, FileCode, Zap, Archive, Clock } from 'lucide-vue-next';
import { ref, onMounted, onUnmounted } from 'vue';
import { useSeo } from '@/composables/useSeo';
import PublicLayout from '@/layouts/PublicLayout.vue';
import { editor } from '@/routes';
import { api as apiDocs } from '@/routes/docs';
import styles from '@/styles';
import type { StyleConfig } from '@/types/style';

// ── SEO ───────────────────────────────────────────────────────────────────────
const { fullTitle, description, ogImage, twitterCard } = useSeo({
    title: 'Style your code screenshots',
    description:
        'Style your code screenshots in seconds. No Figma, no plugins. Drop in a screenshot, pick a style, and export PNG, WebP, or SVG.',
    type: 'website',
});

const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Polsh',
    url: 'https://polsh.work',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'PHP',
    },
    description:
        'Polish your screenshots. Drop in a screenshot, pick a style, export a stunning PNG, WebP, or SVG — no Figma plugins, no install required.',
});

// ── Demo image — inline SVG blob, no file asset needed ───────────────────────
const DEMO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#0f0f13"/>
  <rect y="0" width="800" height="44" fill="#1a1a20"/>
  <rect x="16" y="14" width="60" height="16" rx="4" fill="#e0ff4f" opacity="0.9"/>
  <rect x="96" y="15" width="50" height="14" rx="3" fill="#3a3a45"/>
  <rect x="155" y="15" width="50" height="14" rx="3" fill="#3a3a45"/>
  <rect x="214" y="15" width="50" height="14" rx="3" fill="#3a3a45"/>
  <circle cx="768" cy="22" r="12" fill="#2a2a35"/>
  <rect x="0" y="44" width="180" height="456" fill="#13131a"/>
  <rect x="12" y="64" width="156" height="12" rx="3" fill="#2a2a35"/>
  <rect x="12" y="86" width="156" height="32" rx="6" fill="#e0ff4f" opacity="0.12"/>
  <rect x="20" y="98" width="8" height="8" rx="2" fill="#e0ff4f" opacity="0.6"/>
  <rect x="34" y="98" width="80" height="8" rx="2" fill="#e0ff4f" opacity="0.7"/>
  <rect x="12" y="128" width="156" height="32" rx="6"/>
  <rect x="20" y="141" width="8" height="8" rx="2" fill="#4a4a58"/>
  <rect x="34" y="141" width="70" height="8" rx="2" fill="#4a4a58"/>
  <rect x="12" y="170" width="156" height="32" rx="6"/>
  <rect x="20" y="183" width="8" height="8" rx="2" fill="#4a4a58"/>
  <rect x="34" y="183" width="55" height="8" rx="2" fill="#4a4a58"/>
  <rect x="12" y="212" width="156" height="32" rx="6"/>
  <rect x="20" y="225" width="8" height="8" rx="2" fill="#4a4a58"/>
  <rect x="34" y="225" width="65" height="8" rx="2" fill="#4a4a58"/>
  <rect x="196" y="60" width="148" height="80" rx="8" fill="#1a1a22"/>
  <rect x="208" y="72" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="208" y="90" width="90" height="20" rx="3" fill="#f0f0f2" opacity="0.8"/>
  <rect x="208" y="118" width="45" height="8" rx="2" fill="#4fff8a" opacity="0.6"/>
  <rect x="352" y="60" width="148" height="80" rx="8" fill="#1a1a22"/>
  <rect x="364" y="72" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="364" y="90" width="90" height="20" rx="3" fill="#f0f0f2" opacity="0.8"/>
  <rect x="364" y="118" width="45" height="8" rx="2" fill="#e0ff4f" opacity="0.6"/>
  <rect x="508" y="60" width="148" height="80" rx="8" fill="#1a1a22"/>
  <rect x="520" y="72" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="520" y="90" width="90" height="20" rx="3" fill="#f0f0f2" opacity="0.8"/>
  <rect x="520" y="118" width="45" height="8" rx="2" fill="#ff4f4f" opacity="0.6"/>
  <rect x="664" y="60" width="120" height="80" rx="8" fill="#1a1a22"/>
  <rect x="676" y="72" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="676" y="90" width="80" height="20" rx="3" fill="#f0f0f2" opacity="0.8"/>
  <rect x="196" y="156" width="588" height="288" rx="8" fill="#1a1a22"/>
  <rect x="196" y="156" width="588" height="36" rx="8" fill="#1e1e28"/>
  <rect x="212" y="170" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="380" y="170" width="50" height="8" rx="2" fill="#3a3a45"/>
  <rect x="500" y="170" width="50" height="8" rx="2" fill="#3a3a45"/>
  <rect x="640" y="170" width="50" height="8" rx="2" fill="#3a3a45"/>
  <rect x="212" y="200" width="80" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="200" width="40" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="200" width="60" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="200" width="30" height="8" rx="2" fill="#4fff8a" opacity="0.7"/>
  <rect x="212" y="224" width="100" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="224" width="45" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="224" width="50" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="224" width="30" height="8" rx="2" fill="#ff4f4f" opacity="0.7"/>
  <rect x="212" y="248" width="70" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="248" width="55" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="248" width="45" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="248" width="30" height="8" rx="2" fill="#4fff8a" opacity="0.7"/>
  <rect x="212" y="272" width="90" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="272" width="35" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="272" width="65" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="272" width="30" height="8" rx="2" fill="#4fff8a" opacity="0.7"/>
  <rect x="212" y="296" width="85" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="296" width="40" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="296" width="55" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="296" width="30" height="8" rx="2" fill="#e0ff4f" opacity="0.7"/>
  <rect x="196" y="456" width="280" height="84" rx="8" fill="#1a1a22"/>
  <rect x="208" y="468" width="80" height="8" rx="2" fill="#3a3a45"/>
  <rect x="214" y="500" width="20" height="32" rx="2" fill="#e0ff4f" opacity="0.4"/>
  <rect x="240" y="492" width="20" height="40" rx="2" fill="#e0ff4f" opacity="0.5"/>
  <rect x="266" y="484" width="20" height="48" rx="2" fill="#e0ff4f" opacity="0.6"/>
  <rect x="292" y="476" width="20" height="56" rx="2" fill="#e0ff4f" opacity="0.7"/>
  <rect x="318" y="488" width="20" height="44" rx="2" fill="#e0ff4f" opacity="0.55"/>
  <rect x="344" y="472" width="20" height="60" rx="2" fill="#e0ff4f" opacity="0.8"/>
  <rect x="370" y="468" width="20" height="64" rx="2" fill="#e0ff4f" opacity="0.9"/>
  <rect x="484" y="456" width="300" height="84" rx="8" fill="#1a1a22"/>
  <rect x="496" y="468" width="80" height="8" rx="2" fill="#3a3a45"/>
  <rect x="496" y="484" width="200" height="8" rx="2" fill="#2a2a35"/>
  <rect x="496" y="500" width="160" height="8" rx="2" fill="#2a2a35"/>
  <rect x="496" y="516" width="120" height="8" rx="2" fill="#2a2a35"/>
</svg>`;

let demoImgCache: HTMLImageElement | null = null;

function loadDemoImage(): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        if (demoImgCache) {
            resolve(demoImgCache);

            return;
        }

        const blob = new Blob([DEMO_SVG], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            demoImgCache = img;
            resolve(img);
        };
        img.src = url;
    });
}

// ── Canvas rendering ──────────────────────────────────────────────────────────
function rrPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
): void {
    const cr = Math.min(Math.max(r, 0), w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + cr, y);
    ctx.lineTo(x + w - cr, y);

    if (cr > 0) {
        ctx.arcTo(x + w, y, x + w, y + cr, cr);
    } else {
        ctx.lineTo(x + w, y);
    }

    ctx.lineTo(x + w, y + h - cr);

    if (cr > 0) {
        ctx.arcTo(x + w, y + h, x + w - cr, y + h, cr);
    } else {
        ctx.lineTo(x + w, y + h);
    }

    ctx.lineTo(x + cr, y + h);

    if (cr > 0) {
        ctx.arcTo(x, y + h, x, y + h - cr, cr);
    } else {
        ctx.lineTo(x, y + h);
    }

    ctx.lineTo(x, y + cr);

    if (cr > 0) {
        ctx.arcTo(x, y, x + cr, y, cr);
    } else {
        ctx.lineTo(x, y);
    }

    ctx.closePath();
}

function renderStyleFrame(
    canvas: HTMLCanvasElement,
    style: StyleConfig,
    img: HTMLImageElement | null,
): void {
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const cssW = canvas.offsetWidth || 200;
    const cssH = canvas.offsetHeight || 130;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    ctx.scale(dpr, dpr);

    // Stage background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, cssW, cssH);

    // Card layout — 8% margin
    const margin = cssW * 0.08;
    const cardX = margin;
    const cardY = margin;
    const cardW = cssW - margin * 2;
    const cardH = cssH - margin * 2;

    // Scale radius relative to a 280px reference card width
    const rScale = cardW / 280;
    const r = Math.min(style.radius * rScale, cardH / 3, cardW / 3);

    // Shadow
    if (style.shadow.opacity > 0) {
        ctx.save();
        ctx.shadowColor = style.shadow.color;
        ctx.shadowBlur = style.shadow.blur * rScale * 0.5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = style.shadow.offsetY * rScale * 0.4;
        ctx.globalAlpha = Math.min(style.shadow.opacity * 0.8, 0.9);
        rrPath(ctx, cardX, cardY, cardW, cardH, r);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.restore();
    }

    // Clip to card
    ctx.save();
    rrPath(ctx, cardX, cardY, cardW, cardH, r);
    ctx.clip();

    // Background
    const { background } = style;

    if (background.type === 'solid') {
        ctx.fillStyle = background.colors[0];
        ctx.fillRect(cardX, cardY, cardW, cardH);
    } else {
        const angleRad = (background.angle * Math.PI) / 180;
        const dx = Math.sin(angleRad);
        const dy = -Math.cos(angleRad);
        const halfDiag = Math.sqrt(cardW * cardW + cardH * cardH) / 2;
        const cx = cardX + cardW / 2;
        const cy = cardY + cardH / 2;
        const grad = ctx.createLinearGradient(
            cx - dx * halfDiag,
            cy - dy * halfDiag,
            cx + dx * halfDiag,
            cy + dy * halfDiag,
        );
        grad.addColorStop(0, background.colors[0]);
        grad.addColorStop(1, background.colors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(cardX, cardY, cardW, cardH);
    }

    // Image
    if (img) {
        const padScale = cardW / 280;
        const pad = Math.max(style.padding * padScale * 0.38, 4);
        const imgAreaX = cardX + pad;
        const imgAreaY = cardY + pad;
        const imgAreaW = cardW - pad * 2;
        const imgAreaH = cardH - pad * 2;

        if (imgAreaW > 0 && imgAreaH > 0) {
            const scale = Math.min(
                imgAreaW / img.naturalWidth,
                imgAreaH / img.naturalHeight,
            );
            const scaledW = img.naturalWidth * scale;
            const scaledH = img.naturalHeight * scale;
            ctx.drawImage(
                img,
                imgAreaX + (imgAreaW - scaledW) / 2,
                imgAreaY + (imgAreaH - scaledH) / 2,
                scaledW,
                scaledH,
            );
        }
    }

    ctx.restore();

    // Border
    if (style.border.opacity > 0) {
        ctx.save();
        rrPath(ctx, cardX, cardY, cardW, cardH, r);
        ctx.strokeStyle = `rgba(255,255,255,${style.border.opacity})`;
        ctx.lineWidth = Math.max(style.border.width, 0.5);
        ctx.stroke();
        ctx.restore();
    }
}

// ── Hero interactive grid ─────────────────────────────────────────────────────
const heroSectionRef = ref<HTMLElement | null>(null);
const heroMx = ref('50%');
const heroMy = ref('50%');

function onHeroMouseMove(e: MouseEvent): void {
    const el = heroSectionRef.value;

    if (!el) {
        return;
    }

    const rect = el.getBoundingClientRect();
    heroMx.value = `${((e.clientX - rect.left) / rect.width) * 100}%`;
    heroMy.value = `${((e.clientY - rect.top) / rect.height) * 100}%`;
}

// ── Hero cycling ──────────────────────────────────────────────────────────────
const heroCanvas = ref<HTMLCanvasElement | null>(null);
const heroOpacity = ref<number>(1);
const HERO_SLUGS = ['obsidian-glass', 'neon-halo', 'arctic-white'];
let heroIdx = 0;
let heroCycleTimer: ReturnType<typeof setInterval> | null = null;

async function renderHero(slug: string): Promise<void> {
    const canvas = heroCanvas.value;

    if (!canvas) {
        return;
    }

    const style = styles.find((s) => s.slug === slug);

    if (!style) {
        return;
    }

    const img = await loadDemoImage();
    renderStyleFrame(canvas, style, img);
}

function startHeroCycle(): void {
    heroCycleTimer = setInterval(async () => {
        heroIdx = (heroIdx + 1) % HERO_SLUGS.length;
        heroOpacity.value = 0;
        await new Promise<void>((r) => setTimeout(r, 320));
        await renderHero(HERO_SLUGS[heroIdx]);
        heroOpacity.value = 1;
    }, 3000);
}

// ── Style gallery ─────────────────────────────────────────────────────────────
const galleryRefs = ref<(HTMLCanvasElement | null)[]>(
    new Array(styles.length).fill(null) as (HTMLCanvasElement | null)[],
);

function setGalleryRef(el: HTMLCanvasElement | null, i: number): void {
    galleryRefs.value[i] = el;
}

// ── Before / After ────────────────────────────────────────────────────────────
const baContainerRef = ref<HTMLDivElement | null>(null);
const baBeforeCanvas = ref<HTMLCanvasElement | null>(null);
const baAfterCanvas = ref<HTMLCanvasElement | null>(null);
const baDivPct = ref<number>(50);
let baIsDragging = false;

function baMoveAt(clientX: number): void {
    const container = baContainerRef.value;

    if (!container) {
        return;
    }

    const rect = container.getBoundingClientRect();
    baDivPct.value = Math.min(
        Math.max(((clientX - rect.left) / rect.width) * 100, 0),
        100,
    );
}

function onBaMouseDown(e: MouseEvent): void {
    baIsDragging = true;
    baMoveAt(e.clientX);
}

function onWindowMouseMove(e: MouseEvent): void {
    if (baIsDragging) {
        baMoveAt(e.clientX);
    }
}

function onWindowMouseUp(): void {
    baIsDragging = false;
}

function onBaTouchMove(e: TouchEvent): void {
    if (e.cancelable) {
        e.preventDefault();
    }

    baMoveAt(e.touches[0].clientX);
}

function onBaKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft') {
        baDivPct.value = Math.max(baDivPct.value - (e.shiftKey ? 10 : 5), 0);
    } else if (e.key === 'ArrowRight') {
        baDivPct.value = Math.min(baDivPct.value + (e.shiftKey ? 10 : 5), 100);
    }
}

function renderBefore(img: HTMLImageElement): void {
    const canvas = baBeforeCanvas.value;

    if (!canvas) {
        return;
    }

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const cssW = canvas.offsetWidth || 760;
    const cssH = canvas.offsetHeight || 420;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(0, 0, cssW, cssH);
    const pad = cssW * 0.06;
    const scale = Math.min(
        (cssW - pad * 2) / img.naturalWidth,
        (cssH - pad * 2) / img.naturalHeight,
    );
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    ctx.drawImage(
        img,
        pad + (cssW - pad * 2 - sw) / 2,
        pad + (cssH - pad * 2 - sh) / 2,
        sw,
        sh,
    );
}

// ── Competitive table data ────────────────────────────────────────────────────
const compRows = [
    {
        feature: 'Named style system',
        polsh: true,
        screely: false,
        pika: false,
        brandbird: true,
    },
    {
        feature: 'Multi-image sessions',
        polsh: true,
        screely: false,
        pika: false,
        brandbird: false,
    },
    {
        feature: 'SVG export',
        polsh: true,
        screely: false,
        pika: false,
        brandbird: false,
    },
    {
        feature: 'REST API',
        polsh: true,
        screely: false,
        pika: false,
        brandbird: false,
    },
    {
        feature: 'No watermark (free)',
        polsh: true,
        screely: true,
        pika: false,
        brandbird: false,
    },
    {
        feature: 'Export history',
        polsh: true,
        screely: false,
        pika: false,
        brandbird: false,
    },
    {
        feature: 'Saved presets',
        polsh: true,
        screely: false,
        pika: true,
        brandbird: true,
    },
];

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
    const img = await loadDemoImage();

    // Hero
    await renderHero(HERO_SLUGS[heroIdx]);
    startHeroCycle();

    // Style gallery
    styles.forEach((style, i) => {
        const canvas = galleryRefs.value[i];

        if (canvas) {
            renderStyleFrame(canvas, style, img);
        }
    });

    // Before canvas (raw, greyed by CSS filter)
    renderBefore(img);

    // After canvas (obsidian-glass styled)
    if (baAfterCanvas.value) {
        renderStyleFrame(baAfterCanvas.value, styles[0], img);
    }

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
});

onUnmounted(() => {
    if (heroCycleTimer) {
        clearInterval(heroCycleTimer);
    }

    window.removeEventListener('mousemove', onWindowMouseMove);
    window.removeEventListener('mouseup', onWindowMouseUp);
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
        <meta property="og:url" content="https://polsh.work/" />
        <meta name="twitter:card" :content="twitterCard" />
        <meta name="twitter:title" :content="fullTitle" />
        <meta name="twitter:description" :content="description" />
        <meta name="twitter:image" :content="ogImage" />
        <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
        <component :is="'script'" type="application/ld+json" v-html="jsonLd" />
    </Head>

    <PublicLayout>
        <!-- ── §1 Hero ─────────────────────────────────────────────────────── -->
        <section
            ref="heroSectionRef"
            class="hero"
            :style="{ '--hero-mx': heroMx, '--hero-my': heroMy }"
            @mousemove="onHeroMouseMove"
        >
            <div class="hero-grid-bg" aria-hidden="true" />
            <div class="hero-glow" aria-hidden="true" />

            <div class="container hero-container">
                <div class="hero-inner">
                    <div class="hero-copy">
                        <div class="beta-pill">
                            <span class="beta-dot" aria-hidden="true" />
                            Open beta · Free while we build
                        </div>

                        <h1 class="hero-h1">
                            Polish your<br />
                            <em class="hero-em">screenshots.</em>
                        </h1>

                        <p class="hero-p">
                            Drop in a screenshot. Pick a style. Export a stunning PNG,
                            WebP, or SVG — no Figma plugins, no install required.
                        </p>

                        <div class="hero-actions">
                            <Link :href="editor()" class="btn-primary">Open the editor →</Link>
                        </div>

                        <div class="hero-pills">
                            <span class="hero-pill">Free forever</span>
                            <span class="hero-dot" aria-hidden="true">·</span>
                            <span class="hero-pill">No watermarks</span>
                            <span class="hero-dot" aria-hidden="true">·</span>
                            <span class="hero-pill">Works in your browser</span>
                        </div>
                    </div>

                    <div class="hero-visual">
                        <div class="hero-canvas-wrap">
                            <div class="hero-canvas-glow" aria-hidden="true" />
                            <canvas
                                ref="heroCanvas"
                                class="hero-canvas"
                                :style="{ opacity: heroOpacity }"
                                width="800"
                                height="520"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── §2 Social proof strip ──────────────────────────────────────── -->
        <div class="stats-strip">
            <div class="container">
                <div class="stats-inner">
                    <p class="stats-label">Built for developers who ship.</p>
                    <div class="stats-pills">
                        <span class="stats-pill">18 styles</span>
                        <span class="stats-sep" aria-hidden="true">·</span>
                        <span class="stats-pill">Browser-native</span>
                        <span class="stats-sep" aria-hidden="true">·</span>
                        <span class="stats-pill">No watermarks</span>
                        <span class="stats-sep" aria-hidden="true">·</span>
                        <span class="stats-pill">No Figma required</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── §3 Style showcase ──────────────────────────────────────────── -->
        <section class="styles-section">
            <div class="container">
                <p class="section-label">18 ready-to-use styles</p>
            </div>
            <div class="styles-scroll-wrap">
                <div class="styles-strip">
                    <div
                        v-for="(style, i) in styles"
                        :key="style.slug"
                        class="style-card"
                    >
                        <canvas
                            :ref="(el) => setGalleryRef(el as HTMLCanvasElement | null, i)"
                            class="style-canvas"
                        />
                        <span class="style-name">{{ style.name }}</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── §4 Bento features ──────────────────────────────────────────── -->
        <section class="bento-section">
            <div class="container">
                <h2 class="section-heading">Everything you need to ship polished screenshots.</h2>

                <div class="bento-grid">
                    <!-- Brand Sessions — tall left card -->
                    <div class="bento-card bento-card--brand">
                        <div class="bento-icon-wrap">
                            <Layers class="bento-icon" aria-hidden="true" />
                        </div>
                        <h3 class="bento-title">Brand Sessions</h3>
                        <p class="bento-desc">
                            Save padding, radius, shadow, and color combos as named presets.
                            Apply in one click across every screenshot in a session. Your brand,
                            every time.
                        </p>
                    </div>

                    <!-- Named Styles — top center -->
                    <div class="bento-card">
                        <div class="bento-icon-wrap">
                            <Palette class="bento-icon" aria-hidden="true" />
                        </div>
                        <h3 class="bento-title">Named Styles</h3>
                        <p class="bento-desc">
                            18 hand-crafted styles from minimal white to neon-halo dark. One
                            click, instant results.
                        </p>
                    </div>

                    <!-- SVG Export — top right -->
                    <div class="bento-card">
                        <div class="bento-icon-wrap">
                            <FileCode class="bento-icon" aria-hidden="true" />
                        </div>
                        <h3 class="bento-title">SVG Export</h3>
                        <p class="bento-desc">
                            Export lossless vector frames — perfect for Notion, Figma docs, and
                            README headers.
                        </p>
                    </div>

                    <!-- Batch Export — bottom center -->
                    <div class="bento-card">
                        <div class="bento-icon-wrap">
                            <Archive class="bento-icon" aria-hidden="true" />
                        </div>
                        <h3 class="bento-title">Batch Export</h3>
                        <p class="bento-desc">
                            Style up to 10 screenshots at once and download as a ZIP. One
                            consistent look for your whole launch.
                        </p>
                    </div>

                    <!-- REST API — bottom right -->
                    <div class="bento-card">
                        <div class="bento-icon-wrap">
                            <Zap class="bento-icon" aria-hidden="true" />
                        </div>
                        <h3 class="bento-title">REST API</h3>
                        <p class="bento-desc">
                            Automate via <code>POST /api/v1/glaze</code>. Style screenshots
                            straight from your CI pipeline or build scripts.
                            <Link :href="apiDocs()" class="bento-link">View API docs →</Link>
                        </p>
                    </div>

                    <!-- Export History — full-width bottom -->
                    <div class="bento-card bento-card--history">
                        <div class="bento-icon-wrap">
                            <Clock class="bento-icon" aria-hidden="true" />
                        </div>
                        <h3 class="bento-title">Export History</h3>
                        <p class="bento-desc">
                            Every export is saved to your account. Re-download, re-apply styles,
                            or share with your team.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── §5 Before / After ──────────────────────────────────────────── -->
        <section class="ba-section">
            <div class="container">
                <div class="ba-header">
                    <h2 class="section-heading">One click. That's the whole workflow.</h2>
                    <p class="section-sub">Drag the handle to see the difference.</p>
                </div>

                <div
                    ref="baContainerRef"
                    class="ba-container"
                    role="group"
                    aria-label="Before and after screenshot comparison"
                    @mousedown="onBaMouseDown"
                >
                    <!-- Before (raw) -->
                    <canvas
                        ref="baBeforeCanvas"
                        class="ba-canvas ba-canvas--before"
                        aria-hidden="true"
                    />
                    <div class="ba-label ba-label--before">Before</div>

                    <!-- After (styled, clipped from left) -->
                    <canvas
                        ref="baAfterCanvas"
                        class="ba-canvas ba-canvas--after"
                        :style="{ clipPath: `inset(0 0 0 ${baDivPct}%)` }"
                        aria-hidden="true"
                    />
                    <div
                        class="ba-label ba-label--after"
                        :style="{ left: `${Math.min(baDivPct + 3, 88)}%` }"
                    >
                        After
                    </div>

                    <!-- Divider line + handle -->
                    <div
                        class="ba-divider"
                        :style="{ left: `${baDivPct}%` }"
                        role="slider"
                        :aria-valuenow="Math.round(baDivPct)"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label="Comparison divider — use arrow keys to move"
                        tabindex="0"
                        @keydown="onBaKeyDown"
                        @touchstart.passive="baIsDragging = true"
                        @touchmove="onBaTouchMove"
                        @touchend="baIsDragging = false"
                    >
                        <div class="ba-handle">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M5 3L1 7L5 11M9 3L13 7L9 11"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── §6 How it works ────────────────────────────────────────────── -->
        <section class="hiw-section">
            <div class="container">
                <h2 class="section-heading">Simple by design.</h2>
                <p class="section-sub">Three steps from screenshot to share-ready.</p>

                <div class="hiw-steps">
                    <div class="hiw-step">
                        <span class="hiw-num">01</span>
                        <h3 class="hiw-title">Drop</h3>
                        <p class="hiw-desc">Paste or drag any screenshot into the browser-based editor. No install required.</p>
                    </div>

                    <div class="hiw-connector" aria-hidden="true" />

                    <div class="hiw-step">
                        <span class="hiw-num">02</span>
                        <h3 class="hiw-title">Style</h3>
                        <p class="hiw-desc">Pick from 18 hand-crafted styles or fine-tune padding, radius, shadow, and background.</p>
                    </div>

                    <div class="hiw-connector" aria-hidden="true" />

                    <div class="hiw-step">
                        <span class="hiw-num">03</span>
                        <h3 class="hiw-title">Export</h3>
                        <p class="hiw-desc">Download as PNG, WebP, or SVG. Share it instantly — no watermarks, ever.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── §7 Competitive table ───────────────────────────────────────── -->
        <section class="table-section">
            <div class="container">
                <h2 class="section-heading">Why Polsh?</h2>
                <p class="section-sub">We built what we wanted for ourselves — and made it free.</p>

                <div class="table-scroll">
                    <table class="comp-table">
                        <thead>
                            <tr>
                                <th class="comp-th-feat">Feature</th>
                                <th class="comp-th comp-th--polsh">Polsh</th>
                                <th class="comp-th">Screely</th>
                                <th class="comp-th">Pika</th>
                                <th class="comp-th">BrandBird</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in compRows" :key="row.feature" class="comp-row">
                                <td class="comp-feat">{{ row.feature }}</td>
                                <td class="comp-cell comp-cell--polsh">
                                    <span v-if="row.polsh" class="comp-check">✓</span>
                                    <span v-else class="comp-dash">—</span>
                                </td>
                                <td class="comp-cell">
                                    <span v-if="row.screely" class="comp-check-dim">✓</span>
                                    <span v-else class="comp-dash">—</span>
                                </td>
                                <td class="comp-cell">
                                    <span v-if="row.pika" class="comp-check-dim">✓</span>
                                    <span v-else class="comp-dash">—</span>
                                </td>
                                <td class="comp-cell">
                                    <span v-if="row.brandbird" class="comp-check-dim">✓</span>
                                    <span v-else class="comp-dash">—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- ── §8 Pricing teaser ──────────────────────────────────────────── -->
        <section class="pricing-section">
            <div class="container">
                <h2 class="section-heading">Start free. Upgrade when you're ready.</h2>
                <p class="section-sub">No credit card required to start.</p>

                <div class="pricing-cards">
                    <!-- Free -->
                    <div class="pricing-card">
                        <div class="pricing-plan-name">Free</div>
                        <div class="pricing-price">$0 <span class="pricing-period">/mo</span></div>
                        <ul class="pricing-features">
                            <li>10 exports per session</li>
                            <li>3 saved presets</li>
                            <li>All 18 styles</li>
                            <li>No watermarks</li>
                            <li>Browser-native — no install</li>
                        </ul>
                        <Link :href="editor()" class="pricing-cta pricing-cta--free">Open editor →</Link>
                    </div>

                    <!-- Pro -->
                    <div class="pricing-card pricing-card--pro">
                        <div class="pricing-plan-name">Pro</div>
                        <div class="pricing-price pricing-price--pro">
                            <span class="pricing-pro-label">Affordable</span>
                        </div>
                        <ul class="pricing-features">
                            <li>Unlimited exports</li>
                            <li>50 saved presets</li>
                            <li>Brand sessions</li>
                            <li>REST API access</li>
                            <li>Export history</li>
                        </ul>
                        <Link href="/settings/billing" class="pricing-cta pricing-cta--pro">View Pro pricing →</Link>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── §9 Closing CTA strip ───────────────────────────────────────── -->
        <section class="cta-strip">
            <div class="container">
                <div class="cta-inner">
                    <h2 class="cta-heading">Start polishing today.</h2>
                    <p class="cta-sub">Free forever. No watermarks. No Figma required.</p>
                    <Link :href="editor()" class="btn-primary cta-btn">Open the editor →</Link>
                </div>
            </div>
        </section>
    </PublicLayout>
</template>

<style scoped>
/* ── Shared ─────────────────────────────────────────────────────────────────── */
.container {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-heading {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 600;
    color: #f0f0f2;
    letter-spacing: -0.035em;
    line-height: 1.2;
    margin: 0 0 0.875rem;
}

.section-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    color: #8a8a9a;
    margin: 0 0 3rem;
    line-height: 1.6;
}

.section-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: #4a4a5a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 1.25rem;
}

.btn-primary {
    font-family: 'DM Mono', monospace;
    font-size: 0.875rem;
    font-weight: 500;
    color: #0a0a0c;
    background: #e0ff4f;
    padding: 0.6875rem 1.5rem;
    border-radius: 7px;
    text-decoration: none;
    letter-spacing: -0.01em;
    transition: opacity 0.15s ease;
    display: inline-block;
}

.btn-primary:hover {
    opacity: 0.88;
}

/* ── §1 Hero ─────────────────────────────────────────────────────────────── */
.hero {
    position: relative;
    padding: 5rem 0 4rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    overflow: hidden;
}

.hero-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
}

.hero-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at var(--hero-mx, 50%) var(--hero-my, 50%),
        rgba(224, 255, 79, 0.06) 0%,
        transparent 55%
    );
    pointer-events: none;
    transition: background 0.08s ease;
}

.hero-container {
    position: relative;
    z-index: 1;
}

.hero-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.hero-copy {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.beta-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: #8a8a9a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.3125rem 0.75rem;
    border-radius: 100px;
    margin-bottom: 1.75rem;
    width: fit-content;
}

.beta-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e0ff4f;
    flex-shrink: 0;
    box-shadow: 0 0 6px rgba(224, 255, 79, 0.7);
}

.hero-h1 {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(2.5rem, 5vw, 3.75rem);
    font-weight: 700;
    color: #f0f0f2;
    letter-spacing: -0.04em;
    line-height: 1.05;
    margin: 0 0 1.25rem;
}

.hero-em {
    font-style: normal;
    color: #e0ff4f;
}

.hero-p {
    font-family: 'DM Sans', sans-serif;
    font-size: 1.0625rem;
    color: #8a8a9a;
    line-height: 1.7;
    margin: 0 0 2rem;
    max-width: 32rem;
}

.hero-actions {
    margin-bottom: 1.25rem;
}

.hero-pills {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.hero-pill {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8125rem;
    color: #4a4a5a;
}

.hero-dot {
    color: #2a2a35;
    font-size: 0.875rem;
}

.hero-visual {
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero-canvas-wrap {
    position: relative;
    width: 100%;
    border-radius: 14px;
    overflow: visible;
    animation: heroFloat 7s ease-in-out infinite;
}

@keyframes heroFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

.hero-canvas-glow {
    position: absolute;
    inset: -20px;
    border-radius: 24px;
    background: radial-gradient(ellipse at 50% 50%, rgba(224, 255, 79, 0.12) 0%, transparent 70%);
    filter: blur(20px);
    pointer-events: none;
    z-index: 0;
}

.hero-canvas {
    position: relative;
    z-index: 1;
    width: 100%;
    height: auto;
    display: block;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    box-shadow:
        0 0 0 1px rgba(224, 255, 79, 0.06),
        0 24px 80px rgba(0, 0, 0, 0.6),
        0 4px 16px rgba(0, 0, 0, 0.4);
    transition: opacity 0.32s ease;
}

/* ── §2 Stats strip ──────────────────────────────────────────────────────── */
.stats-strip {
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    padding: 1.25rem 0;
}

.stats-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.stats-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: #4a4a5a;
    margin: 0;
}

.stats-pills {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.stats-pill {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: #8a8a9a;
}

.stats-sep {
    color: #2a2a35;
}

/* ── §3 Style showcase ───────────────────────────────────────────────────── */
.styles-section {
    padding: 4rem 0 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.styles-scroll-wrap {
    overflow-x: auto;
    padding: 0 1.5rem 3rem;
    scrollbar-width: none;
}

.styles-scroll-wrap::-webkit-scrollbar {
    display: none;
}

.styles-strip {
    display: flex;
    gap: 1px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    overflow: hidden;
    width: max-content;
    min-width: 100%;
}

.style-card {
    flex: 0 0 190px;
    background: #111114;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.style-canvas {
    width: 190px;
    height: 120px;
    display: block;
}

.style-name {
    font-family: 'DM Mono', monospace;
    font-size: 0.6875rem;
    color: #4a4a5a;
    padding: 0.625rem 0.875rem;
    letter-spacing: -0.01em;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ── §4 Bento features ───────────────────────────────────────────────────── */
.bento-section {
    padding: 5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto auto;
    gap: 1px;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    overflow: hidden;
}

.bento-card {
    background: #111114;
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    transition: background 0.15s ease;
}

.bento-card:hover {
    background: #141417;
}

/* Brand Sessions: row 1-2, col 1 */
.bento-card--brand {
    grid-row: span 2;
}

/* Export History: col 1-3, last row */
.bento-card--history {
    grid-column: span 3;
    flex-direction: row;
    align-items: flex-start;
    gap: 1.25rem;
}

.bento-card--history .bento-desc {
    margin: 0;
}

.bento-icon-wrap {
    width: 2.25rem;
    height: 2.25rem;
    background: rgba(224, 255, 79, 0.08);
    border: 1px solid rgba(224, 255, 79, 0.2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.bento-icon {
    width: 1rem;
    height: 1rem;
    color: #e0ff4f;
    stroke-width: 1.75;
}

.bento-title {
    font-family: 'DM Mono', monospace;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #f0f0f2;
    letter-spacing: -0.01em;
    margin: 0;
}

.bento-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: #8a8a9a;
    line-height: 1.65;
    margin: 0;
}

.bento-desc code {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: #e0ff4f;
    background: rgba(224, 255, 79, 0.08);
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
}

.bento-link {
    display: inline-block;
    margin-top: 0.625rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: #e0ff4f;
    text-decoration: none;
    border-bottom: 1px solid rgba(224, 255, 79, 0.3);
    transition: border-color 0.15s ease;
}

.bento-link:hover {
    border-color: #e0ff4f;
}

/* ── §5 Before / After ───────────────────────────────────────────────────── */
.ba-section {
    padding: 5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.ba-header {
    margin-bottom: 2.5rem;
}

.ba-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    overflow: hidden;
    cursor: col-resize;
    border: 1px solid rgba(255, 255, 255, 0.08);
    user-select: none;
}

.ba-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

.ba-canvas--before {
    filter: grayscale(0.6) brightness(0.75);
}

.ba-label {
    position: absolute;
    top: 1rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    padding: 0.25rem 0.625rem;
    border-radius: 4px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    pointer-events: none;
}

.ba-label--before {
    left: 1rem;
}

.ba-label--after {
    transition: left 0.05s linear;
}

.ba-divider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.6);
    transform: translateX(-50%);
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
}

.ba-divider:focus-visible {
    background: #e0ff4f;
}

.ba-handle {
    width: 2rem;
    height: 2rem;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0a0a0c;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    flex-shrink: 0;
}

/* ── §6 How it works ─────────────────────────────────────────────────────── */
.hiw-section {
    padding: 5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.hiw-steps {
    display: flex;
    align-items: flex-start;
    gap: 0;
}

.hiw-step {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 2rem;
}

.hiw-step:first-child {
    padding-left: 0;
}

.hiw-step:last-child {
    padding-right: 0;
}

.hiw-connector {
    flex-shrink: 0;
    width: 3rem;
    height: 1px;
    background: repeating-linear-gradient(
        to right,
        rgba(255, 255, 255, 0.15) 0,
        rgba(255, 255, 255, 0.15) 4px,
        transparent 4px,
        transparent 10px
    );
    margin-top: 1.125rem;
    align-self: flex-start;
}

.hiw-num {
    font-family: 'DM Mono', monospace;
    font-size: 2rem;
    font-weight: 500;
    color: #e0ff4f;
    letter-spacing: -0.04em;
    line-height: 1;
    opacity: 0.7;
}

.hiw-title {
    font-family: 'DM Mono', monospace;
    font-size: 1.0625rem;
    font-weight: 500;
    color: #f0f0f2;
    letter-spacing: -0.02em;
    margin: 0;
}

.hiw-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: #8a8a9a;
    line-height: 1.65;
    margin: 0;
}

/* ── §7 Competitive table ─────────────────────────────────────────────────── */
.table-section {
    padding: 5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.table-scroll {
    overflow-x: auto;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    overflow: hidden;
}

.comp-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
}

.comp-th-feat {
    padding: 1rem 1.5rem;
    text-align: left;
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: #4a4a5a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: #111114;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    min-width: 12rem;
}

.comp-th {
    padding: 1rem 1.5rem;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: #8a8a9a;
    background: #111114;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    font-weight: 500;
    min-width: 7rem;
}

.comp-th--polsh {
    color: #e0ff4f;
    background: rgba(224, 255, 79, 0.04);
}

.comp-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.1s ease;
}

.comp-row:last-child {
    border-bottom: none;
}

.comp-row:hover {
    background: rgba(255, 255, 255, 0.02);
}

.comp-feat {
    padding: 0.875rem 1.5rem;
    color: #8a8a9a;
    font-size: 0.9rem;
    background: #0e0e11;
}

.comp-cell {
    padding: 0.875rem 1.5rem;
    text-align: center;
    background: #0e0e11;
    font-size: 1rem;
}

.comp-cell--polsh {
    background: rgba(224, 255, 79, 0.03);
}

.comp-check {
    color: #e0ff4f;
    font-weight: 600;
}

.comp-check-dim {
    color: #4a4a5a;
    font-weight: 500;
}

.comp-dash {
    color: #2a2a35;
}

/* ── §8 Pricing ───────────────────────────────────────────────────────────── */
.pricing-section {
    padding: 5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.pricing-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    max-width: 42rem;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    overflow: hidden;
}

.pricing-card {
    background: #111114;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.pricing-card--pro {
    background: #12120f;
    box-shadow: inset 0 1px 0 rgba(224, 255, 79, 0.2);
}

.pricing-plan-name {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: #4a4a5a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.pricing-price {
    font-family: 'DM Mono', monospace;
    font-size: 2.25rem;
    font-weight: 500;
    color: #f0f0f2;
    letter-spacing: -0.04em;
    line-height: 1;
}

.pricing-period {
    font-size: 1rem;
    color: #4a4a5a;
    font-weight: 400;
}

.pricing-price--pro {
    font-size: 1rem;
}

.pricing-pro-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    color: #e0ff4f;
    letter-spacing: normal;
    font-weight: 500;
}

.pricing-features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    flex: 1;
}

.pricing-features li {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: #8a8a9a;
    padding-left: 1.25rem;
    position: relative;
}

.pricing-features li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #e0ff4f;
    font-size: 0.75rem;
    top: 1px;
}

.pricing-cta {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    font-weight: 500;
    padding: 0.625rem 1rem;
    border-radius: 7px;
    text-decoration: none;
    text-align: center;
    transition: opacity 0.15s ease;
    display: block;
    letter-spacing: -0.01em;
}

.pricing-cta--free {
    background: rgba(255, 255, 255, 0.07);
    color: #f0f0f2;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.pricing-cta--free:hover {
    background: rgba(255, 255, 255, 0.1);
}

.pricing-cta--pro {
    background: #e0ff4f;
    color: #0a0a0c;
}

.pricing-cta--pro:hover {
    opacity: 0.88;
}

/* ── §9 CTA strip ─────────────────────────────────────────────────────────── */
.cta-strip {
    padding: 5rem 0;
    background: #0d0d10;
    position: relative;
    overflow: hidden;
}

.cta-strip::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(224, 255, 79, 0.3), transparent);
}

.cta-strip::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 60% 60% at 50% 100%, black 0%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 100%, black 0%, transparent 100%);
    pointer-events: none;
}

.cta-inner {
    position: relative;
    z-index: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.cta-heading {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 700;
    color: #f0f0f2;
    letter-spacing: -0.04em;
    line-height: 1.1;
    margin: 0;
}

.cta-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    color: #8a8a9a;
    margin: 0;
}

.cta-btn {
    margin-top: 0.5rem;
    padding: 0.8125rem 2rem;
    font-size: 0.9375rem;
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
    .hero-inner {
        grid-template-columns: 1fr;
        gap: 2.5rem;
    }

    .hero {
        padding: 3.5rem 0 3rem;
    }

    .bento-grid {
        grid-template-columns: 1fr 1fr;
    }

    .bento-card--brand {
        grid-row: span 1;
        grid-column: span 2;
    }

    .bento-card--history {
        grid-column: span 2;
        flex-direction: column;
    }

    .hiw-steps {
        flex-direction: column;
        gap: 2rem;
    }

    .hiw-connector {
        display: none;
    }

    .hiw-step {
        padding: 0;
    }

    .pricing-cards {
        grid-template-columns: 1fr;
        max-width: 22rem;
    }
}

@media (max-width: 600px) {
    .hero-h1 {
        font-size: 2.25rem;
    }

    .bento-grid {
        grid-template-columns: 1fr;
    }

    .bento-card--brand,
    .bento-card--history {
        grid-column: span 1;
    }

    .section-heading {
        font-size: 1.5rem;
    }
}
</style>
