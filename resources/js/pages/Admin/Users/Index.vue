<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { Search, UserX, Users } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import AppSidebarLayout from '@/layouts/app/AppSidebarLayout.vue';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as adminUsersIndex, show as adminUsersShow } from '@/routes/admin/users';

interface Subscription {
    status: string;
    plan: string;
}
interface Role {
    name: string;
}
interface User {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    email_verified_at: string | null;
    created_at: string;
    roles: Role[];
    subscriptions: Subscription[];
    presets_count: number;
    support_tickets_count: number;
}
interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

const props = defineProps<{
    users: PaginatedUsers;
    filters: { q?: string; role?: string; plan?: string };
}>();

const search = ref(props.filters.q ?? '');
const roleFilter = ref(props.filters.role ?? 'all');
const planFilter = ref(props.filters.plan ?? 'all');

let debounceTimer: ReturnType<typeof setTimeout>;

function applyFilters() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        router.get(
            adminUsersIndex().url,
            {
                q: search.value || undefined,
                role: roleFilter.value !== 'all' ? roleFilter.value : undefined,
                plan: planFilter.value !== 'all' ? planFilter.value : undefined,
            },
            { preserveState: true, replace: true },
        );
    }, 300);
}

watch([search, roleFilter, planFilter], applyFilters);

function isProUser(user: User): boolean {
    return user.subscriptions.some((s) => s.status === 'active');
}

function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: adminUsersIndex().url },
];
</script>

<template>
    <Head title="Users" />
    <AppSidebarLayout :breadcrumbs="breadcrumbs">
        <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <Users class="size-5 text-[var(--muted-foreground)]" />
                    <div>
                        <h1 class="text-xl font-semibold text-[var(--foreground)]">Users</h1>
                        <p class="text-sm text-[var(--muted-foreground)]">
                            {{ users.total }} total user{{ users.total !== 1 ? 's' : '' }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-3">
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-foreground)]" />
                    <Input
                        v-model="search"
                        placeholder="Search by name or email…"
                        class="pl-9"
                    />
                </div>
                <Select v-model="roleFilter">
                    <SelectTrigger class="w-full sm:w-40">
                        <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                </Select>
                <Select v-model="planFilter">
                    <SelectTrigger class="w-full sm:w-40">
                        <SelectValue placeholder="All plans" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All plans</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <!-- Table -->
            <div class="rounded-lg border border-[var(--sidebar-border)] overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-[var(--sidebar-border)] bg-[var(--sidebar-background)]">
                            <th class="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium">User</th>
                            <th class="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium hidden md:table-cell">Plan</th>
                            <th class="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium hidden lg:table-cell">Role</th>
                            <th class="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium hidden lg:table-cell">Presets</th>
                            <th class="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium hidden xl:table-cell">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="user in users.data"
                            :key="user.id"
                            class="border-b border-[var(--sidebar-border)] last:border-0 hover:bg-[var(--sidebar-background)] cursor-pointer transition-colors"
                            @click="router.visit(adminUsersShow(user.id).url)"
                        >
                            <!-- User -->
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-3">
                                    <div class="size-9 rounded-full bg-[var(--sidebar-background)] border border-[var(--sidebar-border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <img v-if="user.avatar_url" :src="user.avatar_url" :alt="user.name" class="size-9 object-cover" />
                                        <span v-else class="text-xs font-semibold text-[var(--muted-foreground)]">{{ initials(user.name) }}</span>
                                    </div>
                                    <div>
                                        <p class="font-medium text-[var(--foreground)]">{{ user.name }}</p>
                                        <p class="text-xs text-[var(--muted-foreground)]">{{ user.email }}</p>
                                    </div>
                                </div>
                            </td>
                            <!-- Plan -->
                            <td class="px-4 py-3 hidden md:table-cell">
                                <span
                                    :class="isProUser(user)
                                        ? 'bg-[#e0ff4f]/10 text-[#e0ff4f] border-[#e0ff4f]/20'
                                        : 'bg-[var(--sidebar-background)] text-[var(--muted-foreground)] border-[var(--sidebar-border)]'"
                                    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                                >
                                    {{ isProUser(user) ? 'Pro' : 'Free' }}
                                </span>
                            </td>
                            <!-- Role -->
                            <td class="px-4 py-3 hidden lg:table-cell">
                                <span
                                    v-for="role in user.roles"
                                    :key="role.name"
                                    :class="role.name === 'admin'
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : 'bg-[var(--sidebar-background)] text-[var(--muted-foreground)] border-[var(--sidebar-border)]'"
                                    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mr-1"
                                >
                                    {{ role.name }}
                                </span>
                                <span v-if="user.roles.length === 0" class="text-[var(--muted-foreground)]">—</span>
                            </td>
                            <!-- Presets -->
                            <td class="px-4 py-3 hidden lg:table-cell text-[var(--muted-foreground)]">
                                {{ user.presets_count }}
                            </td>
                            <!-- Joined -->
                            <td class="px-4 py-3 hidden xl:table-cell text-[var(--muted-foreground)]">
                                {{ new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                            </td>
                        </tr>
                        <tr v-if="users.data.length === 0">
                            <td colspan="5" class="py-2">
                                <Empty class="py-8">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <UserX />
                                        </EmptyMedia>
                                    </EmptyHeader>
                                    <EmptyTitle>No users found</EmptyTitle>
                                    <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
                                </Empty>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="users.last_page > 1" class="flex items-center justify-between">
                <p class="text-sm text-[var(--muted-foreground)]">
                    Showing {{ users.from }}–{{ users.to }} of {{ users.total }}
                </p>
                <div class="flex items-center gap-2">
                    <Link
                        v-for="link in users.links"
                        :key="link.label"
                        :href="link.url ?? '#'"
                        :class="[
                            link.active ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                            !link.url ? 'opacity-40 pointer-events-none' : '',
                        ]"
                        class="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors"
                        preserve-scroll
                        v-html="link.label"
                    />
                </div>
            </div>
        </div>
    </AppSidebarLayout>
</template>
