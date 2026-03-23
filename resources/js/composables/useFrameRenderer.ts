/**
 * useFrameRenderer — Pro device frame config factories.
 *
 * Returns declarative Konva config objects consumed by CanvasStage.vue.
 *
 * IMPORTANT — sizing contract:
 *   Each function receives the actual frameWidth × frameHeight from
 *   calculateFrameLayout, which sizes the frame to fit the SCREEN content
 *   area (deviceScreenDimensions) plus the bezel insets.
 *
 *   The body therefore FILLS the frame exactly (offsetX = offsetY = 0),
 *   and every interior element scales proportionally using:
 *     sx(v) = frameWidth  * v / BASE_W   (horizontal)
 *     sy(v) = frameHeight * v / BASE_H   (vertical)
 *
 *   Screen insets must match the values returned by chromeHeightForFrame /
 *   activityBarWidth / rightBezelForFrame / bottomChromeHeightForFrame in
 *   useCanvas.ts so that imageBounds.x/y/width/height aligns exactly with
 *   screenX/Y/W/H here.
 */

interface RectConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
    listening?: boolean;
}

interface CircleConfig {
    x: number;
    y: number;
    radius: number;
    fill: string;
    listening?: boolean;
}

// ── Shared types ─────────────────────────────────────────────────────────────

export interface ProPhoneFrameConfig {
    /** Device body — rendered BEFORE the image (fills frame exactly) */
    bodyConfig: RectConfig;
    /** Thin inner-bevel highlight — rendered BEFORE the image */
    bevelConfig: RectConfig;
    /** Screen area fill — rendered BEFORE the image */
    screenBgConfig: RectConfig;
    /** Screen inset shadow ring — rendered AFTER the image */
    screenRingConfig: RectConfig;
    /** Side buttons on the left */
    leftButtons: RectConfig[];
    /** Side button on the right */
    rightButtons: RectConfig[];
    /** Dynamic Island pill */
    dynamicIslandConfig: RectConfig;
    /** Camera dot inside Dynamic Island */
    cameraDotConfig: CircleConfig;
}

export interface ProTabletFrameConfig {
    /** Device body — rendered BEFORE the image (fills frame exactly) */
    bodyConfig: RectConfig;
    /** Thin inner-bevel highlight — rendered BEFORE the image */
    bevelConfig: RectConfig;
    /** Screen area fill — rendered BEFORE the image */
    screenBgConfig: RectConfig;
    /** Screen inset shadow ring — rendered AFTER the image */
    screenRingConfig: RectConfig;
    /** Volume button(s) on the left */
    leftButtons: RectConfig[];
    /** Power button on the right */
    rightButtons: RectConfig[];
    /** Front sensor element at top center (dot or Face ID bar) */
    sensorConfig: RectConfig;
}

// Keep legacy type aliases so CanvasStage.vue imports still compile
export type IPhone15ProFrameConfig = ProPhoneFrameConfig;
export type IPadProFrameConfig = ProTabletFrameConfig;

// ── iPhone 15 Pro ────────────────────────────────────────────────────────────
// Base body: 417 × 878 | Screen: 393 × 852 (12px sides, 13px top/bottom)
// Bezels use sx()/sy() so they scale proportionally with the rendered frame.
// useCanvas.ts returns BODY dims from deviceScreenDimensions and computes
// proportional insets in frameOverlayBounds — no fixed-pixel mismatch.

