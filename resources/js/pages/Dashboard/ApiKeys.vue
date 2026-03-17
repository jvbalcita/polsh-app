<script setup lang="ts">
import { Head, Link, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

interface ApiKey {
    id: number;
    name: string;
    key_prefix: string;
    last_used_at: string | null;
    requests_today: number;
    requests_reset_at: string;
    revoked_at: string | null;
    created_at: string;
}

const props = defineProps<{
    apiKeys: ApiKey[];
}>();

const page = usePage();
const isPro = page.props.isPro as boolean;
const hasTeam = !!(page.props.teamId as number | null);

const dailyLimit = hasTeam ? 5000 : 500;

// Create form state
const showCreateForm = ref(false);
const isCreating = ref(false);
const newKeyName = ref('');
const createError = ref('');

// Revealed key state — shown once after creation
const revealedKey = ref('');
const revealedKeyName = ref('');
const copied = ref(false);

// Revoke state
const revokingId = ref<number | null>(null);

const xsrfToken = (): string =>
    decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');

async function createKey(): Promise<void> {
    if (!newKeyName.value.trim()) return;
    isCreating.value = true;
    createError.value = '';

    try {
        const res = await fetch('/dashboard/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
            body: JSON.stringify({ name: newKeyName.value.trim() }),
        });

        if (!res.ok) {
            const data = await res.json();
            createError.value = data.message ?? 'Failed to create key.';
            return;
        }

        const data = await res.json();

        // Show the plaintext key ONCE
        revealedKey.value = data.key;
        revealedKeyName.value = data.name;
        showCreateForm.value = false;
        newKeyName.value = '';

        // Add to list with a placeholder (no real key shown)
        props.apiKeys.unshift({
            id: data.id,
            name: data.name,
            key_prefix: data.key_prefix,
            last_used_at: null,
            requests_today: 0,
            requests_reset_at: new Date().toISOString(),
            revoked_at: null,
            created_at: new Date().toISOString(),
        });
    } finally {
        isCreating.value = false;
    }
}

