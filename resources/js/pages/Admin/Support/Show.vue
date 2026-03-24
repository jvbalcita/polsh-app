<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';

const props = defineProps<{
    ticket: {
        id: number;
        type: string;
        subject: string;
        description: string;
        status: string;
        submitter_name: string;
        submitter_email: string;
        assigned_admin_id: number | null;
        created_at: string;
        replies: Array<{
            id: number;
            is_staff_reply: boolean;
            message: string;
            created_at: string;
            author: { name: string } | null;
        }>;
    };
    admins: Array<{ id: number; name: string }>;
}>();

const statusForm = useForm({
    status: props.ticket.status,
    assigned_admin_id: props.ticket.assigned_admin_id,
});

const replyForm = useForm({ message: '' });

function saveStatus() {
    statusForm.patch(`/admin/support/${props.ticket.id}`, { preserveScroll: true });
}

function submitReply() {
    replyForm.post(`/admin/support/${props.ticket.id}/reply`, {
        preserveScroll: true,
        onSuccess: () => replyForm.reset(),
    });
}
</script>

<template>
    <Head :title="`#POLSH-${ticket.id} — Admin Support`" />
    <AppLayout>
        <div class="admin-show">
            <!-- Left column: thread -->
            <div class="thread-col">
                <div class="ticket-header">
                    <div class="ticket-meta">
                        <span class="ticket-ref">#POLSH-{{ ticket.id }}</span>
                        <span class="ticket-type-badge">{{ ticket.type.replace('_', ' ') }}</span>
                    </div>
                    <h1 class="ticket-subject">{{ ticket.subject }}</h1>
                    <div class="ticket-submitter">From: {{ ticket.submitter_name }} ({{ ticket.submitter_email }})</div>
                    <p class="ticket-desc">{{ ticket.description }}</p>
                </div>

                <div v-if="ticket.replies.length > 0" class="reply-thread">
                    <div
                        v-for="reply in ticket.replies"
                        :key="reply.id"
                        class="reply"
                        :class="{ 'reply--staff': reply.is_staff_reply }"
                    >
                        <div class="reply-header">
                            <span class="reply-author">{{ reply.is_staff_reply ? 'Polsh Support' : (reply.author?.name ?? ticket.submitter_name) }}</span>
                            <span class="reply-date">{{ new Date(reply.created_at).toLocaleDateString() }}</span>
                        </div>
                        <p class="reply-msg">{{ reply.message }}</p>
                    </div>
                </div>

                <!-- Admin reply form -->
                <form class="reply-form" @submit.prevent="submitReply">
                    <div class="reply-form-label">Staff reply</div>
                    <textarea v-model="replyForm.message" class="reply-textarea" rows="5" placeholder="Write a response..." required />
                    <p v-if="replyForm.errors.message" class="field-error">{{ replyForm.errors.message }}</p>
                    <button type="submit" class="reply-btn" :disabled="replyForm.processing">
                        {{ replyForm.processing ? 'Sending...' : 'Send reply' }}
                    </button>
                </form>
            </div>

            <!-- Right column: metadata -->
            <div class="meta-col">
                <div class="meta-card">
                    <h2 class="meta-heading">Manage</h2>

                    <div class="meta-field">
                        <label class="meta-label">Status</label>
                        <select v-model="statusForm.status" class="meta-select">
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div class="meta-field">
                        <label class="meta-label">Assigned to</label>
                        <select v-model="statusForm.assigned_admin_id" class="meta-select">
                            <option :value="null">Unassigned</option>
                            <option v-for="admin in admins" :key="admin.id" :value="admin.id">{{ admin.name }}</option>
                        </select>
                    </div>

                    <button class="save-btn" :disabled="statusForm.processing" @click="saveStatus">
                        {{ statusForm.processing ? 'Saving...' : 'Save changes' }}
                    </button>
                </div>

                <div class="meta-card">
                    <h2 class="meta-heading">Submitter</h2>
                    <p class="meta-text">{{ ticket.submitter_name }}</p>
                    <p class="meta-email">{{ ticket.submitter_email }}</p>
                    <p class="meta-date">Submitted {{ new Date(ticket.created_at).toLocaleDateString() }}</p>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.admin-show { max-width: 72rem; margin: 0 auto; padding: 2rem 1.5rem; display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }
.thread-col { display: flex; flex-direction: column; gap: 1.5rem; }
.ticket-header { border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; background: #111114; }
.ticket-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.ticket-ref { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #e0ff4f; }
.ticket-type-badge { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #6a6a7a; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 4px; }
.ticket-subject { font-family: 'DM Sans', sans-serif; font-size: 1.25rem; font-weight: 600; color: #f0f0f2; letter-spacing: -0.025em; margin: 0 0 0.5rem; }
.ticket-submitter { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #6a6a7a; margin-bottom: 0.875rem; }
.ticket-desc { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #8a8a9a; line-height: 1.65; margin: 0; white-space: pre-wrap; }
.reply-thread { display: flex; flex-direction: column; gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
.reply { padding: 1.25rem 1.5rem; background: #111114; }
.reply--staff { border-left: 3px solid rgba(224,255,79,0.4); background: rgba(224,255,79,0.02); }
.reply-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.625rem; }
.reply-author { font-family: 'DM Mono', monospace; font-size: 0.8125rem; color: #f0f0f2; }
.reply-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; }
.reply-msg { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #8a8a9a; line-height: 1.65; margin: 0; white-space: pre-wrap; }
.reply-form { display: flex; flex-direction: column; gap: 0.75rem; }
.reply-form-label { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #4a4a5a; text-transform: uppercase; letter-spacing: 0.08em; }
.reply-textarea { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem 1rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; outline: none; resize: vertical; width: 100%; box-sizing: border-box; }
.reply-textarea:focus { border-color: rgba(224,255,79,0.4); }
.field-error { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #ff6b6b; margin: 0; }
.reply-btn { font-family: 'DM Mono', monospace; font-size: 0.8125rem; background: #e0ff4f; color: #0a0a0c; padding: 0.625rem 1.25rem; border-radius: 7px; border: none; cursor: pointer; align-self: flex-start; }
.reply-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.meta-col { display: flex; flex-direction: column; gap: 1rem; }
.meta-card { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }
.meta-heading { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #4a4a5a; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
.meta-field { display: flex; flex-direction: column; gap: 0.375rem; }
.meta-label { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #6a6a7a; }
.meta-select { background: #0e0e11; border: 1px solid rgba(255,255,255,0.08); border-radius: 7px; padding: 0.5rem 0.75rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none; width: 100%; }
.save-btn { font-family: 'DM Mono', monospace; font-size: 0.8125rem; background: rgba(255,255,255,0.07); color: #f0f0f2; border: 1px solid rgba(255,255,255,0.1); padding: 0.5625rem 1rem; border-radius: 7px; cursor: pointer; align-self: stretch; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.meta-text { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #f0f0f2; margin: 0; }
.meta-email { font-family: 'DM Mono', monospace; font-size: 0.8125rem; color: #6a6a7a; margin: 0; }
.meta-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; margin: 0; }
@media (max-width: 900px) { .admin-show { grid-template-columns: 1fr; } }
</style>
