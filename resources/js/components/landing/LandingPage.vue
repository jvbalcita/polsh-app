<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { ArrowUpRight, Boxes, FolderKanban, Sparkles } from 'lucide-vue-next';
import { computed } from 'vue';
import { editor, register } from '@/routes';
import { api as apiDocs } from '@/routes/docs';

const props = withDefaults(
    defineProps<{
        canRegister?: boolean;
    }>(),
    {
        canRegister: false,
    },
);

const sampleEditorImage = '/images/polsh-sample-editor.png';
const productSampleImage = '/images/polsh-landing-sample-ui.svg';
const framedProductSampleImage = '/images/polsh-landing-sample-ui-framed.svg';
const page = usePage();

const hasAuthenticatedUser = computed(() => Boolean(page.props.auth?.user));
const showSecondaryCta = computed(() =>
    props.canRegister && !hasAuthenticatedUser.value,
);
const finalCtaHref = computed(() => (showSecondaryCta.value ? register() : apiDocs()));
const finalCtaLabel = computed(() =>
    showSecondaryCta.value ? 'Create free account' : 'Review the API',
);

const surfaceRows = [
    {
        title: 'Launch announcements',
        body: 'Ship polished proof for new features without rebuilding the visual system every time.',
    },
    {
        title: 'Documentation and help center',
        body: 'Keep headers and product steps readable, consistent, and close to the real interface.',
    },
    {
        title: 'Changelog and release notes',
        body: 'Turn updates into repeatable cover assets that look like part of the product brand.',
    },
    {
        title: 'Social and community posts',
        body: 'Export clean, focused visuals that travel well beyond the product itself.',
    },
];

const systemRows = [
    {
        title: 'Presets',
        body: 'Save the look once and reuse it across launches, docs, and ongoing product comms.',
        icon: Sparkles,
    },
    {
        title: 'Sessions',
        body: 'Group related screens into one batch so the whole story ships with a shared visual rhythm.',
        icon: FolderKanban,
    },
    {
        title: 'API',
        body: 'Keep manual and automated output aligned when the team needs scale, not just a one-off export.',
        icon: Boxes,
    },
];
</script>

