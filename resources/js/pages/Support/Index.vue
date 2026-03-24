<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { Empty, EmptyAction, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { create } from '@/actions/App/Http/Controllers/SupportController';
import SettingsLayout from '@/layouts/settings/Layout.vue';

defineProps<{
    tickets: Array<{
        id: number;
        type: string;
        subject: string;
        status: string;
        created_at: string;
    }>;
}>();

const statusConfig: Record<string, { label: string; color: string }> = {
    open: { label: 'Open', color: '#8a8a9a' },
    in_progress: { label: 'In Progress', color: '#e0ff4f' },
    resolved: { label: 'Resolved', color: '#4fff8a' },
    closed: { label: 'Closed', color: '#4a4a5a' },
};

const typeLabels: Record<string, string> = {
    bug_report: 'Bug Report',
    feature_request: 'Feature Request',
    assistance: 'Assistance',
    refund_request: 'Refund Request',
};
</script>

<template>
    <Head title="Support Requests" />
    <SettingsLayout>
        <div class="space-y-6">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h1 class="text-xl font-semibold tracking-tight">Support Requests</h1>
                    <p class="text-sm text-muted-foreground mt-1">
                        View your submitted requests. We typically respond within 1–2 business days.
                    </p>
                </div>
                <Link href="/support" class="new-btn">New request</Link>
            </div>

            <!-- Empty state -->
            <Empty v-if="tickets.length === 0">
                <EmptyMedia variant="icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle>No support requests yet</EmptyTitle>
                    <EmptyDescription>Submit a request and we'll get back to you within 1–2 business days.</EmptyDescription>
                </EmptyHeader>
                <EmptyAction>
                    <Link :href="create.url()" class="empty-cta">Submit a request</Link>
                </EmptyAction>
            </Empty>

            <!-- Ticket table -->
            <div v-else class="rounded-lg border border-sidebar-border overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-sidebar-border bg-sidebar">
                            <th class="th">Type</th>
                            <th class="th">Subject</th>
                            <th class="th">Status</th>
                            <th class="th">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="ticket in tickets"
                            :key="ticket.id"
                            class="border-b border-sidebar-border last:border-0 transition-colors"
                        >
                            <td class="td text-muted-foreground font-mono text-xs uppercase tracking-wider">
                                {{ typeLabels[ticket.type] ?? ticket.type }}
                            </td>
                            <td class="td">
                                <Link
                                    :href="`/support/tickets/${ticket.id}`"
                                    class="font-medium hover:underline underline-offset-4"
                                >
                                    {{ ticket.subject }}
                                </Link>
                            </td>
                            <td class="td">
                                <span
                                    class="inline-block font-mono text-xs px-2 py-0.5 rounded border"
                                    :style="{ color: statusConfig[ticket.status]?.color, borderColor: statusConfig[ticket.status]?.color }"
                                >
                                    {{ statusConfig[ticket.status]?.label ?? ticket.status }}
                                </span>
                            </td>
                            <td class="td text-muted-foreground text-xs">
                                {{ new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </SettingsLayout>
</template>

<style scoped>
.th {
    padding: 0.5rem 1rem;
    text-align: left;
    font-size: 0.6875rem;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted-foreground);
    white-space: nowrap;
}

.td {
    padding: 0.75rem 1rem;
    vertical-align: middle;
}

.empty-cta {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    background: #e0ff4f;
    color: #0a0a0c;
    padding: 0.4375rem 0.875rem;
    border-radius: 6px;
    text-decoration: none;
    transition: opacity 0.15s ease;
    display: inline-block;
}

.empty-cta:hover {
    opacity: 0.88;
}

.new-btn {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    background: #e0ff4f;
    color: #0a0a0c;
    padding: 0.4375rem 0.875rem;
    border-radius: 6px;
    text-decoration: none;
    white-space: nowrap;
    flex-shrink: 0;
    transition: opacity 0.15s ease;
    display: inline-block;
}

.new-btn:hover {
    opacity: 0.88;
}
</style>
