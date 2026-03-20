<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';
import ProductPageHeader from '@/components/ProductPageHeader.vue';
import ProductUpgradeCard from '@/components/ProductUpgradeCard.vue';
import { editor } from '@/routes';
import { portal as billingPortal } from '@/routes/billing';
import { invite as inviteTeam, leave as leaveTeamRoute, store as storeTeam } from '@/routes/teams';

interface Member {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: 'owner' | 'member';
    joined_at: string;
}

interface TeamPreset {
    id: number;
    name: string;
    style_slug: string;
}

interface Team {
    id: number;
    name: string;
    slug: string;
    owner_id: number;
}

const props = defineProps<{
    team: Team | null;
    members: Member[];
    teamPresets: TeamPreset[];
}>();

const page = usePage();
const isPro = page.props.isPro as boolean;
const currentUserId = (page.props.auth?.user as { id: number } | null)?.id;

// Create team form
const createForm = useForm({ name: '' });

function submitCreate(): void {
    createForm.post(storeTeam.url(), {
        onSuccess: () => createForm.reset(),
    });
}

// Invite form
const inviteForm = useForm({ email: '' });
const inviteSuccess = ref(false);

function submitInvite(): void {
    if (!props.team) {
return;
}

    inviteForm.post(inviteTeam.url(props.team.id), {
        onSuccess: () => {
            inviteForm.reset();
            inviteSuccess.value = true;
            setTimeout(() => (inviteSuccess.value = false), 3000);
        },
    });
}

// Leave team
const leaveForm = useForm({});

function leaveTeam(): void {
    if (!props.team) {
return;
}

    if (!confirm('Are you sure you want to leave this team?')) {
return;
}

    leaveForm.post(leaveTeamRoute.url(props.team.id));
}

function isOwner(member: Member): boolean {
    return member.role === 'owner';
}
</script>

