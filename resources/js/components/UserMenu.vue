<script setup lang="ts">
import { computed } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const page = usePage();
const user = computed(() => (page.props.auth as any)?.user ?? null);
const plan = computed(() => (page.props.auth as any)?.plan ?? 'free');

const initials = computed(() => {
    return (user.value?.name ?? '')
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
});

const isPro = computed(() => plan.value === 'pro' || plan.value === 'team');
</script>

<template>
    <!-- Authenticated: avatar + dropdown -->
    <DropdownMenu v-if="user">
        <DropdownMenuTrigger as-child>
            <button
                type="button"
                class="user-avatar-btn"
                :title="user.name"
            >
                <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    :alt="user.name"
                    class="avatar-img"
                />
                <span v-else class="avatar-initials">{{ initials }}</span>
            </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="user-dropdown">
            <!-- Header: name + email + plan badge -->
            <div class="dropdown-header">
                <div class="dropdown-identity">
                    <div class="dropdown-name">{{ user.name }}</div>
                    <div class="dropdown-email">{{ user.email }}</div>
                </div>
                <span class="plan-badge" :class="isPro ? 'plan-badge--pro' : 'plan-badge--free'">
                    {{ isPro ? 'Pro' : 'Free' }}
                </span>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem @click="router.visit('/editor')">
                My Presets
            </DropdownMenuItem>
            <DropdownMenuItem @click="router.visit('/history')">
                Export History
            </DropdownMenuItem>
            <DropdownMenuItem @click="router.visit('/billing')">
                Billing &amp; Plan
            </DropdownMenuItem>
            <DropdownMenuItem @click="router.visit('/settings/profile')">
                Connected Accounts
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem class="dropdown-logout" @click="router.post('/logout')">
                Log out
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>

    <!-- Unauthenticated: ghost "Sign in" button -->
    <a v-else href="/auth/github" class="sign-in-btn">Sign in</a>
</template>

<style scoped>
.user-avatar-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    overflow: hidden;
    cursor: pointer;
    background: #1a1a1f;
    transition: border-color 150ms ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.user-avatar-btn:hover {
    border-color: rgba(224, 255, 79, 0.4);
}
.user-avatar-btn:focus-visible {
    outline: 2px solid #e0ff4f;
    outline-offset: 2px;
    border-radius: 50%;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-initials {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #e0ff4f;
    line-height: 1;
}

/* Dropdown panel */
:deep(.user-dropdown) {
    width: 228px;
    background: #222228;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 4px;
}

.dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px 8px;
    gap: 8px;
}

.dropdown-identity {
    min-width: 0;
}

.dropdown-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #f0f0f2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dropdown-email {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #4a4a58;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Plan badge */
.plan-badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 999px;
    flex-shrink: 0;
}
.plan-badge--free {
    color: #4a4a58;
    background: #1a1a1f;
    border: 1px solid rgba(255, 255, 255, 0.07);
}
.plan-badge--pro {
    color: #0a0a0c;
    background: #e0ff4f;
}

/* Logout item */
:deep(.dropdown-logout) {
    color: #ff4f4f !important;
}

/* Sign in button */
.sign-in-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #f0f0f2;
    padding: 7px 14px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: transparent;
    cursor: pointer;
    text-decoration: none;
    transition: border-color 150ms ease, background 150ms ease;
    display: inline-flex;
    align-items: center;
}
.sign-in-btn:hover {
    border-color: rgba(255, 255, 255, 0.20);
    background: #1a1a1f;
}
.sign-in-btn:focus-visible {
    outline: 2px solid #e0ff4f;
    outline-offset: 2px;
    border-radius: 6px;
}
</style>
