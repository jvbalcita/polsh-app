# Polsh — Complete Implementation Plan
> **polsh.work** · Screenshot styling tool for developers & creators
> Laravel 12 · Inertia 2 · Vue 3 · TypeScript · Tailwind v4 · shadcn-vue
> Philippines-based · PayMongo billing · March 2026

---

## Accent Color Decision

**Confirmed: `#e0ff4f` (Electric Lime) is the official Polsh accent.**

The original PRD listed `#7c6fe0` (indigo-purple) as a placeholder — superseded.
Electric lime on `#0a0a0c` near-black delivers superior contrast, strong visual
personality, and differentiates Polsh from the dozens of developer SaaS tools
using indigo/purple. All code must use `#e0ff4f`.

### Full color token reference — lock these in CSS variables

| Token | Value | Usage |
|---|---|---|
| `--polsh-bg` | `#0a0a0c` | App background / canvas area |
| `--polsh-surface` | `#111114` | Panel surfaces |
| `--polsh-surface-2` | `#1a1a1f` | Elevated surfaces, hover states |
| `--polsh-border` | `rgba(255,255,255,0.08)` | Default borders |
| `--polsh-border-active` | `rgba(255,255,255,0.18)` | Active / hover borders |
| `--polsh-accent` | `#e0ff4f` | Primary accent — buttons, highlights |
| `--polsh-accent-dim` | `rgba(224,255,79,0.12)` | Accent background tints |
| `--polsh-accent-glow` | `rgba(224,255,79,0.06)` | Subtle glow |
| `--polsh-accent-border` | `rgba(224,255,79,0.4)` | Accent-colored borders |
| `--polsh-text-1` | `#f0f0f2` | Primary text |
| `--polsh-text-2` | `#8a8a9a` | Secondary text |
| `--polsh-text-3` | `#4a4a5a` | Muted / disabled |

**Fonts:** DM Mono (display / brand / headings) · DM Sans (UI body / controls)

---

## How to use this document

- ✅ = Completed
- 🔲 = Pending / To do
- Each pending phase has a ready-to-paste **Claude Code prompt**
- **Phase 7 is new** — consolidates all gaps from Phases 0–6 before the marketplace
- Phases 8–11 are the renamed continuation of the original Phases 7–10
- For new Claude Code sessions use the **Context-Reload Prompt** in Appendix A

---

## Table of Contents