export function getIPhone15ProFrameConfig(
    frameWidth: number,
    frameHeight: number,
): ProPhoneFrameConfig {
    const BASE_W = 417; // body: 393 (screen) + 2×12 (bezels)
    const BASE_H = 878; // body: 852 (screen) + 2×13 (bezels)
    const BEZEL_V = 12; // left & right bezel in BASE units
    const BEZEL_H = 13; // top & bottom bezel in BASE units

    const sx = (v: number) => frameWidth * (v / BASE_W);
    const sy = (v: number) => frameHeight * (v / BASE_H);

    const screenX = Math.round(sx(BEZEL_V)); // proportional — scales with frame
    const screenY = Math.round(sy(BEZEL_H));
    const screenW = frameWidth - screenX * 2;
    const screenH = frameHeight - screenY * 2;
    const screenRx = sx(46);

    // Dynamic Island — horizontally centered on screen
    const diW = sx(126);
    const diH = sy(36);
    const diX = (frameWidth - diW) / 2;
    const diY = screenY + sy(10);

    return {
        bodyConfig: {
            x: 0,
            y: 0,
            width: frameWidth,
            height: frameHeight,
            fill: '#2C2C2E',
            cornerRadius: sx(54),
            listening: false,
        },
        bevelConfig: {
            x: 1,
            y: 1,
            width: frameWidth - 2,
            height: frameHeight - 2,
            fill: 'transparent',
            stroke: 'rgba(255,255,255,0.07)',
            strokeWidth: 1,
            cornerRadius: sx(53),
            listening: false,
        },
        screenBgConfig: {
            x: screenX,
            y: screenY,
            width: screenW,
            height: screenH,
            fill: '#000000',
            cornerRadius: screenRx,
            listening: false,
        },
        screenRingConfig: {
            x: screenX,
            y: screenY,
            width: screenW,
            height: screenH,
            fill: 'transparent',
            stroke: 'rgba(0,0,0,0.35)',
            strokeWidth: 2,
            cornerRadius: screenRx,
            listening: false,
        },
        leftButtons: [
            // Silent toggle
            {
                x: -sx(6),
                y: sy(130),
                width: sx(6),
                height: sy(34),
                fill: '#3A3A3C',
                cornerRadius: sx(3),
                listening: false,
            },
            // Volume up
            {
                x: -sx(6),
                y: sy(188),
                width: sx(6),
                height: sy(58),
                fill: '#3A3A3C',
                cornerRadius: sx(3),
                listening: false,
            },
            // Volume down
            {
                x: -sx(6),
                y: sy(256),
                width: sx(6),
                height: sy(58),
                fill: '#3A3A3C',
                cornerRadius: sx(3),
                listening: false,
            },
        ],
        rightButtons: [
            // Power / side button
            {
                x: frameWidth,
                y: sy(248),
                width: sx(6),
                height: sy(78),
                fill: '#3A3A3C',
                cornerRadius: sx(3),
                listening: false,
            },
        ],
        dynamicIslandConfig: {
            x: diX,
            y: diY,
            width: diW,
            height: diH,
            fill: '#000000',
            cornerRadius: sx(18),
            listening: false,
        },
        cameraDotConfig: {
            x: diX + diW - sx(13),
            y: diY + sy(18),
            radius: sx(7),
            fill: '#0a0a0a',
            listening: false,
        },
    };
}

// ── iPhone 17 Pro ────────────────────────────────────────────────────────────
// Base body: 424 × 898 | Screen: 402 × 874 (11px sides, 12px top/bottom)
// Body color: #3A3A38 (warm titanium) | Bezels proportional via sx()/sy().

