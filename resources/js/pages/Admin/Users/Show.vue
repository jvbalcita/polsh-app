<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { Activity, CheckCircle2, CreditCard, Key, LayoutGrid, Mail, Palette, Send, ShieldCheck, Ticket, XCircle } from 'lucide-vue-next';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import AppSidebarLayout from '@/layouts/app/AppSidebarLayout.vue';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as adminUsersIndex, updateRole as adminUsersUpdateRole } from '@/routes/admin/users';

interface Role { name: string }
interface Subscription {
    id: number; plan: string; status: string;
    current_period_start: string; current_period_end: string;
    paymongo_subscription_id: string | null; cancelled_at: string | null;
}
interface Payment {
    id: number; amount: number; currency: string; status: string;
    paymongo_payment_id: string | null; paid_at: string | null; created_at: string;
}
interface Preset {
    id: number; name: string; created_at: string;
}
interface ExportSession {
    id: number; created_at: string; settings: Record<string, unknown>;
}
interface SupportTicket {
    id: number; type: string; subject: string; status: string; created_at: string;
}
interface ApiKey {
    id: number; name: string; last_used_at: string | null; revoked_at: string | null; created_at: string;
}
interface Activity {
    id: number; description: string; subject_type: string | null; properties: Record<string, unknown>; created_at: string;
}
interface User {
    id: number; name: string; email: string; avatar_url: string | null;
    email_verified_at: string | null; created_at: string;
    roles: Role[];
    subscriptions: Subscription[];
    payments: Payment[];
    presets: Preset[];
    export_sessions: ExportSession[];
    support_tickets: SupportTicket[];
    api_keys: ApiKey[];
}

const props = defineProps<{
    user: User;
    activities: Activity[];
}>();

const activeTab = ref('subscriptions');
const tabs = [
    { key: 'subscriptions', label: 'Subscriptions' },
    { key: 'payments', label: 'Payments' },
    { key: 'presets', label: 'Presets' },
    { key: 'exports', label: 'Exports' },
    { key: 'support', label: 'Support' },
    { key: 'activity', label: 'Activity' },
    { key: 'api-keys', label: 'API Keys' },
];

const roleForm = useForm({ role: props.user.roles[0]?.name ?? 'user' });

function saveRole() {
    roleForm.patch(adminUsersUpdateRole(props.user.id).url, {
        preserveScroll: true,
        onSuccess: () => toast.success('Role updated successfully.'),
        onError: () => toast.error('Failed to update role.'),
    });
}

function initials(name: string): string {
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function formatDate(d: string | null): string {
    if (!d) { return '—'; }
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(amount: number, currency = 'PHP'): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(amount / 100);
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: adminUsersIndex().url },
    { title: props.user.name, href: '#' },
];
</script>