<template>
    <div class="landing-root">
        <section class="landing-hero">
            <div class="landing-hero-copy">
                <div class="landing-intro">
                    <p class="landing-kicker">Product marketing, docs, and launch visuals</p>
                    <p class="landing-overline">A screenshot system for product teams that ship often.</p>
                </div>

                <div class="landing-headline-block">
                    <h1>Your screenshot workflow should feel like a product system.</h1>
                    <p>
                        Polsh keeps the screens you already trust, then adds the layout,
                        preset, export, and consistency layer that makes them market-ready.
                    </p>
                </div>

                <div class="landing-actions landing-actions--hero">
                    <Link :href="editor()" class="landing-button landing-button--primary">
                        Open editor
                        <ArrowUpRight class="landing-button-icon" aria-hidden="true" />
                    </Link>
                    <Link
                        v-if="showSecondaryCta"
                        :href="register()"
                        class="landing-button landing-button--secondary"
                    >
                        Create free account
                    </Link>
                    <Link
                        v-else
                        :href="apiDocs()"
                        class="landing-inline-link landing-inline-link--hero"
                    >
                        Review the API
                    </Link>
                </div>
            </div>

            <figure class="landing-hero-stage">
                <div class="landing-stage-topline">
                    Same product state, stronger presentation layer
                </div>
                <img
                    :src="sampleEditorImage"
                    alt="Polsh editor interface shown as the main product proof in the landing page hero"
                />
            </figure>
        </section>

        <section class="landing-surfaces">
            <div class="landing-surfaces-intro">
                <p class="landing-kicker">Support</p>
                <h2>Built for the surfaces that convert product attention into adoption.</h2>
            </div>

            <div class="landing-surfaces-grid">
                <div class="landing-before-rail">
                    <span class="landing-rail-label">Raw input</span>
                    <div class="landing-before-panel">
                        <img
                            :src="productSampleImage"
                            alt="Raw SaaS product screenshot sample shown before Polsh styling is applied"
                        />
                    </div>
                </div>

                <div class="landing-surface-list">
                    <article
                        v-for="(row, index) in surfaceRows"
                        :key="row.title"
                        class="landing-surface-row"
                    >
                        <span class="landing-surface-index">{{ `0${index + 1}` }}</span>
                        <div class="landing-surface-copy">
                            <h3>{{ row.title }}</h3>
                            <p>{{ row.body }}</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="landing-transformation">
            <div class="landing-transformation-copy">
                <p class="landing-kicker">Before / after</p>
                <h2>Keep the UI honest. Upgrade the frame around it.</h2>
                <p>
                    Polsh should feel believable on the landing page because the workflow is
                    believable in the product: screenshot in, preset and frame applied, polished
                    export out.
                </p>
            </div>

            <div class="landing-transformation-stage">
                <div class="landing-after-shell">
                    <div class="landing-after-grid" aria-hidden="true" />
                    <div class="landing-after-window">
                        <div class="landing-mac-frame">
                            <div class="landing-mac-toolbar" aria-hidden="true">
                                <div class="landing-mac-lights">
                                    <span class="landing-mac-light landing-mac-light--red" />
                                    <span class="landing-mac-light landing-mac-light--yellow" />
                                    <span class="landing-mac-light landing-mac-light--green" />
                                </div>
                                <div class="landing-mac-pill" />
                            </div>
                            <img
                                :src="framedProductSampleImage"
                                alt="Styled output showing a SaaS product screenshot sample in a final marketing frame with macOS chrome"
                            />
                        </div>
                    </div>
                </div>

                <div class="landing-inset-before">
                    <span>Before</span>
                    <img :src="productSampleImage" alt="Unstyled SaaS product screenshot inset" />
                </div>
            </div>
        </section>

        <section class="landing-system">
            <div class="landing-system-intro">
                <p class="landing-kicker">Detail</p>
                <h2>The system scales beyond one polished image.</h2>
            </div>

            <div class="landing-system-columns">
                <article v-for="row in systemRows" :key="row.title" class="landing-system-column">
                    <component :is="row.icon" class="landing-system-icon" aria-hidden="true" />
                    <h3>{{ row.title }}</h3>
                    <p>{{ row.body }}</p>
                </article>
            </div>
        </section>

        <section class="landing-cta">
            <div class="landing-cta-copy">
                <p class="landing-kicker">Get started</p>
                <h2>Build the screenshot layer your product marketing keeps needing.</h2>
                <p>
                    Open the editor, define the treatment, and turn recurring product visuals
                    into a reusable part of the stack.
                </p>
            </div>

            <div class="landing-actions landing-actions--footer">
                <Link :href="finalCtaHref" class="landing-button landing-button--primary">
                    {{ finalCtaLabel }}
                    <ArrowUpRight class="landing-button-icon" aria-hidden="true" />
                </Link>
            </div>
        </section>
    </div>
</template>

<style scoped>
.landing-root {
    color: #f5f7fb;
    font-family: 'Space Grotesk', 'DM Sans', sans-serif;
}

.landing-hero,
.landing-surfaces,
.landing-transformation,
.landing-system,
.landing-cta {
    width: min(84rem, calc(100% - 3rem));
    margin: 0 auto;
}

.landing-hero {
    padding: clamp(3rem, 7vw, 6rem) 0 4.5rem;
}

.landing-intro,
.landing-headline-block,
.landing-hero-copy,
.landing-surfaces-intro,
.landing-transformation-copy,
.landing-system-intro,
.landing-cta-copy {
    display: grid;
    gap: 0.8rem;
}

.landing-kicker {
    margin: 0;
    color: rgba(240, 240, 242, 0.62);
    font-family: 'JetBrains Mono', 'DM Mono', monospace;
    font-size: 0.74rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.landing-overline {
    margin: 0;
    color: rgba(240, 240, 242, 0.72);
    font-size: 0.98rem;
}

.landing-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.landing-hero-copy {
    max-width: 54rem;
    gap: 1.35rem;
}

.landing-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 999px;
    padding: 0.9rem 1.25rem;
    text-decoration: none;
    transition:
        transform 180ms ease,
        background-color 180ms ease,
        border-color 180ms ease;
}

.landing-button:hover,
.landing-inline-link:hover {
    transform: translateY(-1px);
}

.landing-button--primary {
    background: #e0ff4f;
    color: #0a1008;
    font-weight: 600;
}

.landing-button--secondary {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.03);
    color: #ffffff;
}

.landing-button-icon,
.landing-system-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
}