export function getIPhone17ProFrameConfig(
    frameWidth: number,
    frameHeight: number,
): ProPhoneFrameConfig {
    const BASE_W = 424; // body: 402 (screen) + 2×11 (bezels)
    const BASE_H = 898; // body: 874 (screen) + 2×12 (bezels)
    const BEZEL_V = 11;
    const BEZEL_H = 12;

    const sx = (v: number) => frameWidth * (v / BASE_W);
    const sy = (v: number) => frameHeight * (v / BASE_H);

    const screenX = Math.round(sx(BEZEL_V));
    const screenY = Math.round(sy(BEZEL_H));
    const screenW = frameWidth - screenX * 2;
    const screenH = frameHeight - screenY * 2;
    const screenRx = sx(48);

    const diW = sx(126);
    const diH = sy(36);
    const diX = (frameWidth - diW) / 2;
    const diY = screenY + sy(10);

    return {
        bodyConfig: {
            x: 0,
            y: 0,
            width: frameWidth,
            height: frameHeight,
            fill: '#3A3A38',
            cornerRadius: sx(56),
            listening: false,
        },
        bevelConfig: {
            x: 1,
            y: 1,
            width: frameWidth - 2,
            height: frameHeight - 2,
            fill: 'transparent',
            stroke: 'rgba(255,255,255,0.07)',
            strokeWidth: 1,
            cornerRadius: sx(55),
            listening: false,
        },
        screenBgConfig: {
            x: screenX,
            y: screenY,
            width: screenW,
            height: screenH,
            fill: '#0d0d0d',
            cornerRadius: screenRx,
            listening: false,
        },
        screenRingConfig: {
            x: screenX,
            y: screenY,
            width: screenW,
            height: screenH,
            fill: 'transparent',
            stroke: 'rgba(0,0,0,0.35)',
            strokeWidth: 2,
            cornerRadius: screenRx,
            listening: false,
        },
        leftButtons: [
            // Silent toggle
            {
                x: -sx(6),
                y: sy(130),
                width: sx(6),
                height: sy(34),
                fill: '#4A4A48',
                cornerRadius: sx(3),
                listening: false,
            },
            // Volume up
            {
                x: -sx(6),
                y: sy(188),
                width: sx(6),
                height: sy(58),
                fill: '#4A4A48',
                cornerRadius: sx(3),
                listening: false,
            },
            // Volume down
            {
                x: -sx(6),
                y: sy(256),
                width: sx(6),
                height: sy(58),
                fill: '#4A4A48',
                cornerRadius: sx(3),
                listening: false,
            },
        ],
        rightButtons: [
            // Power / side button
            {
                x: frameWidth,
                y: sy(248),
                width: sx(6),
                height: sy(78),
                fill: '#4A4A48',
                cornerRadius: sx(3),
                listening: false,
            },
        ],
        dynamicIslandConfig: {
            x: diX,
            y: diY,
            width: diW,
            height: diH,
            fill: '#000000',
            cornerRadius: sx(18),
            listening: false,
        },
        cameraDotConfig: {
            x: diX + diW - sx(13),
            y: diY + sy(18),
            radius: sx(7),
            fill: '#0a0a0a',
            listening: false,
        },
    };
}

// ── iPad Pro (2022+ design) ───────────────────────────────────────────────────
// Base body: 1024 × 1366 | Screen: 992 × 1326 (16px sides, 20px top/bottom)
// Body: #1A1A1A dark | Camera pill on right bezel | Bezels proportional.

export function getIPadProFrameConfig(
    frameWidth: number,
    frameHeight: number,
): ProTabletFrameConfig {
    const BASE_W = 1024;
    const BASE_H = 1366;
    const BEZEL_H = 20;
    const BEZEL_V = 16;

    const sx = (v: number) => frameWidth * (v / BASE_W);
    const sy = (v: number) => frameHeight * (v / BASE_H);

    const screenX = Math.round(sx(BEZEL_V));
    const screenY = Math.round(sy(BEZEL_H));
    const screenW = frameWidth - screenX * 2;
    const screenH = frameHeight - screenY * 2;
    const screenRx = sx(14);

    return {
        bodyConfig: {
            x: 0,
            y: 0,
            width: frameWidth,
            height: frameHeight,
            fill: '#1A1A1A',
            cornerRadius: sx(20),
            listening: false,
        },
        bevelConfig: {
            x: 1,
            y: 1,
            width: frameWidth - 2,
            height: frameHeight - 2,
            fill: 'transparent',
            stroke: 'rgba(255,255,255,0.06)',
            strokeWidth: 1,
            cornerRadius: sx(19),
            listening: false,
        },
        screenBgConfig: {
            x: screenX,
            y: screenY,
            width: screenW,
            height: screenH,
            fill: '#0d0d0d',
            cornerRadius: screenRx,
            listening: false,
        },
        screenRingConfig: {
            x: screenX,
            y: screenY,
            width: screenW,
            height: screenH,
            fill: 'transparent',
            stroke: 'rgba(0,0,0,0.4)',
            strokeWidth: 2,
            cornerRadius: screenRx,
            listening: false,
        },
        // Volume buttons on top edge, left side
        leftButtons: [
            {
                x: frameWidth * 0.20,
                y: -sy(4),
                width: sx(30),
                height: sy(8),
                fill: '#2A2A2A',
                cornerRadius: sx(4),
                listening: false,
            },
            {
                x: frameWidth * 0.28,
                y: -sy(4),
                width: sx(30),
                height: sy(8),
                fill: '#2A2A2A',
                cornerRadius: sx(4),
                listening: false,
            },
        ],
        // Power button on top edge, right side
        rightButtons: [
            {
                x: frameWidth * 0.75,
                y: -sy(4),
                width: sx(50),
                height: sy(8),
                fill: '#2A2A2A',
                cornerRadius: sx(4),
                listening: false,
            },
        ],
        // Camera pill on right bezel, vertically centered
        sensorConfig: {
            x: frameWidth - sx(11),
            y: frameHeight / 2 - sy(16),
            width: sx(6),
            height: sy(32),
            fill: '#2A2A2A',
            cornerRadius: sx(3),
            listening: false,
        },
    };
}

