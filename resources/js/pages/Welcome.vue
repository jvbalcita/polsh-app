<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { Layers, Palette, FileCode, Zap, Archive } from 'lucide-vue-next';
import { ref, onMounted, onUnmounted } from 'vue';
import UserMenu from '@/components/UserMenu.vue';
import { editor } from '@/routes';
import styles from '@/styles';

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
    if (cr > 0) ctx.arcTo(x + w, y, x + w, y + cr, cr);
    else ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - cr);
    if (cr > 0) ctx.arcTo(x + w, y + h, x + w - cr, y + h, cr);
    else ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + cr, y + h);
    if (cr > 0) ctx.arcTo(x, y + h, x, y + h - cr, cr);
    else ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + cr);
    if (cr > 0) ctx.arcTo(x, y, x + cr, y, cr);
    else ctx.lineTo(x, y);
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
    if (!ctx) return;
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

// ── Hero cycling ──────────────────────────────────────────────────────────────
const heroCanvas = ref<HTMLCanvasElement | null>(null);
const heroOpacity = ref<number>(1);
const HERO_SLUGS = ['obsidian-glass', 'neon-halo', 'arctic-white'];
let heroIdx = 0;
let heroCycleTimer: ReturnType<typeof setInterval> | null = null;

async function renderHero(slug: string): Promise<void> {
    const canvas = heroCanvas.value;
    if (!canvas) return;
    const style = styles.find((s) => s.slug === slug);
    if (!style) return;
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
    if (!container) return;
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
    if (baIsDragging) baMoveAt(e.clientX);
}

function onWindowMouseUp(): void {
    baIsDragging = false;
}

function onBaTouchMove(e: TouchEvent): void {
    if (e.cancelable) e.preventDefault();
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
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const cssW = canvas.offsetWidth || 760;
    const cssH = canvas.offsetHeight || 420;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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
        feature: 'SVG vector export',
        polsh: true,
        screely: false,
        pika: false,
        brandbird: false,
    },
    {
        feature: 'REST API access',
        polsh: true,
        screely: false,
        pika: false,
        brandbird: false,
    },
    {
        feature: 'Batch ZIP export',
        polsh: true,
        screely: false,
        pika: false,
        brandbird: false,
    },
    {
        feature: 'Free open beta',
        polsh: true,
        screely: false,
        pika: true,
        brandbird: false,
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
        if (canvas) renderStyleFrame(canvas, style, img);
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
    if (heroCycleTimer) clearInterval(heroCycleTimer);
    window.removeEventListener('mousemove', onWindowMouseMove);
    window.removeEventListener('mouseup', onWindowMouseUp);
});
</script>