.landing-headline-block h1,
.landing-surfaces-intro h2,
.landing-transformation-copy h2,
.landing-system-intro h2,
.landing-cta-copy h2 {
    margin: 0;
    color: #ffffff;
    font-size: clamp(2.6rem, 6vw, 5rem);
    font-weight: 600;
    letter-spacing: -0.065em;
    line-height: 0.95;
    text-wrap: balance;
}

.landing-headline-block p,
.landing-surfaces-intro p:last-child,
.landing-transformation-copy p:last-child,
.landing-system-intro p:last-child,
.landing-cta-copy p:last-child {
    margin: 0;
    max-width: 41rem;
    color: rgba(240, 240, 242, 0.78);
    font-size: 1.05rem;
    line-height: 1.72;
}

.landing-actions--hero {
    align-items: center;
    margin-top: 0.35rem;
}

.landing-proof-icon,
.landing-system-icon {
    color: #e0ff4f;
}

.landing-hero-stage {
    position: relative;
    overflow: hidden;
    margin: 2.5rem 0 0;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 2rem;
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.08), transparent 44%),
        linear-gradient(180deg, #121316 0%, #09090b 100%);
    padding: 1.2rem;
    box-shadow:
        0 34px 100px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    animation: landing-rise 720ms ease both;
}

.landing-stage-topline {
    margin-bottom: 0.95rem;
    color: rgba(240, 240, 242, 0.58);
    font-family: 'JetBrains Mono', 'DM Mono', monospace;
    font-size: 0.76rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.landing-hero-stage img {
    display: block;
    width: 100%;
    border-radius: 1.2rem;
}

.landing-surfaces,
.landing-transformation,
.landing-system,
.landing-cta {
    padding: 5.25rem 0;
}

.landing-surfaces-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.76fr) minmax(0, 1.2fr);
    gap: 1.8rem;
    align-items: start;
    margin-top: 2rem;
}

.landing-before-rail {
    position: sticky;
    top: 7.5rem;
    display: grid;
    gap: 0.7rem;
}

.landing-rail-label {
    color: rgba(240, 240, 242, 0.58);
    font-family: 'JetBrains Mono', 'DM Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.landing-before-panel {
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 1.6rem;
    background: #111215;
    padding: 1rem;
}

.landing-before-panel img,
.landing-after-window img,
.landing-inset-before img {
    display: block;
    width: 100%;
    border-radius: 1rem;
}

.landing-surface-list {
    display: grid;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.landing-surface-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 1rem;
    padding: 1.25rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.landing-surface-index {
    color: rgba(240, 240, 242, 0.36);
    font-family: 'JetBrains Mono', 'DM Mono', monospace;
    font-size: 0.84rem;
    letter-spacing: 0.14em;
}

.landing-surface-copy {
    display: grid;
    gap: 0.4rem;
}

.landing-surface-copy h3,
.landing-system-column h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 500;
    letter-spacing: -0.03em;
}

.landing-surface-copy p,
.landing-system-column p,
.landing-inline-link {
    margin: 0;
    color: rgba(240, 240, 242, 0.74);
    font-size: 0.98rem;
    line-height: 1.68;
}

.landing-transformation {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.2fr);
    gap: 2rem;
    align-items: center;
}

.landing-transformation-stage {
    position: relative;
    min-width: 0;
}

.landing-after-shell {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 2rem;
    background:
        radial-gradient(circle at top, rgba(224, 255, 79, 0.16), transparent 30%),
        linear-gradient(180deg, #121316 0%, #09090b 100%);
    padding: 3rem 1.25rem 1.25rem;
}

.landing-after-grid {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.22;
}

.landing-after-window {
    position: relative;
    padding: 1rem;
    border: 1px solid rgba(224, 255, 79, 0.24);
    border-radius: 1.55rem;
    background: rgba(11, 14, 15, 0.82);
    backdrop-filter: blur(14px);
    box-shadow:
        0 28px 70px rgba(0, 0, 0, 0.38),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition: transform 220ms ease;
}

.landing-mac-frame {
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.2rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04));
    box-shadow:
        0 20px 44px rgba(0, 0, 0, 0.26),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.landing-mac-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.72rem 0.95rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(12, 16, 20, 0.22));
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.landing-mac-lights {
    display: inline-flex;
    align-items: center;
    gap: 0.42rem;
}

