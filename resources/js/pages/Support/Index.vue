<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
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
    <Head title="Support — Polsh" />
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
            <div v-if="tickets.length === 0" class="empty-state">
                <p class="text-sm text-muted-foreground">No support requests yet.</p>
                <Link href="/support" class="new-btn mt-3">Submit a request</Link>
            </div>

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

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem 0;
}
</style>
