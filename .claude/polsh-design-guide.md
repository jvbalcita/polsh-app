# Polsh — Design Guide & Phase 7.5 Specs
> **polsh.app** · Phase 7.5 reference document
> Bug fixes + design overhaul · Target tag: `v1.3.0`
>
> Place this file at `.claude/design-guide.md` in the project root.
> Claude Code should read this file before starting any Part 3 work.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color Tokens](#2-color-tokens)
3. [Typography](#3-typography)
4. [Spacing & Sizing](#4-spacing--sizing)
5. [Component Patterns](#5-component-patterns)
6. [Bug Fixes](#6-bug-fixes)
7. [Landing Page Redesign](#7-landing-page-redesign)
8. [Editor Redesign](#8-editor-redesign)
9. [Billing Page Redesign](#9-billing-page-redesign)
10. [User Menu Component](#10-user-menu-component)
11. [Motion & Animation](#11-motion--animation)
12. [Responsive Breakpoints](#12-responsive-breakpoints)
13. [Accessibility](#13-accessibility)

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

## 6. Bug Fixes

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
