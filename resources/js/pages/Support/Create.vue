<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';
import PublicLayout from '@/layouts/PublicLayout.vue';

const page = usePage();
const user = page.props.auth?.user as { name: string; email: string } | null;

const types = [
    { value: 'bug_report', label: 'Bug Report', icon: '🐛', desc: 'Something is not working as expected' },
    { value: 'feature_request', label: 'Feature Request', icon: '✨', desc: 'Suggest an idea or improvement' },
    { value: 'assistance', label: 'Get Assistance', icon: '💬', desc: 'General help or questions' },
    { value: 'refund_request', label: 'Refund Request', icon: '💳', desc: 'Request a refund for your subscription' },
];

const form = useForm({
    type: '' as string,
    subject: '',
    description: '',
    submitter_name: '',
    submitter_email: '',
});

const submitted = ref(false);
const ticketRef = ref('');

function selectType(value: string) {
    form.type = value;
}

function submit() {
    form.post('/support', {
        onSuccess: () => {
            if (!user) {
                submitted.value = true;
                ticketRef.value = (page.props.flash as any)?.success ?? '';
            }
        },
    });
}
</script>

<template>
    <Head title="Support — Polsh" />
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
                    <!-- Flash success for auth users -->
                    <div v-if="$page.props.flash?.success" class="flash-success">
                        {{ $page.props.flash.success }}
                    </div>

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

                    <!-- Guest fields -->
                    <template v-if="!user">
                        <div class="field-row">
                            <div class="field-group">
                                <label class="field-label" for="submitter_name">Your name</label>
                                <input id="submitter_name" v-model="form.submitter_name" :class="['field-input', { 'field-input--error': form.errors.submitter_name }]" type="text" placeholder="Full name" />
                                <p v-if="form.errors.submitter_name" class="field-error">{{ form.errors.submitter_name }}</p>
                            </div>
                            <div class="field-group">
                                <label class="field-label" for="submitter_email">Email address</label>
                                <input id="submitter_email" v-model="form.submitter_email" :class="['field-input', { 'field-input--error': form.errors.submitter_email }]" type="email" placeholder="you@example.com" />
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
                        <input id="subject" v-model="form.subject" :class="['field-input', { 'field-input--error': form.errors.subject }]" type="text" placeholder="Brief summary of your request" />
                        <p v-if="form.errors.subject" class="field-error">{{ form.errors.subject }}</p>
                    </div>

                    <!-- Description -->
                    <div class="field-group">
                        <label class="field-label" for="description">Description</label>
                        <textarea id="description" v-model="form.description" :class="['field-textarea', { 'field-input--error': form.errors.description }]" rows="6" placeholder="Please provide as much detail as possible..." />
                        <p v-if="form.errors.description" class="field-error">{{ form.errors.description }}</p>
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
.flash-success { background: rgba(224,255,79,0.08); border: 1px solid rgba(224,255,79,0.2); color: #e0ff4f; padding: 0.75rem 1rem; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; }
.field-group { display: flex; flex-direction: column; gap: 0.5rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field-label { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #6a6a7a; text-transform: uppercase; letter-spacing: 0.08em; }
.field-input, .field-textarea { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.625rem 0.875rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; outline: none; transition: border-color 0.15s ease; width: 100%; box-sizing: border-box; }
.field-input:focus, .field-textarea:focus { border-color: rgba(224,255,79,0.4); }
.field-input--error { border-color: rgba(255, 107, 107, 0.5) !important; }
.field-textarea { resize: vertical; }
.field-error { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #ff6b6b; margin: 0; }
.type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.type-card { display: flex; flex-direction: column; gap: 0.25rem; padding: 1rem; background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; text-align: left; transition: border-color 0.15s ease, background 0.15s ease; }
.type-card--active { border-color: rgba(224,255,79,0.5); background: rgba(224,255,79,0.04); }
.type-icon { font-size: 1.25rem; }
.type-label { font-family: 'DM Mono', monospace; font-size: 0.875rem; color: #f0f0f2; }
.type-desc { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #6a6a7a; }
.submitter-info { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
.submitter-info strong { color: #f0f0f2; }
.submit-btn { font-family: 'DM Mono', monospace; font-size: 0.875rem; font-weight: 500; background: #e0ff4f; color: #0a0a0c; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; transition: opacity 0.15s ease; align-self: flex-start; }
.submit-btn:hover:not(:disabled) { opacity: 0.88; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 600px) { .type-grid, .field-row { grid-template-columns: 1fr; } }
</style>