// ── iPad Pro M5 (Space Black) ─────────────────────────────────────────────────
// Base body: 1024 × 1366 | Screen: 996 × 1330 (14px sides, 18px top/bottom)
// Body: Space Black #1C1C1E | Face ID pill on right bezel | Bezels proportional.

export function getIPadProM5FrameConfig(
    frameWidth: number,
    frameHeight: number,
): ProTabletFrameConfig {
    const BASE_W = 1024;
    const BASE_H = 1366;
    const BEZEL_H = 18;
    const BEZEL_V = 14;

    const sx = (v: number) => frameWidth * (v / BASE_W);
    const sy = (v: number) => frameHeight * (v / BASE_H);

    const screenX = Math.round(sx(BEZEL_V));
    const screenY = Math.round(sy(BEZEL_H));
    const screenW = frameWidth - screenX * 2;
    const screenH = frameHeight - screenY * 2;
    const screenRx = sx(16);

    return {
        bodyConfig: {
            x: 0,
            y: 0,
            width: frameWidth,
            height: frameHeight,
            fill: '#1C1C1E',
            cornerRadius: sx(22),
            listening: false,
        },
        bevelConfig: {
            x: 1,
            y: 1,
            width: frameWidth - 2,
            height: frameHeight - 2,
            fill: 'transparent',
            stroke: 'rgba(255,255,255,0.07)',
            strokeWidth: 1,
            cornerRadius: sx(21),
            listening: false,
        },
        screenBgConfig: {
            x: screenX,
            y: screenY,
            width: screenW,
            height: screenH,
            fill: '#0d0d0d',
            cornerRadius: screenRx,
            listening: false,
        },
        screenRingConfig: {
            x: screenX,
            y: screenY,
            width: screenW,
            height: screenH,
            fill: 'transparent',
            stroke: 'rgba(0,0,0,0.4)',
            strokeWidth: 2,
            cornerRadius: screenRx,
            listening: false,
        },
        // Volume buttons on top edge, left side
        leftButtons: [
            {
                x: frameWidth * 0.20,
                y: -sy(4),
                width: sx(30),
                height: sy(8),
                fill: '#2A2A2A',
                cornerRadius: sx(4),
                listening: false,
            },
            {
                x: frameWidth * 0.28,
                y: -sy(4),
                width: sx(30),
                height: sy(8),
                fill: '#2A2A2A',
                cornerRadius: sx(4),
                listening: false,
            },
        ],
        // Power button on top edge, right side
        rightButtons: [
            {
                x: frameWidth * 0.75,
                y: -sy(4),
                width: sx(50),
                height: sy(8),
                fill: '#2A2A2A',
                cornerRadius: sx(4),
                listening: false,
            },
        ],
        // Face ID pill on right bezel, vertically centered
        sensorConfig: {
            x: frameWidth - sx(10),
            y: frameHeight / 2 - sy(14),
            width: sx(5),
            height: sy(28),
            fill: '#2A2A2C',
            cornerRadius: sx(2.5),
            listening: false,
        },
    };
}

