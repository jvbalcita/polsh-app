# Polsh — Design System & Product Spec
> **polsh.app** · Living reference document
> Place at `.claude/design-guide.md` — Claude Code reads this before any UI work.
> Last updated: March 2026

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color Tokens](#2-color-tokens)
3. [Typography](#3-typography)
4. [Spacing & Sizing](#4-spacing--sizing)
5. [Component Patterns](#5-component-patterns)
6. [Bug Fixes — Phase 7.5](#6-bug-fixes--phase-75)
7. [Landing Page Redesign](#7-landing-page-redesign)
8. [Editor Redesign](#8-editor-redesign)
9. [Billing Page Redesign](#9-billing-page-redesign)
10. [User Menu Component](#10-user-menu-component)
11. [Motion & Animation](#11-motion--animation)
12. [Responsive Breakpoints](#12-responsive-breakpoints)
13. [Accessibility](#13-accessibility)
14. [Per-Image Style Isolation](#14-per-image-style-isolation)
15. [Editor Architecture — The Five Layers](#15-editor-architecture--the-five-layers)
16. [Frame System](#16-frame-system)
17. [Background System](#17-background-system)
18. [Canvas Size System](#18-canvas-size-system)
19. [Layout System](#19-layout-system)
20. [Competitive Positioning vs Shotframe](#20-competitive-positioning-vs-shotframe)

---

## 1. Design Principles

**Dark, confident, developer-native.**
Polsh targets developers and designers who value craft. The UI should feel
like a premium tool, not a generic SaaS signup funnel.

**Electric lime is the only accent.**
`#e0ff4f` is used sparingly but boldly. It signals action, active state,
and brand. Everything else is near-black, dark surfaces, and muted grays.
Never use other bright accent colors alongside lime.

**DM Mono for personality, DM Sans for clarity.**
Monospace communicates precision and developer tooling. All headings, the
wordmark, style names, value badges, and section labels use DM Mono. All
body copy, descriptions, and form labels use DM Sans.

**Generous whitespace, no noise.**
Each element should breathe. Resist the urge to fill space. A sparse,
confident layout communicates quality better than a dense one.

**Every interaction has a response.**
Hover states, focus states, active states, loading states — all defined.
Nothing should feel dead or unresponsive.

---

## 2. Color Tokens

Define these as CSS custom properties in `resources/css/app.css`.

```css
:root {
  /* Backgrounds */
  --polsh-bg:            #0a0a0c;
  --polsh-surface:       #111114;
  --polsh-surface-2:     #1a1a1f;
  --polsh-surface-3:     #222228;

  /* Borders */
  --polsh-border:        rgba(255, 255, 255, 0.07);
  --polsh-border-2:      rgba(255, 255, 255, 0.12);
  --polsh-border-active: rgba(255, 255, 255, 0.20);

  /* Accent — Electric Lime */
  --polsh-accent:        #e0ff4f;
  --polsh-accent-hover:  #ecff7a;
  --polsh-accent-dim:    rgba(224, 255, 79, 0.12);
  --polsh-accent-dim-2:  rgba(224, 255, 79, 0.06);
  --polsh-accent-border: rgba(224, 255, 79, 0.35);

  /* Text */
  --polsh-text-1:  #f0f0f2;
  --polsh-text-2:  #8a8a9a;
  --polsh-text-3:  #4a4a58;
  --polsh-text-4:  #2a2a35;

  /* Status */
  --polsh-error:   #ff4f4f;
  --polsh-success: #4fff8a;
  --polsh-warning: #ffaa4f;
}
```

### Tailwind extension

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'polsh-bg':        'var(--polsh-bg)',
      'polsh-surface':   'var(--polsh-surface)',
      'polsh-surface-2': 'var(--polsh-surface-2)',
      'polsh-border':    'var(--polsh-border)',
      'polsh-accent':    'var(--polsh-accent)',
      'polsh-text-1':    'var(--polsh-text-1)',
      'polsh-text-2':    'var(--polsh-text-2)',
      'polsh-text-3':    'var(--polsh-text-3)',
    },
    fontFamily: {
      sans: ['DM Sans', 'sans-serif'],
      mono: ['DM Mono', 'monospace'],
    },
  }
}
```

---

## 3. Typography

```css
/* resources/css/app.css */
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600&display=swap');
```

### Type scale

| Role | Font | Size | Weight | Color |
|---|---|---|---|---|
| Hero headline | DM Mono | 56px / 64px lh | 500 | `--polsh-text-1` |
| Hero accent word | DM Mono | 56px / 64px lh | 500 | `--polsh-accent` |
| Section heading | DM Mono | 32px | 500 | `--polsh-text-1` |
| Card heading | DM Mono | 18px | 500 | `--polsh-text-1` |
| Panel section label | DM Mono | 10px | 500 | `--polsh-text-3` uppercase + letter-spacing 0.08em |
| Body text | DM Sans | 16px | 400 | `--polsh-text-2` |
| Body large | DM Sans | 18px | 400 | `--polsh-text-2` |
| UI label | DM Sans | 13px | 500 | `--polsh-text-2` |
| Value badge | DM Mono | 11px | 400 | `--polsh-accent` |
| Wordmark | DM Mono | 16px | 500 | `--polsh-text-1` |
| Style name | DM Mono | 12px | 400 | `--polsh-text-2` |

---

## 4. Spacing & Sizing

```
Panel width (style picker):   164px
Panel width (controls):       280px
Canvas min height:            500px
Top bar height:               48px
Image strip height:           72px
Thumbnail size:               64 × 40px
Border radius (card/panel):   8px
Border radius (button):       6px
Border radius (thumbnail):    4px
Border radius (badge/pill):   999px
Border radius (input):        6px
```

---

## 5. Component Patterns

### Primary button

```css
.btn-primary {
  background: var(--polsh-accent);
  color: #0a0a0c;
  font-family: 'DM Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 150ms ease;
}
.btn-primary:hover { background: var(--polsh-accent-hover); }
.btn-primary:focus-visible { outline: 2px solid var(--polsh-accent); outline-offset: 2px; }
```

### Ghost button

```css
.btn-ghost {
  background: transparent;
  color: var(--polsh-text-1);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid var(--polsh-border-2);
  transition: border-color 150ms ease, background 150ms ease;
}
.btn-ghost:hover {
  border-color: var(--polsh-border-active);
  background: var(--polsh-surface-2);
}
```

### Range slider

```css
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 2px;
  background: var(--polsh-border-2);
  border-radius: 999px;
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--polsh-accent);
  cursor: pointer;
  transition: transform 150ms ease;
}
input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
```

### Value badge (current slider value)

```html
<span class="value-badge">24px</span>
```
```css
.value-badge {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: var(--polsh-accent);
  background: var(--polsh-accent-dim);
  border: 1px solid var(--polsh-accent-border);
  padding: 1px 6px;
  border-radius: 999px;
  min-width: 36px;
  text-align: right;
}
```

### Panel section label

```html
<div class="section-label">FRAME</div>
```
```css
.section-label {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--polsh-text-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 14px 0 6px;
  border-top: 1px solid var(--polsh-border);
  margin-top: 4px;
}
.section-label:first-child {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}
```

### Plan badge

```html
<span class="plan-badge plan-badge--pro">Pro</span>
```
```css
.plan-badge {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
}
.plan-badge--free {
  color: var(--polsh-text-3);
  background: var(--polsh-surface-2);
  border: 1px solid var(--polsh-border);
}
.plan-badge--pro {
  color: #0a0a0c;
  background: var(--polsh-accent);
}
```

---

## 6. Bug Fixes — Phase 7.5

### Bug 1 — Cannot add a second image (ImageStrip crash)

**Error:** `[Vue warn]: Unhandled error during execution of native event handler at <ImageStrip>`

**Root cause:** The hidden file input ref in `ImageStrip.vue` is broken or the
`@change` handler is not properly connected, causing the crash on the second trigger.

**Fix in `ImageStrip.vue`:**

```vue
<template>
  <div class="image-strip">
    <div
      v-for="(img, i) in store.images"
      :key="img.id"
      class="strip-thumb"
      :class="{ active: i === store.activeIndex, locked: img.locked }"
      @click="store.activeIndex = i"
    >
      <span v-if="img.locked" class="lock-overlay">🔒</span>
    </div>

    <button class="strip-add" @click="triggerFileInput">+</button>

    <!-- IMPORTANT: file input must be at component root, NOT inside button -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor'

const store = useEditorStore()
const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  for (const file of Array.from(input.files)) {
    const url = URL.createObjectURL(file)
    await new Promise<void>(resolve => {
      const img = new Image()
      img.onload = () => {
        store.addImage({
          id: crypto.randomUUID(),
          src: url,
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          locked: false,
        })
        resolve()
      }
      img.src = url
    })
  }

  input.value = '' // reset so the same file can be re-selected
}
</script>
```

**Fix in `useEditorStore` (`stores/editor.ts`):**

```ts
addImage(image: EditorImage) {
  this.images.push(image)
  this.activeIndex = this.images.length - 1  // auto-switch to new image
},
```

**Manual test:** Upload first image → click "+" → upload second image → both
thumbnails appear in the strip → click between them → canvas switches correctly.

---

### Bug 2 — Image doesn't fill canvas (leaves side padding)

**Root cause:** The Konva image node is sized with a fixed pixel value rather
than computing scale relative to the current stage size and padding setting.

**Fix in `FrameCanvas.vue` (or `useCanvas.ts`):**

Replace any fixed image sizing with this computed layout function:

```ts
function computeImageLayout(
  imgW: number,
  imgH: number,
  stageW: number,
  stageH: number,
  padding: number
): { x: number; y: number; width: number; height: number } {
  const availW = stageW - padding * 2
  const availH = stageH - padding * 2
  const scale = Math.min(availW / imgW, availH / imgH)
  const scaledW = imgW * scale
  const scaledH = imgH * scale
  const x = padding + (availW - scaledW) / 2
  const y = padding + (availH - scaledH) / 2
  return { x, y, width: scaledW, height: scaledH }
}
```

Call this whenever: the image first loads, the stage is resized, or the
`padding` value in the store changes. Pass the result to the Konva `Image`
node's `x`, `y`, `width`, `height` attributes.

**Manual test:** Upload a wide 16:9 screenshot on a 1:1 aspect ratio canvas →
image fills the available frame area with only the padding gap on all four
sides. No blank space visible beyond the padding.

---

### Bug 3 — Download and Export ZIP do nothing

**Root cause:** The Konva stage ref is `null` at export time because `useExport.ts`
cannot access the stage from outside the `FrameCanvas.vue` component tree.

**Step 1 — Create `composables/useStageRegistry.ts`:**

```ts
import type Konva from 'konva'

let _stage: Konva.Stage | null = null

export function registerStage(stage: Konva.Stage): void {
  _stage = stage
}

export function getStage(): Konva.Stage | null {
  return _stage
}
```

**Step 2 — Register in `FrameCanvas.vue`:**

```ts
import { registerStage } from '@/composables/useStageRegistry'
import { onMounted } from 'vue'

const stageRef = ref(null)

onMounted(() => {
  const stage = stageRef.value?.getStage()
  if (stage) registerStage(stage)
})
```

**Step 3 — Consume in `useExport.ts`:**

```ts
import { getStage } from '@/composables/useStageRegistry'
import { useEditorStore } from '@/stores/editor'
import { nextTick } from 'vue'
import JSZip from 'jszip'

export function useExport() {
  async function exportImage(format: string, scale: number) {
    const stage = getStage()
    if (!stage) { console.error('[useExport] Stage not registered'); return }

    const mimeType = format === 'jpeg' ? 'image/jpeg'
                   : format === 'webp' ? 'image/webp'
                   : 'image/png'

    const dataUrl = stage.toDataURL({ pixelRatio: scale, mimeType })
    triggerDownload(dataUrl, `polsh-export.${format}`)
  }

  async function exportAllAsZip(format: string, scale: number) {
    const stage = getStage()
    if (!stage) return

    const store = useEditorStore()
    const zip = new JSZip()
    const originalIndex = store.activeIndex

    for (let i = 0; i < store.images.length; i++) {
      store.activeIndex = i
      await nextTick()
      await new Promise(r => setTimeout(r, 120)) // wait for Konva redraw

      const dataUrl = stage.toDataURL({ pixelRatio: scale })
      const base64 = dataUrl.split(',')[1]
      const slug = store.activeStyle?.slug ?? 'polsh'
      zip.file(`${slug}-${i + 1}.${format}`, base64, { base64: true })
    }

    store.activeIndex = originalIndex // restore original selection

    const blob = await zip.generateAsync({ type: 'blob' })
    triggerDownload(URL.createObjectURL(blob), 'polsh-export.zip')
  }

  function triggerDownload(href: string, filename: string) {
    const a = document.createElement('a')
    a.href = href
    a.download = filename
    a.click()
  }

  return { exportImage, exportAllAsZip }
}
```

**Manual test — single:** Upload one image → click Download PNG → file downloads
with correct content.
**Manual test — ZIP:** Add 3 images with different styles → click "Export all as
ZIP" → ZIP file downloads containing 3 correctly named image files.

---

## 7. Landing Page Redesign

File: `resources/js/pages/Welcome.vue`

### 7.1 — Navigation bar

```
[polsh]                          [Sign in]  [Open editor →]
```

- Wordmark: DM Mono 16px `--polsh-text-1`
- Height: 56px, horizontal padding: 32px desktop / 20px mobile
- Sticky with `position: sticky; top: 0; z-index: 50`
- `backdrop-filter: blur(12px)` + `background: rgba(10,10,12,0.85)`
- Bottom border: `1px solid var(--polsh-border)`
- Right: `<UserMenu />` component

### 7.2 — Hero section

**Desktop layout:** Two columns, 55% left / 45% right.
**Mobile layout:** Single column — copy above, canvas below.

**Left column copy:**

```
[● Open beta · Free while we build]

Polish your
screenshots.

Drop in a screenshot. Pick a style. Export a stunning
PNG, WebP, or SVG — no Figma plugins, no subscriptions.

[Open the editor →]   [Save presets with GitHub]

Free forever · No watermark · Works in your browser
```

**Beta badge:**
```css
.beta-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--polsh-border-2);
  border-radius: 999px;
  padding: 6px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: var(--polsh-text-2);
  margin-bottom: 32px;
}
.beta-badge .dot {
  width: 6px;
  height: 6px;
  background: var(--polsh-accent);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.85); }
}
```

**Hero headline:** "Polish your" on line 1, "screenshots." on line 2.
"screenshots." uses `color: var(--polsh-accent)`. Both lines DM Mono 56px weight 500.

**Right column — live Konva demo canvas:**
- A Konva stage 400×260px rendering `resources/js/assets/demo-screenshot.png`
  (bundle a generic dark SaaS UI mockup PNG — dark nav, content area, looks real)
- Auto-cycles through `obsidian-glass` → `neon-halo` → `arctic-white` every 3s
- Crossfade: fade out (opacity 0, 300ms) → swap style → fade in (opacity 1, 300ms)
- Container CSS:
  ```css
  .hero-demo {
    transform: perspective(1200px) rotateY(-8deg) rotateX(2deg);
    transition: transform 400ms ease;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
    border-radius: 10px;
    overflow: hidden;
  }
  .hero-demo:hover {
    transform: perspective(1200px) rotateY(-2deg) rotateX(0deg);
  }
  ```

### 7.3 — Style gallery strip

**Label:** `18 READY-TO-USE STYLES` — DM Mono 11px uppercase centered, `--polsh-text-3`

**Cards:** 200×130px each, horizontal scroll with snap:
```css
.style-gallery {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 0 32px 16px;
}
.style-gallery::-webkit-scrollbar { display: none; }

.style-gallery-card {
  flex-shrink: 0;
  width: 200px;
  height: 130px;
  border-radius: 8px;
  border: 1px solid var(--polsh-border);
  overflow: hidden;
  position: relative;
  scroll-snap-align: start;
  cursor: pointer;
  transition: border-color 150ms, transform 200ms;
}
.style-gallery-card:hover {
  border-color: var(--polsh-accent-border);
  transform: scale(1.02);
}
.style-gallery-card canvas { width: 100%; height: 100%; display: block; }
.style-gallery-card-name {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 20px 10px 8px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.9);
}
```

Each card renders a small Konva canvas with `demo-screenshot.png` and that
style's config applied. Reuse the same Konva rendering logic from the editor.

### 7.4 — Features section

**Headline:** `Built for developers who ship.` — DM Mono 32px

**Grid layout:**
```
┌─────────────────────────┬────────────────────┐
│                         │   Named Styles     │
│    Brand Sessions       ├────────────────────┤
│    (large card)         │   SVG Export       │
└─────────────────────────┴────────────────────┘
┌────────────────────┬─────────────────────────┐
│   REST API         │   Batch ZIP Export      │
└────────────────────┴─────────────────────────┘
```

```css
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 12px;
}
.feature-card--large { grid-row: span 2; }
```

**Card styling:**
```css
.feature-card {
  background: var(--polsh-surface);
  border: 1px solid var(--polsh-border);
  border-radius: 8px;
  padding: 24px;
  transition: border-color 200ms, background 200ms;
}
.feature-card:hover {
  border-color: var(--polsh-border-active);
  background: var(--polsh-surface-2);
}
.feature-card .icon { width: 28px; height: 28px; color: var(--polsh-accent); margin-bottom: 16px; }
.feature-card h3 { font-family: 'DM Mono', monospace; font-size: 16px; color: var(--polsh-text-1); margin-bottom: 8px; }
.feature-card p  { font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--polsh-text-2); line-height: 1.6; }
```

**Feature card content:**

| Slot | Icon (lucide) | Title | Body |
|---|---|---|---|
| Large | `Layers` | Brand Sessions | Save padding, radius, shadow, and color combos as named presets. Apply in one click across every screenshot in a session. |
| Small top-right | `Palette` | Named Styles | 18 hand-crafted styles from minimal white to neon-halo dark. One click, instant results. |
| Small bottom-right | `FileCode` | SVG Export | Export lossless vector frames — perfect for Notion, Figma docs, and README headers. |
| Wide bottom-left | `Zap` | REST API | Integrate with `POST /api/v1/glaze`. Automate styling from your CI pipeline or build scripts. |
| Wide bottom-right | `Archive` | Batch Export | Style up to 10 screenshots at once, download as a ZIP. One consistent look for your whole launch. |

### 7.5 — Before / After section

**Headline:** `Before and after.` — DM Mono 28px left-aligned
**Subtext:** `The same screenshot. One click.`

- Draggable vertical divider splitting the same image: left = raw, right = polished
- Left side: no styling (greyscale + slight desaturation via CSS `filter`)
- Right side: `obsidian-glass` style applied
- Divider: 2px `var(--polsh-accent)` line + 24px circular drag handle with `← →` arrows
- Labels: "Before" (left, `--polsh-text-3`) · "After" (right, `--polsh-accent`)
- Implement: right panel uses `clip-path: inset(0 0 0 {x}px)`, updated on `mousemove`
- Keyboard support: left/right arrow keys move divider by 5%

### 7.6 — Competitive table

**Headline:** `Why Polsh?` — DM Mono 24px

| Feature | Polsh | Screely | Pika | BrandBird |
|---|---|---|---|---|
| Named style system | ✓ | — | — | ✓ |
| Multi-image sessions | ✓ | — | — | — |
| SVG vector export | ✓ | — | — | — |
| REST API access | ✓ | — | — | — |
| Batch ZIP export | ✓ | — | — | — |
| Free open beta | ✓ | — | ✓ | — |

**Styling:**
```css
.competitive-table {
  width: 100%;
  border-collapse: separate;
  border: 1px solid var(--polsh-border);
  border-radius: 8px;
  overflow: hidden;
}
.competitive-table th {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--polsh-text-3);
  padding: 12px 16px;
  border-bottom: 1px solid var(--polsh-border);
  background: var(--polsh-surface);
}
.competitive-table th:nth-child(2) { color: var(--polsh-accent); }
.competitive-table td {
  padding: 10px 16px;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  border-bottom: 1px solid var(--polsh-border);
}
.competitive-table td:nth-child(2) { background: var(--polsh-accent-dim-2); }
.competitive-table .check { color: var(--polsh-accent); }
.competitive-table .dash  { color: var(--polsh-text-4); }
```

### 7.7 — Footer

```
polsh                          GitHub  Twitter  Changelog

© 2026 Polsh · Screenshot styling for developers
Made in the Philippines 🇵🇭
```

- Top border: `1px solid var(--polsh-border)`
- Padding: 48px 32px
- Three-column layout on desktop, stacked on mobile
- "Made in the Philippines 🇵🇭" — DM Sans 12px `--polsh-text-3`
- Icons: `Github` + `Twitter` from lucide-vue-next, 18px

---

## 8. Editor Redesign

### 8.1 — Top bar

```
[polsh / editor]       [obsidian-glass]       [UserMenu]
     ← left                ← center              ← right
```

```css
.editor-topbar {
  height: 48px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--polsh-border);
  backdrop-filter: blur(12px);
  background: rgba(10, 10, 12, 0.85);
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-right { display: flex; justify-content: flex-end; }
```

- Left: `polsh` DM Mono 15px `--polsh-text-1` + ` / editor` DM Mono 15px `--polsh-text-3`
- Center: current style name DM Mono 13px `--polsh-text-3`. `opacity: 0` when no image
  is loaded, `opacity: 1` when loaded (CSS transition 300ms)
- Right: `<UserMenu />` component

### 8.2 — Style picker panel (left)

Width: 164px. Background: `var(--polsh-surface)`. Border-right: `1px solid var(--polsh-border)`.

**Structure (top to bottom):**
1. Search/filter input
2. Scrollable style card grid
3. "Apply to all" button pinned to bottom

**Search input:**
```css
.style-search {
  width: calc(100% - 20px);
  margin: 10px;
  padding: 6px 10px;
  background: var(--polsh-surface-2);
  border: 1px solid var(--polsh-border);
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: var(--polsh-text-1);
  outline: none;
}
.style-search:focus { border-color: var(--polsh-accent-border); }
```

Filter: `v-model="styleFilter"` — filters `styles` array by `name.toLowerCase().includes(filter)`.

**Style card grid:** 2 columns, `gap: 8px`, `padding: 0 10px 10px`

```css
.style-card {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  border: 1.5px solid var(--polsh-border);
  cursor: pointer;
  aspect-ratio: 16/10;
  transition: border-color 150ms;
}
.style-card:hover  { border-color: var(--polsh-border-active); }
.style-card.active { border-color: var(--polsh-accent); background: var(--polsh-accent-dim); }
.style-card canvas { width: 100%; height: 100%; display: block; }
.style-card-name {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 12px 6px 4px;
  background: linear-gradient(transparent, rgba(0,0,0,0.65));
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

Each card shows `demo-screenshot.png` rendered with that style's config in a
small Konva canvas — NOT a flat color rectangle.

**"Apply to all" button (pinned to panel bottom):**
```css
.apply-to-all {
  width: calc(100% - 20px);
  margin: 8px 10px;
  padding: 8px;
  background: transparent;
  border: 1px solid var(--polsh-border-2);
  border-radius: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: var(--polsh-text-2);
  cursor: pointer;
  text-align: center;
  transition: border-color 150ms, color 150ms;
}
.apply-to-all:hover { border-color: var(--polsh-accent-border); color: var(--polsh-accent); }
```

### 8.3 — Canvas area (center)

**Background:**
```css
.canvas-area {
  background-color: var(--polsh-bg);
  background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  overflow: hidden;
}
```

**Empty state (no image loaded):**
```css
.canvas-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px;
  border: 1.5px dashed rgba(255,255,255,0.12);
  border-radius: 12px;
  text-align: center;
  transition: border-color 200ms, background 200ms;
}
.canvas-empty.drag-over {
  border-color: var(--polsh-accent);
  background: var(--polsh-accent-dim-2);
}
.empty-icon  { font-size: 36px; opacity: 0.25; margin-bottom: 8px; }
.empty-title { font-family: 'DM Mono', monospace; font-size: 15px; color: var(--polsh-text-2); }
.empty-hint  { font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--polsh-text-3); }
```

**Floating image info bar (shown above canvas when image is loaded):**
```css
.image-info-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--polsh-surface-2);
  border: 1px solid var(--polsh-border);
  border-radius: 6px;
  padding: 4px 12px;
  margin-bottom: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: var(--polsh-text-3);
}
.image-name { color: var(--polsh-text-2); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.image-dims { font-family: 'DM Mono', monospace; font-size: 11px; }
```

### 8.4 — Image strip (bottom)

Height: 72px. Background: `var(--polsh-surface)`. Border-top: `1px solid var(--polsh-border)`.

```css
.image-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.image-strip::-webkit-scrollbar { display: none; }

.strip-thumb {
  width: 64px; height: 40px;
  flex-shrink: 0;
  border-radius: 4px;
  border: 1.5px solid var(--polsh-border);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: border-color 150ms;
}
.strip-thumb:hover  { border-color: var(--polsh-border-active); }
.strip-thumb.active { border-color: var(--polsh-accent); }
.strip-thumb .lock-overlay { position: absolute; top: 2px; right: 2px; font-size: 9px; }

.strip-add {
  width: 64px; height: 40px;
  flex-shrink: 0;
  border-radius: 4px;
  border: 1.5px dashed var(--polsh-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Mono', monospace;
  font-size: 20px;
  color: var(--polsh-text-3);
  background: transparent;
  cursor: pointer;
  transition: border-color 150ms, color 150ms;
}
.strip-add:hover { border-color: var(--polsh-accent-border); color: var(--polsh-accent); }
```

### 8.5 — Control panel (right)

Width: 280px. Background: `var(--polsh-surface)`. Border-left: `1px solid var(--polsh-border)`.
`overflow-y: auto; padding: 16px`.

**Section groups (in order):**
- `FRAME` — Padding, Radius
- `SHADOW` — Shadow, Shadow Blur
- `BORDER` — Border, Glass Blur
- `TEXTURE` — Noise Grain
- `CANVAS` — Aspect Ratio buttons
- `BACKGROUND` — Color presets (10 swatches × 24px)
- `EXPORT` — Format, Resolution, Download, ZIP

Each control row:
```html
<div class="control-row">
  <div class="control-row-header">
    <label class="control-label">Padding</label>
    <span class="value-badge">{{ store.padding }}px</span>
  </div>
  <input type="range" v-model="store.padding" min="0" max="80" />
</div>
```
```css
.control-row { margin-bottom: 14px; }
.control-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.control-label { font-family: 'DM Sans', sans-serif; font-size: 12px; color: var(--polsh-text-2); }
```

**Color presets — 10 swatches:**

Preset values (in order):
`#e0ff4f` · `#ffffff` · `#0a0a0c` · `#a855f7` · `#3b82f6` · `#f97316` · `#ec4899` · `#10b981` · `#f43f5e` · `#06b6d4`

```css
.color-swatch {
  width: 24px; height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: transform 150ms, border-color 150ms;
}
.color-swatch:hover { transform: scale(1.15); }
.color-swatch.active { border-color: rgba(255,255,255,0.8); }
```

Add `title="Color name"` on each swatch for native tooltip.

**Export section:**
```html
<div class="section-label">EXPORT</div>

<!-- Format toggle -->
<div class="format-group">
  <button v-for="fmt in ['PNG','WEBP','JPEG','SVG']"
    :class="{ active: format === fmt }" @click="format = fmt">{{ fmt }}</button>
</div>

<!-- Scale toggle -->
<div class="scale-group">
  <button v-for="s in [1, 2, 4]"
    :class="{ active: scale === s, disabled: s === 4 && !isPro }"
    @click="selectScale(s)">
    {{ s }}×
    <span v-if="s === 4 && !isPro" class="pro-badge">PRO</span>
  </button>
</div>

<button class="btn-primary export-download" @click="doExport">↓ Download</button>
<button class="btn-ghost export-zip" @click="doExportZip">Export all as ZIP</button>
```

```css
.btn-primary.export-download { width: 100%; margin-top: 12px; padding: 12px; }
.btn-ghost.export-zip        { width: 100%; margin-top: 8px; padding: 10px; font-size: 13px; }
```

---

## 9. Billing Page Redesign

File: `resources/js/pages/Billing/Index.vue`

### Layout

Page title: `Billing & Plan` — DM Mono 28px, centered.
Subtitle: `Simple pricing. No surprises.` — DM Sans 16px `--polsh-text-2`, centered.

**Monthly / Yearly toggle:**
```html
<div class="plan-toggle">
  <button :class="{ active: cycle === 'monthly' }" @click="cycle = 'monthly'">Monthly</button>
  <button :class="{ active: cycle === 'yearly' }" @click="cycle = 'yearly'">
    Yearly <span class="save-pill">Save 25%</span>
  </button>
</div>
```
```css
.plan-toggle {
  display: flex;
  gap: 4px;
  background: var(--polsh-surface-2);
  border: 1px solid var(--polsh-border);
  border-radius: 8px;
  padding: 4px;
  margin: 24px auto;
  width: fit-content;
}
.plan-toggle button {
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--polsh-text-2);
  cursor: pointer;
}
.plan-toggle button.active {
  background: var(--polsh-surface-3);
  color: var(--polsh-text-1);
}
.save-pill {
  background: var(--polsh-accent);
  color: #0a0a0c;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 999px;
  margin-left: 8px;
}
```

**Two plan cards side by side:**

```css
.plans-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
}
.plan-card {
  background: var(--polsh-surface);
  border: 1px solid var(--polsh-border-2);
  border-radius: 12px;
  padding: 32px;
}
.plan-card--pro {
  border-color: var(--polsh-accent);
  background: linear-gradient(160deg, rgba(224,255,79,0.05) 0%, var(--polsh-surface) 60%);
  position: relative;
}
.plan-card--pro::before {
  content: 'Most popular';
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--polsh-accent);
  color: #0a0a0c;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 14px;
  border-radius: 999px;
  white-space: nowrap;
}
```

**Plan price:**
```html
<div class="plan-price">
  <span class="price-currency">₱</span>
  <span class="price-amount">{{ cycle === 'monthly' ? '500' : '4,500' }}</span>
  <span class="price-period">{{ cycle === 'monthly' ? '/mo' : '/yr' }}</span>
</div>
```
```css
.price-amount { font-family: 'DM Mono', monospace; font-size: 40px; font-weight: 500; color: var(--polsh-text-1); }
.price-currency, .price-period { font-family: 'DM Sans', sans-serif; font-size: 16px; color: var(--polsh-text-2); }
```

**Feature checklist:**
```css
.feature-item { display: flex; gap: 10px; padding: 5px 0; font-size: 14px; }
.feature-check { font-family: 'DM Mono', monospace; color: var(--polsh-accent); }
.feature-dash  { font-family: 'DM Mono', monospace; color: var(--polsh-text-4); }
.feature-text  { font-family: 'DM Sans', sans-serif; color: var(--polsh-text-2); }
```

**Below the cards:**
```html
<!-- Payment method icons -->
<div class="payment-methods">
  <span>Pay with</span>
  <img src="/icons/visa.svg" alt="Visa" />
  <img src="/icons/mastercard.svg" alt="Mastercard" />
  <img src="/icons/gcash.svg" alt="GCash" />
  <img src="/icons/maya.svg" alt="Maya" />
</div>

<!-- Trust line -->
<p class="trust-line">No contracts. Cancel anytime.</p>
```
```css
.payment-methods { display: flex; align-items: center; gap: 10px; justify-content: center; margin-top: 24px; font-size: 13px; color: var(--polsh-text-3); }
.payment-methods img { height: 20px; opacity: 0.6; }
.trust-line { text-align: center; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--polsh-text-3); margin-top: 12px; }
```

---

## 10. User Menu Component

File: `resources/js/components/UserMenu.vue`

Uses shadcn-vue `DropdownMenu`. Full implementation:

```vue
<template>
  <DropdownMenu v-if="auth.user">
    <DropdownMenuTrigger as-child>
      <button class="user-avatar-btn" :title="auth.user.name">
        <img v-if="auth.user.avatar" :src="auth.user.avatar" class="avatar-img" alt="Avatar" />
        <span v-else class="avatar-initials">{{ initials }}</span>
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="user-dropdown">
      <div class="dropdown-header">
        <div>
          <div class="dropdown-name">{{ auth.user.name }}</div>
          <div class="dropdown-email">{{ auth.user.email }}</div>
        </div>
        <span class="plan-badge" :class="`plan-badge--${auth.user.plan}`">
          {{ auth.user.plan === 'pro' ? 'Pro' : 'Free' }}
        </span>
      </div>

      <DropdownMenuSeparator />
      <DropdownMenuItem @click="router.visit('/presets')">My Presets</DropdownMenuItem>
      <DropdownMenuItem @click="router.visit('/history')">Export History</DropdownMenuItem>
      <DropdownMenuItem @click="router.visit('/billing')">Billing & Plan</DropdownMenuItem>
      <DropdownMenuItem @click="router.visit('/settings/accounts')">Connected Accounts</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="dropdown-logout" @click="router.post('/logout')">Log out</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <a v-else href="/login" class="btn-ghost sign-in-btn">Sign in</a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const auth = computed(() => (usePage().props as any).auth)

const initials = computed(() => {
  return (auth.value.user?.name ?? '')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})
</script>
```

```css
.user-avatar-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--polsh-border-2);
  overflow: hidden;
  cursor: pointer;
  background: var(--polsh-surface-2);
  transition: border-color 150ms;
  display: flex; align-items: center; justify-content: center;
}
.user-avatar-btn:hover { border-color: var(--polsh-accent-border); }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initials { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--polsh-accent); }

.user-dropdown {
  width: 228px;
  background: var(--polsh-surface-3);
  border: 1px solid var(--polsh-border-2);
  border-radius: 8px;
  padding: 4px;
}
.dropdown-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px 8px;
}
.dropdown-name  { font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--polsh-text-1); }
.dropdown-email { font-family: 'DM Sans', sans-serif; font-size: 11px; color: var(--polsh-text-3); margin-top: 2px; }
.dropdown-logout { color: var(--polsh-error) !important; }

.sign-in-btn { font-size: 13px; padding: 7px 14px; }
```

---

## 11. Motion & Animation

Keep all animations subtle. Never animate for decoration alone.

```css
/* Standard interaction response */
transition: all 150ms ease;

/* Larger state changes (panels, dropdowns) */
transition: all 250ms ease;

/* Focus ring — applied to ALL interactive elements */
:focus-visible {
  outline: 2px solid var(--polsh-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Card hover lift */
.card:hover { transform: translateY(-2px); }
transition: transform 200ms ease, border-color 200ms ease;

/* Canvas demo crossfade (landing page hero) */
.canvas-layer { transition: opacity 300ms ease; }

/* Beta badge pulse — see Section 7.2 */
```

---

## 12. Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm — large phones / tablets */ }
@media (min-width: 1024px) { /* lg — desktop */ }
@media (min-width: 1280px) { /* xl — wide desktop */ }
```

### Landing page breakpoints

| Section | Mobile (<640px) | Desktop (1024px+) |
|---|---|---|
| Nav | Hamburger menu or simplified | Full nav |
| Hero | Single column, canvas below copy | Two-column 55/45 |
| Style gallery | 160×105px cards | 200×130px cards |
| Features | Single column stacked | Asymmetric grid |
| Competitive table | Horizontal scroll wrapper | Full width |
| Footer | Stacked, centered | Three columns |

### Editor breakpoints

| Breakpoint | Layout |
|---|---|
| <1024px (tablet) | Style picker hidden, toggled via button in topbar (slide-over drawer). Controls collapse to bottom sheet. Canvas fills full width. |
| ≥1024px (desktop) | Full 3-column: style picker (164px) — canvas (flex 1) — controls (280px) |

---

## 13. Accessibility

- Every interactive element has `:focus-visible` outline in `var(--polsh-accent)`
- Color is never the only conveyor of meaning (✓/— in tables, not just green/red)
- All `<img>` tags have meaningful `alt` attributes
- Form inputs have associated `<label>` elements
- Range sliders have `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- shadcn-vue `DropdownMenu` handles ARIA roles automatically
- Minimum touch target: 44×44px on mobile
- Before/After drag handle: `role="slider"`, arrow keys move by 5%, Shift+arrow by 10%
- Color contrast: all text meets WCAG AA (4.5:1 for body, 3:1 for large text)

---

*Polsh Design Guide · Phase 7.5 · v1.3.0*
*Implementation plan: `.claude/implementation-plan.md`*
*Last updated: March 2026*

---

## 14. Per-Image Style Isolation

### The bug

Currently `useEditorStore` holds one global `activeStyle` plus one set of
adjustment values (padding, radius, shadow, etc.) for the entire session.
When a style or control is changed, it overwrites the settings for all images
because there is no per-image state.

### The fix — per-image settings in the images array

Each image object in `images[]` must carry its own complete settings snapshot:

```ts
// resources/js/types/editor.ts
interface SessionImage {
  id: string
  url: string                     // object URL or uploaded path
  name: string
  width: number
  height: number
  locked: boolean

  // Per-image settings — independent from all other images
  settings: ImageSettings
}

interface ImageSettings {
  styleSlug: string               // which named style is active
  backgroundType: 'gradient' | 'solid' | 'mesh' | 'image' | 'transparent'
  backgroundValue: string         // CSS gradient string, hex color, or image URL
  frameType: string               // 'none' | 'macos-dark' | 'browser-light' | etc.
  padding: number                 // 0–120px
  radius: number                  // 0–40px
  shadow: number                  // 0–100
  shadowBlur: number              // 0–80px
  shadowColor: string             // hex
  border: number                  // 0–4px
  borderColor: string             // hex
  noiseGrain: number              // 0–30%
  aspectRatio: string             // '16:9' | '1:1' | 'og' | '4:5' | 'free'
}

// Default settings (used when a new image is added)
const DEFAULT_SETTINGS: ImageSettings = {
  styleSlug: 'obsidian-glass',
  backgroundType: 'gradient',
  backgroundValue: 'linear-gradient(135deg, #0a0a0c 0%, #1a1a2e 100%)',
  frameType: 'none',
  padding: 48,
  radius: 12,
  shadow: 50,
  shadowBlur: 40,
  shadowColor: '#000000',
  border: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  noiseGrain: 3,
  aspectRatio: '16:9',
}
```

### Store changes

```ts
// useEditorStore — key changes

// REMOVE: global activeStyle, padding, radius, shadow, etc.
// ADD: computed getters that read from images[activeIndex].settings

const activeSettings = computed<ImageSettings | null>(() =>
  images.value[activeIndex.value]?.settings ?? null
)

const activeStyleSlug = computed(() =>
  activeSettings.value?.styleSlug ?? 'obsidian-glass'
)

// When a control changes, write ONLY to the active image's settings
function updateSetting<K extends keyof ImageSettings>(
  key: K,
  value: ImageSettings[K]
) {
  const img = images.value[activeIndex.value]
  if (!img || img.locked) return
  img.settings = { ...img.settings, [key]: value }
  saveToLocalStorage()
}

// Apply to all: copies active image settings to all UNLOCKED images
function applyToAll() {
  const source = images.value[activeIndex.value]
  if (!source) return
  images.value.forEach((img) => {
    if (!img.locked && img.id !== source.id) {
      img.settings = { ...source.settings }
    }
  })
  showToast(`Applied to ${images.value.filter(i => !i.locked).length} images`)
}

// Add image: new images always get DEFAULT_SETTINGS (or copy from active if preferred)
function addImage(file: SessionImage) {
  images.value.push({
    ...file,
    settings: { ...DEFAULT_SETTINGS },
  })
  activeIndex.value = images.value.length - 1
}
```

### Canvas rendering change

`FrameCanvas.vue` must consume `activeSettings` rather than individual
store properties:

```ts
// Before (wrong — reads global store props)
const padding = store.padding
const radius = store.radius

// After (correct — reads per-image settings)
const settings = store.activeSettings
const padding = settings?.padding ?? 48
const radius = settings?.radius ?? 12
```

### Control panel binding change

Every slider and control in `ControlPanel.vue` must bind to
`store.updateSetting('padding', value)` rather than setting
`store.padding = value` directly.

---

## 15. Editor Architecture — The Five Layers

This is the conceptual model that separates Polsh from every competitor
that lumps everything into one "style" concept.

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1: CANVAS SIZE                               │
│  What are the output dimensions?                    │
│  Twitter · LinkedIn · Square · Stories · Custom     │
├─────────────────────────────────────────────────────┤
│  LAYER 2: BACKGROUND                                │
│  What is behind the screenshot?                     │
│  Gradient · Solid · Mesh · Abstract · Transparent   │
├─────────────────────────────────────────────────────┤
│  LAYER 3: FRAME                                     │
│  What wraps the screenshot?                         │
│  None · macOS · Browser · Terminal · iPhone · iPad  │
├─────────────────────────────────────────────────────┤
│  LAYER 4: ADJUSTMENTS                               │
│  Fine-tune the composition                          │
│  Padding · Radius · Shadow · Noise · Border         │
├─────────────────────────────────────────────────────┤
│  LAYER 5: LAYOUT (Phase 8+)                         │
│  How are multiple images arranged?                  │
│  Single · Side by side · Grid · Before/After        │
└─────────────────────────────────────────────────────┘
```

### Why this is better than the competition

Shotframe and similar tools conflate Layers 2 and 3 — their "style" is
really a background + maybe a frame + some adjustments all baked together.
This makes it impossible to mix and match: you can't take the "neon halo"
background with the "macOS dark" frame.

Polsh's five-layer model means any combination works:
- macOS frame + abstract background + heavy shadow → works
- Browser frame + transparent background (for web mockups) → works
- No frame + solid lime background + zero noise → works
- iPhone bezel + mesh gradient + max radius → works

**Named styles become presets** — a "style" in Polsh is just a saved
combination of all five layer settings. Users can still pick a style
card to instantly apply a curated look, but they can also mix freely.

### Migration path from current architecture

In Phase 7.5: fix per-image isolation (Section 14) and separate the
controls into Background, Frame, and Adjustments tabs in the right panel.
The "named styles" picker on the left becomes a "Quick presets" strip.

In Phase 8: add Layout system. In Phase 9+: add community preset marketplace.

### UI layout for the right panel — tabbed controls

```
┌─────────────────────────────────────┐
│  [ Background ] [ Frame ] [ Adjust ] │  ← tab strip
├─────────────────────────────────────┤
│                                     │
│  (content changes per tab)          │
│                                     │
└─────────────────────────────────────┘
```

- Tabs in DM Mono 11px uppercase
- Active tab: lime underline 2px, lime text
- Inactive: muted text
- No icons in tabs — text only, keep it tight

---

## 16. Frame System

Frames are overlays that simulate a device or application chrome.
They are rendered **on top of** the screenshot inside the Konva canvas,
not behind it. The screenshot is clipped and positioned inside the
frame's content area.

### Available frames

| Frame ID | Name | Description | Plan |
|---|---|---|---|
| `none` | No Frame | Screenshot floats on background with shadow | Free |
| `macos-dark` | macOS Dark | Dark title bar, traffic light buttons (dark) | Free |
| `macos-light` | macOS Light | Light title bar, traffic light buttons (light) | Free |
| `browser-chrome` | Browser | Address bar, tab strip — neutral gray | Free |
| `browser-arc` | Arc Browser | Arc-style sidebar chrome | Pro |
| `terminal` | Terminal | Dark terminal window, prompt header | Free |
| `iphone-15` | iPhone 15 | iPhone 15 Pro titanium bezel | Pro |
| `ipad-pro` | iPad Pro | iPad Pro silver bezel | Pro |
| `window-minimal` | Minimal Window | Three dots only, no title bar | Free |
| `code-editor` | Code Editor | VS Code-style title + tab bar | Free |

### How frames are rendered in Konva

```
┌──────────────────────────────────┐
│  [•][•][•]  My App         [—][□][×]  ← Frame chrome layer (Konva shapes)
├──────────────────────────────────┤
│                                  │
│   [  screenshot image  ]         │  ← Screenshot, clipped to content area
│                                  │
└──────────────────────────────────┘
↑
Entire thing sits on top of the background layer
```

The frame is drawn as Konva `Rect`, `Line`, `Circle`, and `Text` nodes.
The screenshot is clipped using Konva's `clipFunc` to the content area
of the frame (below the chrome bar).

### Frame options (appear in Frame tab when a frame is selected)

- **Title text** — editable string shown in the title bar (default: "My App")
- **URL text** — for browser frames, the address bar URL (default: "example.com")
- **Window buttons** — toggle: show/hide the traffic light / close buttons
- **Tab name** — for browser frames, tab label text

### Why padding works differently with frames

When `frameType !== 'none'`, the padding slider controls the space
**outside** the frame (between frame edge and canvas edge).
When `frameType === 'none'`, padding controls the space between the
screenshot edges and the canvas edge.

This distinction must be clear in the UI — show a small tooltip or
label change when a frame is active:
- No frame: "Padding — space around screenshot"
- Frame active: "Padding — space around frame"

---

## 17. Background System

Backgrounds sit behind the screenshot (and its frame if any).
They fill the entire canvas.

### Background types

| Type | Description | Controls |
|---|---|---|
| `gradient` | CSS linear or radial gradient | Start color, end color, angle, type |
| `solid` | Single flat color | Color picker |
| `mesh` | Soft multi-point gradient | 4 color points, blend intensity |
| `noise` | Solid color with grain texture | Base color, grain amount, grain size |
| `abstract` | Bundled abstract SVG/PNG images | Image picker (12 bundled options) |
| `transparent` | Checkerboard (for PNG export) | None |
| `custom-image` | User-uploaded background image | Upload + fit/fill/stretch mode |

### Named style backgrounds

When a named style is applied from the quick presets strip, it sets both
the `backgroundType` and the frame, padding, and other defaults. The user
can then change any individual layer without "breaking" the style — styles
are just a starting point, not a locked configuration.

### Background tab UI

```
TYPE
[ Gradient ] [ Solid ] [ Mesh ] [ Abstract ] [ Image ] [ None ]

(when Gradient selected:)
Start color  [●]  #0d0d1a
End color    [●]  #1a1a2e
Angle        ────●───  135°
Type         [ Linear ] [ Radial ]

(when Abstract selected:)
[img1] [img2] [img3] [img4]    ← 4×3 grid of bundled abstract options
[img5] [img6] [img7] [img8]
[img9] ...
```

---

## 18. Canvas Size System

Canvas size determines the **output dimensions** of the final exported image.
This is separate from the aspect ratio concept — it's about real pixel sizes.

### Preset canvas sizes

| Preset | Dimensions | Use case |
|---|---|---|
| `twitter-landscape` | 1200 × 675px | Twitter / X post |
| `twitter-square` | 1080 × 1080px | Twitter / X square post |
| `linkedin` | 1200 × 627px | LinkedIn post |
| `og-image` | 1200 × 630px | Open Graph / link preview |
| `dribbble` | 1600 × 1200px | Dribbble shot |
| `stories` | 1080 × 1920px | Instagram / TikTok stories |
| `product-hunt` | 1270 × 760px | Product Hunt gallery |
| `github-social` | 1280 × 640px | GitHub social preview |
| `free` | custom | User enters width + height |

### UI placement

Canvas size lives in its own row **above the canvas area**, not in the
right panel. It's a selection that affects the stage, so it should be
immediately visible:

```
┌──────────────────────────────────────────────────────────┐
│  [ Twitter ] [ LinkedIn ] [ OG Image ] [ Stories ] [···] │  ← canvas size bar
├──────────────────────────────────────────────────────────┤
│                                                          │
│                   [ canvas ]                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Pill buttons, same style as aspect ratio buttons
- "···" opens a dropdown with all presets + custom input
- Changing canvas size re-renders the stage at the new ratio immediately
- Custom: show a `width × height` input pair with a "px" suffix label

---

## 19. Layout System
> **Phase 8 feature** — do not implement in Phase 7.5.
> Documented here for architecture planning.

Layout controls how multiple uploaded images are arranged on the canvas.

### Layout types

| Layout | Description | Max images |
|---|---|---|
| `single` | One image, centered (current behavior) | 1 |
| `side-by-side` | Two images horizontally | 2 |
| `stacked` | Two images vertically | 2 |
| `grid-2x2` | Four images in a 2×2 grid | 4 |
| `grid-3` | Three images: 1 large left + 2 stacked right | 3 |
| `before-after` | Special: draggable reveal divider between 2 images | 2 |
| `filmstrip` | Horizontal strip with equal-sized thumbnails | 2–6 |

### Layout rules

- Layout applies to the **canvas composition** — all images share the same
  background, frame style, and adjustment settings in layout mode
- Per-image isolation (Section 14) still applies to individual slots — each
  slot can have different content but shares the layout's background/frame
- `before-after` layout is a special interactive export — the divider
  position is baked into the exported image at whatever position the user sets
- Layout switcher lives above the image strip, replacing the current "+" button
  area when more than 1 image is loaded

---

## 20. Competitive Positioning vs Shotframe

### What Shotframe does

Shotframe.space offers: backgrounds (abstract/gradient/solid), appearance
controls (radius, shadow, padding), outlines (glass variants, inset, border),
frames (macOS, iPhone 15 Pro), canvas sizes (Twitter, Square, LinkedIn, Stories,
Dribbble, Custom), layouts (single, 2-slot, 3-slot, before/after), quick presets,
and image/code mode.

### Where Polsh beats them

| Capability | Shotframe | Polsh |
|---|---|---|
| Named style presets | Quick presets only (5 generic) | 18 crafted named styles + community marketplace |
| Per-image independent styles | ✗ | ✓ (after Phase 7.5 fix) |
| SVG vector export | ✗ | ✓ |
| REST API + CLI | ✗ | ✓ |
| Batch session (edit all at once) | ✗ | ✓ |
| Community style marketplace | ✗ | ✓ (Phase 8) |
| Team workspaces / shared presets | ✗ | ✓ |
| 5-layer architecture (mix & match) | ✗ (baked styles) | ✓ |
| Code screenshot mode | ✗ | Planned Phase 9+ |
| Frame + Background independence | ✗ | ✓ |

### Where Shotframe currently beats us (gaps to close)

| Gap | Target phase |
|---|---|
| Layout system (2-slot, grid, before/after) | Phase 8 |
| Canvas size presets (Twitter, LinkedIn etc.) | Phase 7.5 (partial) |
| Abstract/image backgrounds | Phase 7.5 |
| More frame options (iPhone, iPad bezel) | Phase 8 |
| Code screenshot mode | Phase 10+ |

### Polsh's unique positioning statement

> "Polsh is the screenshot tool for developers who care about craft.
> Unlimited combinations: any background, any frame, any size —
> with the REST API and CLI that Shotframe will never build."

The API + CLI angle is the one thing Shotframe categorically cannot match
because their product is browser-only. That is Polsh's defensible moat and
should be prominent in all marketing copy.

---

*Polsh Design System & Product Spec · polsh.app*
*Implementation plan: `.claude/implementation-plan.md`*
*Last updated: March 2026*
