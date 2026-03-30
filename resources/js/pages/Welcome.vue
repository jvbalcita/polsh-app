<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import LandingPage from '@/components/landing/LandingPage.vue';
import { useSeo } from '@/composables/useSeo';
import PublicLayout from '@/layouts/PublicLayout.vue';

const props = withDefaults(
    defineProps<{
        canRegister?: boolean;
    }>(),
    {
        canRegister: false,
    },
);

const { pageTitle, metaTitle, description, ogImage, twitterCard } = useSeo({
    title: 'Product visuals for launches, docs, and product marketing',
    description:
        'Turn raw product screenshots into polished launch assets, docs visuals, changelog covers, and social-ready exports from one browser-based editor.',
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
        priceCurrency: 'USD',
    },
    description:
        'Turn raw product screenshots into polished launch assets, docs visuals, changelog covers, and social-ready exports from one browser-based editor.',
});
</script>

<template>
    <Head>
        <title>{{ pageTitle }}</title>
        <meta name="description" :content="description" />
        <meta property="og:title" :content="metaTitle" />
        <meta property="og:description" :content="description" />
        <meta property="og:image" :content="ogImage" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://polsh.work/" />
        <meta name="twitter:card" :content="twitterCard" />
        <meta name="twitter:title" :content="metaTitle" />
        <meta name="twitter:description" :content="description" />
        <meta name="twitter:image" :content="ogImage" />
        <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
        <component :is="'script'" type="application/ld+json" v-html="jsonLd" />
    </Head>

    <PublicLayout>
        <div class="landing-shell">
            <LandingPage :can-register="props.canRegister" />
        </div>
    </PublicLayout>
</template>

<style scoped>
.landing-shell {
    background:
        radial-gradient(circle at top, rgba(224, 255, 79, 0.1), transparent 28%),
        linear-gradient(180deg, #09090b 0%, #070709 22%, #050506 100%);
}
</style>
