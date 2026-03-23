# Polsh — iPhone & iPad Device Frame Implementation

Add two new frame types to the existing `useFrameRenderer.ts` composable:
`iphone_15_pro` and `ipad_pro`. Both are Pro-tier frames.

Please read both files before doing anything:
  .claude/implementation-plan.md
  .claude/design-guide.md

Do NOT modify any existing frame renderers. Only add the two new frame
functions and register them in the frame registry.

---

## REFERENCE DIMENSIONS

All measurements are in Polsh canvas units (pixels at 1x).
The design is based on iPhone 15 Pro and iPad Pro 12.9" real device proportions.
Scale these proportionally — the frame renderer receives a target `frameWidth`
and `frameHeight` from the canvas size system and must fit within it.

### iPhone 15 Pro proportions

Device body aspect ratio: 9 : 19.5 (width : height)
At a standard render size of 390w × 844h canvas units:

| Part                      | Value (canvas units)     |
|---------------------------|--------------------------|
| Body width                | 390                      |
| Body height               | 844                      |
| Body corner radius        | 55                       |
| Bezel thickness (all sides)| 14px                    |
| Screen corner radius      | 44                       |
| Screen inset x            | 14 (left), 14 (right)    |
| Screen inset y            | 14 (top), 14 (bottom)    |
| Screen width              | 362 (body - 2×14)        |
| Screen height             | 816 (body - 2×14)        |
| Body frame color          | #2C2C2E (titanium dark)  |
| Body edge highlight top   | #4A4A4C                  |
| Body edge shadow bottom   | #1A1A1C                  |
| Screen bezel inner ring   | #000000 at 40% opacity   |
| Dynamic Island pill x     | center − 62 = 133        |
| Dynamic Island pill y     | 24 (from screen top)     |
| Dynamic Island pill width | 124                      |
| Dynamic Island pill height| 37                       |
| Dynamic Island pill rx    | 18                       |
| Dynamic Island pill fill  | #000000                  |
| Camera dot x              | Dynamic Island right −14  |
| Camera dot y              | Dynamic Island center y   |
| Camera dot radius         | 8                         |
| Camera dot fill           | #0a0a0a                   |
| Side button (right) x     | body right edge           |
| Side button y             | 260                       |
| Side button height        | 80                        |
| Side button width         | 6                         |
| Side button rx            | 3                         |
| Side button color         | #3A3A3C                   |
| Vol up button (left) y    | 200                       |
| Vol up button height      | 60                        |
| Vol down button (left) y  | 270                       |
| Vol down button height    | 60                        |
| Silent toggle (left) y    | 140                       |
| Silent toggle height      | 36                        |
| All left buttons width    | 6, rx 3                   |
| All left buttons x        | body left edge − 6        |

### iPad Pro 12.9" proportions

Device body aspect ratio: 3 : 4 (landscape: 4:3)
At a standard render size of 1024w × 1366h canvas units (portrait):

| Part                      | Value (canvas units)     |
|---------------------------|--------------------------|
| Body width                | 1024                     |
| Body height               | 1366                     |
| Body corner radius        | 20 (flatter than iPhone) |
| Bezel thickness top/bottom| 32                       |
| Bezel thickness left/right| 24                       |
| Screen corner radius      | 12                        |
| Screen x                  | 24                        |
| Screen y                  | 32                        |
| Screen width              | 976 (1024 - 2×24)        |
| Screen height             | 1302 (1366 - 2×32)       |
| Body frame color          | #D4D4D2 (silver aluminum)|
| Body edge highlight       | #E8E8E6                  |
| Body edge shadow          | #ABABAB                  |
| Screen bezel inner ring   | #000000 at 25% opacity   |
| Front camera dot x        | body center x            |
| Front camera dot y        | 16 (from body top)       |
| Front camera dot radius   | 5.5                      |
| Front camera dot fill     | #9A9A9A                  |
| Volume button (left) x    | body left − button width  |
| Volume button y           | 440                       |
| Volume button height      | 120                       |
| Volume button width       | 6, rx 3                   |
| Power button (right) x    | body right                |
| Power button y            | 300                       |
| Power button height       | 60                        |
| Power button width        | 6, rx 3                   |
| Button color (silver)     | #B0B0AE                   |

---

## IMPLEMENTATION

### 1. Frame content area (clip region)

The user's screenshot must be clipped to the SCREEN area only — not
the full device body. The content area for Konva's clipFunc is:

iPhone:
  x: FRAME_X + 14
  y: FRAME_Y + 14
  width: frameWidth - 28
  height: frameHeight - 28
  cornerRadius: 44

iPad:
  x: FRAME_X + 24
  y: FRAME_Y + 32
  width: frameWidth - 48
  height: frameHeight - 64
  cornerRadius: 12

FRAME_X and FRAME_Y are the top-left coordinates of the frame on
the Konva canvas (accounting for padding from the canvas size system).

---

### 2. Scaling system

Both frames must scale proportionally to fit whatever canvas size
the user has chosen. Use this approach:

