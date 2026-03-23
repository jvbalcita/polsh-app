# Polsh — Device Frame Fixes & New Frame Additions

Please read these files before doing anything:
  .claude/implementation-plan.md
  .claude/design-guide.md
  .claude/device-frames-prompt.md

This prompt covers FOUR tasks. Work through them in order.
Do NOT commit until all four are complete and manually tested.

---

## CONTEXT — What exists and what needs to change

There are currently FOUR device frames in the system:

| Frame ID         | Status        | Action                              |
|------------------|---------------|-------------------------------------|
| `iphone_15_pro`  | Old (broken)  | Fix image fill + improve design     |
| `ipad_pro`       | Old (broken)  | Fix image fill + improve design     |
| `iphone_17_pro`  | New (rename)  | Was `iphone_15_pro` new — rename + fix image fill |
| `ipad_pro_m5`    | New (fix)     | Was `ipad_pro` new — fix color + fix image fill   |

The new frames added in the previous session are currently registered
as `iphone_15_pro` and `ipad_pro`, which CONFLICTS with the old frames.
You will need to untangle this by reading the current frame registry
and renderer file first before touching anything.

---

## CRITICAL FIX — Image not filling the screen (applies to ALL 4 frames)

This is the most important fix across every device frame.

**The problem:** The user's screenshot is rendering as a small centered
rectangle inside the screen area instead of filling it completely.

**The cause:** The Konva Image node is either:
1. Not having its `width` and `height` set to match the screen area, OR
2. Using default image dimensions instead of being stretched to fill, OR
3. The `clipFunc` is correct but the image `x/y/width/height` attrs
   are still at the original uploaded image's natural dimensions

**The fix:** After applying `clipFunc` to the image node, ALSO set:
```typescript
imageNode.setAttrs({
  x: screenX,
  y: screenY,
  width: screenW,
  height: screenH,
  // clipFunc stays as-is
})
```

This forces the image to stretch/fill the entire screen rect.
The `clipFunc` then crops it to the rounded screen shape.
This is the equivalent of CSS `object-fit: cover` + `object-position: center`.

If `imageNode` is a `Konva.Image`, also ensure the underlying
`HTMLImageElement` is not constraining it — Konva images stretch
when you explicitly set width/height attributes regardless of natural size.

Apply this fix to ALL four frame renderers.

---

## TASK 1 — Fix old `iphone_15_pro` frame

The existing `iphone_15_pro` frame (the one that was there BEFORE
the previous session) looks like a flat dark phone outline with:
- Dynamic Island pill cutout at top ✓
- Home indicator bar at bottom ✓
- But no body depth, no side buttons, minimal design

**Improvements to make:**

1. Apply the image fill fix described above
2. Add side buttons (same measurements from device-frames-prompt.md):
   - Silent toggle: left side, y=140, h=36, w=6, rx=3, fill #3A3A3C
   - Vol up: left side, y=200, h=60, w=6, rx=3, fill #3A3A3C
   - Vol down: left side, y=270, h=60, w=6, rx=3, fill #3A3A3C
   - Power: right side, y=260, h=80, w=6, rx=3, fill #3A3A3C
   (All measurements are at base 390×844 scale — apply scale factor)
3. Add inner body bevel: `stroke rgba(255,255,255,0.08)`, strokeWidth=1,
   cornerRadius = bodyCornerRadius - 1, fill transparent
4. Make the Dynamic Island more visible:
   - pill fill: #000000 (solid black)
   - ensure width=124, height=37, rx=18 at base scale
   - add the camera dot: circle at right side inside pill, r=8, fill #0a0a0a
5. Screen inner shadow ring: stroke `rgba(0,0,0,0.4)`, strokeWidth=3, 
   drawn ON TOP of the image, fill transparent — gives the screen a
   slightly recessed look
6. Do NOT change the frame ID or aspect ratio

---

## TASK 2 — Fix old `ipad_pro` frame

The existing `ipad_pro` frame has a small camera bar at top center,
home indicator at bottom, but is very flat with no body definition.

**Improvements to make:**

1. Apply the image fill fix
2. Body color: keep the existing dark color if it's already dark gray.
   If it's currently very light or white, change to `#1C1C1E` (dark space gray)
3. Add body bevel: `stroke rgba(255,255,255,0.06)`, strokeWidth=1, transparent fill
4. Make the camera dot more polished: `fill #2A2A2C`, radius=5.5 at base scale,
   centered at top bezel, vertically centered in the top bezel gap
