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
        created_at: string;
        replies: Array<{
            id: number;
            is_staff_reply: boolean;
            message: string;
            created_at: string;
            author: { name: string } | null;
        }>;
    };
}>();

const isClosed = props.ticket.status === 'closed';

const form = useForm({ message: '' });

function submitReply() {
    form.post(`/support/tickets/${props.ticket.id}/reply`, {
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
    <Head :title="`${ticket.subject} — Support`" />
    <AppLayout>
        <div class="show-page">
            <!-- Ticket header -->
            <div class="ticket-header">
                <div class="ticket-meta">
                    <span class="ticket-ref">#POLSH-{{ ticket.id }}</span>
                    <span class="ticket-status" :class="`status--${ticket.status}`">
                        {{ ticket.status.replace('_', ' ') }}
                    </span>
                </div>
                <h1 class="ticket-subject">{{ ticket.subject }}</h1>
                <p class="ticket-desc">{{ ticket.description }}</p>
            </div>

            <!-- Reply thread -->
            <div v-if="ticket.replies.length > 0" class="reply-thread">
                <div
                    v-for="reply in ticket.replies"
                    :key="reply.id"
                    class="reply"
                    :class="{ 'reply--staff': reply.is_staff_reply }"
                >
                    <div class="reply-header">
                        <span class="reply-author">
                            {{ reply.is_staff_reply ? 'Polsh Support' : (reply.author?.name ?? 'You') }}
                        </span>
                        <span class="reply-date">{{ new Date(reply.created_at).toLocaleDateString() }}</span>
                    </div>
                    <p class="reply-message">{{ reply.message }}</p>
                </div>
            </div>

            <!-- Reply form -->
            <div class="reply-form-wrap">
                <div v-if="isClosed" class="closed-note">
                    This ticket is closed. Open a new request if you need further help.
                </div>
                <form v-else class="reply-form" @submit.prevent="submitReply">
                    <textarea
                        v-model="form.message"
                        class="reply-textarea"
                        rows="4"
                        placeholder="Write a reply..."
                        required
                    />
                    <p v-if="form.errors.message" class="field-error">{{ form.errors.message }}</p>
                    <button type="submit" class="reply-btn" :disabled="form.processing">
                        {{ form.processing ? 'Sending...' : 'Send reply' }}
                    </button>
                </form>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.show-page { max-width: 48rem; margin: 0 auto; padding: 2rem 1.5rem 4rem; display: flex; flex-direction: column; gap: 2rem; }
.ticket-header { border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; background: #111114; }
.ticket-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.875rem; }
.ticket-ref { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #e0ff4f; }
.ticket-status { font-family: 'DM Mono', monospace; font-size: 0.75rem; text-transform: capitalize; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #8a8a9a; }
.status--open { color: #8a8a9a; }
.status--in_progress { color: #e0ff4f; }
.status--resolved { color: #4fff8a; }
.status--closed { color: #4a4a5a; }
.ticket-subject { font-family: 'DM Sans', sans-serif; font-size: 1.25rem; font-weight: 600; color: #f0f0f2; letter-spacing: -0.025em; margin: 0 0 0.75rem; }
.ticket-desc { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #8a8a9a; line-height: 1.65; margin: 0; white-space: pre-wrap; }
.reply-thread { display: flex; flex-direction: column; gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
.reply { padding: 1.25rem 1.5rem; background: #111114; }
.reply--staff { border-left: 3px solid rgba(224,255,79,0.4); background: rgba(224,255,79,0.02); }
.reply-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.625rem; }
.reply-author { font-family: 'DM Mono', monospace; font-size: 0.8125rem; color: #f0f0f2; }
.reply-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; }
.reply-message { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #8a8a9a; line-height: 1.65; margin: 0; white-space: pre-wrap; }
.closed-note { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; padding: 1rem 1.25rem; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; background: #111114; }
.reply-form { display: flex; flex-direction: column; gap: 0.75rem; }
.reply-textarea { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem 1rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; outline: none; resize: vertical; width: 100%; box-sizing: border-box; }
.reply-textarea:focus { border-color: rgba(224,255,79,0.4); }
.field-error { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #ff6b6b; margin: 0; }
.reply-btn { font-family: 'DM Mono', monospace; font-size: 0.8125rem; background: #e0ff4f; color: #0a0a0c; padding: 0.625rem 1.25rem; border-radius: 7px; border: none; cursor: pointer; align-self: flex-start; }
.reply-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
