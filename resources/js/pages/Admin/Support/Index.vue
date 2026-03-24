<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { ref } from 'vue';

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

const statusColors: Record<string, string> = {
    open: '#8a8a9a',
    in_progress: '#e0ff4f',
    resolved: '#4fff8a',
    closed: '#3a3a4a',
};

const typeLabels: Record<string, string> = {
    bug_report: 'Bug', feature_request: 'Feature', assistance: 'Assist', refund_request: 'Refund',
};

const statusFilter = ref(props.filters.status ?? '');
const typeFilter = ref(props.filters.type ?? '');

function applyFilters() {
    router.get('/admin/support', {
        status: statusFilter.value || undefined,
        type: typeFilter.value || undefined,
    }, { preserveState: true, replace: true });
}
</script>

<template>
    <Head title="Admin — Support Tickets" />
    <AppLayout>
        <div class="admin-page">
            <div class="admin-header">
                <h1 class="admin-title">Support Tickets</h1>
                <div class="filters">
                    <select v-model="statusFilter" class="filter-select" @change="applyFilters">
                        <option value="">All statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select v-model="typeFilter" class="filter-select" @change="applyFilters">
                        <option value="">All types</option>
                        <option value="bug_report">Bug Report</option>
                        <option value="feature_request">Feature Request</option>
                        <option value="assistance">Assistance</option>
                        <option value="refund_request">Refund Request</option>
                    </select>
                </div>
            </div>

            <div class="tickets-table">
                <div class="table-header">
                    <span>Submitter</span>
                    <span>Type</span>
                    <span>Subject</span>
                    <span>Status</span>
                    <span>Assigned</span>
                    <span>Updated</span>
                </div>
                <Link
                    v-for="ticket in tickets.data"
                    :key="ticket.id"
                    :href="`/admin/support/${ticket.id}`"
                    class="table-row"
                >
                    <span class="cell-name">{{ ticket.submitter_name }}</span>
                    <span class="cell-type">{{ typeLabels[ticket.type] ?? ticket.type }}</span>
                    <span class="cell-subject">{{ ticket.subject }}</span>
                    <span class="cell-status" :style="{ color: statusColors[ticket.status] }">{{ ticket.status.replace('_', ' ') }}</span>
                    <span class="cell-assigned">{{ ticket.assigned_admin?.name ?? '—' }}</span>
                    <span class="cell-date">{{ new Date(ticket.updated_at).toLocaleDateString() }}</span>
                </Link>
            </div>

            <!-- Pagination -->
            <div v-if="tickets.last_page > 1" class="pagination">
                <span class="page-info">Page {{ tickets.current_page }} of {{ tickets.last_page }}</span>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.admin-page { max-width: 72rem; margin: 0 auto; padding: 2rem 1.5rem; }
.admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.admin-title { font-family: 'DM Sans', sans-serif; font-size: 1.5rem; font-weight: 600; color: #f0f0f2; letter-spacing: -0.025em; margin: 0; }
.filters { display: flex; gap: 0.75rem; }
.filter-select { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 7px; padding: 0.4375rem 0.875rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none; cursor: pointer; }
.tickets-table { border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
.table-header { display: grid; grid-template-columns: 140px 80px 1fr 110px 120px 90px; gap: 1rem; padding: 0.75rem 1.25rem; background: #0e0e11; border-bottom: 1px solid rgba(255,255,255,0.07); }
.table-header span { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #4a4a5a; text-transform: uppercase; letter-spacing: 0.1em; }
.table-row { display: grid; grid-template-columns: 140px 80px 1fr 110px 120px 90px; gap: 1rem; padding: 0.875rem 1.25rem; background: #111114; border-bottom: 1px solid rgba(255,255,255,0.04); text-decoration: none; transition: background 0.1s ease; align-items: center; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #141417; }
.cell-name { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #f0f0f2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-type { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #6a6a7a; }
.cell-subject { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #c0c0d0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-status { font-family: 'DM Mono', monospace; font-size: 0.75rem; text-transform: capitalize; }
.cell-assigned { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; }
.pagination { display: flex; justify-content: center; padding: 1.5rem 0; }
.page-info { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; }
</style>