.landing-mac-light {
    width: 0.72rem;
    height: 0.72rem;
    border-radius: 999px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
}

.landing-mac-light--red {
    background: #ff5f57;
}

.landing-mac-light--yellow {
    background: #febc2e;
}

.landing-mac-light--green {
    background: #28c840;
}

.landing-mac-pill {
    width: 32%;
    max-width: 11rem;
    height: 0.7rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
}

.landing-mac-frame img {
    border-radius: 0;
}

.landing-after-shell:hover .landing-after-window {
    transform: translateY(-4px);
}

.landing-inset-before {
    position: absolute;
    right: -1rem;
    bottom: -1rem;
    width: min(18rem, 42%);
    display: grid;
    gap: 0.55rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 1.45rem;
    background: rgba(10, 10, 12, 0.9);
    padding: 0.9rem;
}

.landing-inset-before span {
    color: rgba(240, 240, 242, 0.58);
    font-family: 'JetBrains Mono', 'DM Mono', monospace;
    font-size: 0.74rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.landing-system-columns {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}

.landing-system-column {
    min-height: 16rem;
    display: grid;
    align-content: start;
    gap: 0.8rem;
    padding: 1.4rem 1.2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 70%);
}

.landing-system-icon {
    width: 1.1rem;
    height: 1.1rem;
}

.landing-cta {
    display: grid;
    gap: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.landing-inline-link {
    display: inline-flex;
    align-items: center;
    color: rgba(240, 240, 242, 0.84);
    text-decoration: none;
    transition: transform 180ms ease;
}

.landing-inline-link--hero {
    min-height: 3.35rem;
}

@keyframes landing-rise {
    from {
        opacity: 0;
        transform: translateY(24px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 960px) {
    .landing-transformation,
    .landing-surfaces-grid {
        grid-template-columns: 1fr;
        align-items: flex-start;
    }

    .landing-before-rail {
        position: static;
    }

    .landing-system-columns {
        grid-template-columns: 1fr;
    }

    .landing-inset-before {
        width: min(17rem, 46%);
        right: -0.4rem;
        bottom: -0.4rem;
    }
}

@media (max-width: 640px) {
    .landing-hero,
    .landing-surfaces,
    .landing-transformation,
    .landing-system,
    .landing-cta {
        width: min(100%, calc(100% - 1.5rem));
    }

    .landing-headline-block h1,
    .landing-surfaces-intro h2,
    .landing-transformation-copy h2,
    .landing-system-intro h2,
    .landing-cta-copy h2 {
        font-size: clamp(2.25rem, 12vw, 3.3rem);
    }

    .landing-hero {
        padding-top: 2rem;
        padding-bottom: 3.25rem;
    }

    .landing-surfaces,
    .landing-transformation,
    .landing-system,
    .landing-cta {
        padding: 3.5rem 0;
    }

    .landing-headline-block p,
    .landing-surfaces-intro p:last-child,
    .landing-transformation-copy p:last-child,
    .landing-system-intro p:last-child,
    .landing-cta-copy p:last-child {
        font-size: 1rem;
        line-height: 1.65;
    }

    .landing-actions {
        width: 100%;
        flex-direction: column;
    }

    .landing-button {
        width: 100%;
    }

    .landing-inset-before {
        position: static;
        order: -1;
        width: 100%;
        margin-top: 1rem;
        border-radius: 1.15rem;
        padding: 0.75rem;
    }

    .landing-transformation-stage {
        display: grid;
        gap: 1rem;
    }

    .landing-after-shell {
        border-radius: 1.35rem;
        padding: 1.25rem 0.8rem 0.8rem;
    }

    .landing-after-window {
        padding: 0.7rem;
        border-radius: 1.1rem;
    }

    .landing-mac-frame {
        border-radius: 0.9rem;
    }

    .landing-mac-toolbar {
        padding: 0.55rem 0.7rem;
    }

    .landing-mac-light {
        width: 0.62rem;
        height: 0.62rem;
    }

    .landing-before-panel {
        border-radius: 1.2rem;
        padding: 0.75rem;
    }

    .landing-surface-row {
        gap: 0.75rem;
        padding: 1rem 0;
    }

    .landing-system-column {
        min-height: auto;
        padding: 1.1rem 0.85rem;
    }

    .landing-actions--footer {
        align-items: stretch;
    }
}
</style>