<template>
    <Head title="Polish your screenshots" />

    <div class="lp-root">
        <!-- ── Nav ── -->
        <nav class="lp-nav">
            <span class="lp-wordmark">polsh</span>
            <div class="lp-nav-right">
                <Link :href="editor()" class="btn-editor">Open editor →</Link>
                <UserMenu />
            </div>
        </nav>

        <!-- ── Hero ── -->
        <section class="hero-section">
            <div class="hero-copy">
                <div class="beta-badge">
                    <span class="beta-dot" />
                    Open beta · Free while we build
                </div>

                <h1 class="hero-h1">
                    Polish your<br />
                    <span class="hero-accent">screenshots.</span>
                </h1>

                <p class="hero-body">
                    Drop in a screenshot. Pick a style. Export a stunning PNG,
                    WebP, or SVG — no Figma plugins, no subscriptions.
                </p>

                <div class="hero-ctas">
                    <Link :href="editor()" class="btn-primary"
                        >Open the editor →</Link
                    >
                    <a href="/auth/github" class="btn-ghost">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                            />
                        </svg>
                        Save presets with GitHub
                    </a>
                </div>

                <p class="hero-footnote">
                    Free forever · No watermark · Works in your browser
                </p>
            </div>

            <div class="hero-demo-wrap">
                <div class="hero-demo">
                    <canvas
                        ref="heroCanvas"
                        class="hero-canvas"
                        :style="{ opacity: heroOpacity }"
                        width="800"
                        height="520"
                    />
                </div>
            </div>
        </section>

        <!-- ── Style gallery ── -->
        <section class="gallery-section">
            <p class="gallery-label">18 ready-to-use styles</p>
            <div class="style-gallery">
                <div
                    v-for="(style, i) in styles"
                    :key="style.slug"
                    class="style-gallery-card"
                >
                    <canvas
                        :ref="
                            (el) =>
                                setGalleryRef(el as HTMLCanvasElement | null, i)
                        "
                        class="gallery-canvas"
                    />
                    <div class="style-gallery-card-name">{{ style.name }}</div>
                </div>
            </div>
        </section>

        <!-- ── Features ── -->
        <section class="features-section">
            <h2 class="section-heading">Built for developers who ship.</h2>
            <div class="features-grid">
                <!-- Brand Sessions — large (row-span 2) -->
                <div class="feature-card feature-card--large">
                    <Layers class="feature-icon" aria-hidden="true" />
                    <h3>Brand Sessions</h3>
                    <p>
                        Save padding, radius, shadow, and color combos as named
                        presets. Apply in one click across every screenshot in a
                        session.
                    </p>
                </div>
                <!-- Named Styles -->
                <div class="feature-card">
                    <Palette class="feature-icon" aria-hidden="true" />
                    <h3>Named Styles</h3>
                    <p>
                        18 hand-crafted styles from minimal white to neon-halo
                        dark. One click, instant results.
                    </p>
                </div>
                <!-- SVG Export -->
                <div class="feature-card">
                    <FileCode class="feature-icon" aria-hidden="true" />
                    <h3>SVG Export</h3>
                    <p>
                        Export lossless vector frames — perfect for Notion,
                        Figma docs, and README headers.
                    </p>
                </div>
                <!-- REST API -->
                <div class="feature-card">
                    <Zap class="feature-icon" aria-hidden="true" />
                    <h3>REST API</h3>
                    <p>
                        Automate via <code>POST /api/v1/glaze</code>. Style
                        screenshots straight from your CI pipeline or build
                        scripts.
                    </p>
                </div>
                <!-- Batch Export -->
                <div class="feature-card">
                    <Archive class="feature-icon" aria-hidden="true" />
                    <h3>Batch Export</h3>
                    <p>
                        Style up to 10 screenshots at once and download as a
                        ZIP. One consistent look for your whole launch.
                    </p>
                </div>
            </div>
        </section>

        <!-- ── Before / After ── -->
        <section class="ba-section">
            <div class="ba-header">
                <h2 class="ba-heading">Before and after.</h2>
                <p class="ba-sub">The same screenshot. One click.</p>
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
        </section>

        <!-- ── Competitive table ── -->
        <section class="table-section">
            <h2 class="section-heading" style="margin-bottom: 32px">
                Why Polsh?
            </h2>
            <div class="table-scroll">
                <table class="competitive-table">
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
                        <tr v-for="row in compRows" :key="row.feature">
                            <td class="comp-feat">{{ row.feature }}</td>
                            <td class="comp-cell comp-cell--polsh">
                                <span v-if="row.polsh" class="comp-check"
                                    >✓</span
                                >
                                <span v-else class="comp-dash">—</span>
                            </td>
                            <td class="comp-cell">
                                <span v-if="row.screely" class="comp-check-dim"
                                    >✓</span
                                >
                                <span v-else class="comp-dash">—</span>
                            </td>
                            <td class="comp-cell">
                                <span v-if="row.pika" class="comp-check-dim"
                                    >✓</span
                                >
                                <span v-else class="comp-dash">—</span>
                            </td>
                            <td class="comp-cell">
                                <span
                                    v-if="row.brandbird"
                                    class="comp-check-dim"
                                    >✓</span
                                >
                                <span v-else class="comp-dash">—</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- ── CTA ── -->
        <section class="cta-section">
            <h2 class="cta-heading">
                Ready to ship
                <span style="color: #e0ff4f">beautiful</span> screenshots?
            </h2>
            <p class="cta-sub">
                No account required. Drop a screenshot and go.
            </p>
            <Link :href="editor()" class="btn-primary cta-btn"
                >Start for free →</Link
            >
        </section>

        <!-- ── Footer ── -->
        <footer class="lp-footer">
            <div class="footer-inner">
                <div class="footer-brand">
                    <span class="lp-wordmark">polsh</span>
                    <p class="footer-tagline">
                        © 2026 Polsh · Screenshot styling for developers
                    </p>
                    <p class="footer-ph">Made in the Philippines 🇵🇭</p>
                </div>
                <div class="footer-links">
                    <a href="/changelog" class="footer-link">Changelog</a>
                    <a href="/docs/api" class="footer-link">API Docs</a>
                </div>
                <div class="footer-social">
                    <a
                        href="https://github.com/polsh-app"
                        class="footer-social-link"
                        target="_blank"
                        rel="noopener"
                        aria-label="GitHub"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                            />
                        </svg>
                    </a>
                    <a
                        href="https://twitter.com/polshapp"
                        class="footer-social-link"
                        target="_blank"
                        rel="noopener"
                        aria-label="Twitter / X"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
/* ── Root ──────────────────────────────────────────────────────────────────── */
.lp-root {
    min-height: 100vh;
    background: #0a0a0c;
    color: #f0f0f2;
    overflow-x: hidden;
}

/* ── Nav ───────────────────────────────────────────────────────────────────── */
.lp-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(10, 10, 12, 0.85);
    backdrop-filter: blur(12px);
}

