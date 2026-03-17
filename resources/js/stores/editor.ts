import { defineStore } from 'pinia';
import { usePage } from '@inertiajs/vue3';
import { computed, markRaw, ref } from 'vue';
import type { EditorImage, EditorSettings } from '@/types/editor';
import type { StyleConfig } from '@/types/style';
import allStyles from '@/styles';

export interface SavedPreset {
    id: number;
    name: string;
    style_slug: string;
    customizations: Partial<EditorSettings>;
    team_id?: number | null;
}

export const useEditorStore = defineStore('editor', () => {
    const page = usePage();
    const images = ref<EditorImage[]>([]);
    const activeIndex = ref<number>(0);
    const activeStyle = ref<StyleConfig>(allStyles[0]);

    const settings = ref<EditorSettings>({
        padding: allStyles[0].padding,
        radius: allStyles[0].radius,
        shadowOpacity: allStyles[0].shadow.opacity,
        shadowBlur: allStyles[0].shadow.blur,
        shadowOffsetY: allStyles[0].shadow.offsetY,
        borderWidth: allStyles[0].border.width,
        noiseGrain: allStyles[0].noise,
        aspectRatio: '16:9',
        exportFormat: 'png',
        exportResolution: 2,
    });

    const activeImage = computed<EditorImage | null>(() => images.value[activeIndex.value] ?? null);

    // Presets (loaded on demand when user is authenticated)
    const presets = ref<SavedPreset[]>([]);
    const teamPresets = ref<SavedPreset[]>([]);
    const presetsLoaded = ref(false);

    async function fetchPresets(): Promise<void> {
        if (presetsLoaded.value) return;
        const res = await fetch('/presets', { headers: { Accept: 'application/json' } });
        if (res.ok) {
            const data = await res.json();
            // Support both old array format and new { user, team } shape
            if (Array.isArray(data)) {
                presets.value = data;
            } else {
                presets.value = data.user ?? [];
                teamPresets.value = data.team ?? [];
            }
        }
        presetsLoaded.value = true;
    }

    async function savePreset(name: string, teamId?: number | null): Promise<SavedPreset | null> {
        const customizations: Partial<EditorSettings> = {
            padding: settings.value.padding,
            radius: settings.value.radius,
            shadowOpacity: settings.value.shadowOpacity,
            shadowBlur: settings.value.shadowBlur,
            shadowOffsetY: settings.value.shadowOffsetY,
            borderWidth: settings.value.borderWidth,
            noiseGrain: settings.value.noiseGrain,
        };
        const res = await fetch('/presets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''),
            },
            body: JSON.stringify({
                name,
                style_slug: activeStyle.value.slug,
                customizations,
                team_id: teamId ?? null,
            }),
        });
        if (!res.ok) return null;
        const preset: SavedPreset = await res.json();

        if (teamId) {
            teamPresets.value.unshift(preset);
        } else {
            presets.value.unshift(preset);
        }

        return preset;
    }

    function loadPreset(preset: SavedPreset): void {
        const style = allStyles.find((s) => s.slug === preset.style_slug);
        if (style) {
            activeStyle.value = style;
        }
        Object.assign(settings.value, preset.customizations);
    }

    async function deletePreset(id: number): Promise<void> {
        await fetch(`/presets/${id}`, {
            method: 'DELETE',
            headers: {
                'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''),
            },
        });
        presets.value = presets.value.filter((p) => p.id !== id);
        teamPresets.value = teamPresets.value.filter((p) => p.id !== id);
    }

    function applyStyle(style: StyleConfig): void {
        activeStyle.value = style;
        settings.value.padding = style.padding;
        settings.value.radius = style.radius;
        settings.value.shadowOpacity = style.shadow.opacity;
        settings.value.shadowBlur = style.shadow.blur;
        settings.value.shadowOffsetY = style.shadow.offsetY;
        settings.value.borderWidth = style.border.width;
        settings.value.noiseGrain = style.noise;
    }

    function addImage(file: File): Promise<void> {
        const imageLimit = (page.props.imageLimit as number) ?? 3;
        if (images.value.length >= imageLimit) {
            return Promise.reject(new Error('IMAGE_LIMIT_REACHED'));
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target?.result as string;
                const img = markRaw(new Image());
                img.onload = () => {
                    images.value.push({
                        id: (crypto.randomUUID ?? (() => `${Date.now()}-${Math.random().toString(36).slice(2)}`))(),
                        src,
                        element: img,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                    });
                    activeIndex.value = images.value.length - 1;
                    resolve();
                };
                img.onerror = reject;
                img.src = src;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function removeImage(id: string): void {
        const index = images.value.findIndex((img) => img.id === id);
        if (index === -1) return;
        images.value.splice(index, 1);
        if (activeIndex.value >= images.value.length) {
            activeIndex.value = Math.max(0, images.value.length - 1);
        }
    }

    function setActiveIndex(index: number): void {
        activeIndex.value = index;
    }

    return {
        images,
        activeIndex,
        activeStyle,
        settings,
        activeImage,
        allStyles,
        presets,
        teamPresets,
        presetsLoaded,
        applyStyle,
        addImage,
        removeImage,
        setActiveIndex,
        fetchPresets,
        savePreset,
        loadPreset,
        deletePreset,
    };
});
