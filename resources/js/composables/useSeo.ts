import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

interface SeoOptions {
    title?: string;
    description?: string;
    image?: string;
    canonical?: string;
    type?: 'website' | 'article';
}

interface SharedSeo {
    siteName: string;
    description: string;
    ogImage: string;
    twitterCard: string;
}

export function useSeo(options: SeoOptions = {}) {
    const page = usePage();

    const seo = computed<SharedSeo>(() => {
        const shared = (page.props as Record<string, unknown>).seo as SharedSeo | undefined;

        return shared ?? {
            siteName: 'Polsh',
            description: 'Style your code screenshots in seconds. No Figma, no plugins. Drop in a screenshot, pick a style, and export PNG, WebP, or SVG.',
            ogImage: '/images/og-polsh.png',
            twitterCard: 'summary_large_image',
        };
    });

    const fullTitle = computed(() =>
        options.title
            ? `${options.title} — ${seo.value.siteName}`
            : seo.value.siteName,
    );

    const description = computed(() => options.description ?? seo.value.description);
    const ogImage = computed(() => options.image ?? seo.value.ogImage);
    const twitterCard = computed(() => seo.value.twitterCard);
    const canonical = computed(() => options.canonical ?? '');
    const type = computed(() => options.type ?? 'website');

    return { fullTitle, description, ogImage, twitterCard, canonical, type, seo };
}
