<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3';
import { BookOpen, CreditCard, History, LogOut, Settings, Sparkles, Users } from 'lucide-vue-next';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import UserInfo from '@/components/UserInfo.vue';
import { editor, history, logout } from '@/routes';
import { portal as billingPortal } from '@/routes/billing';
import { api as docsApi } from '@/routes/docs';
import { settings as teamsSettings } from '@/routes/teams';
import { edit } from '@/routes/profile';
import type { Auth, User } from '@/types';

type Props = {
    user: User;
    plan?: Auth['plan'];
    showWorkspaceLinks?: boolean;
};

const handleLogout = () => {
    router.flushAll();
};

withDefaults(defineProps<Props>(), {
    plan: null,
    showWorkspaceLinks: false,
});
</script>

<template>
    <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserInfo :user="user" :show-email="true" />
            <span
                v-if="plan"
                class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium"
                :class="
                    plan === 'pro' || plan === 'team'
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                "
            >
                {{ plan === 'pro' || plan === 'team' ? 'Pro' : 'Free' }}
            </span>
        </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup v-if="showWorkspaceLinks">
        <DropdownMenuItem :as-child="true">
            <Link class="block w-full cursor-pointer" :href="editor()">
                <Sparkles class="mr-2 h-4 w-4" />
                My Presets
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem :as-child="true">
            <Link class="block w-full cursor-pointer" :href="history()">
                <History class="mr-2 h-4 w-4" />
                Export History
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem :as-child="true">
            <Link class="block w-full cursor-pointer" :href="teamsSettings()">
                <Users class="mr-2 h-4 w-4" />
                My Team
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem :as-child="true">
            <Link class="block w-full cursor-pointer" :href="billingPortal()">
                <CreditCard class="mr-2 h-4 w-4" />
                Billing &amp; Plan
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem :as-child="true">
            <Link class="block w-full cursor-pointer" :href="docsApi()">
                <BookOpen class="mr-2 h-4 w-4" />
                API Docs
            </Link>
        </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator v-if="showWorkspaceLinks" />
    <DropdownMenuGroup>
        <DropdownMenuItem :as-child="true">
            <Link class="block w-full cursor-pointer" :href="edit()" prefetch>
                <Settings class="mr-2 h-4 w-4" />
                Settings
            </Link>
        </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem :as-child="true">
        <Link
            class="block w-full cursor-pointer"
            :href="logout()"
            @click="handleLogout"
            as="button"
            data-test="logout-button"
        >
            <LogOut class="mr-2 h-4 w-4" />
            Log out
        </Link>
    </DropdownMenuItem>
</template>
