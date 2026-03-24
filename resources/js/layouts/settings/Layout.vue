<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/composables/useCurrentUrl';
import { toUrl } from '@/lib/utils';
import { editor } from '@/routes';
import { edit as editBilling } from '@/routes/billing';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: editProfile(),
    },
    {
        title: 'Billing',
        href: editBilling(),
    },
    {
        title: 'Security',
        href: editSecurity(),
    },
];

const { isCurrentOrParentUrl } = useCurrentUrl();
</script>

<template>
    <div class="flex h-screen overflow-hidden bg-[#080808]">
        <!-- Sidebar -->
        <aside
            class="hidden w-52 flex-shrink-0 flex-col border-r border-[#1e1e1e] bg-[#111] lg:flex"
        >
            <div class="flex items-center gap-2 border-b border-[#1e1e1e] px-4 py-5">
                <AppLogoIcon class="size-5 text-[#e0ff4f]" />
                <span class="font-mono text-sm font-semibold tracking-tight text-white"
                    >polsh</span
                >
            </div>

            <nav class="flex-1 px-2 py-4" aria-label="Settings navigation">
                <p
                    class="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-[#444]"
                >
                    Settings
                </p>

                <div class="space-y-0.5">
                    <Link
                        v-for="item in sidebarNavItems"
                        :key="toUrl(item.href)"
                        :href="item.href"
                        :class="[
                            'flex items-center gap-2 rounded-r px-3 py-2 text-sm transition-colors',
                            isCurrentOrParentUrl(item.href)
                                ? 'border-l-2 border-[#e0ff4f] bg-[#1a1a1a] font-medium text-[#e0ff4f]'
                                : 'border-l-2 border-transparent text-muted-foreground hover:bg-[#161616] hover:text-foreground',
                        ]"
                    >
                        {{ item.title }}
                    </Link>
                </div>
            </nav>

            <div class="border-t border-[#1a1a1a] p-4">
                <Link
                    :href="editor()"
                    class="flex items-center gap-1.5 text-xs text-[#444] transition-colors hover:text-[#777]"
                >
                    ← Back to Editor
                </Link>
            </div>
        </aside>

        <!-- Mobile top nav -->
        <div class="flex flex-1 flex-col overflow-hidden">
            <div
                class="flex items-center justify-between border-b border-[#1e1e1e] px-4 py-3 lg:hidden"
            >
                <div class="flex items-center gap-2">
                    <AppLogoIcon class="size-5 text-[#e0ff4f]" />
                    <span class="font-mono text-sm font-semibold tracking-tight text-white"
                        >polsh</span
                    >
                </div>
                <Link
                    :href="editor()"
                    class="text-xs text-[#555] transition-colors hover:text-[#888]"
                >
                    ← Editor
                </Link>
            </div>

            <nav
                class="flex gap-1 overflow-x-auto border-b border-[#1e1e1e] px-4 py-2 lg:hidden"
                aria-label="Settings navigation"
            >
                <Link
                    v-for="item in sidebarNavItems"
                    :key="toUrl(item.href)"
                    :href="item.href"
                    :class="[
                        'whitespace-nowrap rounded px-3 py-1.5 text-sm transition-colors',
                        isCurrentOrParentUrl(item.href)
                            ? 'bg-[#1a1a1a] font-medium text-[#e0ff4f]'
                            : 'text-muted-foreground hover:text-foreground',
                    ]"
                >
                    {{ item.title }}
                </Link>
            </nav>

            <Separator class="lg:hidden" />

            <!-- Content -->
            <main class="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
                <div class="max-w-2xl space-y-12">
                    <slot />
                </div>
            </main>
        </div>
    </div>
</template>
