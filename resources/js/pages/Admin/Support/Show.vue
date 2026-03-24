<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { ExternalLink, Paperclip } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
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
        attachment_path: string | null;
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Support Tickets', href: '/admin/support' },
    { title: `#POLSH-${props.ticket.id}`, href: `/admin/support/${props.ticket.id}` },
];

const typeLabels: Record<string, string> = {
    bug_report: 'Bug Report',
    feature_request: 'Feature Request',
    assistance: 'Assistance',
    refund_request: 'Refund Request',
};

const statusConfig: Record<string, { label: string; color: string }> = {
    open: { label: 'Open', color: '#8a8a9a' },
    in_progress: { label: 'In Progress', color: '#e0ff4f' },
    resolved: { label: 'Resolved', color: '#4fff8a' },
    closed: { label: 'Closed', color: '#4a4a5a' },
};

const statusForm = useForm({
    status: props.ticket.status,
    assigned_admin_id: props.ticket.assigned_admin_id as number | null,
});

const replyForm = useForm({ message: '' });

function saveStatus() {
    statusForm.patch(`/admin/support/${props.ticket.id}`, {
        preserveScroll: true,
        onSuccess: () => toast.success('Ticket updated successfully.'),
        onError: () => toast.error('Failed to update ticket.'),
    });
}

function submitReply() {
    replyForm.post(`/admin/support/${props.ticket.id}/reply`, {
        preserveScroll: true,
        onSuccess: () => {
            replyForm.reset();
            toast.success('Reply sent.');
        },
        onError: () => toast.error('Failed to send reply.'),
    });
}

function attachmentUrl(path: string) {
    return `/storage/${path}`;
}

function attachmentName(path: string) {
    return path.split('/').pop() ?? path;
}
</script>

<template>
    <Head :title="`#POLSH-${ticket.id} — Admin Support`" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 p-6 items-start">
            <!-- Thread column -->
            <div class="flex flex-col gap-5">
                <!-- Ticket header -->
                <div class="rounded-xl border border-sidebar-border bg-sidebar p-5">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="font-mono text-xs text-[#e0ff4f]">#POLSH-{{ ticket.id }}</span>
                        <span class="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded uppercase tracking-wider">
                            {{ typeLabels[ticket.type] ?? ticket.type }}
                        </span>
                        <span
                            class="ml-auto font-mono text-xs px-2 py-0.5 rounded border"
                            :style="{ color: statusConfig[ticket.status]?.color, borderColor: statusConfig[ticket.status]?.color }"
                        >
                            {{ statusConfig[ticket.status]?.label ?? ticket.status }}
                        </span>
                    </div>
                    <h1 class="text-lg font-semibold tracking-tight mb-1">{{ ticket.subject }}</h1>
                    <p class="text-sm text-muted-foreground mb-4">From: {{ ticket.submitter_name }} ({{ ticket.submitter_email }})</p>
                    <p class="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{{ ticket.description }}</p>

                    <!-- Attachment -->
                    <a
                        v-if="ticket.attachment_path"
                        :href="attachmentUrl(ticket.attachment_path)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 mt-4 text-xs font-mono text-[#e0ff4f] hover:opacity-80 transition-opacity border border-[rgba(224,255,79,0.25)] px-3 py-1.5 rounded-md"
                    >
                        <Paperclip class="size-3.5" />
                        {{ attachmentName(ticket.attachment_path) }}
                        <ExternalLink class="size-3" />
                    </a>
                </div>

                <!-- Reply thread -->
                <div v-if="ticket.replies.length > 0" class="rounded-xl border border-sidebar-border overflow-hidden">
                    <div
                        v-for="reply in ticket.replies"
                        :key="reply.id"
                        class="p-5 border-b border-sidebar-border last:border-0"
                        :class="reply.is_staff_reply ? 'border-l-2 border-l-[rgba(224,255,79,0.4)] bg-[rgba(224,255,79,0.02)]' : 'bg-sidebar'"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-mono text-sm font-medium">
                                {{ reply.is_staff_reply ? 'Polsh Support' : (reply.author?.name ?? ticket.submitter_name) }}
                            </span>
                            <span class="text-xs text-muted-foreground">{{ new Date(reply.created_at).toLocaleDateString() }}</span>
                        </div>
                        <p class="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{{ reply.message }}</p>
                    </div>
                </div>

                <!-- Admin reply form -->
                <div class="flex flex-col gap-3">
                    <p class="text-xs font-mono text-muted-foreground uppercase tracking-widest">Staff reply</p>
                    <textarea
                        v-model="replyForm.message"
                        class="reply-textarea"
                        rows="5"
                        placeholder="Write a response..."
                    />
                    <p v-if="replyForm.errors.message" class="text-xs text-destructive">{{ replyForm.errors.message }}</p>
                    <div>
                        <Button :disabled="replyForm.processing" @click="submitReply">
                            {{ replyForm.processing ? 'Sending...' : 'Send reply' }}
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Sidebar column -->
            <div class="flex flex-col gap-4">
                <!-- Manage card -->
                <div class="rounded-xl border border-sidebar-border bg-sidebar p-5 flex flex-col gap-4">
                    <h2 class="text-xs font-mono uppercase tracking-widest text-muted-foreground">Manage</h2>

                    <div class="flex flex-col gap-1.5">
                        <label class="text-sm text-muted-foreground">Status</label>
                        <Select v-model="statusForm.status">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label class="text-sm text-muted-foreground">Assigned to</label>
                        <Select :model-value="statusForm.assigned_admin_id?.toString() ?? 'none'" @update:model-value="(v) => statusForm.assigned_admin_id = v !== 'none' ? parseInt(v) : null">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Unassigned</SelectItem>
                                <SelectItem v-for="admin in admins" :key="admin.id" :value="admin.id.toString()">
                                    {{ admin.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button class="w-full" :disabled="statusForm.processing" @click="saveStatus">
                        {{ statusForm.processing ? 'Saving...' : 'Save changes' }}
                    </Button>
                </div>

                <!-- Submitter card -->
                <div class="rounded-xl border border-sidebar-border bg-sidebar p-5 flex flex-col gap-2">
                    <h2 class="text-xs font-mono uppercase tracking-widest text-muted-foreground">Submitter</h2>
                    <p class="text-sm font-medium">{{ ticket.submitter_name }}</p>
                    <p class="font-mono text-xs text-muted-foreground">{{ ticket.submitter_email }}</p>
                    <p class="text-xs text-muted-foreground">Submitted {{ new Date(ticket.created_at).toLocaleDateString() }}</p>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
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
</style>
