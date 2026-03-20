import { describe, expect, it } from 'vitest';
import {
    BACKGROUND_PRESETS,
    calculateImagePlacement,
    getDesktopWindowControls,
} from '@/composables/editorPresentation';

describe('editorPresentation', () => {
    it('smart-fits the full image inside a framed viewport by default', () => {
        const placement = calculateImagePlacement({
            viewportX: 0,
            viewportY: 72,
            viewportWidth: 504,
            viewportHeight: 259,
            imageWidth: 1600,
            imageHeight: 900,
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
        });

        expect(placement.width).toBe(460.44444444444446);
        expect(placement.height).toBe(259);
        expect(placement.x).toBeCloseTo(21.7777777778, 6);
        expect(placement.y).toBe(72);
        expect(placement.isClipped).toBe(false);
    });

    it('lets users zoom and pan while staying clamped to viewport bounds', () => {
        const placement = calculateImagePlacement({
            viewportX: 0,
            viewportY: 72,
            viewportWidth: 504,
            viewportHeight: 259,
            imageWidth: 1600,
            imageHeight: 900,
            zoom: 1.8,
            offsetX: 1,
            offsetY: -1,
        });

        expect(placement.width).toBeCloseTo(828.8, 6);
        expect(placement.height).toBeCloseTo(466.2, 6);
        expect(placement.x).toBeCloseTo(-324.8, 6);
        expect(placement.y).toBe(72);
        expect(placement.isClipped).toBe(true);
    });

    it('returns windows controls aligned to the right edge', () => {
        const controls = getDesktopWindowControls({
            framePlatform: 'windows',
            width: 960,
            height: 32,
        });

        expect(controls.platform).toBe('windows');
        expect(controls.alignment).toBe('right');
        expect(controls.buttons.map((button) => button.kind)).toEqual([
            'minimize',
            'maximize',
            'close',
        ]);
        expect(controls.buttons[0]?.x).toBeLessThan(
            controls.buttons[1]?.x ?? 0,
        );
    });

    it('offers curated presets for every editable background mode', () => {
        expect(BACKGROUND_PRESETS.solid.length).toBeGreaterThanOrEqual(6);
        expect(BACKGROUND_PRESETS.gradient.length).toBeGreaterThanOrEqual(6);
        expect(BACKGROUND_PRESETS.mesh.length).toBeGreaterThanOrEqual(6);
        expect(BACKGROUND_PRESETS.abstract.length).toBeGreaterThanOrEqual(8);
        expect(
            BACKGROUND_PRESETS.abstract.some(
                (preset) => preset.label === 'Gallery',
            ),
        ).toBe(true);
    });
});
