<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { Paperclip, X } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import PublicLayout from '@/layouts/PublicLayout.vue';

const page = usePage();
const user = page.props.auth?.user as { name: string; email: string } | null;

defineProps<{
    subscription?: {
        plan: string;
        lemon_squeezy_id: string;
        status: string;
        renews_at: string | null;
        ends_at: string | null;
        on_grace_period: boolean;
    } | null;
}>();

const types = [
    { value: 'bug_report', label: 'Bug Report', icon: '🐛', desc: 'Something is not working as expected' },
    { value: 'feature_request', label: 'Feature Request', icon: '✨', desc: 'Suggest an idea or improvement' },
    { value: 'assistance', label: 'Get Assistance', icon: '💬', desc: 'General help or questions' },
    { value: 'refund_request', label: 'Refund Request', icon: '💳', desc: 'Request a refund for your subscription' },
];

const subjectTemplates: Record<string, string> = {
    bug_report: 'Bug Report: [Brief description of the issue]',
    feature_request: 'Feature Request: [Brief description of the feature]',
    assistance: 'Help needed with [topic]',
    refund_request: 'Refund Request – Pro Subscription',
};

const descriptionTemplates: Record<string, string> = {
    bug_report: `**What happened?**
[Describe what went wrong]

**Steps to reproduce:**
1.
2.
3.

**Expected behavior:**
[What did you expect to happen?]

**Browser / device:**
[e.g. Chrome on macOS]`,
    feature_request: `**What would you like to see?**
[Describe the feature or improvement]

**Why would this be useful?**
[Explain the problem it solves or the value it adds]

**Any examples or references?**
[Links, screenshots, or other tools that do something similar]`,
    assistance: `**What do you need help with?**
[Describe your question or situation]

**What have you already tried?**
[Optional — any steps you've taken so far]`,
    refund_request: `**Reason for refund request:**
[Explain why you are requesting a refund]

**Additional context:**
[Any other information that may be relevant]`,
};

const form = useForm({
    type: '' as string,
    subject: '',
    description: '',
    submitter_name: '',
    submitter_email: '',
    attachment: null as File | null,
});

const submitted = ref(false);
const ticketRef = ref('');
const attachmentInput = ref<HTMLInputElement | null>(null);
const subjectUserEdited = ref(false);
const descriptionUserEdited = ref(false);

const isRefund = computed(() => form.type === 'refund_request');

function selectType(value: string) {
    const previousTemplate = form.type ? subjectTemplates[form.type] : null;
    form.type = value;

    // Apply subject template unless user has written custom content
    if (!subjectUserEdited.value || form.subject === previousTemplate || !form.subject) {
        form.subject = subjectTemplates[value] ?? '';
        subjectUserEdited.value = false;
    }

    // Apply description template unless user has written custom content
    if (!descriptionUserEdited.value || form.description === (form.type ? descriptionTemplates[form.type] : null) || !form.description) {
        form.description = descriptionTemplates[value] ?? '';
        descriptionUserEdited.value = false;
    }
}

function onSubjectInput() {
    const currentTemplate = form.type ? subjectTemplates[form.type] : null;
    subjectUserEdited.value = form.subject !== currentTemplate;
}

function onDescriptionInput() {
    const currentTemplate = form.type ? descriptionTemplates[form.type] : null;
    descriptionUserEdited.value = form.description !== currentTemplate;
}

function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    form.attachment = file;
}

function clearFile() {
    form.attachment = null;

    if (attachmentInput.value) {
attachmentInput.value.value = '';
}
}

