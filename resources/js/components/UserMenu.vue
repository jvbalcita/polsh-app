<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserMenuContent from '@/components/UserMenuContent.vue';
import { github as githubRoute } from '@/routes/auth';

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
            <UserMenuContent :user="user" :plan="plan" show-workspace-links />
        </DropdownMenuContent>
    </DropdownMenu>

    <!-- Unauthenticated: ghost "Sign in" button -->
    <Link v-else :href="githubRoute()" class="sign-in-btn">Sign in</Link>
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

:deep(.user-dropdown) {
    width: 228px;
    background: #222228;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 4px;
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