// ── Frame registry ────────────────────────────────────────────────────────────

export const DEVICE_FRAME_REGISTRY = [
    {
        id: 'iphone_15_pro',
        name: 'iPhone 15 Pro',
        tier: 'pro' as const,
        category: 'device',
        aspectRatio: 9 / 19.5,
        defaultPadding: 40,
        thumbnail: 'iphone_15_pro',
    },
    {
        id: 'iphone_17_pro',
        name: 'iPhone 17 Pro',
        tier: 'pro' as const,
        category: 'device',
        aspectRatio: 9 / 19.5,
        defaultPadding: 40,
        thumbnail: 'iphone_17_pro',
    },
    {
        id: 'ipad_pro',
        name: 'iPad Pro',
        tier: 'pro' as const,
        category: 'device',
        aspectRatio: 3 / 4,
        defaultPadding: 40,
        thumbnail: 'ipad_pro',
    },
    {
        id: 'ipad_pro_m5',
        name: 'iPad Pro M5',
        tier: 'pro' as const,
        category: 'device',
        aspectRatio: 3 / 4,
        defaultPadding: 40,
        thumbnail: 'ipad_pro_m5',
    },
] as const;

// ── Thumbnails (64×64 inline SVG) ────────────────────────────────────────────

export const frameThumbnails: Record<string, string> = {
    iphone_15_pro: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="12" y="2" width="40" height="60" rx="10" fill="#2C2C2E" stroke="#4A4A4C" stroke-width="0.5"/>
  <rect x="16" y="6" width="32" height="52" rx="8" fill="#111"/>
  <rect x="24" y="8" width="16" height="5" rx="2.5" fill="#000"/>
  <rect x="10" y="20" width="2" height="7" rx="1" fill="#3A3A3C"/>
  <rect x="10" y="30" width="2" height="7" rx="1" fill="#3A3A3C"/>
  <rect x="52" y="26" width="2" height="10" rx="1" fill="#3A3A3C"/>
</svg>`,
    iphone_17_pro: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="12" y="2" width="40" height="60" rx="11" fill="#3A3A3A" stroke="#555" stroke-width="0.5"/>
  <rect x="15" y="5" width="34" height="54" rx="9" fill="#0d0d0d"/>
  <rect x="23" y="7" width="18" height="5" rx="2.5" fill="#000"/>
  <circle cx="38" cy="9.5" r="1.5" fill="#0a0a0a"/>
  <rect x="10" y="19" width="2" height="7" rx="1" fill="#4A4A4A"/>
  <rect x="10" y="29" width="2" height="7" rx="1" fill="#4A4A4A"/>
  <rect x="52" y="25" width="2" height="10" rx="1" fill="#4A4A4A"/>
</svg>`,
    ipad_pro: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="4" width="52" height="56" rx="8" fill="#1C1C1E" stroke="#3A3A3A" stroke-width="0.5"/>
  <rect x="10" y="8" width="44" height="48" rx="4" fill="#111"/>
  <circle cx="32" cy="6" r="2" fill="#2A2A2C"/>
  <rect x="4" y="24" width="2" height="12" rx="1" fill="#2A2A2C"/>
  <rect x="58" y="18" width="2" height="8" rx="1" fill="#2A2A2C"/>
</svg>`,
    ipad_pro_m5: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="4" width="52" height="56" rx="9" fill="#1C1C1E" stroke="#3A3A3A" stroke-width="0.5"/>
  <rect x="9" y="7" width="46" height="50" rx="5" fill="#0d0d0d"/>
  <rect x="27" y="5.5" width="10" height="2" rx="1" fill="#2A2A2C"/>
  <rect x="4" y="23" width="2" height="12" rx="1" fill="#2A2A2A"/>
  <rect x="58" y="18" width="2" height="8" rx="1" fill="#2A2A2A"/>
</svg>`,
};