function submit() {
    form.post('/support', {
        forceFormData: true,
        onSuccess: () => {
            if (!user) {
                submitted.value = true;
                ticketRef.value = (page.props.flash as any)?.success ?? '';
            }
        },
    });
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<template>
    <Head title="New Support Request" />
    <PublicLayout>
        <div class="support-page">
            <div class="support-container">
                <div class="support-header">
                    <h1 class="support-title">How can we help?</h1>
                    <p class="support-sub">We typically respond within 1–2 business days.</p>
                </div>

                <!-- Guest success state -->
                <div v-if="submitted" class="support-success">
                    <div class="success-icon">✓</div>
                    <h2 class="success-heading">Request received</h2>
                    <p class="success-msg">{{ ticketRef }}</p>
                    <p class="success-note">We'll follow up at your email address.</p>
                </div>

                <form v-else class="support-form" @submit.prevent="submit">
                    <!-- Type selector -->
                    <div class="field-group">
                        <label class="field-label">What do you need help with?</label>
                        <div class="type-grid">
                            <button
                                v-for="t in types"
                                :key="t.value"
                                type="button"
                                class="type-card"
                                :class="{ 'type-card--active': form.type === t.value }"
                                @click="selectType(t.value)"
                            >
                                <span class="type-icon">{{ t.icon }}</span>
                                <span class="type-label">{{ t.label }}</span>
                                <span class="type-desc">{{ t.desc }}</span>
                            </button>
                        </div>
                        <p v-if="form.errors.type" class="field-error">{{ form.errors.type }}</p>
                    </div>

                    <!-- Subscription reference card (refund only) -->
                    <div v-if="isRefund && subscription" class="subscription-card">
                        <div class="sub-card-header">
                            <span class="sub-card-label">Active Subscription</span>
                            <span class="sub-card-badge">{{ subscription.plan }}</span>
                        </div>
                        <dl class="sub-card-details">
                            <div class="sub-detail">
                                <dt>Subscription ID</dt>
                                <dd>{{ subscription.lemon_squeezy_id }}</dd>
                            </div>
                            <div class="sub-detail">
                                <dt>{{ subscription.on_grace_period ? 'Ends on' : 'Next billing' }}</dt>
                                <dd>{{ formatDate(subscription.on_grace_period ? subscription.ends_at! : subscription.renews_at!) }}</dd>
                            </div>
                            <div class="sub-detail">
                                <dt>Status</dt>
                                <dd class="sub-status-active">{{ subscription.status }}</dd>
                            </div>
                        </dl>
                        <p class="sub-card-note">This subscription will be referenced in your refund request.</p>
                    </div>

                    <div v-else-if="isRefund && !subscription" class="no-sub-note">
                        <span>⚠️</span>
                        <span>No active subscription found on your account. If you believe this is an error, please describe your situation below.</span>
                    </div>

                    <!-- Guest fields -->
                    <template v-if="!user">
                        <div class="field-row">
                            <div class="field-group">
                                <label class="field-label" for="submitter_name">Your name</label>
                                <input
                                    id="submitter_name"
                                    v-model="form.submitter_name"
                                    :class="['field-input', { 'field-input--error': form.errors.submitter_name }]"
                                    type="text"
                                    placeholder="Full name"
                                />
                                <p v-if="form.errors.submitter_name" class="field-error">{{ form.errors.submitter_name }}</p>
                            </div>
                            <div class="field-group">
                                <label class="field-label" for="submitter_email">Email address</label>
                                <input
                                    id="submitter_email"
                                    v-model="form.submitter_email"
                                    :class="['field-input', { 'field-input--error': form.errors.submitter_email }]"
                                    type="email"
                                    placeholder="you@example.com"
                                />
                                <p v-if="form.errors.submitter_email" class="field-error">{{ form.errors.submitter_email }}</p>
                            </div>
                        </div>
                    </template>

                    <!-- Auth user info -->
                    <div v-else class="submitter-info">
                        Submitting as <strong>{{ user.name }}</strong> ({{ user.email }})
                    </div>

                    <!-- Subject -->
                    <div class="field-group">
                        <label class="field-label" for="subject">Subject</label>
                        <input
                            id="subject"
                            v-model="form.subject"
                            :class="['field-input', { 'field-input--error': form.errors.subject }]"
                            type="text"
                            placeholder="Brief summary of your request"
                            @input="onSubjectInput"
                        />
                        <p v-if="form.errors.subject" class="field-error">{{ form.errors.subject }}</p>
                    </div>

                    <!-- Description -->
                    <div class="field-group">
                        <label class="field-label" for="description">Description</label>
                        <textarea
                            id="description"
                            v-model="form.description"
                            :class="['field-textarea', { 'field-input--error': form.errors.description }]"
                            rows="9"
                            placeholder="Please provide as much detail as possible..."
                            @input="onDescriptionInput"
                        />
                        <p v-if="form.errors.description" class="field-error">{{ form.errors.description }}</p>
                    </div>

                    <!-- Optional file attachment -->
                    <div class="field-group">
                        <label class="field-label">Attachment <span class="field-label-optional">(optional)</span></label>
                        <div v-if="!form.attachment" class="file-drop" @click="attachmentInput?.click()">
                            <Paperclip class="file-icon" />
                            <span class="file-prompt">Click to attach a file</span>
                            <span class="file-hint">JPG, PNG, GIF, PDF, TXT, DOC — max 10 MB</span>
                        </div>
                        <div v-else class="file-selected">
                            <Paperclip class="file-icon-sm" />
                            <span class="file-name">{{ form.attachment.name }}</span>
                            <span class="file-size">({{ (form.attachment.size / 1024).toFixed(0) }} KB)</span>
                            <button type="button" class="file-clear" @click="clearFile">
                                <X class="size-3.5" />
                            </button>
                        </div>
                        <input
                            ref="attachmentInput"
                            type="file"
                            class="hidden"
                            accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
                            @change="onFileChange"
                        />
                        <p v-if="form.errors.attachment" class="field-error">{{ form.errors.attachment }}</p>
                    </div>

                    <button type="submit" class="submit-btn" :disabled="form.processing || !form.type">
                        {{ form.processing ? 'Sending...' : 'Submit request' }}
                    </button>
                </form>
            </div>
        </div>
    </PublicLayout>
</template>

<style scoped>
.support-page { padding: 4rem 0 6rem; }
.support-container { max-width: 42rem; margin: 0 auto; padding: 0 1.5rem; }
.support-header { margin-bottom: 2.5rem; }
.support-title { font-family: 'DM Sans', sans-serif; font-size: clamp(1.75rem, 4vw, 2.25rem); font-weight: 700; color: #f0f0f2; letter-spacing: -0.035em; margin: 0 0 0.5rem; }
.support-sub { font-family: 'DM Sans', sans-serif; font-size: 1rem; color: #6a6a7a; margin: 0; }
.support-form { display: flex; flex-direction: column; gap: 1.5rem; }
.support-success { text-align: center; padding: 3rem 2rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; background: #111114; }
.success-icon { font-size: 2rem; color: #e0ff4f; margin-bottom: 1rem; }
.success-heading { font-family: 'DM Sans', sans-serif; font-size: 1.25rem; font-weight: 600; color: #f0f0f2; margin: 0 0 0.5rem; }
.success-msg { font-family: 'DM Mono', monospace; font-size: 0.875rem; color: #e0ff4f; margin: 0 0 0.5rem; }
.success-note { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; margin: 0; }

.field-group { display: flex; flex-direction: column; gap: 0.5rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field-label { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #6a6a7a; text-transform: uppercase; letter-spacing: 0.08em; }
.field-label-optional { text-transform: none; color: #4a4a5a; font-size: 0.6875rem; }
.field-input, .field-textarea { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.625rem 0.875rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; outline: none; transition: border-color 0.15s ease; width: 100%; box-sizing: border-box; }
.field-input:focus, .field-textarea:focus { border-color: rgba(224,255,79,0.4); }
.field-textarea { resize: vertical; }
.field-input--error { border-color: rgba(255, 107, 107, 0.5) !important; }
.field-error { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #ff6b6b; margin: 0; }

/* Type selector */
.type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.type-card { display: flex; flex-direction: column; gap: 0.25rem; padding: 1rem; background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; text-align: left; transition: border-color 0.15s ease, background 0.15s ease; }
.type-card--active { border-color: rgba(224,255,79,0.5); background: rgba(224,255,79,0.04); }
.type-icon { font-size: 1.25rem; }
.type-label { font-family: 'DM Mono', monospace; font-size: 0.875rem; color: #f0f0f2; }
.type-desc { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #6a6a7a; }

/* Subscription card */
.subscription-card { background: rgba(224,255,79,0.04); border: 1px solid rgba(224,255,79,0.2); border-radius: 10px; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }
.sub-card-header { display: flex; align-items: center; justify-content: space-between; }
.sub-card-label { font-family: 'DM Mono', monospace; font-size: 0.6875rem; color: #e0ff4f; text-transform: uppercase; letter-spacing: 0.1em; }
.sub-card-badge { font-family: 'DM Mono', monospace; font-size: 0.75rem; background: rgba(224,255,79,0.12); color: #e0ff4f; padding: 0.125rem 0.5rem; border-radius: 4px; text-transform: capitalize; }
.sub-card-details { display: flex; flex-direction: column; gap: 0.5rem; margin: 0; }
.sub-detail { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.sub-detail dt { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #6a6a7a; }
.sub-detail dd { font-family: 'DM Mono', monospace; font-size: 0.8125rem; color: #c0c0d0; margin: 0; word-break: break-all; }
.sub-status-active { color: #4fff8a !important; }
.sub-card-note { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; margin: 0; }

.no-sub-note { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.875rem 1rem; background: rgba(255,165,0,0.06); border: 1px solid rgba(255,165,0,0.2); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #c8a06a; }

/* Auth user info */
.submitter-info { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
.submitter-info strong { color: #f0f0f2; }

/* File upload */
.file-drop { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; padding: 1.25rem; background: #111114; border: 1px dashed rgba(255,255,255,0.12); border-radius: 8px; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease; text-align: center; }
.file-drop:hover { border-color: rgba(224,255,79,0.3); background: rgba(224,255,79,0.02); }
.file-icon { width: 1.25rem; height: 1.25rem; color: #4a4a5a; }
.file-prompt { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #8a8a9a; }
.file-hint { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: #4a4a5a; }
.file-selected { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 0.875rem; background: #111114; border: 1px solid rgba(224,255,79,0.2); border-radius: 8px; }
.file-icon-sm { width: 1rem; height: 1rem; color: #e0ff4f; flex-shrink: 0; }
.file-name { font-family: 'DM Mono', monospace; font-size: 0.8125rem; color: #f0f0f2; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-size { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: #6a6a7a; white-space: nowrap; }
.file-clear { display: flex; align-items: center; justify-content: center; width: 1.25rem; height: 1.25rem; border: none; background: rgba(255,255,255,0.06); border-radius: 4px; cursor: pointer; color: #8a8a9a; flex-shrink: 0; }
.file-clear:hover { background: rgba(255,107,107,0.15); color: #ff6b6b; }

.submit-btn { font-family: 'DM Mono', monospace; font-size: 0.875rem; font-weight: 500; background: #e0ff4f; color: #0a0a0c; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; transition: opacity 0.15s ease; align-self: flex-start; }
.submit-btn:hover:not(:disabled) { opacity: 0.88; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 600px) { .type-grid, .field-row { grid-template-columns: 1fr; } }
</style>
