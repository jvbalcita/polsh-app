<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/AppLayout.vue';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Support Tickets', href: '/admin/support' },
];

const props = defineProps<{
    tickets: {
        data: Array<{
            id: number;
            type: string;
            subject: string;
            status: string;
            submitter_name: string;
            assigned_admin_id: number | null;
            updated_at: string;
            assigned_admin: { name: string } | null;
        }>;
        current_page: number;
        last_page: number;
    };
    admins: Array<{ id: number; name: string }>;
    filters: { status?: string; type?: string; assigned?: string };
}>();

const statusFilter = ref(props.filters.status ?? '');
const typeFilter = ref(props.filters.type ?? '');

function applyFilters() {
    router.get('/admin/support', {
        status: statusFilter.value || undefined,
        type: typeFilter.value || undefined,
    }, { preserveState: true, replace: true });
}

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
</script>

<template>
    <Head title="Admin — Support Tickets" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-6 p-6">
            <!-- Header -->
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 class="text-xl font-semibold tracking-tight">Support Tickets</h1>
                    <p class="text-sm text-muted-foreground mt-0.5">{{ tickets.data.length }} tickets shown</p>
                </div>
                <div class="flex items-center gap-3">
                    <Select v-model="statusFilter" @update:model-value="applyFilters">
                        <SelectTrigger class="w-40">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select v-model="typeFilter" @update:model-value="applyFilters">
                        <SelectTrigger class="w-44">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All types</SelectItem>
                            <SelectItem value="bug_report">Bug Report</SelectItem>
                            <SelectItem value="feature_request">Feature Request</SelectItem>
                            <SelectItem value="assistance">Assistance</SelectItem>
                            <SelectItem value="refund_request">Refund Request</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <!-- Table -->
            <div class="rounded-xl border border-sidebar-border overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-sidebar-border bg-sidebar">
                            <th class="th">Ref</th>
                            <th class="th">Submitter</th>
                            <th class="th">Type</th>
                            <th class="th">Subject</th>
                            <th class="th">Status</th>
                            <th class="th">Assigned</th>
                            <th class="th">Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="ticket in tickets.data"
                            :key="ticket.id"
                            class="border-b border-sidebar-border last:border-0 hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
                            @click="router.visit(`/admin/support/${ticket.id}`)"
                        >
                            <td class="td font-mono text-xs text-muted-foreground">#POLSH-{{ ticket.id }}</td>
                            <td class="td font-medium">{{ ticket.submitter_name }}</td>
                            <td class="td text-muted-foreground">{{ typeLabels[ticket.type] ?? ticket.type }}</td>
                            <td class="td max-w-xs truncate">{{ ticket.subject }}</td>
                            <td class="td">
                                <span
                                    class="inline-block font-mono text-xs px-2 py-0.5 rounded border"
                                    :style="{ color: statusConfig[ticket.status]?.color, borderColor: statusConfig[ticket.status]?.color }"
                                >
                                    {{ statusConfig[ticket.status]?.label ?? ticket.status }}
                                </span>
                            </td>
                            <td class="td text-muted-foreground">{{ ticket.assigned_admin?.name ?? '—' }}</td>
                            <td class="td font-mono text-xs text-muted-foreground">{{ new Date(ticket.updated_at).toLocaleDateString() }}</td>
                        </tr>
                        <tr v-if="tickets.data.length === 0">
                            <td colspan="7" class="td text-center text-muted-foreground py-12">No tickets found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="tickets.last_page > 1" class="flex items-center justify-between text-sm text-muted-foreground">
                <span>Page {{ tickets.current_page }} of {{ tickets.last_page }}</span>
                <div class="flex gap-2">
                    <Button
                        v-if="tickets.current_page > 1"
                        variant="outline"
                        size="sm"
                        @click="router.get('/admin/support', { ...filters, page: tickets.current_page - 1 })"
                    >
                        Previous
                    </Button>
                    <Button
                        v-if="tickets.current_page < tickets.last_page"
                        variant="outline"
                        size="sm"
                        @click="router.get('/admin/support', { ...filters, page: tickets.current_page + 1 })"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.th {
    padding: 0.625rem 1rem;
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
</style>