<template>
    <Head :title="`User — ${user.name}`" />
    <AppSidebarLayout :breadcrumbs="breadcrumbs">
        <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

                <!-- Profile Card -->
                <div class="rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-background)] p-6 space-y-5">
                    <!-- Avatar + Name -->
                    <div class="flex flex-col items-center text-center gap-3">
                        <div class="size-16 rounded-full border border-[var(--sidebar-border)] flex items-center justify-center overflow-hidden">
                            <img v-if="user.avatar_url" :src="user.avatar_url" :alt="user.name" class="size-16 object-cover" />
                            <span v-else class="text-lg font-semibold text-[var(--muted-foreground)]">{{ initials(user.name) }}</span>
                        </div>
                        <div>
                            <h2 class="font-semibold text-[var(--foreground)]">{{ user.name }}</h2>
                            <p class="text-sm text-[var(--muted-foreground)]">{{ user.email }}</p>
                        </div>
                        <div class="flex flex-wrap gap-1.5 justify-center">
                            <span
                                v-for="role in user.roles"
                                :key="role.name"
                                :class="role.name === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-[var(--sidebar-background)] text-[var(--muted-foreground)] border-[var(--sidebar-border)]'"
                                class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                            >
                                {{ role.name }}
                            </span>
                        </div>
                    </div>

                    <hr class="border-[var(--sidebar-border)]" />

                    <!-- Meta -->
                    <dl class="space-y-3 text-sm">
                        <div>
                            <dt class="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-0.5">Email verified</dt>
                            <dd class="flex items-center gap-1.5 text-[var(--foreground)]">
                                <CheckCircle2 v-if="user.email_verified_at" class="size-4 text-green-500" />
                                <XCircle v-else class="size-4 text-red-500" />
                                {{ user.email_verified_at ? formatDate(user.email_verified_at) : 'Not verified' }}
                            </dd>
                        </div>
                        <div>
                            <dt class="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-0.5">Joined</dt>
                            <dd class="text-[var(--foreground)]">{{ formatDate(user.created_at) }}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-0.5">Subscription</dt>
                            <dd>
                                <span
                                    :class="user.subscriptions.some(s => s.status === 'active')
                                        ? 'bg-[#e0ff4f]/10 text-[#e0ff4f] border-[#e0ff4f]/20'
                                        : 'bg-[var(--sidebar-background)] text-[var(--muted-foreground)] border-[var(--sidebar-border)]'"
                                    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                                >
                                    {{ user.subscriptions.some(s => s.status === 'active') ? 'Pro' : 'Free' }}
                                </span>
                            </dd>
                        </div>
                    </dl>

                    <hr class="border-[var(--sidebar-border)]" />

                    <!-- Role change -->
                    <div class="space-y-2">
                        <p class="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">Change Role</p>
                        <div class="flex gap-2">
                            <Select v-model="roleForm.role" class="flex-1">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button size="sm" :disabled="roleForm.processing" @click="saveRole">Save</Button>
                        </div>
                    </div>
                </div>

                <!-- Tabs Panel -->
                <div class="rounded-lg border border-[var(--sidebar-border)] overflow-hidden">
                    <!-- Tab bar -->
                    <div class="flex overflow-x-auto border-b border-[var(--sidebar-border)] bg-[var(--sidebar-background)]">
                        <button
                            v-for="tab in tabs"
                            :key="tab.key"
                            :class="activeTab === tab.key
                                ? 'border-b-2 border-[#e0ff4f] text-[var(--foreground)]'
                                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'"
                            class="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors"
                            @click="activeTab = tab.key"
                        >
                            {{ tab.label }}
                            <span
                                v-if="tab.key === 'subscriptions' && user.subscriptions.length"
                                class="ml-1.5 text-xs text-[var(--muted-foreground)]"
                            >({{ user.subscriptions.length }})</span>
                        </button>
                    </div>

                    <!-- Tab content -->
                    <div class="p-5">

                        <!-- Subscriptions -->
                        <template v-if="activeTab === 'subscriptions'">
                            <Empty v-if="!user.subscriptions.length" class="py-6">
                                <EmptyHeader><EmptyMedia variant="icon"><CreditCard /></EmptyMedia></EmptyHeader>
                                <EmptyTitle>No subscriptions</EmptyTitle>
                                <EmptyDescription>This user has never subscribed to a plan.</EmptyDescription>
                            </Empty>
                            <table v-else class="w-full text-sm">
                                <thead><tr class="text-left text-[var(--muted-foreground)]">
                                    <th class="pb-2 font-medium">Plan</th>
                                    <th class="pb-2 font-medium">Status</th>
                                    <th class="pb-2 font-medium hidden md:table-cell">Period</th>
                                    <th class="pb-2 font-medium hidden lg:table-cell">PayMongo ID</th>
                                </tr></thead>
                                <tbody>
                                    <tr v-for="sub in user.subscriptions" :key="sub.id" class="border-t border-[var(--sidebar-border)]">
                                        <td class="py-2 text-[var(--foreground)]">{{ sub.plan }}</td>
                                        <td class="py-2">
                                            <span :class="sub.status === 'active' ? 'text-green-400' : 'text-[var(--muted-foreground)]'">{{ sub.status }}</span>
                                        </td>
                                        <td class="py-2 text-[var(--muted-foreground)] hidden md:table-cell">{{ formatDate(sub.current_period_start) }} – {{ formatDate(sub.current_period_end) }}</td>
                                        <td class="py-2 text-[var(--muted-foreground)] font-mono text-xs hidden lg:table-cell">{{ sub.paymongo_subscription_id ?? '—' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </template>

                        <!-- Payments -->
                        <template v-else-if="activeTab === 'payments'">
                            <Empty v-if="!user.payments.length" class="py-6">
                                <EmptyHeader><EmptyMedia variant="icon"><CreditCard /></EmptyMedia></EmptyHeader>
                                <EmptyTitle>No payments</EmptyTitle>
                                <EmptyDescription>No payment transactions on record.</EmptyDescription>
                            </Empty>
                            <table v-else class="w-full text-sm">
                                <thead><tr class="text-left text-[var(--muted-foreground)]">
                                    <th class="pb-2 font-medium">Amount</th>
                                    <th class="pb-2 font-medium">Status</th>
                                    <th class="pb-2 font-medium hidden md:table-cell">PayMongo ID</th>
                                    <th class="pb-2 font-medium hidden lg:table-cell">Paid at</th>
                                </tr></thead>
                                <tbody>
                                    <tr v-for="payment in user.payments" :key="payment.id" class="border-t border-[var(--sidebar-border)]">
                                        <td class="py-2 text-[var(--foreground)] font-medium">{{ formatAmount(payment.amount, payment.currency) }}</td>
                                        <td class="py-2">
                                            <span :class="payment.status === 'paid' ? 'text-green-400' : 'text-[var(--muted-foreground)]'">{{ payment.status }}</span>
                                        </td>
                                        <td class="py-2 text-[var(--muted-foreground)] font-mono text-xs hidden md:table-cell">{{ payment.paymongo_payment_id ?? '—' }}</td>
                                        <td class="py-2 text-[var(--muted-foreground)] hidden lg:table-cell">{{ formatDate(payment.paid_at) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </template>

                        <!-- Presets -->
                        <template v-else-if="activeTab === 'presets'">
                            <Empty v-if="!user.presets.length" class="py-6">
                                <EmptyHeader><EmptyMedia variant="icon"><Palette /></EmptyMedia></EmptyHeader>
                                <EmptyTitle>No presets</EmptyTitle>
                                <EmptyDescription>This user hasn't saved any style presets.</EmptyDescription>
                            </Empty>
                            <div v-else class="divide-y divide-[var(--sidebar-border)]">
                                <div v-for="preset in user.presets" :key="preset.id" class="py-2.5 flex items-center justify-between">
                                    <span class="text-sm text-[var(--foreground)]">{{ preset.name }}</span>
                                    <span class="text-xs text-[var(--muted-foreground)]">{{ formatDate(preset.created_at) }}</span>
                                </div>
                            </div>
                        </template>

                        <!-- Exports -->
                        <template v-else-if="activeTab === 'exports'">
                            <Empty v-if="!user.export_sessions.length" class="py-6">
                                <EmptyHeader><EmptyMedia variant="icon"><Send /></EmptyMedia></EmptyHeader>
                                <EmptyTitle>No exports</EmptyTitle>
                                <EmptyDescription>This user hasn't exported any screenshots yet.</EmptyDescription>
                            </Empty>
                            <div v-else class="divide-y divide-[var(--sidebar-border)]">
                                <div v-for="session in user.export_sessions" :key="session.id" class="py-2.5 flex items-center justify-between">
                                    <span class="text-sm text-[var(--foreground)] font-mono">{{ session.settings?.style ?? 'Unknown style' }}</span>
                                    <span class="text-xs text-[var(--muted-foreground)]">{{ formatDate(session.created_at) }}</span>
                                </div>
                            </div>
                        </template>

                        <!-- Support -->
                        <template v-else-if="activeTab === 'support'">
                            <Empty v-if="!user.support_tickets.length" class="py-6">
                                <EmptyHeader><EmptyMedia variant="icon"><Ticket /></EmptyMedia></EmptyHeader>
                                <EmptyTitle>No support tickets</EmptyTitle>
                                <EmptyDescription>This user hasn't submitted any support requests.</EmptyDescription>
                            </Empty>
                            <div v-else class="divide-y divide-[var(--sidebar-border)]">
                                <div v-for="ticket in user.support_tickets" :key="ticket.id" class="py-2.5 flex items-center gap-3">
                                    <span
                                        :class="{
                                            'text-yellow-400': ticket.status === 'open',
                                            'text-blue-400': ticket.status === 'in_progress',
                                            'text-green-400': ticket.status === 'resolved',
                                            'text-[var(--muted-foreground)]': ticket.status === 'closed',
                                        }"
                                        class="text-xs font-medium w-20 flex-shrink-0"
                                    >{{ ticket.status }}</span>
                                    <span class="text-sm text-[var(--foreground)] flex-1 truncate">{{ ticket.subject }}</span>
                                    <span class="text-xs text-[var(--muted-foreground)] flex-shrink-0">{{ formatDate(ticket.created_at) }}</span>
                                </div>
                            </div>
                        </template>

                        <!-- Activity -->
                        <template v-else-if="activeTab === 'activity'">
                            <Empty v-if="!activities.length" class="py-6">
                                <EmptyHeader><EmptyMedia variant="icon"><Activity /></EmptyMedia></EmptyHeader>
                                <EmptyTitle>No activity</EmptyTitle>
                                <EmptyDescription>No actions have been logged for this user yet.</EmptyDescription>
                            </Empty>
                            <div v-else class="divide-y divide-[var(--sidebar-border)]">
                                <div v-for="activity in activities" :key="activity.id" class="py-2.5 flex items-start justify-between gap-4">
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm text-[var(--foreground)]">{{ activity.description }}</p>
                                        <p v-if="activity.subject_type" class="text-xs text-[var(--muted-foreground)] mt-0.5">{{ activity.subject_type }}</p>
                                    </div>
                                    <span class="text-xs text-[var(--muted-foreground)] flex-shrink-0">{{ formatDate(activity.created_at) }}</span>
                                </div>
                            </div>
                        </template>

                        <!-- API Keys -->
                        <template v-else-if="activeTab === 'api-keys'">
                            <Empty v-if="!user.api_keys.length" class="py-6">
                                <EmptyHeader><EmptyMedia variant="icon"><Key /></EmptyMedia></EmptyHeader>
                                <EmptyTitle>No API keys</EmptyTitle>
                                <EmptyDescription>This user hasn't generated any API keys.</EmptyDescription>
                            </Empty>
                            <div v-else class="divide-y divide-[var(--sidebar-border)]">
                                <div v-for="key in user.api_keys" :key="key.id" class="py-2.5 flex items-center gap-3">
                                    <Key class="size-3.5 text-[var(--muted-foreground)] flex-shrink-0" />
                                    <span class="text-sm text-[var(--foreground)] flex-1">{{ key.name }}</span>
                                    <span v-if="key.revoked_at" class="text-xs text-red-400">Revoked</span>
                                    <span v-else class="text-xs text-green-400">Active</span>
                                    <span class="text-xs text-[var(--muted-foreground)] hidden sm:block">{{ key.last_used_at ? 'Used ' + formatDate(key.last_used_at) : 'Never used' }}</span>
                                </div>
                            </div>
                        </template>

                    </div>
                </div>

            </div>
        </div>
    </AppSidebarLayout>
</template>