.lp-wordmark {
    font-family: 'DM Mono', monospace;
    font-size: 16px;
    font-weight: 500;
    color: #f0f0f2;
}

.lp-nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.btn-editor {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 6px;
    border: 1px solid rgba(224, 255, 79, 0.3);
    background: transparent;
    color: #e0ff4f;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition:
        background 150ms ease,
        border-color 150ms ease;
}

.btn-editor:hover {
    background: rgba(224, 255, 79, 0.08);
    border-color: rgba(224, 255, 79, 0.5);
}

/* ── Shared buttons ─────────────────────────────────────────────────────────── */
.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 12px 24px;
    border-radius: 6px;
    background: #e0ff4f;
    color: #0a0a0c;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background 150ms ease;
}

.btn-primary:hover {
    background: #ecff7a;
}

.btn-primary:focus-visible {
    outline: 2px solid #e0ff4f;
    outline-offset: 2px;
}

.btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: transparent;
    color: #f0f0f2;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition:
        border-color 150ms ease,
        background 150ms ease;
}

.btn-ghost:hover {
    border-color: rgba(255, 255, 255, 0.22);
    background: #1a1a1f;
}

.btn-ghost:focus-visible {
    outline: 2px solid #e0ff4f;
    outline-offset: 2px;
}

/* ── Hero ───────────────────────────────────────────────────────────────────── */
.hero-section {
    display: grid;
    grid-template-columns: 55fr 45fr;
    align-items: center;
    gap: 48px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 80px 32px 96px;
}

@media (max-width: 900px) {
    .hero-section {
        grid-template-columns: 1fr;
        gap: 48px;
        padding: 56px 20px 72px;
        text-align: center;
    }
}

.beta-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    padding: 6px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #8a8a9a;
    margin-bottom: 28px;
}

.beta-dot {
    width: 6px;
    height: 6px;
    background: #e0ff4f;
    border-radius: 50%;
    flex-shrink: 0;
    animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(0.85);
    }
}

.hero-h1 {
    font-family: 'DM Mono', monospace;
    font-size: clamp(40px, 5vw, 56px);
    line-height: 1.15;
    font-weight: 500;
    color: #f0f0f2;
    margin: 0 0 20px;
}

.hero-accent {
    color: #e0ff4f;
}

.hero-body {
    font-family: 'DM Sans', sans-serif;
    font-size: 17px;
    line-height: 1.7;
    color: #8a8a9a;
    margin: 0 0 32px;
    max-width: 440px;
}

@media (max-width: 900px) {
    .hero-body {
        margin-left: auto;
        margin-right: auto;
    }
}

.hero-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
}

@media (max-width: 900px) {
    .hero-ctas {
        justify-content: center;
    }
}

.hero-footnote {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #4a4a5a;
    margin: 0;
}

.hero-demo-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
}

.hero-demo {
    transform: perspective(1200px) rotateY(-8deg) rotateX(2deg);
    transition: transform 400ms ease;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
    border-radius: 10px;
    overflow: hidden;
    line-height: 0;
}

.hero-demo:hover {
    transform: perspective(1200px) rotateY(-2deg) rotateX(0deg);
}

.hero-canvas {
    width: 400px;
    height: 260px;
    display: block;
    transition: opacity 300ms ease;
}

@media (max-width: 500px) {
    .hero-canvas {
        width: 300px;
        height: 195px;
    }
}

/* ── Style gallery ───────────────────────────────────────────────────────────── */
.gallery-section {
    padding: 0 0 80px;
}

.gallery-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: #4a4a5a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: center;
    margin: 0 0 20px;
}

.style-gallery {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    padding: 0 32px 16px;
}

.style-gallery::-webkit-scrollbar {
    display: none;
}

.style-gallery-card {
    flex-shrink: 0;
    width: 200px;
    height: 130px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    overflow: hidden;
    position: relative;
    scroll-snap-align: start;
    cursor: pointer;
    transition:
        border-color 150ms ease,
        transform 200ms ease;
}

.style-gallery-card:hover {
    border-color: rgba(224, 255, 79, 0.35);
    transform: scale(1.02);
}

.gallery-canvas {
    width: 100%;
    height: 100%;
    display: block;
}

.style-gallery-card-name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 10px 8px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* ── Features ───────────────────────────────────────────────────────────────── */
.features-section {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 32px 96px;
}

.section-heading {
    font-family: 'DM Mono', monospace;
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 500;
    color: #f0f0f2;
    margin: 0 0 40px;
}

.features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 12px;
}

@media (max-width: 640px) {
    .features-grid {
        grid-template-columns: 1fr;
    }
    .feature-card--large {
        grid-row: span 1;
    }
}

.feature-card {
    background: #111114;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    padding: 24px;
    transition:
        border-color 200ms ease,
        background 200ms ease;
}