```typescript
function getIPhoneScale(targetWidth: number, targetHeight: number) {
  // Base design at 390 × 844
  const BASE_W = 390
  const BASE_H = 844
  const scaleX = targetWidth / BASE_W
  const scaleY = targetHeight / BASE_H
  // Use the smaller scale to ensure frame fits, then center
  return Math.min(scaleX, scaleY)
}
```

Apply the scale factor to ALL measurements (body size, bezel, buttons,
Dynamic Island, etc.) before drawing. The frame group should then be
offset to center within the canvas.

---

### 3. Draw order (z-order matters — draw bottom to top)

iPhone draw order:
1. Screen background fill (#000000) — full screen rect with rx=44
2. User screenshot — clipped to screen rect (clipFunc)
3. Screen inner shadow ring — stroke only, rx=44, stroke #000 opacity 0.4
4. Device body outline — rx=55, fill #2C2C2E, stroke #4A4A4C opacity 0.6
5. Device body inner bevel — rx=53, fill none, stroke #666 opacity 0.15
6. Buttons — left side (silent, vol up, vol down), right side (power)
7. Dynamic Island pill — fill #000, rx=18
8. Camera dot inside Dynamic Island — fill #0a0a0a, slightly darker than pill

iPad draw order:
1. Screen background fill (#0d0d0d) — screen rect with rx=12
2. User screenshot — clipped to screen rect
3. Screen inner shadow ring — stroke only, rx=12
4. Device body — rx=20, fill #D4D4D2, stroke #B0B0AE
5. Device body highlight — rx=19, fill none, stroke #E8E8E6 opacity 0.5
6. Buttons — left volume, right power
7. Front camera dot

---

### 4. Konva implementation pattern

Follow the same pattern as the existing frame types in useFrameRenderer.ts.
Here is the expected function signature and structure:

```typescript
function drawIPhone15ProFrame(
  layer: Konva.Layer,
  imageNode: Konva.Image,
  frameX: number,
  frameY: number,
  frameWidth: number,
  frameHeight: number,
  options: FrameOptions
): void {
  const scale = Math.min(frameWidth / 390, frameHeight / 844)

  const s = (v: number) => v * scale  // scale helper

  // Clamp the actual draw origin so frame stays centered
  const bodyW = s(390)
  const bodyH = s(844)
  const offsetX = frameX + (frameWidth - bodyW) / 2
  const offsetY = frameY + (frameHeight - bodyH) / 2

  // --- Screen clip region ---
  const screenX = offsetX + s(14)
  const screenY = offsetY + s(14)
  const screenW = bodyW - s(28)
  const screenH = bodyH - s(28)
  const screenRx = s(44)

  // Apply clip to the imageNode using Konva clipFunc
  imageNode.setAttrs({
    clipFunc: (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath()
      // rounded rect clip path
      const r = screenRx
      ctx.moveTo(screenX + r, screenY)
      ctx.lineTo(screenX + screenW - r, screenY)
      ctx.arcTo(screenX + screenW, screenY, screenX + screenW, screenY + r, r)
      ctx.lineTo(screenX + screenW, screenY + screenH - r)
      ctx.arcTo(screenX + screenW, screenY + screenH, screenX + screenW - r, screenY + screenH, r)
      ctx.lineTo(screenX + r, screenY + screenH)
      ctx.arcTo(screenX, screenY + screenH, screenX, screenY + screenH - r, r)
      ctx.lineTo(screenX, screenY + r)
      ctx.arcTo(screenX, screenY, screenX + r, screenY, r)
      ctx.closePath()
    },
    x: screenX,
    y: screenY,
    width: screenW,
    height: screenH,
  })

  // --- 1. Screen background ---
  const screenBg = new Konva.Rect({
    x: screenX, y: screenY,
    width: screenW, height: screenH,
    fill: '#000000',
    cornerRadius: screenRx,
  })
  layer.add(screenBg)

  // imageNode is added by the caller — it sits above screenBg

  // --- 2. Screen inner shadow ring ---
  const screenRing = new Konva.Rect({
    x: screenX, y: screenY,
    width: screenW, height: screenH,
    fill: 'transparent',
    stroke: 'rgba(0,0,0,0.4)',
    strokeWidth: s(3),
    cornerRadius: screenRx,
  })
  layer.add(screenRing)

  // --- 3. Device body ---
  const body = new Konva.Rect({
    x: offsetX, y: offsetY,
    width: bodyW, height: bodyH,
    fill: '#2C2C2E',
    stroke: '#4A4A4C',
    strokeWidth: s(1),
    cornerRadius: s(55),
  })
  layer.add(body)

  // --- 4. Body inner highlight (thin bevel) ---
  const bevel = new Konva.Rect({
    x: offsetX + s(1), y: offsetY + s(1),
    width: bodyW - s(2), height: bodyH - s(2),
    fill: 'transparent',
    stroke: 'rgba(255,255,255,0.08)',
    strokeWidth: s(1),
    cornerRadius: s(54),
  })
  layer.add(bevel)

  // --- 5. Buttons ---
  // Silent toggle (left)
  layer.add(new Konva.Rect({
    x: offsetX - s(6), y: offsetY + s(140),
    width: s(6), height: s(36),
    fill: '#3A3A3C', cornerRadius: s(3),
  }))
  // Vol up (left)
  layer.add(new Konva.Rect({
    x: offsetX - s(6), y: offsetY + s(200),
    width: s(6), height: s(60),
    fill: '#3A3A3C', cornerRadius: s(3),
  }))
  // Vol down (left)
  layer.add(new Konva.Rect({
    x: offsetX - s(6), y: offsetY + s(270),
    width: s(6), height: s(60),
    fill: '#3A3A3C', cornerRadius: s(3),
  }))
  // Power button (right)
  layer.add(new Konva.Rect({
    x: offsetX + bodyW, y: offsetY + s(260),
    width: s(6), height: s(80),
    fill: '#3A3A3C', cornerRadius: s(3),
  }))

  // --- 6. Dynamic Island ---
  const diW = s(124)
  const diH = s(37)
  const diX = offsetX + (bodyW / 2) - (diW / 2)
  const diY = screenY + s(10)

  layer.add(new Konva.Rect({
    x: diX, y: diY,
    width: diW, height: diH,
    fill: '#000000',
    cornerRadius: s(18),
  }))

  // Camera dot (right side inside Dynamic Island)
  layer.add(new Konva.Circle({
    x: diX + diW - s(14),
    y: diY + diH / 2,
    radius: s(8),
    fill: '#0a0a0a',
  }))
}
```

Implement `drawIPadProFrame` using the same pattern with the iPad
measurements from the reference table above. The iPad silver body
uses `#D4D4D2` fill, `#B0B0AE` stroke, and a white highlight bevel.

---

### 5. Frame registry

In the frame registry (wherever frame types are listed and selected),
add these two entries:

```typescript
{
  id: 'iphone_15_pro',
  name: 'iPhone 15 Pro',
  tier: 'pro',                    // Pro subscription required
  category: 'device',
  aspectRatio: 9 / 19.5,         // 0.4615... (portrait)
  defaultPadding: 40,
  thumbnail: 'iphone_15_pro',    // SVG thumbnail key
},
{
  id: 'ipad_pro',
  name: 'iPad Pro',
  tier: 'pro',
  category: 'device',
  aspectRatio: 3 / 4,            // 0.75 (portrait)
  defaultPadding: 40,
  thumbnail: 'ipad_pro',
},
```

---

### 6. Frame thumbnails (for the Frame tab grid)

Each frame type needs a small SVG thumbnail (64×64px) shown in the
Frame tab selector grid. Create two thumbnail SVGs:

iPhone thumbnail (64×64):
- Body: dark rounded rect, rx=10, fill #2C2C2E
- Screen: slightly inset, rx=8, fill #111
- Dynamic Island: tiny pill at top center, fill #000

iPad thumbnail (64×64):
- Body: silver rounded rect, rx=5, fill #D4D4D2
- Screen: inset, rx=4, fill #111
- Camera dot: tiny circle top center, fill #9A9A9A

These can be inline SVG strings stored in a `frameThumbnails` const object:
```typescript
export const frameThumbnails: Record<string, string> = {
  iphone_15_pro: `<svg viewBox="0 0 64 64">...</svg>`,
  ipad_pro: `<svg viewBox="0 0 64 64">...</svg>`,
}
```

---

### 7. Orientation support (future-proof)

Both frame functions should accept an `orientation: 'portrait' | 'landscape'`
option in `FrameOptions`. For landscape:
- Swap width/height
- Rotate the button positions (vol buttons move to top/bottom, power moves
  to a side)
- Dynamic Island becomes horizontal at the left edge in landscape

For this implementation, default to portrait only. Just make sure the
`orientation` field is accepted in the type and ignored for now (log a
warning if landscape is passed). We'll implement landscape in a follow-up.

---

### 8. Pro gate

Both frames have `tier: 'pro'`. The existing pro gate in the Frame tab
should already lock them for free users. Confirm:
- The frame card in the grid shows a lock icon overlay for free users
- Clicking a locked frame card opens the upgrade modal
- The `isPro` check uses the `usePro()` composable

If the lock icon or modal is not yet implemented for individual frame
cards, implement it now following the same pattern as other pro gates
in the editor.

---

### 9. Manual test

After implementation:

iPhone 15 Pro frame:
1. Subscribe a test user to Pro (or use tinker to set isPro)
2. Open editor, upload any image
3. Go to Frame tab, select "iPhone 15 Pro"
4. Canvas should update — device body visible, screenshot clipped to screen area
5. Dynamic Island should appear as a black pill at the top of the screen
6. Buttons (vol up/down, silent, power) should be visible on the sides
7. Export as PNG — the exported image should include the full frame
8. Test with padding slider — the frame should resize within the canvas

iPad Pro frame:
9. Select "iPad Pro" — silver body, thinner bezels than iPhone
10. Front camera dot visible at top center
11. Export works correctly

Free user:
12. Log in as free user
13. Both iPhone and iPad frames show lock icon in the grid
14. Clicking either opens the upgrade modal

Do NOT commit — this will be committed as part of the larger billing
fixes batch under tag v1.3.2.
```
