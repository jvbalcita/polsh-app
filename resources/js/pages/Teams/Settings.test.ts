import { createApp, nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from '@/pages/Teams/Settings.vue';

const pageProps = vi.hoisted(() => ({
    auth: { user: { id: 1 } },
    isPro: false,
}));

vi.mock('@inertiajs/vue3', () => ({
    Head: { template: '<div><slot /></div>' },
    Link: {
        props: ['href'],
        template:
            '<a :href="typeof href === \'string\' ? href : href?.url"><slot /></a>',
    },
    useForm: () => ({
        processing: false,
        errors: {},
        name: '',
        email: '',
        post: vi.fn(),
        reset: vi.fn(),
    }),
    usePage: () => ({ props: pageProps }),
}));

vi.mock('@/components/ProductPageHeader.vue', () => ({
    default: { template: '<div data-test="page-header" />' },
}));

vi.mock('@/components/ProductUpgradeCard.vue', () => ({
    default: {
        props: ['title', 'description', 'ctaHref', 'ctaLabel'],
        template:
            '<section data-test="upgrade-card"><h2>{{ title }}</h2><p>{{ description }}</p><span>{{ ctaLabel }}</span><slot /><slot name="icon" /></section>',
    },
}));

vi.mock('@/routes', () => ({
    editor: () => '/editor',
}));

vi.mock('@/routes/billing', () => ({
    portal: () => '/billing',
}));

vi.mock('@/routes/teams', () => ({
    invite: { url: () => '/teams/1/invite' },
    join: (token: string) => ({ url: `/teams/join/${token}`, method: 'get' }),
    leave: { url: () => '/teams/1/leave' },
    store: { url: () => '/teams' },
}));

async function renderPage(overrides: Record<string, unknown> = {}) {
    const container = document.createElement('div');

    createApp(SettingsPage as never, {
        team: null,
        members: [],
        teamPresets: [],
        pendingInvitations: [],
        ...overrides,
    }).mount(container);

    await nextTick();

    return container;
}

describe('teams settings page', () => {
    beforeEach(() => {
        pageProps.auth = { user: { id: 1 } };
        pageProps.isPro = false;
    });

    it('shows pending invitation state before the upgrade card for invited free users', async () => {
        const container = await renderPage({
            pendingInvitations: [
                {
                    id: 1,
                    token: 'invite-token',
                    expires_at: '2026-03-27T12:00:00Z',
                    team: {
                        id: 2,
                        name: 'Studio Team',
                        slug: 'studio-team',
                        owner_name: 'Owner Person',
                    },
                },
            ],
        });

        expect(container.textContent).toContain('Studio Team');
        expect(container.textContent).toContain('Accept invitation');
        expect(container.textContent).not.toContain('Teams is a Pro feature');
    });

    it('shows pending invitation state before the create team form for invited pro users', async () => {
        pageProps.isPro = true;

        const container = await renderPage({
            pendingInvitations: [
                {
                    id: 1,
                    token: 'invite-token',
                    expires_at: '2026-03-27T12:00:00Z',
                    team: {
                        id: 2,
                        name: 'Studio Team',
                        slug: 'studio-team',
                        owner_name: 'Owner Person',
                    },
                },
            ],
        });

        expect(container.textContent).toContain('Studio Team');
        expect(container.textContent).toContain('Accept invitation');
        expect(container.textContent).not.toContain('Create a Team');
    });

    it('shows team management before any upgrade gating when user already has a team', async () => {
        const container = await renderPage({
            team: {
                id: 2,
                name: 'Studio Team',
                slug: 'studio-team',
                owner_id: 1,
            },
        });

        expect(container.textContent).toContain('Studio Team');
        expect(container.textContent).not.toContain('Teams is a Pro feature');
    });
});
