<script setup lang="ts">
import { Form, Head, Link, usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import AvatarCropModal from '@/components/AvatarCropModal.vue';
import Heading from '@/components/Heading.vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { send } from '@/routes/verification';
import type { User } from '@/types';

type Props = {
    mustVerifyEmail: boolean;
    status?: string;
    avatarUrl?: string | null;
};

const props = defineProps<Props>();

const page = usePage();
const user = computed(() => page.props.auth.user as User);

const displayAvatarUrl = ref<string | null>(props.avatarUrl ?? null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const cropModalOpen = ref(false);
const cropImageSrc = ref<string>('');

function openFilePicker() {
    fileInputRef.value?.click();
}

function onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        cropImageSrc.value = e.target?.result as string;
        cropModalOpen.value = true;
    };

    reader.readAsDataURL(file);
    input.value = '';
}

function onAvatarSaved(newAvatarUrl: string) {
    displayAvatarUrl.value = newAvatarUrl;
}

const userInitials = computed(() => {
    const name = user.value?.name ?? '';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
});
</script>

<template>
    <SettingsLayout>
        <Head title="Profile settings" />

        <h1 class="sr-only">Profile settings</h1>

        <div class="space-y-6">
            <Heading
                variant="small"
                title="Profile"
                description="Your name, email address, and avatar"
            />

            <!-- Avatar -->
            <div
                class="flex items-center gap-4 rounded-lg border border-[#222] bg-[#141414] p-4"
            >
                <div class="relative flex-shrink-0">
                    <img
                        v-if="displayAvatarUrl"
                        :src="displayAvatarUrl"
                        :alt="user.name"
                        class="h-14 w-14 rounded-full object-cover"
                    />
                    <div
                        v-else
                        class="flex h-14 w-14 items-center justify-center rounded-full bg-[#e0ff4f] text-lg font-bold text-black"
                    >
                        {{ userInitials }}
                    </div>
                </div>

                <div class="flex-1">
                    <p class="text-sm font-medium text-[#ccc]">{{ user.name }}</p>
                    <p class="text-xs text-[#555]">Click edit to upload a new avatar</p>
                </div>

                <Button variant="outline" size="sm" @click="openFilePicker">
                    Edit
                </Button>

                <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="hidden"
                    @change="onFileSelected"
                />
            </div>

            <!-- Profile form -->
            <Form
                v-bind="ProfileController.update.form()"
                class="space-y-6"
                v-slot="{ errors, processing, recentlySuccessful }"
            >
                <div class="grid gap-2">
                    <Label for="name">Name</Label>
                    <Input
                        id="name"
                        class="mt-1 block w-full"
                        name="name"
                        :default-value="user.name"
                        required
                        autocomplete="name"
                        placeholder="Full name"
                    />
                    <InputError class="mt-2" :message="errors.name" />
                </div>

                <div class="grid gap-2">
                    <Label for="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        class="mt-1 block w-full"
                        name="email"
                        :default-value="user.email"
                        required
                        autocomplete="username"
                        placeholder="Email address"
                    />
                    <InputError class="mt-2" :message="errors.email" />
                </div>

                <div v-if="mustVerifyEmail && !user.email_verified_at">
                    <p class="-mt-4 text-sm text-muted-foreground">
                        Your email address is unverified.
                        <Link
                            :href="send()"
                            as="button"
                            class="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                        >
                            Click here to resend the verification email.
                        </Link>
                    </p>

                    <div
                        v-if="status === 'verification-link-sent'"
                        class="mt-2 text-sm font-medium text-green-600"
                    >
                        A new verification link has been sent to your email address.
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <Button
                        :disabled="processing"
                        data-test="update-profile-button"
                        >Save changes</Button
                    >

                    <Transition
                        enter-active-class="transition ease-in-out"
                        enter-from-class="opacity-0"
                        leave-active-class="transition ease-in-out"
                        leave-to-class="opacity-0"
                    >
                        <p
                            v-show="recentlySuccessful"
                            class="text-sm text-neutral-600"
                        >
                            Saved.
                        </p>
                    </Transition>
                </div>
            </Form>
        </div>

        <Separator />

        <AvatarCropModal
            v-model:open="cropModalOpen"
            :image-src="cropImageSrc"
            @saved="onAvatarSaved"
        />
    </SettingsLayout>
</template>
