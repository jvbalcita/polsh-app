<script setup lang="ts">
import { ref } from 'vue';
import { CircleStencil, Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    open: boolean;
    imageSrc: string;
};

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:open': [value: boolean];
    saved: [avatarUrl: string];
}>();

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null);
const saving = ref(false);

async function save() {
    if (!cropperRef.value) {
        return;
    }

    const { canvas } = cropperRef.value.getResult() as { canvas: HTMLCanvasElement };

    saving.value = true;

    canvas.toBlob(async (blob) => {
        if (!blob) {
            saving.value = false;
            return;
        }

        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.png');

        try {
            const xsrfToken = decodeURIComponent(
                document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
            );

            const response = await fetch('/settings/avatar', {
                method: 'POST',
                headers: { 'X-XSRF-TOKEN': xsrfToken },
                body: formData,
            });

            const { avatarUrl } = (await response.json()) as { avatarUrl: string };
            emit('saved', avatarUrl);
            emit('update:open', false);
        } finally {
            saving.value = false;
        }
    }, 'image/png');
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit avatar</DialogTitle>
            </DialogHeader>

            <div class="relative h-72 w-full overflow-hidden rounded-lg bg-[#111]">
                <Cropper
                    ref="cropperRef"
                    :src="imageSrc"
                    :stencil-component="CircleStencil"
                    :image-restriction="'fit-area'"
                    class="h-full w-full"
                />
            </div>

            <div class="flex justify-end gap-2 pt-2">
                <Button
                    variant="ghost"
                    :disabled="saving"
                    @click="emit('update:open', false)"
                >
                    Cancel
                </Button>
                <Button :disabled="saving" @click="save">
                    {{ saving ? 'Saving…' : 'Save' }}
                </Button>
            </div>
        </DialogContent>
    </Dialog>
</template>
