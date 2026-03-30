import { describe, expect, it, vi } from 'vitest';
import { useSeo } from '@/composables/useSeo';

const pageProps = vi.hoisted(() => ({
    seo: {
        siteName: 'Polsh',
        description: 'Shared SEO description',
        ogImage: '/images/og-polsh.png',
        twitterCard: 'summary_large_image',
    },
}));

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({ props: pageProps }),
}));

describe('useSeo', () => {
    it('returns a page-only browser title and a branded metadata title', () => {
        const { pageTitle, metaTitle } = useSeo({
            title: 'Privacy Policy',
        });

        expect(pageTitle.value).toBe('Privacy Policy');
        expect(metaTitle.value).toBe('Privacy Policy — Polsh');
    });

    it('falls back to the site name when no page title is provided', () => {
        const { pageTitle, metaTitle } = useSeo();

        expect(pageTitle.value).toBe('Polsh');
        expect(metaTitle.value).toBe('Polsh');
    });
});