async function copyKey(): Promise<void> {
    await navigator.clipboard.writeText(revealedKey.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
}

async function revokeKey(apiKey: ApiKey): Promise<void> {
    if (!confirm(`Revoke key "${apiKey.name}"? This cannot be undone.`)) return;
    revokingId.value = apiKey.id;

    try {
        await fetch(`/dashboard/api-keys/${apiKey.id}/revoke`, {
            method: 'POST',
            headers: { 'X-XSRF-TOKEN': xsrfToken() },
        });

        const idx = props.apiKeys.findIndex((k) => k.id === apiKey.id);
        if (idx !== -1) {
            props.apiKeys[idx].revoked_at = new Date().toISOString();
        }
    } finally {
        revokingId.value = null;
    }
}

function usagePercent(key: ApiKey): number {
    return Math.min(100, Math.round((key.requests_today / dailyLimit) * 100));
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<template>
    <Head title="API Keys" />

    <div class="min-h-screen" style="background: #080808">
        <!-- Topbar -->
        <header class="flex h-11 items-center justify-between border-b border-white/8 px-6" style="background: #111111">
            <div class="flex items-center gap-3">
                <Link href="/editor" class="text-sm font-semibold tracking-tight" style="color: #e0ff4f">polsh</Link>
                <span class="text-xs text-white/20">/ api keys</span>
            </div>
            <Link
                href="/editor"
                class="flex items-center gap-1.5 text-[11px] text-white/35 transition-colors hover:text-white/60"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to editor
            </Link>
        </header>

        <div class="mx-auto max-w-2xl px-6 py-10">
            <!-- Pro gate -->
            <div
                v-if="!isPro"
                class="rounded-xl border border-[#e0ff4f]/15 px-6 py-8 text-center"
                style="background: rgba(224,255,79,0.04)"
            >
                <h2 class="text-base font-semibold text-white/70">API access is a Pro feature</h2>
                <p class="mt-2 text-sm text-white/35">Upgrade to Pro to generate API keys and use the REST API.</p>
                <Link
                    href="/billing"
                    class="mt-5 inline-block rounded-md px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                    style="background: #e0ff4f; color: #080808"
                >
                    Upgrade to Pro →
                </Link>
            </div>

            <template v-else>
                <!-- Header -->
                <div class="mb-8 flex items-start justify-between">
                    <div>
                        <h1 class="text-xl font-semibold text-white/85">API Keys</h1>
                        <p class="mt-1 text-sm text-white/35">
                            Use these keys to authenticate requests to the Polsh API.
                            <Link href="/docs/api" class="text-[#e0ff4f]/70 hover:text-[#e0ff4f] transition-colors">View docs →</Link>
                        </p>
                    </div>
                    <button
                        type="button"
                        class="shrink-0 rounded-md px-4 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-80"
                        style="background: #e0ff4f; color: #080808"
                        @click="showCreateForm = true"
                    >
                        + New key
                    </button>
                </div>

                <!-- Rate limit info -->
                <div class="mb-5 flex items-center gap-2 rounded-md border border-white/6 px-4 py-2.5" style="background: rgba(255,255,255,0.03)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white/30">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    <span class="text-[11px] text-white/40">
                        Rate limit: <span class="text-white/60">{{ dailyLimit.toLocaleString() }} requests/day</span>
                        {{ hasTeam ? '(team plan)' : '(Pro plan)' }}
                    </span>
                </div>

                <!-- Revealed key modal -->
                <div
                    v-if="revealedKey"
                    class="mb-6 rounded-xl border border-[#e0ff4f]/20 p-5"
                    style="background: rgba(224,255,79,0.05)"
                >
                    <div class="mb-2 flex items-center justify-between">
                        <p class="text-[11px] font-semibold uppercase tracking-widest text-[#e0ff4f]/70">
                            Key created — copy it now
                        </p>
                        <button
                            type="button"
                            class="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                            @click="revealedKey = ''"
                        >
                            Dismiss ✕
                        </button>
                    </div>
                    <p class="mb-3 text-[11px] text-white/40">
                        This is the only time <strong class="text-white/60">{{ revealedKeyName }}</strong> will be shown.
                        Store it somewhere safe.
                    </p>
                    <div class="flex items-center gap-2">
                        <code
                            class="min-w-0 flex-1 truncate rounded border border-white/10 px-3 py-1.5 font-mono text-[11px] text-[#e0ff4f]/80"
                            style="background: rgba(0,0,0,0.4)"
                        >{{ revealedKey }}</code>
                        <button
                            type="button"
                            class="shrink-0 rounded border px-3 py-1.5 text-[11px] font-semibold transition-colors"
                            :style="copied ? 'border-color: rgba(224,255,79,0.4); color: #e0ff4f' : 'border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.5)'"
                            @click="copyKey"
                        >
                            {{ copied ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>

                <!-- Create form inline -->
                <div
                    v-if="showCreateForm"
                    class="mb-5 rounded-xl border border-white/10 p-5"
                    style="background: #111111"
                >
                    <p class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">New key</p>
                    <div class="flex gap-2">
                        <input
                            v-model="newKeyName"
                            type="text"
                            maxlength="60"
                            placeholder="e.g. CI pipeline"
                            class="min-w-0 flex-1 rounded border px-3 py-1.5 text-[12px] outline-none"
                            style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #e0e0e0"
                            @keydown.enter="createKey"
                            @keydown.escape="showCreateForm = false"
                        />
                        <button
                            type="button"
                            :disabled="isCreating || !newKeyName.trim()"
                            class="shrink-0 rounded px-3 py-1.5 text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                            style="background: #e0ff4f; color: #080808"
                            @click="createKey"
                        >
                            {{ isCreating ? '…' : 'Create' }}
                        </button>
                        <button
                            type="button"
                            class="shrink-0 rounded px-2 py-1.5 text-[11px] text-white/30 transition-opacity hover:text-white/60"
                            @click="showCreateForm = false"
                        >
                            ✕
                        </button>
                    </div>
                    <p v-if="createError" class="mt-1.5 text-[11px] text-red-400">{{ createError }}</p>
                </div>

                <!-- Keys list -->
                <div
                    v-if="apiKeys.length > 0"
                    class="rounded-xl border border-white/8 overflow-hidden"
                    style="background: #111111"
                >
                    <div
                        v-for="key in apiKeys"
                        :key="key.id"
                        class="border-b border-white/5 px-5 py-4 last:border-0"
                        :class="{ 'opacity-50': key.revoked_at }"
                    >
                        <div class="flex items-start justify-between gap-4">
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <p class="text-[12px] font-medium text-white/75">{{ key.name }}</p>
                                    <span
                                        v-if="key.revoked_at"
                                        class="rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-400/70"
                                    >Revoked</span>
                                </div>
                                <p class="mt-0.5 font-mono text-[10px] text-white/30">{{ key.key_prefix }}••••••••••••••••••••••••••••••••</p>
                                <p class="mt-0.5 text-[10px] text-white/25">
                                    Created {{ formatDate(key.created_at) }}
                                    <span class="mx-1">·</span>
                                    Last used: {{ formatDate(key.last_used_at) }}
                                </p>
                            </div>
                            <button
                                v-if="!key.revoked_at"
                                type="button"
                                :disabled="revokingId === key.id"
                                class="shrink-0 rounded border border-red-500/20 px-2.5 py-1 text-[10px] font-medium text-red-400/60 transition-colors hover:border-red-500/40 hover:text-red-400/80 disabled:opacity-40"
                                @click="revokeKey(key)"
                            >
                                {{ revokingId === key.id ? '…' : 'Revoke' }}
                            </button>
                        </div>

                        <!-- Usage bar -->
                        <div v-if="!key.revoked_at && key.requests_today > 0" class="mt-3">
                            <div class="mb-1 flex justify-between">
                                <span class="text-[10px] text-white/25">Today</span>
                                <span class="text-[10px] tabular-nums text-white/35">
                                    {{ key.requests_today.toLocaleString() }} / {{ dailyLimit.toLocaleString() }}
                                </span>
                            </div>
                            <div class="h-1 w-full overflow-hidden rounded-full" style="background: rgba(255,255,255,0.06)">
                                <div
                                    class="h-full rounded-full transition-all"
                                    :style="{
                                        width: usagePercent(key) + '%',
                                        background: usagePercent(key) > 80 ? '#f97316' : '#e0ff4f',
                                    }"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-else-if="!showCreateForm" class="rounded-xl border border-white/6 px-6 py-10 text-center" style="background: #111111">
                    <p class="text-sm text-white/30">No API keys yet.</p>
                    <button
                        type="button"
                        class="mt-4 text-[12px] text-[#e0ff4f]/70 transition-colors hover:text-[#e0ff4f]"
                        @click="showCreateForm = true"
                    >
                        Create your first key →
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>