5. Apply screen inner shadow ring for depth
6. Add power button on right side:
   x = bodyRight, y = bodyY + bodyH×0.22, h = bodyH×0.06, w=6, rx=3, fill #2A2A2C
7. Do NOT change the frame ID or aspect ratio

---

## TASK 3 — Rename new iPhone frame → `iphone_17_pro` and fix image fill

The newly created frame from the previous session (currently registered
with a conflicting ID) needs to be:

1. **Renamed** in the frame registry: ID becomes `iphone_17_pro`
2. **Name** (display): `iPhone 17 Pro`
3. **Fix the image fill** using the critical fix above
4. The design itself (body, Dynamic Island, buttons) from the previous
   session's implementation is correct — keep it as-is, only fix the fill

iPhone 17 Pro design differences vs iPhone 15 Pro:
- Same Dynamic Island (no change from 15 Pro in design language)
- Slightly thinner bezels: screen inset 12px instead of 14px
- Body corner radius: 58 (slightly more rounded than 15 Pro's 55)
- Body color option: `#3A3A3A` (natural titanium, slightly warmer)
- Everything else identical to iphone_15_pro new frame

Frame registry entry:
```typescript
{
  id: 'iphone_17_pro',
  name: 'iPhone 17 Pro',
  tier: 'pro',
  category: 'device',
  aspectRatio: 9 / 19.5,
  defaultPadding: 40,
  thumbnail: 'iphone_17_pro',
}
```

---

## TASK 4 — Fix new iPad frame → `ipad_pro_m5`, fix color, fix image fill

The newly created iPad frame (currently registered with a conflicting ID)
needs to be:

1. **Renamed**: ID becomes `ipad_pro_m5`
2. **Name** (display): `iPad Pro M5`
3. **Fix the body color** — it is currently rendering as WHITE or very light gray.
   Change ALL body fill colors to:
   - Body fill: `#1C1C1E` (dark space black — matches Apple's Space Black finish)
   - Body stroke: `#3A3A3A`
   - Body bevel stroke: `rgba(255,255,255,0.07)`
   - Buttons: `#2A2A2A`
   - Camera dot: `#2A2A2C`
   - Screen bezel inner shadow: `rgba(0,0,0,0.5)`
   The iPad Pro M5 comes in Silver and Space Black — we use Space Black.

4. **Fix the image fill** using the critical fix above

5. **Design corrections** for iPad Pro M5 vs the old measurements:
   - Body corner radius: 22 (iPad Pro M5 has slightly rounder corners)
   - Top bezel: 28px (thinner than previous 32 — iPad Pro M5 has very thin bezels)
   - Bottom bezel: 28px
   - Left/right bezel: 20px (thinner than previous 24)
   - Screen corner radius: 16 (matches the iPad Pro M5's display)
   - Camera dot: positioned in center of top bezel, radius=5
   - Home indicator: none (iPad Pro M5 is fully gesture-based, no home indicator)
   - Face ID sensor: small rounded rect at top center instead of just a dot:
     width=32, height=6, rx=3, fill=#2A2A2C, centered in top bezel

6. Frame registry entry:
```typescript
{
  id: 'ipad_pro_m5',
  name: 'iPad Pro M5',
  tier: 'pro',
  category: 'device',
  aspectRatio: 3 / 4,
  defaultPadding: 40,
  thumbnail: 'ipad_pro_m5',
}
```

---

## THUMBNAILS

Update or create 64×64 SVG thumbnails for all four frames.
Store them in the `frameThumbnails` const object.

### `iphone_15_pro` thumbnail (dark, pill Dynamic Island)
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="12" y="2" width="40" height="60" rx="10" fill="#2C2C2E" stroke="#4A4A4C" stroke-width="0.5"/>
  <rect x="16" y="6" width="32" height="52" rx="8" fill="#111"/>
  <rect x="24" y="8" width="16" height="5" rx="2.5" fill="#000"/>
  <rect x="10" y="20" width="2" height="7" rx="1" fill="#3A3A3C"/>
  <rect x="10" y="30" width="2" height="7" rx="1" fill="#3A3A3C"/>
  <rect x="52" y="26" width="2" height="10" rx="1" fill="#3A3A3C"/>
</svg>
```

### `ipad_pro` thumbnail (dark, camera dot top center)
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="4" width="52" height="56" rx="8" fill="#1C1C1E" stroke="#3A3A3A" stroke-width="0.5"/>
  <rect x="10" y="8" width="44" height="48" rx="4" fill="#111"/>
  <circle cx="32" cy="6" r="2" fill="#2A2A2C"/>
  <rect x="4" y="24" width="2" height="12" rx="1" fill="#2A2A2C"/>
  <rect x="58" y="18" width="2" height="8" rx="1" fill="#2A2A2C"/>
</svg>
```

### `iphone_17_pro` thumbnail (dark titanium, same pill but warmer)
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="12" y="2" width="40" height="60" rx="11" fill="#3A3A3A" stroke="#555" stroke-width="0.5"/>
  <rect x="15" y="5" width="34" height="54" rx="9" fill="#0d0d0d"/>
  <rect x="23" y="7" width="18" height="5" rx="2.5" fill="#000"/>
  <circle cx="38" cy="9.5" r="1.5" fill="#0a0a0a"/>
  <rect x="10" y="19" width="2" height="7" rx="1" fill="#4A4A4A"/>
  <rect x="10" y="29" width="2" height="7" rx="1" fill="#4A4A4A"/>
  <rect x="52" y="25" width="2" height="10" rx="1" fill="#4A4A4A"/>
</svg>
```

### `ipad_pro_m5` thumbnail (space black, Face ID sensor bar)
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="4" width="52" height="56" rx="9" fill="#1C1C1E" stroke="#3A3A3A" stroke-width="0.5"/>
  <rect x="9" y="7" width="46" height="50" rx="5" fill="#0d0d0d"/>
  <rect x="27" y="5.5" width="10" height="2" rx="1" fill="#2A2A2C"/>
  <rect x="4" y="23" width="2" height="12" rx="1" fill="#2A2A2A"/>
  <rect x="58" y="18" width="2" height="8" rx="1" fill="#2A2A2A"/>
</svg>
```

---

## FRAME SELECTOR UI

After all four frames are correctly implemented, verify the Frame tab
grid shows all four with correct thumbnails and labels:

| Thumbnail | Label          | Badge    |
|-----------|----------------|----------|
| iphone_15_pro thumb | iPhone 15 Pro | PRO |
| iphone_17_pro thumb | iPhone 17 Pro | PRO |
| ipad_pro thumb      | iPad Pro      | PRO |
| ipad_pro_m5 thumb   | iPad Pro M5   | PRO |

All four require Pro subscription. Free users see lock icon overlay.

---

## MANUAL TEST CHECKLIST

Run all of these before reporting complete:

**Image fill test (all 4 frames):**
- [ ] Upload any landscape screenshot
- [ ] Apply each frame — image must FILL the entire screen area (no black
      bars top/bottom or left/right inside the screen rect)
- [ ] Image should be cropped/clipped at the rounded screen corners only
- [ ] Verify with a portrait screenshot too — should also fill completely

**iPhone 15 Pro:**
- [ ] Dark titanium body visible (#2C2C2E)
- [ ] Dynamic Island pill centered at top, black fill, camera dot inside
- [ ] Three left buttons and one right power button visible
- [ ] Screen has subtle inner shadow ring

**iPad Pro:**
- [ ] Dark space gray body (#1C1C1E) — NOT white or light
- [ ] Camera dot at top center
- [ ] Power button visible on right side

**iPhone 17 Pro:**
- [ ] Slightly warmer titanium body (#3A3A3A)
- [ ] Dynamic Island with camera dot
- [ ] Buttons on both sides
- [ ] Marginally thinner bezels than iPhone 15 Pro

**iPad Pro M5:**
- [ ] Space Black body (#1C1C1E) — NOT white or light
- [ ] Face ID sensor bar (small rect) at top center instead of dot
- [ ] Very thin bezels (28px top/bottom, 20px sides at base scale)
- [ ] No home indicator bar at bottom

**Pro gate:**
- [ ] Free user sees lock overlay on all 4 device frames
- [ ] Clicking locked frame opens upgrade modal

---

## GIT

Do NOT commit yet. These fixes will be batched with the billing fixes
under tag v1.3.2. Just confirm all tests pass and report done.

After completing each individual task, immediately update
.claude/implementation-plan.md by changing that task's 🔲 to ✅.
```
