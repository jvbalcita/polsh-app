<script setup lang="ts">
import { ref } from 'vue';
import { Head, Link, router, usePage } from '@inertiajs/vue3';

interface ExportSession {
    id: number;
    style_slug: string;
    image_count: number;
    thumbnail_url: string | null;
    created_at: string;
}

const props = defineProps<{
    sessions: ExportSession[];
}>();

const page = usePage();
const isPro = page.props.isPro as boolean;

const FREE_HISTORY_LIMIT = 10;

// Free users see only the 10 most recent exports; server already limits the query
const visibleSessions = props.sessions;
const hasMore = !isPro && props.sessions.length >= FREE_HISTORY_LIMIT;

const localSessions = ref<ExportSession[]>(visibleSessions);

function reopen(sessionId: number): void {
    router.visit('/editor', { data: { session: sessionId } });
}

async function deleteSession(sessionId: number): Promise<void> {
    const xsrf = decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');

    await fetch(`/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'X-XSRF-TOKEN': xsrf },
    });

    localSessions.value = localSessions.value.filter((s) => s.id !== sessionId);
}

function relativeTime(dateString: string): string {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
}
</script>

<template>
    <Head title="Export History" />

    <div
        class="min-h-screen"
        style="background: #080808"
    >
        <!-- Topbar -->
        <header
            class="flex h-11 items-center justify-between border-b border-white/8 px-6"
            style="background: #111111"
        >
            <div class="flex items-center gap-3">
                <Link
                    href="/editor"
                    class="text-sm font-semibold tracking-tight"
                    style="color: #e0ff4f"
                >
                    polsh
                </Link>
                <span class="text-xs text-white/20">/ history</span>
            </div>
            <Link
                href="/editor"
                class="flex items-center gap-1.5 text-[11px] text-white/35 transition-colors hover:text-white/60"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back to editor
            </Link>
        </header>

        <div class="mx-auto max-w-5xl px-6 py-10">
            <!-- Page header -->
            <div class="mb-8">
                <h1 class="text-xl font-semibold text-white/85">Export History</h1>
                <p class="mt-1 text-sm text-white/35">Your recent exports. Click "Re-open" to restore the style and settings.</p>
            </div>

            <!-- Empty state -->
            <div
                v-if="localSessions.length === 0"
                class="flex flex-col items-center justify-center rounded-xl border border-white/8 py-20 text-center"
                style="background: #111111"
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" class="mb-4 text-white/20">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <p class="text-sm font-medium text-white/40">No exports yet</p>
                <p class="mt-1 text-xs text-white/20">Export an image from the editor to see it here</p>
                <Link
                    href="/editor"
                    class="mt-5 rounded-md px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                    style="background: #e0ff4f; color: #080808"
                >
                    Open editor
                </Link>
            </div>

            <!-- Session grid -->
            <div
                v-else
                class="grid gap-4"
                style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))"
            >
                <div
                    v-for="session in localSessions"
                    :key="session.id"
                    class="group overflow-hidden rounded-xl border border-white/8 transition-colors hover:border-white/15"
                    style="background: #111111"
                >
                    <!-- Thumbnail -->
                    <div class="relative aspect-video overflow-hidden border-b border-white/8" style="background: #0a0a0a">
                        <img
                            v-if="session.thumbnail_url"
                            :src="session.thumbnail_url"
                            :alt="`Export — ${session.style_slug}`"
                            class="h-full w-full object-cover"
                        />
                        <div
                            v-else
                            class="flex h-full items-center justify-center"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-white/15">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        </div>

                        <!-- Delete button (on hover) -->
                        <button
                            type="button"
                            class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white/40 opacity-0 transition-all hover:bg-black/90 hover:text-white/80 group-hover:opacity-100"
                            title="Delete"
                            @click="deleteSession(session.id)"
                        >
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Card body -->
                    <div class="px-4 py-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                                <p class="truncate text-[12px] font-medium text-white/70">{{ session.style_slug }}</p>
                                <p class="mt-0.5 text-[11px] text-white/30">
                                    {{ session.image_count }} {{ session.image_count === 1 ? 'image' : 'images' }}
                                    · {{ relativeTime(session.created_at) }}
                                </p>
                            </div>
                            <button
                                type="button"
                                class="shrink-0 rounded-md border border-white/12 px-2.5 py-1 text-[10px] font-semibold text-white/45 transition-colors hover:border-white/25 hover:text-white/70"
                                @click="reopen(session.id)"
                            >
                                Re-open
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pro upgrade nudge for free users who have more history -->
            <div
                v-if="hasMore"
                class="mt-6 rounded-xl border border-[#e0ff4f]/15 px-6 py-5 text-center"
                style="background: rgba(224,255,79,0.04)"
            >
                <p class="text-sm font-medium text-white/60">
                    Free tier shows your 3 most recent exports.
                </p>
                <p class="mt-1 text-xs text-white/35">
                    Upgrade to Pro to access your full export history (up to 20 exports).
                </p>
                <Link
                    href="/billing"
                    class="mt-4 inline-block rounded-md px-5 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                    style="background: #e0ff4f; color: #080808"
                >
                    Upgrade to Pro →
                </Link>
            </div>
        </div>
    </div>
</template>