<template>
    <Head title="Team Settings" />

    <div
        class="min-h-screen"
        style="background: #080808"
    >
        <ProductPageHeader
            context="/ team"
            :home-href="editor()"
            :trailing-href="editor()"
            trailing-label="Back to editor"
        />

        <div class="mx-auto max-w-2xl px-6 py-10">
            <ProductUpgradeCard
                v-if="!isPro"
                title="Teams is a Pro feature"
                description="Upgrade to Pro to create a team and share presets with your teammates."
                :cta-href="billingPortal()"
                cta-label="Upgrade to Pro →"
            >
                <template #icon>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" class="mx-auto mb-4 text-[#e0ff4f]/50">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </template>
            </ProductUpgradeCard>

            <!-- No team: create form -->
            <template v-else-if="!team">
                <div class="mb-8">
                    <h1 class="text-xl font-semibold text-white/85">Create a Team</h1>
                    <p class="mt-1 text-sm text-white/35">
                        Share presets with your teammates by creating a team workspace.
                    </p>
                </div>

                <form
                    class="polsh-panel rounded-xl border border-white/8 p-6"
                    @submit.prevent="submitCreate"
                >
                    <label class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-white/30">
                        Team name
                    </label>
                    <input
                        v-model="createForm.name"
                        type="text"
                        maxlength="60"
                        placeholder="e.g. Acme Design"
                        class="w-full rounded-md border px-3 py-2 text-sm outline-none"
                        style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #e0e0e0"
                        required
                    />
                    <p v-if="createForm.errors.name" class="mt-1 text-[11px] text-red-400">
                        {{ createForm.errors.name }}
                    </p>
                    <button
                        type="submit"
                        :disabled="createForm.processing"
                        class="mt-4 rounded-md px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                        style="background: #e0ff4f; color: #080808"
                    >
                        {{ createForm.processing ? 'Creating…' : 'Create team' }}
                    </button>
                </form>
            </template>

            <!-- Has team: management view -->
            <template v-else>
                <div class="mb-8 flex items-start justify-between">
                    <div>
                        <h1 class="text-xl font-semibold text-white/85">{{ team.name }}</h1>
                        <p class="mt-0.5 text-xs text-white/30">{{ team.slug }}</p>
                    </div>
                </div>

                <!-- Members section -->
                <section class="polsh-panel mb-6 rounded-xl border border-white/8 overflow-hidden">
                    <div class="border-b border-white/8 px-5 py-3">
                        <h2 class="text-[11px] font-semibold uppercase tracking-widest text-white/35">Members</h2>
                    </div>
                    <div class="divide-y divide-white/5">
                        <div
                            v-for="member in members"
                            :key="member.id"
                            class="flex items-center justify-between px-5 py-3"
                        >
                            <div class="flex items-center gap-3">
                                <img
                                    v-if="member.avatar"
                                    :src="member.avatar"
                                    :alt="member.name"
                                    class="h-7 w-7 rounded-full object-cover"
                                />
                                <div
                                    v-else
                                    class="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
                                    style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5)"
                                >
                                    {{ member.name.charAt(0).toUpperCase() }}
                                </div>
                                <div>
                                    <p class="text-[12px] font-medium text-white/75">{{ member.name }}</p>
                                    <p class="text-[10px] text-white/30">{{ member.email }}</p>
                                </div>
                            </div>
                            <span
                                class="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                                :class="isOwner(member) ? 'bg-[#e0ff4f]/15 text-[#e0ff4f]/80' : 'bg-white/6 text-white/35'"
                            >
                                {{ member.role }}
                            </span>
                        </div>
                    </div>
                </section>

                <!-- Invite section (owner only) -->
                <section
                    v-if="currentUserId === team.owner_id"
                    class="polsh-panel mb-6 rounded-xl border border-white/8 p-5"
                >
                    <h2 class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">Invite by email</h2>

                    <div
                        v-if="inviteSuccess"
                        class="mb-3 rounded-md border border-green-500/20 bg-green-500/10 px-3 py-2 text-[11px] text-green-400"
                    >
                        Invitation sent!
                    </div>

                    <form class="flex gap-2" @submit.prevent="submitInvite">
                        <input
                            v-model="inviteForm.email"
                            type="email"
                            placeholder="teammate@example.com"
                            class="min-w-0 flex-1 rounded-md border px-3 py-1.5 text-[12px] outline-none"
                            style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #e0e0e0"
                            required
                        />
                        <button
                            type="submit"
                            :disabled="inviteForm.processing"
                            class="shrink-0 rounded-md border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:opacity-80 disabled:opacity-40"
                            style="border-color: rgba(224,255,79,0.25); color: rgba(224,255,79,0.8)"
                        >
                            {{ inviteForm.processing ? '…' : 'Send invite' }}
                        </button>
                    </form>
                    <p v-if="inviteForm.errors.email" class="mt-1 text-[11px] text-red-400">
                        {{ inviteForm.errors.email }}
                    </p>
                </section>

                <!-- Shared presets -->
                <section
                    v-if="teamPresets.length > 0"
                    class="polsh-panel mb-6 rounded-xl border border-white/8 overflow-hidden"
                >
                    <div class="border-b border-white/8 px-5 py-3">
                        <h2 class="text-[11px] font-semibold uppercase tracking-widest text-white/35">Shared presets</h2>
                    </div>
                    <div class="divide-y divide-white/5">
                        <div
                            v-for="preset in teamPresets"
                            :key="preset.id"
                            class="flex items-center justify-between px-5 py-2.5"
                        >
                            <div>
                                <p class="text-[12px] text-white/70">{{ preset.name }}</p>
                                <p class="text-[10px] text-white/30">{{ preset.style_slug }}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Leave team (non-owners only) -->
                <div v-if="currentUserId !== team.owner_id" class="rounded-xl border border-red-500/15 p-5" style="background: rgba(239,68,68,0.04)">
                    <h2 class="mb-2 text-[11px] font-semibold uppercase tracking-widest text-red-400/60">Danger zone</h2>
                    <p class="mb-3 text-[12px] text-white/35">
                        Leaving the team will remove your access to all shared presets.
                    </p>
                    <button
                        type="button"
                        :disabled="leaveForm.processing"
                        class="rounded-md border border-red-500/30 px-3 py-1.5 text-[11px] font-semibold text-red-400/70 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-40"
                        @click="leaveTeam"
                    >
                        Leave team
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>
