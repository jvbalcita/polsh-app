import { usePage } from '@inertiajs/vue3';
import { defineStore } from 'pinia';
import { computed, markRaw, ref } from 'vue';
import { toast } from 'vue-sonner';
import allStyles from '@/styles';
import { DEFAULT_SETTINGS } from '@/types/editor';
import type {
    ExportSettings,
    ImageSettings,
    SessionImage,
} from '@/types/editor';
import type { StyleConfig } from '@/types/style';

export interface SavedPreset {
    id: number;
    name: string;
    style_slug: string;
    customizations: Partial<ImageSettings>;
    team_id?: number | null;
}

interface ValidationErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

function firstValidationError(payload: ValidationErrorResponse): string {
    const firstFieldError = Object.values(payload.errors ?? {}).flat()[0];

    return firstFieldError ?? payload.message ?? 'Unable to save preset.';
}

function getBorderColorFromStyle(style: StyleConfig): string {
    switch (style.border.type) {
        case 'glass':
        case 'subtle':
            return `rgba(255,255,255,${style.border.opacity})`;
        case 'neon':
            return '#a855f7';
        case 'glow':
            return '#06b6d4';
        default:
            return 'rgba(255,255,255,0.1)';
    }
}

function settingsFromStyle(style: StyleConfig): Partial<ImageSettings> {
    const frameType =
        style.chrome === 'macos'
            ? 'macos-dark'
            : style.chrome === 'browser'
              ? 'browser'
              : 'none';

    return {
        styleSlug: style.slug,
        backgroundType: style.background.type,
        gradientStart: style.background.colors[0],
        gradientEnd: style.background.colors[1],
        gradientAngle: style.background.angle,
        gradientIsRadial: false,
        solidColor: style.background.colors[0],
        frameType,
        padding: style.padding,
        radius: style.radius,
        shadow: Math.round(style.shadow.opacity * 100),
        shadowBlur: style.shadow.blur,
        shadowColor: style.shadow.color,
        border: style.border.width,
        borderColor: getBorderColorFromStyle(style),
        noiseGrain: style.noise,
    };
}

function isWindowsDesktopFrame(frameType: string): boolean {
    return (
        frameType === 'browser' ||
        frameType === 'terminal' ||
        frameType === 'window-minimal'
    );
}

export const useEditorStore = defineStore('editor', () => {
    const page = usePage();
    const images = ref<SessionImage[]>([]);
    const activeIndex = ref<number>(0);

    /** Global export settings — shared across all images */
    const exportSettings = ref<ExportSettings>({
        exportFormat: 'png',
        exportResolution: 2,
    });

    const activeImage = computed<SessionImage | null>(
        () => images.value[activeIndex.value] ?? null,
    );

    const activeSettings = computed<ImageSettings | null>(
        () => images.value[activeIndex.value]?.settings ?? null,
    );

    const activeStyle = computed<StyleConfig | null>(() => {
        const slug = activeSettings.value?.styleSlug;

        return slug ? (allStyles.find((s) => s.slug === slug) ?? null) : null;
    });

    // Presets (loaded on demand when user is authenticated)
    const presets = ref<SavedPreset[]>([]);
    const teamPresets = ref<SavedPreset[]>([]);
    const presetsLoaded = ref(false);

    async function fetchPresets(): Promise<void> {
        if (presetsLoaded.value) {
            return;
        }

        const res = await fetch('/presets', {
            headers: { Accept: 'application/json' },
        });

        if (res.ok) {
            const data = await res.json();

            if (Array.isArray(data)) {
                presets.value = data;
            } else {
                presets.value = data.user ?? [];
                teamPresets.value = data.team ?? [];
            }
        }

        presetsLoaded.value = true;
    }

    async function savePreset(
        name: string,
        teamId?: number | null,
    ): Promise<SavedPreset> {
        const img = images.value[activeIndex.value];
        const styleSlug = activeSettings.value?.styleSlug?.trim() ?? '';

        if (!styleSlug) {
            const error = 'Choose an image and style before saving a preset.';

            toast.error(error);

            throw new Error(error);
        }

        const customizations: Partial<ImageSettings> = img
            ? { ...img.settings }
            : {};
        const res = await fetch('/presets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                ),
            },
            body: JSON.stringify({
                name,
                style_slug: styleSlug,
                customizations,
                team_id: teamId ?? null,
            }),
        });

        if (!res.ok) {
            const payload = (await res
                .json()
                .catch(() => ({}))) as ValidationErrorResponse;

            const error = firstValidationError(payload);

            toast.error(error);

            throw new Error(error);
        }

        const preset: SavedPreset = await res.json();

        if (teamId) {
            teamPresets.value.unshift(preset);
        } else {
            presets.value.unshift(preset);
        }

        return preset;
    }

    function loadPreset(preset: SavedPreset): void {
        const img = images.value[activeIndex.value];

        if (!img) {
            return;
        }

        img.settings = { ...img.settings, ...preset.customizations };
    }

    async function deletePreset(id: number): Promise<void> {
        await fetch(`/presets/${id}`, {
            method: 'DELETE',
            headers: {
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                ),
            },
        });
        presets.value = presets.value.filter((p) => p.id !== id);
        teamPresets.value = teamPresets.value.filter((p) => p.id !== id);
    }

    function trackEvent(name: string): void {
        if (typeof window !== 'undefined' && (window as any).plausible) {
            (window as any).plausible(name);
        }
    }

    function applyStyle(style: StyleConfig): void {
        const img = images.value[activeIndex.value];

        if (!img) {
            return;
        }

        img.settings = { ...img.settings, ...settingsFromStyle(style) };
        trackEvent('style_applied');
    }

    function updateSetting<K extends keyof ImageSettings>(
        key: K,
        value: ImageSettings[K],
    ): void {
        const img = images.value[activeIndex.value];

        if (!img || img.locked) {
            return;
        }

        img.settings = { ...img.settings, [key]: value };
    }

    function setFramePlatform(platform: ImageSettings['framePlatform']): void {
        const img = images.value[activeIndex.value];

        if (!img || img.locked) {
            return;
        }

        const nextSettings: ImageSettings = {
            ...img.settings,
            framePlatform: platform,
        };

        if (
            platform === 'windows' &&
            isWindowsDesktopFrame(nextSettings.frameType)
        ) {
            nextSettings.radius = 0;
        }

        img.settings = nextSettings;
    }

    function applyToAll(): void {
        const source = images.value[activeIndex.value];

        if (!source) {
            return;
        }

        images.value.forEach((img) => {
            if (!img.locked && img.id !== source.id) {
                img.settings = { ...source.settings };
            }
        });
        trackEvent('apply_to_all');
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
                    const currentSettings =
                        images.value[activeIndex.value]?.settings ??
                        DEFAULT_SETTINGS;
                    images.value.push({
                        id: crypto.randomUUID(),
                        src,
                        element: img,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        locked: false,
                        settings: { ...currentSettings },
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

        if (index === -1) {
            return;
        }

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
        activeImage,
        activeSettings,
        activeStyle,
        allStyles,
        exportSettings,
        presets,
        teamPresets,
        presetsLoaded,
        applyStyle,
        updateSetting,
        setFramePlatform,
        applyToAll,
        addImage,
        removeImage,
        setActiveIndex,
        fetchPresets,
        savePreset,
        loadPreset,
        deletePreset,
    };
});
