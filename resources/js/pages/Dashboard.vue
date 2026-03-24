<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { AlertCircle, CheckCircle2, Clock, Inbox, MessageSquare, Ticket } from 'lucide-vue-next';
import AppLayout from '@/layouts/AppLayout.vue';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { index as adminSupportIndex, show as adminSupportShow } from '@/routes/admin/support';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

const props = defineProps<{
    stats: {
        total: number;
        open: number;
        in_progress: number;
        resolved: number;
        closed: number;
    };
    recentTickets: Array<{
        id: number;
        user_id: number | null;
        submitter_name: string | null;
        type: string;
        subject: string;
        status: string;
        created_at: string;
        user: { id: number; name: string } | null;
    }>;
}>();

const statusConfig: Record<string, { label: string; color: string }> = {
    open: { label: 'Open', color: '#8a8a9a' },
    in_progress: { label: 'In Progress', color: '#e0ff4f' },
    resolved: { label: 'Resolved', color: '#4fff8a' },
    closed: { label: 'Closed', color: '#3a3a4a' },
};

const typeLabels: Record<string, string> = {
    bug_report: 'Bug Report',
    feature_request: 'Feature Request',
    assistance: 'Assistance',
    refund_request: 'Refund Request',
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function submitterName(ticket: typeof props.recentTickets[number]): string {
    return ticket.user?.name ?? ticket.submitter_name ?? 'Guest';
}
</script>

<template>
    <Head title="Admin Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="admin-dashboard">
            <!-- Header -->
            <div class="admin-header">
                <div>
                    <h1 class="admin-title">Admin Dashboard</h1>
                    <p class="admin-sub">Overview of support activity and platform health.</p>
                </div>
                <Link :href="adminSupportIndex()" class="admin-cta">View all tickets →</Link>
            </div>

            <!-- Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon stat-icon--total"><Inbox class="stat-svg" /></div>
                    <div class="stat-body">
                        <p class="stat-label">Total Tickets</p>
                        <p class="stat-value">{{ stats.total }}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon stat-icon--open"><AlertCircle class="stat-svg" /></div>
                    <div class="stat-body">
                        <p class="stat-label">Open</p>
                        <p class="stat-value">{{ stats.open }}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon stat-icon--progress"><Clock class="stat-svg" /></div>
                    <div class="stat-body">
                        <p class="stat-label">In Progress</p>
                        <p class="stat-value">{{ stats.in_progress }}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon stat-icon--resolved"><CheckCircle2 class="stat-svg" /></div>
                    <div class="stat-body">
                        <p class="stat-label">Resolved</p>
                        <p class="stat-value">{{ stats.resolved }}</p>
                    </div>
                </div>
            </div>

            <!-- Recent Tickets -->
            <div class="section">
                <div class="section-header">
                    <div class="section-title-row">
                        <MessageSquare class="section-icon" />
                        <h2 class="section-title">Recent Tickets</h2>
                    </div>
                    <Link :href="adminSupportIndex()" class="section-link">View all</Link>
                </div>

                <div v-if="recentTickets.length === 0" class="py-8">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Ticket />
                            </EmptyMedia>
                        </EmptyHeader>
                        <EmptyTitle>No tickets yet</EmptyTitle>
                        <EmptyDescription>Support requests will appear here once submitted.</EmptyDescription>
                    </Empty>
                </div>

                <div v-else class="tickets-table-wrap">
                    <table class="tickets-table">
                        <thead>
                            <tr>
                                <th>Ref</th>
                                <th>Subject</th>
                                <th>Type</th>
                                <th>Submitter</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="ticket in recentTickets"
                                :key="ticket.id"
                                class="ticket-row"
                                @click="() => $inertia.visit(adminSupportShow({ ticket: ticket.id }))"
                            >
                                <td class="td-ref">#POLSH-{{ ticket.id }}</td>
                                <td class="td-subject">{{ ticket.subject }}</td>
                                <td class="td-type">{{ typeLabels[ticket.type] ?? ticket.type }}</td>
                                <td class="td-submitter">{{ submitterName(ticket) }}</td>
                                <td class="td-status">
                                    <span
                                        class="status-badge"
                                        :style="{ color: statusConfig[ticket.status]?.color ?? '#8a8a9a', borderColor: statusConfig[ticket.status]?.color ?? '#8a8a9a' }"
                                    >
                                        {{ statusConfig[ticket.status]?.label ?? ticket.status }}
                                    </span>
                                </td>
                                <td class="td-date">{{ formatDate(ticket.created_at) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.admin-dashboard {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.admin-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.admin-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--foreground);
    letter-spacing: -0.03em;
    margin: 0 0 0.25rem;
}

.admin-sub {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
}

.admin-cta {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: #0a0a0c;
    background: #e0ff4f;
    padding: 0.4375rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    transition: opacity 0.15s ease;
    white-space: nowrap;
    flex-shrink: 0;
}

.admin-cta:hover {
    opacity: 0.88;
}

/* Stats */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--sidebar-background);
    border: 1px solid var(--sidebar-border);
    border-radius: 12px;
}

.stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stat-icon--total { background: rgba(255, 255, 255, 0.05); }
.stat-icon--open { background: rgba(255, 107, 107, 0.1); }
.stat-icon--progress { background: rgba(224, 255, 79, 0.1); }
.stat-icon--resolved { background: rgba(79, 255, 138, 0.1); }

.stat-icon--total .stat-svg { color: var(--muted-foreground); }
.stat-icon--open .stat-svg { color: #ff6b6b; }
.stat-icon--progress .stat-svg { color: #e0ff4f; }
.stat-icon--resolved .stat-svg { color: #4fff8a; }

.stat-svg {
    width: 1.125rem;
    height: 1.125rem;
}

.stat-body {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.stat-label {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin: 0;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--foreground);
    line-height: 1;
    margin: 0;
    letter-spacing: -0.04em;
}

/* Section */
.section {
    background: var(--sidebar-background);
    border: 1px solid var(--sidebar-border);
    border-radius: 12px;
    overflow: hidden;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--sidebar-border);
}

.section-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-icon {
    width: 1rem;
    height: 1rem;
    color: var(--muted-foreground);
}

.section-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--foreground);
    margin: 0;
}

.section-link {
    font-size: 0.8125rem;
    color: var(--muted-foreground);
    text-decoration: none;
    transition: color 0.15s ease;
}

.section-link:hover {
    color: var(--foreground);
}

/* Table */
.tickets-table-wrap {
    overflow-x: auto;
}

.tickets-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.tickets-table thead th {
    text-align: left;
    padding: 0.625rem 1.25rem;
    font-size: 0.6875rem;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted-foreground);
    border-bottom: 1px solid var(--sidebar-border);
    white-space: nowrap;
}

.ticket-row {
    cursor: pointer;
    transition: background 0.12s ease;
}

.ticket-row:hover {
    background: var(--sidebar-accent);
}

.ticket-row:not(:last-child) td {
    border-bottom: 1px solid var(--sidebar-border);
}

.tickets-table td {
    padding: 0.75rem 1.25rem;
    color: var(--foreground);
    white-space: nowrap;
}

.td-ref {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: var(--muted-foreground) !important;
}

.td-subject {
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.td-type {
    color: var(--muted-foreground) !important;
}

.td-submitter {
    color: var(--muted-foreground) !important;
}

.td-date {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: var(--muted-foreground) !important;
}

.status-badge {
    display: inline-block;
    font-family: 'DM Mono', monospace;
    font-size: 0.6875rem;
    font-weight: 500;
    padding: 0.1875rem 0.5rem;
    border-radius: 4px;
    border: 1px solid currentColor;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

@media (max-width: 900px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 520px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .admin-dashboard {
        padding: 1rem;
    }
}
</style>