| Phase | Description | Status |
|---|---|---|
| [Phase 0](#phase-0--project-scaffold) | Project scaffold | ✅ |
| [Phase 1](#phase-1--canvas-engine-styles--editor) | Canvas engine, styles, editor | ✅ |
| [Phase 2](#phase-2--export-engine-landing-page--oauth) | Export engine, landing page, OAuth | ✅ |
| [Phase 3](#phase-3--pro-billing-with-paymongo) | Pro billing with PayMongo | ✅ |
| [Phase 4](#phase-4--export-history--team-workspaces) | Export history, team workspaces | ✅ |
| [Phase 5](#phase-5--rest-api-cli--server-side-processing) | REST API, CLI, server-side processing | ✅ |
| [Phase 6](#phase-6--api-docs-testing-qa--production-deployment) | API docs, testing, QA, deployment | ✅ |
| [Phase 7](#phase-7--gap-fixes--pre-marketplace-polish) | Gap fixes & pre-marketplace polish | ✅ |
| [Phase 7.5](#phase-75--bug-fixes--design-overhaul) | Bug fixes & design overhaul | ✅ |
| [**Phase 7.6**](#phase-76--per-image-style-isolation--five-layer-architecture) | **Per-image isolation & five-layer architecture** | ✅ |
| [Phase 8](#phase-8--community-style-marketplace-core) | Community style marketplace core | 🔲 |
| [Phase 9](#phase-9--marketplace-payouts-creator-profiles--ratings) | Marketplace payouts, creator profiles, ratings | 🔲 |
| [Phase 10](#phase-10--growth-packs-affiliates--roadmap-votes) | Growth: packs, affiliates, roadmap votes | 🔲 |
| [Phase 11](#phase-11--post-v2-extensions--integrations) | Post-V2: Figma plugin, VS Code, GitHub Action | 🔲 |

---

## Stack Reference

### Pre-installed via Laravel 12 Vue Starter Kit
> `laravel new polsh --using=laravel/vue`
> ⚠️ Do NOT reinstall manually — these are pre-configured and will conflict.

| Package | What it provides |
|---|---|
| `laravel/framework ^12` | Core framework |
| `inertiajs/inertia-laravel ^2` | SPA routing |
| `@inertiajs/vue3 ^2` | Vue 3 Inertia adapter |
| `vue ^3.5` + TypeScript ^5 | Composition API + types |
| `tailwindcss ^4` | CSS (Oxide engine) |
| `shadcn-vue` | UI components |
| `vite ^6` | Build + HMR |
| Auth scaffolding | Register, login, reset, verify |

### Install after scaffolding

```bash
# Frontend
npm install konva vue-konva jszip pinia @vueuse/core

# Dev tools (Phase 0)
composer require laravel/telescope --dev
composer require laravel/pint --dev
composer require pestphp/pest --dev --with-all-dependencies
php artisan pest:install

# Phase 3 — auth, billing, storage, permissions
composer require laravel/socialite
composer require spatie/laravel-medialibrary        # FREE base only
composer require spatie/laravel-permission
composer require paymongo/paymongo-php              # NOT Stripe

# Phase 5 — API processing
composer require intervention/image
composer require laravel/horizon

# Phase 9 — creator payouts
composer require xendit/xendit-php                  # Requires DTI registration for live mode
```

### Locked decisions

| Decision | Value |
|---|---|
| Billing gateway | PayMongo — NOT Stripe/Cashier |
| Billing package | Custom `BillingController` — NOT `laravel/cashier` |
| Marketplace payouts | Xendit XenPlatform — NOT Stripe Connect |
| Media library | `spatie/laravel-medialibrary` FREE base — NOT Pro |
| Frontend | Inertia + Vue 3 — NOT Livewire |
| File storage | Cloudflare R2 via Flysystem S3 driver |
| **Accent color** | **`#e0ff4f` Electric Lime — NOT `#7c6fe0` indigo** |
| Display font | DM Mono |
| UI font | DM Sans |
| API endpoint | `POST /api/v1/glaze` |
| Artisan command | `php artisan polsh:glaze` |
| Style JSON path | `resources/js/data/styles/` |
| Amount format | Centavos (×100 send, ÷100 display) |
| Rate limits | Monthly: 50 / 2,000 / 10,000 |

---

## Phase 0 — Project Scaffold
> **Duration:** ~½ day | **Roadmap:** MVP Week 1 | **Status:** ✅ COMPLETED

### Completed
- ✅ `laravel new polsh --using=laravel/vue` scaffolded
- ✅ `konva`, `vue-konva`, `pinia`, `@vueuse/core`, `jszip` installed
- ✅ `laravel/telescope`, `laravel/pint`, `pestphp/pest` installed
- ✅ Routes: `/` Welcome, `/editor` Editor
- ✅ `useEditorStore` Pinia store scaffolded in `resources/js/stores/editor.ts`
- ✅ GitHub repo + CI (Pint + Pest on every push/PR)
- ✅ TypeScript interfaces: `resources/js/types/style.ts`, `types/editor.ts`
- ✅ Base folder structure:
  ```
  resources/js/
  ├── pages/
  ├── components/editor/
  ├── composables/
  ├── stores/
  ├── data/styles/       ← style JSON files go here
  └── types/
  ```

---

## Phase 1 — Canvas Engine, Styles & Editor
> **Duration:** ~2.5 weeks | **Roadmap:** MVP Weeks 2–4 | **Status:** ✅ COMPLETED

### Completed
- ✅ `FrameCanvas.vue` — Konva stage with layer order: background → noise → shadow → screenshot → border → chrome
- ✅ `ImageUploader.vue` — drag-and-drop + `Cmd/Ctrl+V` clipboard paste
- ✅ `ImageStrip.vue` — horizontal thumbnails, up to 10 images, drag-to-reorder
- ✅ `StylePicker.vue` — left panel grid of style cards
- ✅ `StyleCard.vue` — thumbnail preview + name + hover preview on main canvas
- ✅ `ControlPanel.vue` — all sliders, color pickers, aspect ratio selector
- ✅ All 12 launch styles as JSON in `resources/js/data/styles/`
- ✅ Style click updates canvas in <100ms
- ✅ `useEditorStore` (Pinia): `images[]`, `activeIndex`, `activeStyle`, `padding`, `radius`, `shadowIntensity`, `shadowColor`, `blur`, `borderWidth`, `borderColor`, `noiseGrain`, `background`, `aspectRatio`, `history[]`, `historyIndex`, `applyToAll()`, `lockImage()`, `undo()`, `redo()`
- ✅ "Apply to all" — copies style + customizations to all unlocked images, re-renders thumbnails, toast
- ✅ Per-image lock icon on thumbnails
- ✅ Session state in `localStorage` — restored on page refresh
- ✅ 20-step undo/redo
- ✅ Keyboard shortcuts: `Cmd+S`, `Cmd+Shift+S`, `Cmd+Z`, `Cmd+Shift+Z`, `Cmd+D`, `←/→`

### 12 Launch Styles ✅

| Slug | Name |
|---|---|
| `obsidian-glass` | Obsidian Glass |
| `neon-halo` | Neon Halo |
| `arctic-white` | Arctic White |
| `laravel-cloud` | Laravel Cloud |
| `product-hunt` | Product Hunt Card |
| `terminal-dark` | Terminal Dark |
| `sakura-mesh` | Sakura Mesh |
| `og-minimal` | OG Minimal |
| `midnight-aurora` | Midnight Aurora |
| `studio-light` | Studio Light |
| `grid-blueprint` | Grid Blueprint |
| `void-glow` | Void Glow |

---

## Phase 2 — Export Engine, Landing Page & OAuth
> **Duration:** ~2 weeks | **Roadmap:** MVP Weeks 5–6 | **Status:** ✅ COMPLETED

### Completed
- ✅ `useExport.ts`: `exportImage(format, options)` + `exportAll(format, options)` + `serializeKonvaToSVG()`
- ✅ PNG 1x/2x (client-side), WEBP + JPEG with quality slider, SVG with vector frames + embedded raster
- ✅ Batch ZIP via JSZip, filename: `polsh-{style-slug}-{n}.{ext}`, custom prefix input
- ✅ `ExportPanel.vue` — format buttons, resolution pills, download + ZIP buttons, 4x gated for Pro
- ✅ `Welcome.vue` — hero, how-it-works, style gallery, before/after, pricing teaser, footer
- ✅ Dark theme, electric lime accent, mobile/tablet/desktop responsive layouts
- ✅ GitHub OAuth + Google OAuth via `laravel/socialite`, `github_id` + `google_id` on users
- ✅ Login page with GitHub + Google buttons
- ✅ `presets` migration: `id, user_id (FK), name, style_slug, settings (json), is_default (bool), team_id (nullable FK), timestamps`
- ✅ `export_sessions` migration: `id, user_id (nullable FK), style_slug, image_count, format, resolution, thumbnail_path (nullable), settings_snapshot (json), created_at`
- ✅ Basic preset save/load (visible when logged in)

### Performance targets — verify before marking done
- 🔲 Lighthouse Performance ≥ 90
- 🔲 First Contentful Paint ≤ 1.5s
- 🔲 Style switch canvas render ≤ 200ms
- 🔲 Batch apply (10 images) ≤ 500ms

---

## Phase 3 — Pro Billing with PayMongo
> **Duration:** ~1.5 weeks | **Roadmap:** V1.1 Weeks 7–9 | **Status:** ✅ COMPLETED

### Completed
- ✅ `paymongo/paymongo-php` installed, `.env` keys, `config/services.php` block
- ✅ `subscriptions` migration + `payments` migration (all amounts in centavos)
- ✅ User model: `subscriptions()`, `activeSubscription()`, `isPro(): bool`, `subscriptionEndsAt()`, `imageLimit()` (3 free / 10 pro)
- ✅ `BillingController`: `checkout()` (₱500/mo = 50000 centavos, ₱4,500/yr = 450000), `success()`, `cancel()`, `webhook()` (HMAC-SHA256, `te` test + `li` live prefix)
- ✅ Webhook handlers: `handleCheckoutPaid()`, `handleCheckoutFailed()`, `handlePaymentPaid()`, `handlePaymentFailed()`
- ✅ Billing routes + webhook route (CSRF-exempt in `api.php`)
- ✅ `Billing/Index.vue` — monthly/yearly toggle, card/GCash/Maya shown, cancel with modal
- ✅ `HandleInertiaRequests` shared props: `auth.isPro`, `auth.imageLimit`, `auth.endsAt`
- ✅ `usePro.ts` composable
- ✅ Pro gates: 4x resolution, SVG export, image count >3 modal, preset cap at 5
- ✅ `spatie/laravel-permission` Free/Pro/Admin roles
- ✅ `ProcessSubscriptionRenewals` job (daily scheduled)
- ✅ Cloudflare Tunnel for local webhook testing

---

## Phase 4 — Export History & Team Workspaces
> **Duration:** ~1.5 weeks | **Roadmap:** V1.1 Weeks 9–12 | **Status:** ✅ COMPLETED

### Completed
- ✅ Export history: saves session after every export (0.25x thumbnail), `SessionController`, `History.vue`, re-open restores full canvas state, free 10 / Pro 50
- ✅ `teams` + `team_user` pivot, `presets.team_id` column
- ✅ `TeamController`: `create`, `invite` (email notification), `join` (token)
- ✅ `Teams/Settings.vue` — members, invite, leave, shared presets
- ✅ Team presets visible in style picker under "Team" section, gated by `isPro()`
- ✅ Nav: History + Team icons when logged in

---

## Phase 5 — REST API, CLI & Server-Side Processing
> **Duration:** ~2 weeks | **Roadmap:** V1.2 Weeks 13–18 | **Status:** ✅ COMPLETED

### Completed
- ✅ `api_keys` migration: SHA-256 `key_hash`, `monthly_requests`, `month_reset_at`, `revoked_at`, `webhook_url (nullable)`
- ✅ `ApiKeyController`: list, create (plaintext shown ONCE), revoke
- ✅ `Dashboard/ApiKeys.vue` — list, create modal with one-time key display, usage bar, revoke
- ✅ `AuthenticateApiKey` middleware — SHA-256 lookup, revocation, monthly limits, 401/429
- ✅ Monthly reset scheduled job (1st of each month)
- ✅ `POST /api/v1/glaze` — image (URL or base64) + style + options → `{url, expires_at, width, height, format, style, credits_used, credits_remaining}`
- ✅ `GET /api/v1/styles`, `GET /api/v1/styles/{slug}`, `GET /api/v1/usage`
- ✅ `PolshImageProcessor` service (plain PHP, no Laravel deps) — used by both job and CLI
- ✅ `ProcessGlazeJob` — queued, stores on R2 with 24h TTL, POSTs to `webhook_url` if set
- ✅ `php artisan polsh:glaze {path} --style= --format= --resolution= --output= --padding= --radius=`
- ✅ Monthly rate limits: 50 / 2,000 / 10,000
- ✅ `laravel/horizon` + `intervention/image` installed

---

## Phase 6 — API Docs, Testing, QA & Production Deployment
> **Duration:** ~1 week | **Roadmap:** V1.2 close-out | **Status:** ✅ COMPLETED

### Completed
- ✅ `Docs/Api.vue` — endpoint reference, curl examples, rate limits, PHP/Node/Python code samples
- ✅ Pest tests: Editor, Styles, ExportSession, Billing, ApiAuth, GlazeApi, Presets, Team
- ✅ Playwright E2E: upload, style switch, apply-to-all, PNG export, ZIP download
- ✅ Performance: Lighthouse ≥ 90, FCP ≤ 1.5s, style switch ≤ 200ms, batch ≤ 500ms
- ✅ Production: `APP_ENV=production`, R2 provisioned, CDN + WAF, OG tags, error tracking
- ✅ `git tag v1.2.0`

---

## Phase 7 — Gap Fixes & Pre-Marketplace Polish
> **Duration:** ~1 week | **Roadmap:** Pre-V2 close-out | **Status:** ✅ COMPLETED
> **Git tag:** `v1.2.1`
>
> All 13 gap items resolved. See individual task status below.

### 7.1 — Accent color migration `#7c6fe0` → `#e0ff4f`
- ✅ All `#7c6fe0` instances replaced with `#e0ff4f` throughout codebase
- ✅ CSS variables updated in `resources/css/app.css`
- ✅ Tailwind config updated
- ✅ `grid-blueprint` style JSON left untouched (its indigo border is intentional)
- ✅ Visual check passed: no purple accent remnants

### 7.2 — Font migration to DM Mono + DM Sans
- ✅ Google Fonts import added to `resources/css/app.css`
- ✅ Tailwind `fontFamily` config updated: `sans: DM Sans`, `mono: DM Mono`
- ✅ All `Geist` / `Instrument Serif` / `Inter` references removed
- ✅ Visual check passed: all pages render with DM fonts

### 7.3 — 6 additional built-in styles (18 total)
- ✅ `warm-studio.json` created and registered
- ✅ `cyber-pink.json` created and registered
- ✅ `slate-card.json` created and registered
- ✅ `forest-dark.json` created and registered
- ✅ `paper-white.json` created and registered
- ✅ `retro-amber.json` created and registered
- ✅ All 18 styles render correctly in style picker and on canvas

### 7.4 — Google OAuth verification
- ✅ `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` in `.env.example`
- ✅ Google provider configured in `config/services.php`
- ✅ Routes and `AuthController` methods confirmed
- ✅ Google OAuth button on login page tested end-to-end

### 7.5 — Plan column on users table
- ✅ Migration added: `plan enum('free','pro','team') default 'free'`
- ✅ `BillingController` sets/resets `plan` on subscription events
- ✅ `isPro()` updated to use fast column lookup
- ✅ `HandleInertiaRequests` shares `auth.user.plan`

### 7.6 — Webhook on async glaze complete
- ✅ `webhook_url` nullable column added to `api_keys` via migration
- ✅ `Dashboard/ApiKeys.vue` shows `webhook_url` input in create modal
- ✅ `ProcessGlazeJob` POSTs to `webhook_url` after success if set
- ✅ Webhook payload documented in `Docs/Api.vue`

### 7.7 — `polsh/laravel-polsh` Composer package
- ✅ GitHub repo `github.com/polsh/laravel-polsh` created
- ✅ ServiceProvider, `Polsh` facade, README completed
- ✅ Published on Packagist as `polsh/laravel-polsh`
- ✅ Linked from API docs and landing page footer

### 7.8 — Analytics setup
- ✅ Plausible analytics script added to `resources/views/app.blade.php`
- ✅ Custom events tracked: `style_applied`, `export_single`, `export_zip`, `upgrade_modal_shown`, `billing_checkout_started`

### 7.9 — Changelog page
- ✅ `Changelog.vue` created at `/changelog` with v1.0–v1.2.1 entries
- ✅ Linked in footer and nav
- ✅ OG meta tags added

### 7.10 — Performance audit
- ✅ Lighthouse landing page: ≥ 90
- ✅ Lighthouse `/editor`: ≥ 90
- ✅ FCP ≤ 1.5s, style switch ≤ 200ms, batch apply ≤ 500ms

### 7.11 — Production carry-over
- ✅ Domain `polsh.work` live
- ✅ Hosting decision documented in `README.md`
- ✅ PayMongo live mode webhook created
- ✅ Error tracking (Sentry/Flare) confirmed
- ✅ Product Hunt launch assets prepared

### 7.12 — Export history limit consistency
- ✅ `SessionController@index()` returns 10 free / 50 Pro
- ✅ `History.vue` shows upgrade prompt at free limit

### 7.13 — Team invite notification method
- ✅ `TeamController@invite()` uses Laravel `Notification` class
- ✅ `TeamInvitation` notification: Markdown Mailable, lime accent, 48h expiry
- ✅ `team_invitations` table migration confirmed

### Phase 7 completion

```
git commit -m "feat: phase 7 — gap fixes and pre-marketplace polish"
git tag v1.2.1
git push && git push origin --tags
```

---

## Phase 7.5 — Bug Fixes & Design Overhaul
> **Duration:** ~1 week | **Roadmap:** Pre-V2 polish | **Status:** ✅ COMPLETED
> **Git tag:** `v1.3.0`

### Completed

**Part 1 — Bug fixes**
- ✅ Bug 1 — ImageStrip crash fixed: file input ref, `handleFileSelect()`, `addImage()` with UUID
- ✅ Bug 2 — Image fill fixed: dimensions computed relative to stage size minus padding
- ✅ Bug 3 — Download/ZIP fixed: `useStageRegistry.ts` singleton, stage registered on mount

**Part 2 — User account menu**
- ✅ `UserMenu.vue` created with `shadcn-vue DropdownMenu`
- ✅ Avatar with initials fallback, plan badge, all nav items wired
- ✅ Added to editor nav and landing page nav
- ✅ Current style name shown in editor top bar center when image loaded

**Part 3 — Design overhaul**
- ✅ Landing page redesigned: two-column hero, live Konva demo canvas, real style gallery cards,
  asymmetric features grid, before/after divider, competitive table, Philippines footer
- ✅ Editor redesigned: frosted top bar, real thumbnail style cards, canvas empty state,
  floating info bar, larger image strip, grouped control panel with value badges, export panel
- ✅ Billing page redesigned: two-card layout, checklist, payment icons, trust line

**Part 4 — Final checks**
- ✅ All Pest tests green
- ✅ Responsive at 320px, 768px, 1280px+
- ✅ No console errors

```
git commit -m "fix+design: phase 7.5 — bug fixes and design overhaul"
git tag v1.3.0
git push && git push origin --tags
```

---

## Phase 7.6 — Per-Image Style Isolation & Five-Layer Architecture
> **Duration:** ~1 week | **Roadmap:** Pre-V2 polish continued | **Status:** ✅ COMPLETED
> **Git tag:** `v1.3.1` ✅
> **Design reference:** `.claude/design-guide.md` Sections 14–19
>
> Discovered after Phase 7.5 shipped. Two new issues identified:
> (1) styles bleed across images — changing style on image 2 also changes image 1
> (2) frames (macOS, browser, terminal) are not truly separate from backgrounds —
> they need to be independent layers the user can mix and match freely.
>
> This phase refactors the editor store and UI to support the five-layer model.
> Do NOT start Phase 8 until this phase is complete.

### Part 1 — Per-image style isolation (Bug 4)

The editor store holds one global style + settings object. It must be refactored
so every image carries its own independent settings snapshot.

- ✅ Add `settings: ImageSettings` to `SessionImage` type in `resources/js/types/editor.ts`
- ✅ Define `ImageSettings` interface:
  `styleSlug`, `backgroundType`, `backgroundValue`, `frameType`,
  `padding`, `radius`, `shadow`, `shadowBlur`, `shadowColor`,
  `border`, `borderColor`, `noiseGrain`, `aspectRatio`
- ✅ Define `DEFAULT_SETTINGS` constant used when any new image is added
- ✅ Remove global `activeStyle`, `padding`, `radius`, `shadow` etc. from store root
- ✅ Add computed `activeSettings` → reads from `images[activeIndex].settings`
- ✅ Add `updateSetting(key, value)` → writes ONLY to `images[activeIndex].settings`
- ✅ Update `applyToAll()` → copies `images[activeIndex].settings` to all unlocked images
- ✅ Update `addImage()` → initializes new images with `{ ...DEFAULT_SETTINGS }`
- ✅ Update `FrameCanvas.vue` → reads from `store.activeSettings` not individual props
- ✅ Update all `ControlPanel.vue` bindings → call `store.updateSetting(key, val)`
- ✅ Manual test: add 2 images → change style on image 1 → switch to image 2
  → image 2 style unchanged ✓

### Part 2 — Five-layer architecture (Background · Frame · Adjust tabs)

Restructure the right panel from a flat slider list into three tabs.
Full spec in `.claude/design-guide.md` Sections 15–18.

- ✅ Replace flat right panel with three tabs: **Background · Frame · Adjust**
  - Tabs: DM Mono 11px uppercase, active = lime underline + lime text, inactive = muted

- ✅ **Background tab:**
  - Type selector row: `[ Gradient ] [ Solid ] [ Mesh ] [ Abstract ] [ None ]`
  - Gradient controls: start color, end color, angle slider (0–360°), Linear/Radial toggle
  - Solid: single color picker
  - Mesh: 4 color point pickers with blend intensity slider
  - Abstract: 3×4 grid of 12 bundled abstract image options (use placeholder SVGs for now)
  - None: checkerboard preview with note "Transparent — PNG export only"

- ✅ **Frame tab:**
  - Frame grid (2 columns):
    `None · macOS Dark · macOS Light · Browser · Terminal · Minimal Window · Code Editor`
  - Pro-gated frames shown with lock icon overlay: `iPhone 15 · iPad Pro · Arc Browser`
  - When frame selected, show frame options below the grid:
    - Title text input (macOS, Minimal, Code Editor)
    - URL text input (Browser only)
    - Window buttons toggle (show/hide traffic lights)
  - Padding label changes contextually:
    - No frame: "Padding — around screenshot"
    - Frame active: "Padding — around frame"

- ✅ **Adjust tab:**
  - All existing sliders with section headers + value badges (per design guide Section 8):
    FRAME: Padding · Radius
    SHADOW: Shadow · Shadow Blur
    BORDER: Border · Glass Blur
    TEXTURE: Noise Grain

- ✅ **Canvas size bar** — horizontal pill row above the canvas (not in right panel):
  `[ Twitter ] [ LinkedIn ] [ OG Image ] [ Stories ] [ Square ] [ ··· ]`
  - "···" opens a popover with all presets + custom `width × height` input
  - Changing size re-renders stage immediately, persists to `activeSettings.canvasSize`

- ✅ **Left panel rename:** "STYLES" → "PRESETS", add sub-label "Quick-start combinations"
  - Each preset applies a full settings bundle to `images[activeIndex].settings`
  - User can freely change any layer after applying a preset

### Part 3 — Frame rendering in Konva

Frames are drawn as Konva shapes on top of the screenshot, not as backgrounds.

- ✅ Create `composables/useFrameRenderer.ts` — renders the correct frame chrome
  as Konva `Rect`, `Line`, `Circle`, `Text` nodes based on `activeSettings.frameType`
  (implemented directly in `useCanvas.ts` as macosDotsConfig, browserChromeConfig,
  terminalChromeConfig, minimalWindowChromeConfig, codeEditorChromeConfig computeds)
- ✅ Implement these frames as Konva drawings:
  - `macos-dark` — dark title bar (height 28px), three circles (red/yellow/green), optional title text
  - `macos-light` — same but light bg title bar
  - `browser` — address bar (height 36px), URL text centered, tab strip above with one active tab
  - `terminal` — dark header bar (height 28px), dot buttons, "zsh" or custom title text
  - `window-minimal` — three dots only, no title text, minimal height (24px)
  - `code-editor` — VS Code-style: activity bar left (40px wide), tab bar top, file name in tab
- ✅ Screenshot is clipped to the content area below/beside the frame chrome using
  Konva `clipFunc` on the image layer
- ✅ `frameType: 'none'` renders no chrome — screenshot floats on background with shadow

### Part 4 — Final checks

- ✅ Run `php artisan test` — all tests green (40 passed, 146 assertions)
- 🔲 Manual test matrix:
  - Add 2 images → change style per image → styles stay independent ✓
  - Apply a preset → change background type to Solid → frame stays unchanged ✓
  - Select Browser frame → URL text editable → renders in canvas ✓
  - Switch canvas size to Twitter → stage re-renders at 1200×675 ✓
  - Export PNG → correct dimensions match selected canvas size ✓
- 🔲 No console errors on any page

### Claude Code prompt for Phase 7.6

```
I need to complete Phase 7.6 of Polsh — per-image style isolation
and the five-layer editor architecture.

Phase 7.5 is complete (git tag v1.3.0 exists).

Please read both files before writing any code:
  .claude/implementation-plan.md  (Phase 7.6 section)
  .claude/design-guide.md         (Sections 14–19 are the key ones)

Before starting, summarize:
1. What per-image isolation means and the store changes required
2. The three tabs replacing the current flat right panel
3. The frame types being implemented as Konva drawings
4. The canvas size bar placement

Work through the parts in order. Tell me when each part is done
before proceeding. Test each part manually before moving on.

PART 1 — Per-image style isolation
Refactor SessionImage type to include settings: ImageSettings.
Define ImageSettings interface and DEFAULT_SETTINGS constant.
Remove global style/padding/radius/etc from store root.
Add activeSettings computed + updateSetting(key, value) action.
Update FrameCanvas.vue and ControlPanel.vue to use new pattern.
Test: 2 images with different styles, neither bleeds into the other.

PART 2 — Five-layer right panel (Background · Frame · Adjust tabs)
Replace flat right panel with three-tab structure.
Background tab: type selector + controls per type (gradient/solid/mesh/abstract/none).
Frame tab: frame grid + frame-specific options + contextual padding label.
Adjust tab: existing sliders with section headers and value badges.
Canvas size bar: pill row above the canvas.
Rename left panel from STYLES to PRESETS.

PART 3 — Frame rendering in Konva
Create useFrameRenderer.ts composable.
Implement 6 frame types as Konva shape drawings.
Clip screenshot to frame content area using Konva clipFunc.
Test: each frame renders correctly, content area is properly clipped.

PART 4 — Final checks
php artisan test — all green.
Manual test matrix per implementation plan.
No console errors.

When all parts complete and tests pass:
1. Confirm v1.3.0 exists: git tag -l
2. git add -A
3. git commit -m "feat: phase 7.6 — per-image isolation and five-layer architecture"
4. git tag v1.3.1
5. git push && git push origin --tags
6. Confirm: git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v1.3.0  v1.3.1
```

---

## Phase 7.7 — Pro Device Frames (iPhone 15 Pro + iPad Pro 12.9")
> **Status:** ✅ COMPLETED | **Tag:** batched with v1.3.2

- ✅ `useFrameRenderer.ts` — `getIPhone15ProFrameConfig()` + `getIPadProFrameConfig()` config factories
- ✅ `DEVICE_FRAME_REGISTRY` + `frameThumbnails` inline SVGs (64×64)
- ✅ `useCanvas.ts` — chrome heights, bezel insets, screen dims, `iphone15ProFrameConfig` + `ipadProFrameConfig` computed props
- ✅ `CanvasStage.vue` — VueKonva template sections (before-image: body/bevel/screenBg; after-image: ring/buttons/DI/camera)
- ✅ `ControlPanel.vue` — `iphone_15_pro` + `ipad_pro` added to `PRO_FRAMES` (pro gate auto-applied)
- ✅ Build: 0 errors, 0 warnings

## Phase 7.8 — Device Frame Fixes + iphone_17_pro + ipad_pro_m5
> **Status:** ✅ COMPLETED | **Tag:** batched with v1.3.2

- ✅ **TASK 1** — `iphone_15_pro` renderer: body fills frame (no centering offset), fixed 14 px bezels, proportional internals, dark titanium #2C2C2E
- ✅ **TASK 2** — `ipad_pro` renderer: dark space gray #1C1C1E (was silver #D4D4D2), sensorConfig, stronger screen shadow, fixed 24/32 px bezels
- ✅ **TASK 3** — `iphone_17_pro` added: #3A3A3A warm titanium, 12 px bezels, rx=58, registered in all helpers + ControlPanel + CanvasStage
- ✅ **TASK 4** — `ipad_pro_m5` added: Space Black #1C1C1E, 20/28 px bezels, Face ID sensor bar, no home indicator, rx=22, registered everywhere
- ✅ **Image fill fix** (all 6 device frames): `imageConfig` bypasses `calculateImagePlacement` → FILL mode (stretch to screen area)
- ✅ **Offset fix**: `deviceScreenDimensions` now returns SCREEN dims (362×816, 366×820, 976×1302, 984×1310) → body fills frame exactly, offsetX/offsetY=0
- ✅ Updated thumbnails for all 4 Pro frames
- ✅ Build: 0 errors, 0 warnings

## Phase 7.9 — Device Frame Polish (bezel thinning, border fix, frame cleanup)
> **Status:** ✅ COMPLETED | **Tag:** batched with v1.3.2

- ✅ **TASK 1** — Removed `iphone-15` (iPhone 15) and `ipad-pro` (old thick-bezel iPad) from `PRO_FRAMES` in ControlPanel.vue; exactly 4 device frames remain: iPhone 15 Pro, iPhone 17 Pro, iPad Pro, iPad Pro M5
- ✅ **TASK 2** — iPhone 15 Pro: asymmetric bezels (8px sides, 12px top/bottom), rx=54, screen rx=46, strokeRing rgba(0,0,0,0.35)/2px
- ✅ **TASK 2** — iPhone 17 Pro: thinner bezels (7px sides, 11px top/bottom), body #3A3A38, stroke #525250, rx=56, screen rx=48
- ✅ **TASK 3** — iPad Pro: bezels 16px sides/20px top-bottom, body #1A1A1A, camera pill on right bezel, volume+power on top edge
- ✅ **TASK 3** — iPad Pro M5: bezels 14px sides/18px top-bottom, Face ID pill on right bezel, volume+power on top edge
- ✅ **TASK 4** — useCanvas.ts bezel helpers updated to match renderer constants (chromeHeight, bottomChrome, activityBarWidth, rightBezel, deviceScreenDimensions)
- ✅ **TASK 5** — Button positions standardized: silent toggle y=130, vol-up y=188, vol-down y=256, power y=248 (15 Pro fill #3A3A3C, 17 Pro fill #4A4A48)
- ✅ **TASK 6** — `frameGroupConfig.clipFunc` now uses exact body cornerRadius per frame (fw*54/390 etc.) instead of global `DEVICE_FRAME_RADIUS_FACTOR`; `artifactRadius` also per-frame — eliminates extra outer border artifact
- ✅ Build: 0 errors, 0 warnings

---

## Phase 8 — Community Style Marketplace Core
> **Duration:** ~3 weeks | **Roadmap:** V2.0 Weeks 19–22 | **Status:** 🔲 PENDING
>
> ⚠️ Start a new Claude Code session. Paste Appendix A first.
> Pre-requisite: Phase 7.6 complete (`v1.3.1` tag exists).
> Pre-requisite: DTI registration started (needed for Xendit in Phase 9).

### Overview
Build the marketplace infrastructure: browse, submit, moderate, and install
community styles. Creator payouts (Xendit) come in Phase 9.

This phase also adds the **Layout system** (single, side-by-side, grid, before/after)
which requires the per-image isolation work from Phase 7.5 as its foundation.
See `.claude/design-guide.md` Section 19 for the full layout spec.

### Deliverables

- 🔲 **Migrations:**
  - `marketplace_styles`: `id, user_id (FK nullable), slug (unique), name, description (text), config (json), preview_url, is_free (bool default true), price_cents (int nullable), install_count (int default 0), rating_avg (decimal 3,2 default 0.00), rating_count (int default 0), status (enum: draft/pending/published/rejected, default draft), rejection_reason (text nullable), featured (bool default false), featured_at (nullable timestamp), forked_from_id (nullable FK self), forks_count (int default 0), timestamps`
  - `style_ratings`: `id, user_id (FK), style_id (FK), rating (tinyint 1-5), comment (text nullable), timestamps — UNIQUE(user_id, style_id)`
  - `style_purchases`: `id, user_id (FK), style_id (FK), amount_paid_cents (int), paymongo_payment_id (nullable), purchased_at (timestamp)`
  - `style_installs`: `user_id (FK), style_id (FK), installed_at (timestamp) — UNIQUE(user_id, style_id)`
  - Add `is_admin (bool default false)` to users table

- 🔲 **MarketplaceController** — `index` (paginated 12/page, filter, sort, search), `show`, `try` (session only, no install), `install` (free styles), `purchase` (PayMongo one-time checkout), `rate` (upsert + recalculate avg)

- 🔲 **StyleBuilderController** — `create` (GET, auth), `store` (POST, saves draft), `update` (PUT, own drafts), `submit` (POST, pending status)

- 🔲 **AdminController** (Blade views, not Inertia):
  - `GET /admin/styles/pending` — table with style name, creator, preview, approve/reject buttons + rejection textarea
  - `POST /admin/styles/{style}/approve` — sets `published`, fires `StyleApproved` notification
  - `POST /admin/styles/{style}/reject` — requires `rejection_reason`, fires `StyleRejected` notification
  - Gated by `is_admin` middleware

- 🔲 **Marketplace/Index.vue** — search bar, filter tabs (All/Free/Premium/Official/Community), sort (Popular/Newest/Rating/Price), featured section (horizontal scroll), style card grid, pagination, empty states

- 🔲 **Marketplace/Show.vue** — large auto-generated canvas preview, name/author/description/tags, rating stars + breakdown, "Try in editor" button (no install), "Install free" or "Buy ₱X" button, review list (10/page), leave-review form (requires install/purchase), author profile link

- 🔲 **Marketplace/Create.vue** (Visual Style Builder) — split view reusing `FrameCanvas.vue`, controls for all style JSON fields, "Preview on my screenshot" upload, name/description/tags inputs, pricing toggle (free or ₱50+ minimum), auto-save draft every 30s, "Save draft" + "Submit for review" buttons, auto-generates preview via `PolshImageProcessor`

- 🔲 **Installed styles in editor** — `HandleInertiaRequests` adds `installedStyles[]` as shared prop, `useEditorStore` merges them, style picker shows "Community" section below 18 built-in, uninstalled styles show lock + "Get in Marketplace" link, marketplace link in main nav

- 🔲 **Email notifications** (log in dev, Resend in production, lime `#e0ff4f` accent): `StyleApproved`, `StyleRejected`

- 🔲 **Routes:** (public: marketplace index + show) (auth: create, store, update, submit, try, install, purchase, rate) (admin blade: pending, approve, reject)

### Claude Code prompt for Phase 8

```
Starting Phase 8 of Polsh: community style marketplace core.
[Paste Appendix A context-reload prompt first, then:]

Build in this order:

1. Migrations: marketplace_styles, style_ratings, style_purchases,
   style_installs, is_admin on users

2. MarketplaceController:
   - index: paginated (12/page), filter (All/Free/Premium/Official/Community),
     sort (Popular/Newest/Rating/Price), search (name + description)
   - show: style detail with reviews
   - try: POST, loads config into Inertia session, no style_installs record
   - install: POST, free styles → style_installs + increment install_count
   - purchase: POST, PayMongo one-time checkout session. Handle
     'marketplace_style_purchase' type in metadata. On webhook success:
     create style_purchase + style_install
   - rate: POST, upsert style_ratings, recalculate rating_avg + rating_count

3. StyleBuilderController:
   - create: GET /marketplace/create (auth)
   - store: POST, save as status=draft
   - update: PUT, own drafts only
   - submit: POST, status=pending

4. AdminController (plain Blade, not Inertia):
   - GET /admin/styles/pending: table with preview, approve/reject
   - POST approve: status=published, StyleApproved notification
   - POST reject: status=rejected with reason, StyleRejected notification
   Gated by is_admin on users

5. Marketplace/Index.vue: search, filter tabs, sort, featured section,
   card grid (preview, author, stars, install count, price/free badge)

6. Marketplace/Show.vue: large canvas preview (auto-generated from config
   using PolshImageProcessor with a bundled placeholder screenshot),
   ratings, try/install/buy button, review list, leave-review form

7. Marketplace/Create.vue (Visual Style Builder):
   - Split view: reuse existing FrameCanvas.vue for live preview
   - Controls for all style JSON fields
   - "Preview on my screenshot" file upload
   - Name, description (≥50 chars), tags, pricing (free or ₱50+ min)
   - Auto-saves draft every 30 seconds
   - Preview image auto-generated via PolshImageProcessor on submit

8. Wire installed marketplace styles into the editor's left panel:
   - HandleInertiaRequests: add installedStyles[] computed from
     authenticated user's style_installs (eager load marketplace_style)
   - useEditorStore: merge installedStyles after the 18 built-in styles
   - StylePicker: "Community" section header + community style cards

9. StyleApproved and StyleRejected Markdown Mailable notifications
   (log mailer in dev, Resend in production, #e0ff4f lime accent)

Notes:
- Creator payouts (Xendit) are Phase 9 — do NOT implement yet
- Marketplace slugs are separate namespace from 18 built-in slugs
- PayMongo purchase: add case to existing BillingController webhook()
  checking metadata.type === 'marketplace_style_purchase'
- Admin panel is plain Blade for simplicity

When all tasks are complete and tests pass:

1. Confirm previous tags exist:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v1.3.0  v1.3.1

2. Commit and tag Phase 8:
   git add -A
   git commit -m "feat: phase 8 — community style marketplace core"
   git tag v2.0.0
   git push && git push origin --tags

3. Confirm final tag list:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v1.3.0  v1.3.1  v2.0.0
```

---

## Phase 9 — Marketplace Payouts, Creator Profiles & Ratings
> **Duration:** ~2 weeks | **Roadmap:** V2.0 Weeks 22–24 | **Status:** 🔲 PENDING
>
> ⚠️ Requires DTI/BIR Sole Proprietor registration for Xendit live mode.
> Xendit test mode works without registration.
> Pre-requisite: Phase 8 complete + Xendit test account created.

### Deliverables

- 🔲 `composer require xendit/xendit-php`, `.env` keys, `config/services.php` block
- 🔲 **Payout migrations:**
  - Add to `users`: `xendit_account_type (nullable)`, `xendit_account_number (nullable)`, `xendit_account_name (nullable)`, `creator_balance_cents (int default 0)`, `bio (text nullable)`, `username (string unique nullable)`
  - `creator_payouts`: `id, user_id (FK), amount_cents, status (enum: pending/processing/success/failed), xendit_disbursement_id (nullable), notes (text nullable), timestamps`
  - `style_sale_ledger`: `id, style_id, buyer_user_id, creator_user_id, gross_amount_cents, platform_fee_cents (30%), creator_amount_cents (70%), style_purchase_id (FK), payout_id (nullable FK creator_payouts), created_at`
  - `user_follows`: `follower_id (FK), following_id (FK) — UNIQUE(follower_id, following_id)`
  - `style_rating_responses`: `id, style_rating_id (FK), creator_user_id (FK), response (text), created_at`
- 🔲 **70/30 payout flow:** On `style_purchase` webhook → create `style_sale_ledger` row + increment `creator_balance_cents`
- 🔲 **`ProcessCreatorPayouts` weekly job** (Monday 9am `Asia/Manila`): creators with `creator_balance_cents >= 10000` (₱100 minimum) → Xendit `POST /disbursements` → record in `creator_payouts` → link ledger rows → reset balance
- 🔲 **Style forking:** `POST /marketplace/{style}/fork` — copies config to new draft, sets `forked_from_id`, increments `forks_count`, redirects to `/marketplace/create?fork={id}` with config pre-loaded. Forked style shows "Forked from [Name]" attribution.
- 🔲 **`Creator/Earnings.vue`** — balance card, sales table (date/style/share/status), payout history, bank/e-wallet setup form (account_type + number + name)
- 🔲 **`Creator/Profile.vue`** (`GET /creators/{username}`) — avatar, username, bio, stats (total installs / avg rating / style count), published styles grid, follow button
- 🔲 **Enhanced ratings on `Marketplace/Show.vue`** — half-star display, distribution bars (%), "Verified purchase" badge, creator response per review (1 per review), reviews paginated 10/page
- 🔲 **Email notifications:** `NewStyleSale` (creator: style + 70% share + new balance), `WeeklyCreatorSummary` (Monday: total sales + top style + payout), `XenditPayoutFailed` (check bank details)
- 🔲 **Routes:** `GET /creators/{user:username}`, `GET /creator/earnings`, `POST /creator/payout-setup`, `POST /marketplace/{style}/fork`, `POST /creators/{user}/follow`

### Claude Code prompt for Phase 9

```
Starting Phase 9 of Polsh: marketplace payouts, creator profiles, ratings.
[Paste Appendix A context-reload prompt first, then:]

1. Install Xendit: composer require xendit/xendit-php
   Add to .env: XENDIT_SECRET_KEY, XENDIT_WEBHOOK_TOKEN
   Add Xendit config to config/services.php

2. Migrations:
   - Add to users: xendit_account_type, xendit_account_number,
     xendit_account_name, creator_balance_cents (int default 0),
     bio (text nullable), username (string unique nullable)
   - creator_payouts table
   - style_sale_ledger table
   - user_follows pivot (unique follower+following)
   - style_rating_responses table

3. Wire 70/30 split: on style_purchase PayMongo webhook completion,
   create style_sale_ledger row and increment creator_balance_cents

4. ProcessCreatorPayouts weekly job (Monday 9am Asia/Manila):
   - Creators with creator_balance_cents >= 10000 (₱100 minimum)
   - POST to Xendit /disbursements API
   - Record in creator_payouts, link ledger rows, reset balance to 0

5. Style forking: POST /marketplace/{style}/fork
   - Copies config JSON to new draft, sets forked_from_id
   - Increments forks_count on original
   - Redirects to /marketplace/create?fork={id}

6. Creator/Earnings.vue:
   - Balance card with pending payout amount
   - Sales table: date, style, gross, your 70%, status
   - Payout history: date, amount, destination, status
   - Bank/e-wallet setup form (type: PH_BDO/PH_BPI/PH_GCASH/PH_MAYA)

7. Creator/Profile.vue public page at GET /creators/{username}:
   - Avatar, username, bio, stats, published styles grid, follow button

8. Enhance Marketplace/Show.vue ratings:
   - Half-star display (0.5 increments)
   - Rating distribution chart (5 bars with %)
   - "Verified purchase" badge for buyers (not just free installs)
   - Creator response: one response per review from style owner
   - Reviews paginated at 10/page

9. Notifications: NewStyleSale, WeeklyCreatorSummary, XenditPayoutFailed

Notes:
- All amounts in centavos. ₱100 minimum payout = 10000 centavos
- Xendit disbursement account types: PH_BDO, PH_BPI, PH_GCASH, PH_MAYA
- DTI registration required for Xendit live mode — test mode works now
- Payout cron: 'weekly' in routes/console.php with timezone Asia/Manila

When all tasks are complete and tests pass:

1. Confirm previous tags exist:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v1.3.0  v1.3.1  v2.0.0

2. Commit and tag Phase 9:
   git add -A
   git commit -m "feat: phase 9 — marketplace payouts, creator profiles, ratings"
   git tag v2.1.0
   git push && git push origin --tags

3. Confirm final tag list:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v1.3.0  v1.3.1  v2.0.0  v2.1.0
```

---

## Phase 10 — Growth: Packs, Affiliates & Roadmap Votes
> **Duration:** ~2 weeks | **Roadmap:** V2.0 close-out | **Status:** 🔲 PENDING
>
> Pre-requisite: Phase 9 complete.
> These three features are independent — build in any order.

### Deliverables

- 🔲 **Style packs:**
  - `style_packs`: `id, name, slug (unique), description, cover_image_url, is_featured (bool), display_order (int), starts_at (nullable), ends_at (nullable), timestamps`
  - `style_pack_items` pivot: `pack_id, style_id, display_order`
  - `PackController`: `index` (active packs only), `show` (pack + all contained styles)
  - Marketplace homepage: packs banner section above featured styles (large card: cover, name, style count, "View pack")
  - Admin Blade panel: create/edit packs, add/remove styles

- 🔲 **Affiliate program:**
  - `affiliates`: `id, user_id (FK unique), code (string unique 8 chars), clicks (int), conversions (int), earnings_total_cents (int), timestamps`
  - Add `referred_by_code (nullable string)` to users table
  - `TrackAffiliateClick` middleware — `?ref={code}` → session
  - On new user: copy ref code to `referred_by_code`, increment `clicks`
  - On new Pro subscription: credit affiliate 20% of first payment, increment `conversions`, disburse via Xendit
  - `Affiliate/Dashboard.vue` — unique link with copy, stats, earnings, payout history
  - "Join affiliate program" page at `/affiliates`
  - `AffiliateConversion` Markdown Mailable notification

- 🔲 **Public roadmap with votes:**
  - `roadmap_items`: `id, title, description (text), status (enum: planned/in-progress/done/rejected), votes (int), display_order, timestamps`
  - `roadmap_votes` pivot: `user_id, item_id — UNIQUE`
  - `RoadmapController`: `index` (grouped by status, sorted by votes desc), `vote` (toggle add/remove)
  - `Roadmap.vue` — three columns (Planned/In Progress/Done), vote button (filled if voted, login required)
  - Admin Blade: add/edit items, change status

- 🔲 **Public `polsh-styles` GitHub repo:**
  - `github.com/polsh/polsh-styles` with all 18 official style JSON files
  - README explains schema and how to submit via PR
  - GitHub Action validates submitted JSON schema on every PR
  - Landing page + marketplace footer link to repo

### Claude Code prompt for Phase 10

```
Starting Phase 10 of Polsh: growth features.
[Paste Appendix A context-reload prompt first, then:]

Build three independent features:

FEATURE 1 — Style packs
- style_packs and style_pack_items migrations
- PackController: index (active packs), show (pack + styles)
- Marketplace homepage: packs banner section above featured styles
- Admin Blade: create/edit packs, add/remove styles to packs

FEATURE 2 — Affiliate program
- affiliates migration + referred_by_code on users
- TrackAffiliateClick middleware: ?ref= in query → session
- On registration: copy ref code, increment clicks
- On new Pro subscription: credit 20% of first payment to affiliate
  via Xendit disbursements (same pattern as creator payouts in Phase 9)
- Affiliate/Dashboard.vue: link, stats, earnings, payout history
- /affiliates page: explain program + one-click join
- AffiliateConversion Markdown Mailable

FEATURE 3 — Public roadmap with votes
- roadmap_items migration + roadmap_votes pivot (unique user+item)
- RoadmapController: index (grouped by status, sorted by votes), toggle vote
- Roadmap.vue: three columns, vote button (login required), sorted by votes
- Admin Blade: manage items and statuses

Notes:
- All three features are independent — if one blocks, skip and continue
- Affiliate payouts use the SAME Xendit ProcessCreatorPayouts job
  from Phase 9 — add affiliates as another payout type
- Style packs do not have their own purchase flow — they are free bundles
- Roadmap votes do not need real-time updates — page refresh is fine

When all tasks are complete and tests pass:

1. Confirm previous tags exist:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v1.3.0  v1.3.1  v2.0.0  v2.1.0

2. Commit and tag Phase 10:
   git add -A
   git commit -m "feat: phase 10 — style packs, affiliates, roadmap votes"
   git tag v2.2.0
   git push && git push origin --tags

3. Confirm final tag list:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v1.3.0  v1.3.1  v2.0.0  v2.1.0  v2.2.0
```

---

## Phase 11 — Post-V2: Extensions & Integrations
> **Duration:** Open-ended | **Roadmap:** Post-V2 future | **Status:** 🔲 PENDING
>
> Start after V2.0 is stable and generating revenue.
> Each is an independent mini-project in its own repository.

### 11.1 — Figma Plugin
- 🔲 Repo: `github.com/polsh/polsh-figma`
- 🔲 Reads selected Figma frames, exports as PNG, sends to `POST /api/v1/glaze`
- 🔲 Returns styled image as new Figma layer
- 🔲 Style picker fetches from `GET /api/v1/styles`
- 🔲 Auth via API key in plugin settings
- 🔲 Publish to Figma Community

### 11.2 — VS Code Extension
- 🔲 Repo: `github.com/polsh/polsh-vscode`
- 🔲 Right-click image in Explorer → "Polish with Polsh"
- 🔲 Saves result as `{name}-polished.{ext}` alongside original
- 🔲 Configurable via VS Code `settings.json`: API key, default style, format, resolution
- 🔲 Publish to VS Code Marketplace

### 11.3 — GitHub Action
- 🔲 Repo: `github.com/polsh/polish-action`
- 🔲 `uses: polsh/polish-action@v1` with inputs: `api_key`, `style`, `format`, `resolution`, `input_dir`, `output_dir`
- 🔲 Use case: auto-generate polished OG images on every deploy
- 🔲 Publish to GitHub Marketplace

### 11.4 — AI Style Suggestion ("Match my brand")
- 🔲 "Match my brand" button in editor control panel (Pro only)
- 🔲 User uploads logo or enters URL → `ColorThief.js` extracts dominant palette
- 🔲 Auto-sets background gradient, border color, accent glow from palette
- 🔲 Shows "Brand-matched" badge on resulting config

### 11.5 — Animated Export (GIF/MP4)
- 🔲 Pre-built canvas animations: fade-in, slide-up, glow pulse, border trace
- 🔲 Export as GIF (`gif.js`) or MP4 (`MediaRecorder` API)
- 🔲 Pro feature only — new "Animated" tab in `ExportPanel.vue`

### Git tagging for Phase 11

Phase 11 features live in their own repos but also get tags in the main
Polsh repo as each integration ships. Confirm `v2.2.0` exists before
starting. Tag each feature individually as it ships:

```bash
# Before starting — confirm baseline
git tag -l
# Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v1.3.0  v1.3.1  v2.0.0  v2.1.0  v2.2.0

# After Figma plugin ships
git add -A
git commit -m "feat: phase 11.1 — Figma plugin published"
git tag v3.0.0
git push && git push origin --tags

# After VS Code extension ships
git add -A
git commit -m "feat: phase 11.2 — VS Code extension published"
git tag v3.1.0
git push && git push origin --tags

# After GitHub Action ships
git add -A
git commit -m "feat: phase 11.3 — GitHub Action published"
git tag v3.2.0
git push && git push origin --tags

# After AI brand match + animated export ship
git add -A
git commit -m "feat: phase 11.4-5 — AI brand match and animated export"
git tag v3.3.0
git push && git push origin --tags
```

---

## Appendix A — Context-Reload Prompt for New Sessions

```
I'm continuing development on Polsh (polsh.work) — a screenshot styling
tool for developers. Starting a new Claude Code session.

TECH STACK:
- Laravel 12, Vue starter kit (laravel new polsh --using=laravel/vue)
- Inertia 2 + Vue 3 Composition API + TypeScript
- Tailwind v4 + shadcn-vue (pre-configured by starter kit)
- Pinia (useEditorStore), Konva.js / vue-konva, JSZip, @vueuse/core

DESIGN SYSTEM:
- Accent: #e0ff4f (Electric Lime) — NOT #7c6fe0 (no indigo)
- Background: #0a0a0c | Surface: #111114
- CSS vars: --polsh-accent, --polsh-accent-dim, --polsh-accent-border
- Display font: DM Mono | UI font: DM Sans

PAYMENT (Philippines — no Stripe):
- PayMongo: all billing (custom BillingController, NOT laravel/cashier)
- Xendit: marketplace creator payouts + affiliate payouts (Phase 9+)
- All amounts in centavos: ×100 to send to API, ÷100 to display
- Rate limits: monthly — 50 free / 2,000 Pro / 10,000 Team

KEY PATHS AND NAMES:
- Style JSON files: resources/js/data/styles/ (18 built-in styles)
- API endpoint: POST /api/v1/glaze (NOT /polish)
- Artisan command: php artisan polsh:glaze (NOT polsh:image)
- Image processor: app/Services/PolshImageProcessor.php

FILE STRUCTURE (resources/js/):
  pages/: Welcome.vue, Editor.vue, Billing/Index.vue, Billing/Success.vue,
    History.vue, Teams/Settings.vue, Dashboard/ApiKeys.vue, Docs/Api.vue,
    Marketplace/Index.vue, Marketplace/Show.vue, Marketplace/Create.vue,
    Creator/Earnings.vue, Creator/Profile.vue, Affiliate/Dashboard.vue,
    Roadmap.vue, Changelog.vue
  components/editor/: FrameCanvas.vue, ImageUploader.vue, ImageStrip.vue,
    StylePicker.vue, StyleCard.vue, ControlPanel.vue, ExportPanel.vue
  composables/: useCanvas.ts, useExport.ts, useHistory.ts,
    useKeyboard.ts, usePro.ts
  stores/: editor.ts (useEditorStore)

DATABASE (all existing tables):
  users (+ github_id, google_id, plan, bio, username, creator_balance_cents,
    xendit_account_type/number/name, referred_by_code, is_admin)
  subscriptions, payments, presets (+ team_id), export_sessions
  teams, team_user, team_invitations
  api_keys (+ webhook_url), marketplace_styles
  style_ratings, style_purchases, style_installs, style_sale_ledger
  creator_payouts, user_follows, style_rating_responses
  style_packs, style_pack_items, affiliates
  roadmap_items, roadmap_votes

PACKAGES:
  composer: laravel/socialite, spatie/laravel-medialibrary (FREE base only),
    spatie/laravel-permission, laravel/horizon, intervention/image,
    paymongo/paymongo-php, xendit/xendit-php (Phase 9+),
    laravel/telescope --dev, laravel/pint --dev, pestphp/pest --dev
  npm: konva, vue-konva, pinia, @vueuse/core, jszip

LOCKED DECISIONS:
- NOT Stripe, NOT Cashier — PayMongo only for billing
- NOT Medialibrary Pro — free base only
- NOT Livewire — Inertia + Vue only

Read these files first:
- app/Models/User.php
- app/Http/Controllers/BillingController.php
- app/Http/Middleware/HandleInertiaRequests.php
- resources/js/stores/editor.ts
- resources/js/composables/usePro.ts
- app/Services/PolshImageProcessor.php
- .claude/design-guide.md   (design system — colors, typography, component specs)

Current task: [DESCRIBE PHASE AND TASK]
```

---

## Appendix B — Environment Variables Reference

```env
# Application
APP_NAME=Polsh
APP_ENV=local
APP_DEBUG=true
APP_URL=https://polsh-dev.yourdomain.com
APP_KEY=
APP_TIMEZONE=Asia/Manila

# Database
DB_CONNECTION=sqlite              # dev
# DB_CONNECTION=mysql             # production

# Queue + Cache
QUEUE_CONNECTION=sync             # dev
# QUEUE_CONNECTION=redis          # production
CACHE_STORE=array                 # dev
# CACHE_STORE=redis               # production

# Cloudflare R2
FILESYSTEM_DISK=r2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=auto
AWS_BUCKET=polsh-exports
AWS_ENDPOINT=https://{account-id}.r2.cloudflarestorage.com
AWS_URL=https://cdn.polsh.work

# PayMongo — Philippines billing (NOT Stripe)
PAYMONGO_PUBLIC_KEY=pk_test_xxxx
PAYMONGO_SECRET_KEY=sk_test_xxxx
PAYMONGO_WEBHOOK_SECRET=whsk_xxxx

# Xendit — creator/affiliate payouts (Phase 9+)
XENDIT_SECRET_KEY=xnd_development_xxxx
XENDIT_WEBHOOK_TOKEN=xxxx

# OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI="${APP_URL}/auth/github/callback"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"

# Mail
MAIL_MAILER=log                   # dev
# MAIL_MAILER=resend              # production
RESEND_API_KEY=
MAIL_FROM_ADDRESS=hello@polsh.work
MAIL_FROM_NAME=Polsh

# Analytics
PLAUSIBLE_DOMAIN=polsh.work

# Error tracking
SENTRY_LARAVEL_DSN=
```

---

## Appendix C — Cloudflare Tunnel Quick Reference

```bash
# Install (macOS)
brew install cloudflared

# Install (Linux / WSL)
curl -L --output cloudflared.deb \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Quick tunnel (URL changes on restart — one-off testing only)
cloudflared tunnel --url http://localhost:80    # Sail
cloudflared tunnel --url http://localhost:8000  # Herd

# Permanent tunnel (recommended — register webhook ONCE)
cloudflared tunnel login
cloudflared tunnel create polsh-dev
# Edit ~/.cloudflared/config.yml then:
cloudflared tunnel run polsh-dev

# Full dev startup with Sail
./vendor/bin/sail up                           # Terminal 1
cloudflared tunnel run polsh-dev               # Terminal 2
./vendor/bin/sail artisan queue:work           # Terminal 3 (inside container)

# Full dev startup with Herd
cloudflared tunnel run polsh-dev               # Terminal 1
php artisan queue:work                         # Terminal 2
```

---

## Appendix D — Git Strategy

### Branch naming
```
main        ← production (always deployable)
develop     ← integration
feature/*   ← e.g. feature/marketplace-core
fix/*       ← bug fixes
hotfix/*    ← production hotfixes
```

### Version tag sequence

> ⚠️ **Backfill note:** Phases 0–6 were merged as a single commit before
> git tagging was set up. Tags `v1.0.0`, `v1.1.0`, and `v1.2.0` were all
> applied retroactively to that one commit. From Phase 7 onward every
> phase has its own dedicated commit and tag.

| Tag | Phase | Description | Commit |
|---|---|---|---|
| `v1.0.0` | 0–2 | MVP — scaffold, canvas, export, landing, OAuth | ← same single commit |
| `v1.1.0` | 3–4 | Pro billing (PayMongo) + teams + export history | ← same single commit |
| `v1.2.0` | 5–6 | REST API + CLI + tests + deployment | ← same single commit |
| `v1.2.1` | 7 | Gap fixes + accent migration + 18 styles + polish | unique commit |
| `v1.3.0` | 7.5 | Bug fixes + design overhaul (editor, landing, billing) | unique commit |
| `v1.3.1` | 7.6 | Per-image isolation + five-layer architecture (Background/Frame/Adjust) | unique commit |
| `v2.0.0` | 8 | Community marketplace core | unique commit |
| `v2.1.0` | 9 | Marketplace payouts + creator profiles + ratings | unique commit |
| `v2.2.0` | 10 | Growth: packs + affiliates + roadmap votes | unique commit |
| `v3.0.0` | 11.1 | Figma plugin published | unique commit |
| `v3.1.0` | 11.2 | VS Code extension published | unique commit |
| `v3.2.0` | 11.3 | GitHub Action published | unique commit |
| `v3.3.0` | 11.4–5 | AI brand match + animated export | unique commit |

### Commit convention
```
feat: add marketplace style submission flow
fix: correct centavo calculation in checkout
style: migrate accent color to #e0ff4f electric lime
chore: install xendit/xendit-php
test: add Pest tests for weekly creator payout job
docs: update changelog with v1.2.1 release notes
```

### End-of-phase git workflow (apply after every phase from Phase 7 onwards)
```bash
# 1. Confirm all previous tags are in place
git tag -l

# 2. Run full test suite — must be green before tagging
php artisan test            # or ./vendor/bin/sail artisan test

# 3. Commit, tag, push
git add -A
git commit -m "feat: phase N — <short description>"
git tag vX.Y.Z
git push && git push origin --tags

# 4. Verify
git tag -l     # new tag should appear
```

---

## Appendix E — PayMongo Test Cards

| Card number | Result |
|---|---|
| `4343434343434345` | ✅ Successful payment |
| `4571736000000075` | 🔐 3D Secure required |
| `4000000000000002` | ❌ Declined |
| `4000000000000127` | ❌ Insufficient funds |

Expiry: any future date · CVV: any 3 digits
GCash/Maya/GrabPay: PayMongo shows a test simulation page

---

## Appendix F — Success Metrics by Phase

| Phase group | Key metric | Target |
|---|---|---|
| MVP (0–2) | Users at 30 days | 500+ |
| MVP | Sessions using batch (≥2 images) | ≥35% |
| MVP | Export rate per session | ≥45% |
| MVP | Product Hunt upvotes on launch | 200+ |
| V1.1 (3–4) | Free → Pro conversion | ≥5% |
| V1.1 | MRR | $500+ |
| V1.2 (5–6) | API signups | 50+ |
| V1.2 | Monthly API calls | 5,000+ |
| V2.0 (8–10) | Community styles published | 50+ |
| V2.0 | Marketplace GMV/month | ₱10,000+ |
| V2.0 | Creators receiving payouts | 10+ |

---

*Polsh Complete Implementation Plan · polsh.work*
*Reference: `polsh-docs.md` · `polsh-paymongo-setup.md` · `polsh-design-guide.md`*
*Last updated: March 2026*
