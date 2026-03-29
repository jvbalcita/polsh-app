import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, nextTick } from 'vue';
import WelcomePage from '@/pages/Welcome.vue';

const pageProps = vi.hoisted(() => ({
    auth: { user: null },
    seo: {
        siteName: 'Polsh',
        description: 'Shared SEO description',
        ogImage: '/images/og-polsh.png',
        twitterCard: 'summary_large_image',
    },
}));

vi.mock('@inertiajs/vue3', () => ({
    Head: { template: '<div><slot /></div>' },
    Link: {
        props: ['href'],
        template:
            '<a :href="typeof href === \'string\' ? href : href?.url"><slot /></a>',
    },
    usePage: () => ({ props: pageProps }),
}));

vi.mock('@/layouts/PublicLayout.vue', () => ({
    default: { template: '<div data-test="public-layout"><slot /></div>' },
}));

async function renderPage(url = 'http://localhost/') {
    window.history.replaceState({}, '', url);

    const container = document.createElement('div');
    document.body.appendChild(container);

    createApp(WelcomePage as never, {
        canRegister: true,
    }).mount(container);

    await nextTick();
    await nextTick();

    return container;
}

afterEach(() => {
    document.body.innerHTML = '';
    window.history.replaceState({}, '', 'http://localhost/');
});

describe('welcome page', () => {
    it('shows the guest sign-up CTA only when no user is signed in', async () => {
        pageProps.auth = { user: null };

        const container = await renderPage();

        expect(container.textContent).toContain('Create free account');
        expect(container.textContent).not.toContain('Review the API');
    });

    it('swaps the secondary hero action to API docs for signed-in users', async () => {
        pageProps.auth = { user: { id: 1 } };

        const container = await renderPage();

        expect(container.textContent).toContain('Review the API');
        expect(container.textContent).not.toContain('Create free account');
    });

    it('renders the final landing page on the home route', async () => {
        pageProps.auth = { user: null };
        const container = await renderPage();

        expect(container.textContent).toContain(
            'Your screenshot workflow should feel like a product system.',
        );
        expect(container.textContent).not.toContain('Landing studies');
    });

    it('keeps the hero editor proof while using the product sample in support imagery', async () => {
        pageProps.auth = { user: null };
        const container = await renderPage();

        expect(container.innerHTML).toContain('/images/polsh-sample-editor.png');
        expect(container.innerHTML).toContain('/images/polsh-landing-sample-ui.svg');
        expect(container.innerHTML).toContain('/images/polsh-landing-sample-ui-framed.svg');
    });
});
