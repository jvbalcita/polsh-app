<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3';
import SettingsLayout from '@/layouts/settings/Layout.vue';

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

const isClosed = props.ticket.status === 'closed';
const form = useForm({ message: '' });

function submitReply() {
    form.post(`/support/tickets/${props.ticket.id}/reply`, {
        preserveScroll: true,
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
    <Head :title="`${ticket.subject} — Support`" />
    <SettingsLayout>
        <div class="space-y-6">
            <!-- Back + header -->
            <div>
                <Link href="/support/tickets" class="back-link">← All requests</Link>
                <div class="flex items-center gap-3 mt-3 mb-1">
                    <span class="font-mono text-xs text-[#e0ff4f]">#POLSH-{{ ticket.id }}</span>
                    <span class="font-mono text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded uppercase tracking-wider">
                        {{ typeLabels[ticket.type] ?? ticket.type }}
                    </span>
                    <span
                        class="ml-auto font-mono text-xs px-2 py-0.5 rounded border"
                        :style="{ color: statusConfig[ticket.status]?.color, borderColor: statusConfig[ticket.status]?.color }"
                    >
                        {{ statusConfig[ticket.status]?.label ?? ticket.status }}
                    </span>
                </div>
                <h1 class="text-lg font-semibold tracking-tight">{{ ticket.subject }}</h1>
                <p class="text-xs text-muted-foreground mt-1">
                    Submitted {{ new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
                </p>
            </div>

            <!-- Original description -->
            <div class="rounded-lg border border-sidebar-border bg-sidebar p-4">
                <p class="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Your request</p>
                <p class="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{{ ticket.description }}</p>
            </div>

            <!-- Reply thread -->
            <div v-if="ticket.replies.length > 0" class="rounded-lg border border-sidebar-border overflow-hidden">
                <div
                    v-for="reply in ticket.replies"
                    :key="reply.id"
                    class="p-4 border-b border-sidebar-border last:border-0"
                    :class="reply.is_staff_reply ? 'border-l-2 border-l-[rgba(224,255,79,0.4)] bg-[rgba(224,255,79,0.02)]' : 'bg-sidebar'"
                >
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-xs font-medium">
                            {{ reply.is_staff_reply ? 'Polsh Support' : 'You' }}
                        </span>
                        <span class="text-xs text-muted-foreground">
                            {{ new Date(reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                        </span>
                    </div>
                    <p class="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{{ reply.message }}</p>
                </div>
            </div>

            <!-- Reply form / closed notice -->
            <div v-if="isClosed" class="rounded-lg border border-sidebar-border bg-sidebar p-4 text-sm text-muted-foreground">
                This ticket is closed. <Link href="/support" class="underline underline-offset-4 hover:text-foreground transition-colors">Open a new request</Link> if you need further help.
            </div>
            <div v-else class="space-y-3">
                <p class="text-xs font-mono text-muted-foreground uppercase tracking-widest">Add a reply</p>
                <textarea
                    v-model="form.message"
                    class="reply-textarea"
                    rows="5"
                    placeholder="Write a reply..."
                />
                <p v-if="form.errors.message" class="text-xs text-destructive">{{ form.errors.message }}</p>
                <div>
                    <button class="reply-btn" :disabled="form.processing" @click.prevent="submitReply">
                        {{ form.processing ? 'Sending…' : 'Send reply' }}
                    </button>
                </div>
            </div>
        </div>
    </SettingsLayout>
</template>

<style scoped>
.back-link {
    font-size: 0.8125rem;
    color: var(--muted-foreground);
    text-decoration: none;
    transition: color 0.15s ease;
}

.back-link:hover {
    color: var(--foreground);
}

.reply-textarea {
    width: 100%;
    background: var(--sidebar-background);
    border: 1px solid var(--sidebar-border);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: var(--foreground);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9375rem;
    outline: none;
    resize: vertical;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
}

.reply-textarea:focus {
    border-color: rgba(224, 255, 79, 0.4);
}

.reply-btn {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    background: #e0ff4f;
    color: #0a0a0c;
    padding: 0.5rem 1.25rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s ease;
}

.reply-btn:hover:not(:disabled) {
    opacity: 0.88;
}

.reply-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