.feature-card:hover {
    border-color: rgba(255, 255, 255, 0.18);
    background: #1a1a1f;
}

.feature-card--large {
    grid-row: span 2;
}

.feature-icon {
    width: 28px;
    height: 28px;
    color: #e0ff4f;
    margin-bottom: 16px;
}

.feature-card h3 {
    font-family: 'DM Mono', monospace;
    font-size: 16px;
    font-weight: 500;
    color: #f0f0f2;
    margin: 0 0 10px;
}

.feature-card p {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #8a8a9a;
    line-height: 1.65;
    margin: 0;
}

.feature-card code {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    background: rgba(224, 255, 79, 0.08);
    color: #e0ff4f;
    padding: 1px 5px;
    border-radius: 3px;
}

/* ── Before / After ─────────────────────────────────────────────────────────── */
.ba-section {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 32px 96px;
}

.ba-header {
    margin-bottom: 28px;
}

.ba-heading {
    font-family: 'DM Mono', monospace;
    font-size: 28px;
    font-weight: 500;
    color: #f0f0f2;
    margin: 0 0 8px;
}

.ba-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #8a8a9a;
    margin: 0;
}

.ba-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 10px;
    overflow: hidden;
    cursor: col-resize;
    user-select: none;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #0a0a0c;
}

.ba-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
}

.ba-canvas--before {
    filter: grayscale(100%) brightness(0.65);
}

.ba-canvas--after {
    /* clip-path applied inline via :style binding */
}

.ba-label {
    position: absolute;
    top: 14px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 999px;
    pointer-events: none;
}

.ba-label--before {
    left: 14px;
    color: #4a4a5a;
    background: rgba(0, 0, 0, 0.5);
}

.ba-label--after {
    color: #e0ff4f;
    background: rgba(0, 0, 0, 0.5);
    transition: left 0ms;
}

.ba-divider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e0ff4f;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: col-resize;
    z-index: 10;
}

.ba-divider:focus-visible {
    outline: 2px solid #e0ff4f;
    outline-offset: 4px;
    border-radius: 2px;
}

.ba-handle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #e0ff4f;
    color: #0a0a0c;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    flex-shrink: 0;
}

/* ── Competitive table ──────────────────────────────────────────────────────── */
.table-section {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 32px 96px;
}

.table-scroll {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.07);
}

.competitive-table {
    width: 100%;
    border-collapse: collapse;
}

.comp-th-feat,
.comp-th {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #4a4a5a;
    padding: 13px 16px;
    background: #111114;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    white-space: nowrap;
}

.comp-th-feat {
    text-align: left;
}
.comp-th {
    text-align: center;
}
.comp-th--polsh {
    color: #e0ff4f;
}

.comp-feat {
    padding: 11px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #8a8a9a;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.comp-cell {
    padding: 11px 16px;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.comp-cell--polsh {
    background: rgba(224, 255, 79, 0.04);
}

.comp-check {
    color: #e0ff4f;
}
.comp-check-dim {
    color: rgba(255, 255, 255, 0.4);
}
.comp-dash {
    color: rgba(255, 255, 255, 0.12);
}

/* ── CTA ────────────────────────────────────────────────────────────────────── */
.cta-section {
    text-align: center;
    padding: 0 32px 96px;
}

.cta-heading {
    font-family: 'DM Mono', monospace;
    font-size: clamp(26px, 4vw, 42px);
    font-weight: 500;
    color: #f0f0f2;
    margin: 0 0 16px;
}

.cta-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #8a8a9a;
    margin: 0 0 32px;
}

.cta-btn {
    padding: 14px 32px;
    font-size: 15px;
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
.lp-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding: 48px 32px;
}

.footer-inner {
    max-width: 960px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: start;
    gap: 32px;
}

@media (max-width: 640px) {
    .footer-inner {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .footer-social {
        justify-content: center;
    }
    .footer-links {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }
}

.footer-brand .lp-wordmark {
    display: block;
    margin-bottom: 8px;
}

.footer-tagline {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #4a4a5a;
    margin: 0 0 4px;
}

.footer-ph {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #4a4a5a;
    margin: 0;
}

.footer-links {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.footer-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #4a4a5a;
    text-decoration: none;
    transition: color 150ms ease;
}

.footer-link:hover {
    color: #8a8a9a;
}

.footer-social {
    display: flex;
    gap: 16px;
    align-items: center;
}

.footer-social-link {
    color: #4a4a5a;
    text-decoration: none;
    transition: color 150ms ease;
    line-height: 0;
}

.footer-social-link:hover {
    color: #8a8a9a;
}

.footer-social-link:focus-visible {
    outline: 2px solid #e0ff4f;
    outline-offset: 3px;
    border-radius: 3px;
}
</style>
