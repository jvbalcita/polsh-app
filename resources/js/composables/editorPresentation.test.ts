import { describe, expect, it } from 'vitest';
import {
    BACKGROUND_PRESETS,
    calculateFrameLayout,
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
        expect(
            (controls.buttons[2]?.x ?? 0) + (controls.buttons[2]?.width ?? 0),
        ).toBe(960);
        expect(controls.buttons.map((button) => button.width)).toEqual([
            24, 24, 36,
        ]);
    });

    it('sizes the frame from the image aspect so the screenshot fills the viewport width by default', () => {
        const layout = calculateFrameLayout({
            areaX: 48,
            areaY: 48,
            areaWidth: 1104,
            areaHeight: 579,
            imageWidth: 1600,
            imageHeight: 900,
            topInset: 72,
            leftInset: 0,
        });

        expect(layout.frame.width).toBeCloseTo(901.3333333333, 6);
        expect(layout.frame.height).toBe(579);
        expect(layout.frame.x).toBeCloseTo(149.3333333333, 6);
        expect(layout.frame.y).toBe(48);
        expect(layout.viewport.width).toBeCloseTo(901.3333333333, 6);
        expect(layout.viewport.height).toBe(507);
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
