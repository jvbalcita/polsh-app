<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';

defineProps<{
    tickets: Array<{
        id: number;
        type: string;
        subject: string;
        status: string;
        created_at: string;
    }>;
}>();

const statusColors: Record<string, string> = {
    open: '#6a6a7a',
    in_progress: '#e0ff4f',
    resolved: '#4fff8a',
    closed: '#3a3a4a',
};

const typeLabels: Record<string, string> = {
    bug_report: 'Bug Report',
    feature_request: 'Feature Request',
    assistance: 'Assistance',
    refund_request: 'Refund',
};
</script>

<template>
    <Head title="My Support Tickets" />
    <AppLayout>
        <div class="tickets-page">
            <div class="tickets-header">
                <h1 class="tickets-title">My Support Tickets</h1>
                <Link href="/support" class="new-ticket-btn">New request</Link>
            </div>

            <div v-if="tickets.length === 0" class="empty-state">
                <p class="empty-text">No support requests yet.</p>
                <Link href="/support" class="new-ticket-btn">Submit a request</Link>
            </div>

            <div v-else class="tickets-list">
                <Link
                    v-for="ticket in tickets"
                    :key="ticket.id"
                    :href="`/support/tickets/${ticket.id}`"
                    class="ticket-row"
                >
                    <span class="ticket-type">{{ typeLabels[ticket.type] ?? ticket.type }}</span>
                    <span class="ticket-subject">{{ ticket.subject }}</span>
                    <span class="ticket-status" :style="{ color: statusColors[ticket.status] }">
                        {{ ticket.status.replace('_', ' ') }}
                    </span>
                    <span class="ticket-date">{{ new Date(ticket.created_at).toLocaleDateString() }}</span>
                </Link>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.tickets-page { max-width: 56rem; margin: 0 auto; padding: 2rem 1.5rem; }
.tickets-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
.tickets-title { font-family: 'DM Sans', sans-serif; font-size: 1.5rem; font-weight: 600; color: #f0f0f2; letter-spacing: -0.025em; margin: 0; }
.new-ticket-btn { font-family: 'DM Mono', monospace; font-size: 0.8125rem; background: #e0ff4f; color: #0a0a0c; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0; }
.empty-text { font-family: 'DM Sans', sans-serif; color: #6a6a7a; margin: 0; }
.tickets-list { display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
.ticket-row { display: grid; grid-template-columns: 130px 1fr 110px 100px; align-items: center; gap: 1rem; padding: 1rem 1.25rem; background: #111114; border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; transition: background 0.1s ease; }
.ticket-row:last-child { border-bottom: none; }
.ticket-row:hover { background: #141417; }
.ticket-type { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #6a6a7a; text-transform: uppercase; letter-spacing: 0.06em; }
.ticket-subject { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #f0f0f2; }
.ticket-status { font-family: 'DM Mono', monospace; font-size: 0.75rem; text-transform: capitalize; text-align: right; }
.ticket-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; text-align: right; }
</style>
