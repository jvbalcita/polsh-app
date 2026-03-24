<script setup lang="ts">
import { Form, Head } from '@inertiajs/vue3';
import { ShieldCheck } from 'lucide-vue-next';
import { onUnmounted, ref } from 'vue';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import DeleteUser from '@/components/DeleteUser.vue';
import Heading from '@/components/Heading.vue';
import InputError from '@/components/InputError.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import TwoFactorRecoveryCodes from '@/components/TwoFactorRecoveryCodes.vue';
import TwoFactorSetupModal from '@/components/TwoFactorSetupModal.vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTwoFactorAuth } from '@/composables/useTwoFactorAuth';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { destroy as destroyProvider } from '@/routes/security/providers';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    hasPassword?: boolean;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    connectedProviders?: string[];
};

withDefaults(defineProps<Props>(), {
    hasPassword: false,
    canManageTwoFactor: false,
    requiresConfirmation: false,
    twoFactorEnabled: false,
    connectedProviders: () => [],
});

const { hasSetupData, clearTwoFactorAuthData } = useTwoFactorAuth();
const showSetupModal = ref<boolean>(false);

onUnmounted(() => clearTwoFactorAuthData());

const providerLabels: Record<string, string> = {
    github: 'GitHub',
    google: 'Google',
};
</script>

<template>
    <SettingsLayout>
        <Head title="Security settings" />

        <h1 class="sr-only">Security settings</h1>

        <div class="space-y-6">
            <Heading
                variant="small"
                title="Security"
                description="Password, two-factor authentication, and connected accounts"
            />

            <!-- Password -->
            <div class="space-y-4">
                <div>
                    <h3 class="text-sm font-semibold text-foreground">Password</h3>
                    <p class="text-sm text-muted-foreground">
                        {{ hasPassword ? 'Update your account password' : 'Create a password for your account' }}
                    </p>
                </div>

                <p
                    v-if="!hasPassword"
                    class="rounded-md border border-amber-800/30 bg-amber-900/10 px-3 py-2 text-xs text-amber-400"
                >
                    You signed in with a connected provider — no current password required.
                </p>

                <Form
                    v-bind="SecurityController.update.form()"
                    :options="{ preserveScroll: true }"
                    reset-on-success
                    :reset-on-error="['password', 'password_confirmation', 'current_password']"
                    class="space-y-4"
                    v-slot="{ errors, processing, recentlySuccessful }"
                >
                    <div v-if="hasPassword" class="grid gap-2">
                        <Label for="current_password">Current password</Label>
                        <PasswordInput
                            id="current_password"
                            name="current_password"
                            class="mt-1 block w-full"
                            autocomplete="current-password"
                            placeholder="Current password"
                        />
                        <InputError :message="errors.current_password" />
                    </div>

                    <div class="grid gap-2">
                        <Label for="password">{{ hasPassword ? 'New password' : 'Password' }}</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            class="mt-1 block w-full"
                            autocomplete="new-password"
                            placeholder="New password"
                        />
                        <InputError :message="errors.password" />
                    </div>

                    <div class="grid gap-2">
                        <Label for="password_confirmation">Confirm password</Label>
                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            class="mt-1 block w-full"
                            autocomplete="new-password"
                            placeholder="Confirm password"
                        />
                        <InputError :message="errors.password_confirmation" />
                    </div>

                    <div class="flex items-center gap-4">
                        <Button :disabled="processing" data-test="update-password-button">
                            {{ hasPassword ? 'Update password' : 'Set password' }}
                        </Button>

                        <Transition
                            enter-active-class="transition ease-in-out"
                            enter-from-class="opacity-0"
                            leave-active-class="transition ease-in-out"
                            leave-to-class="opacity-0"
                        >
                            <p v-show="recentlySuccessful" class="text-sm text-neutral-600">
                                Saved.
                            </p>
                        </Transition>
                    </div>
                </Form>
            </div>

            <Separator />

            <!-- Two-Factor Authentication -->
            <div v-if="canManageTwoFactor" class="space-y-4">
                <div>
                    <h3 class="text-sm font-semibold text-foreground">
                        Two-factor authentication
                    </h3>
                    <p class="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                    </p>
                </div>

                <!-- Locked: no password -->
                <div v-if="!hasPassword && !twoFactorEnabled" class="space-y-2">
                    <p class="text-sm text-muted-foreground">
                        Set a password before enabling two-factor authentication.
                    </p>
                </div>

                <!-- 2FA not enabled -->
                <div
                    v-else-if="!twoFactorEnabled"
                    class="flex flex-col items-start justify-start space-y-4"
                >
                    <p class="text-sm text-muted-foreground">
                        When you enable two-factor authentication, you will be prompted for
                        a secure pin during login. This pin can be retrieved from a
                        TOTP-supported application on your phone.
                    </p>

                    <div>
                        <Button v-if="hasSetupData" @click="showSetupModal = true">
                            <ShieldCheck />Continue setup
                        </Button>
                        <Form
                            v-else
                            v-bind="enable.form()"
                            @success="showSetupModal = true"
                            #default="{ processing }"
                        >
                            <Button type="submit" :disabled="processing">
                                Enable 2FA
                            </Button>
                        </Form>
                    </div>
                </div>

                <!-- 2FA enabled -->
                <div
                    v-else
                    class="flex flex-col items-start justify-start space-y-4"
                >
                    <p class="text-sm text-muted-foreground">
                        You will be prompted for a secure, random pin during login, which
                        you can retrieve from the TOTP-supported application on your phone.
                    </p>

                    <div class="relative inline">
                        <Form v-bind="disable.form()" #default="{ processing }">
                            <Button
                                variant="destructive"
                                type="submit"
                                :disabled="processing"
                            >
                                Disable 2FA
                            </Button>
                        </Form>
                    </div>

                    <TwoFactorRecoveryCodes />
                </div>

                <TwoFactorSetupModal
                    v-model:isOpen="showSetupModal"
                    :requiresConfirmation="requiresConfirmation"
                    :twoFactorEnabled="twoFactorEnabled"
                />
            </div>

            <Separator v-if="connectedProviders.length > 0" />

            <!-- Connected Providers -->
            <div v-if="connectedProviders.length > 0" class="space-y-4">
                <div>
                    <h3 class="text-sm font-semibold text-foreground">
                        Connected providers
                    </h3>
                    <p class="text-sm text-muted-foreground">
                        OAuth accounts linked to your profile
                    </p>
                </div>

                <div class="space-y-2">
                    <div
                        v-for="provider in connectedProviders"
                        :key="provider"
                        class="flex items-center gap-3 rounded-lg border border-[#222] bg-[#141414] px-4 py-3"
                    >
                        <span class="flex-1 text-sm font-medium text-[#ccc]">
                            {{ providerLabels[provider] ?? provider }}
                        </span>

                        <span
                            class="rounded-full bg-emerald-950/50 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
                        >
                            Connected
                        </span>

                        <Form
                            v-bind="destroyProvider.form(provider)"
                            :options="{ preserveScroll: true }"
                            #default="{ processing }"
                        >
                            <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                :disabled="processing || !hasPassword"
                                :title="!hasPassword ? 'Set a password before disconnecting' : undefined"
                                class="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Disconnect
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>

            <Separator />

            <!-- Danger Zone -->
            <div class="space-y-4">
                <div>
                    <h3 class="text-sm font-semibold text-destructive">Danger Zone</h3>
                    <p class="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                    </p>
                </div>

                <DeleteUser />
            </div>
        </div>
    </SettingsLayout>
</template>
