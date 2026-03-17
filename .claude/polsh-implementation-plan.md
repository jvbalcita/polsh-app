# Polsh — Complete Implementation Plan
> **polsh.app** · Screenshot styling tool for developers & creators
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
| [**Phase 7**](#phase-7--gap-fixes--pre-marketplace-polish) | **Gap fixes & pre-marketplace polish** ← NEW | 🔲 |
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
> **Duration:** ~1 week | **Roadmap:** Pre-V2 close-out | **Status:** 🔲 PENDING
>
> **This phase is new.** It fixes every gap, missing item, and unverified
> deliverable identified across Phases 0–6. Do NOT start Phase 8 until
> every item in this phase is checked off.

### 7.1 — Accent color migration `#7c6fe0` → `#e0ff4f`
- 🔲 Search entire codebase for `#7c6fe0` and `7c6fe0` — replace all with `#e0ff4f`
- 🔲 Search for `indigo` Tailwind utility classes used as the app accent — replace with lime
- 🔲 Update `resources/css/app.css` CSS variables:
  ```css
  :root {
    --polsh-accent: #e0ff4f;
    --polsh-accent-dim: rgba(224,255,79,0.12);
    --polsh-accent-glow: rgba(224,255,79,0.06);
    --polsh-accent-border: rgba(224,255,79,0.4);
  }
  ```
- 🔲 Update Tailwind config if accent is defined there
- 🔲 Leave `grid-blueprint` style JSON untouched — its indigo border is the style's personality, not the app accent
- 🔲 Visual check: editor, billing page, landing page, API docs — no purple accent remnants

### 7.2 — Font migration to DM Mono + DM Sans
- 🔲 Add Google Fonts import in `resources/css/app.css`:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
  ```
- 🔲 Update Tailwind config:
  ```js
  fontFamily: {
    sans: ['DM Sans', 'sans-serif'],
    mono: ['DM Mono', 'monospace'],
  }
  ```
- 🔲 Remove all `Geist`, `Instrument Serif`, `Inter` references from CSS and components
- 🔲 Apply: headings / wordmark / style names → `font-mono` (DM Mono), body / controls / labels → `font-sans` (DM Sans)
- 🔲 Visual check: all pages render with DM fonts, no fallback flash

### 7.3 — 6 additional built-in styles (reaching 18 total)
PRD roadmap specifies 18 total built-in styles for V1.1. Phase 1 shipped 12.
- 🔲 `resources/js/data/styles/warm-studio.json` — warm orange/amber bg (`#1c0800`→`#2d1400`), soft card shadow, no border, subtle noise
- 🔲 `resources/js/data/styles/cyber-pink.json` — near-black bg (`#0d000d`→`#1a001a`), hot pink neon border + bloom (`#ff2d78`)
- 🔲 `resources/js/data/styles/slate-card.json` — muted slate blue bg (`#0d1117`→`#161b22`), clean subtle border, minimal
- 🔲 `resources/js/data/styles/forest-dark.json` — dark green bg (`#020d08`→`#0d1f10`), faint green glass border
- 🔲 `resources/js/data/styles/paper-white.json` — off-white bg (`#f5f0e8`→`#ede8df`), warm shadow, `"dark": true`
- 🔲 `resources/js/data/styles/retro-amber.json` — deep amber bg (`#1a0f00`→`#2d1c00`), amber glow border
- 🔲 Register all 6 in the style picker / style loader in `useEditorStore`
- 🔲 Verify all 18 render correctly on canvas
- 🔲 Update landing page style gallery to show all 18 (or a curated best-12 selection)

### 7.4 — Google OAuth verification
- 🔲 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` in `.env.example`
- 🔲 Google provider in `config/services.php`:
  ```php
  'google' => [
      'client_id'     => env('GOOGLE_CLIENT_ID'),
      'client_secret' => env('GOOGLE_CLIENT_SECRET'),
      'redirect'      => env('GOOGLE_REDIRECT_URI'),
  ],
  ```
- 🔲 Routes `GET /auth/google/redirect` and `GET /auth/google/callback` exist in `routes/web.php`
- 🔲 `redirectToGoogle()` and `handleGoogleCallback()` in `AuthController`
- 🔲 Google OAuth button on login page (alongside GitHub)
- 🔲 Test end-to-end in development

### 7.5 — Plan column on users table (fast lookup)
- 🔲 Migration: `$table->enum('plan', ['free','pro','team'])->default('free')->after('email');`
- 🔲 `BillingController@handleCheckoutPaid()` — also sets `$user->update(['plan' => 'pro'])`
- 🔲 `BillingController@cancel()` — when period expires, revert `$user->update(['plan' => 'free'])`
- 🔲 `ProcessSubscriptionRenewals` — sync `plan` column on expiry
- 🔲 Update `isPro()` to use `$this->plan === 'pro'` (fast DB column) instead of subscription query
- 🔲 `HandleInertiaRequests` shares `auth.user.plan` so Vue can access it

### 7.6 — Webhook on async glaze complete (PRD V1.2 item)
- 🔲 `webhook_url (nullable string)` column on `api_keys` table — add via migration
- 🔲 Show `webhook_url` input in "Create API key" modal in `Dashboard/ApiKeys.vue`
- 🔲 In `ProcessGlazeJob::handle()` — after success, if `api_key->webhook_url` is set:
  ```php
  Http::post($apiKey->webhook_url, [
      'event'     => 'glaze.complete',
      'url'       => $resultUrl,
      'style'     => $styleSlug,
      'format'    => $format,
      'job_id'    => $this->jobId,
      'timestamp' => now()->toISOString(),
  ]);
  ```
- 🔲 Document webhook payload in `Docs/Api.vue` under a new "Webhooks" section

### 7.7 — `polsh/laravel-polsh` Composer package
- 🔲 Create GitHub repo `github.com/polsh/laravel-polsh`
- 🔲 ServiceProvider auto-registers `polsh:glaze` Artisan command
- 🔲 `Polsh` facade with `Polsh::glaze(path, style, options)` → returns CDN URL
- 🔲 `README.md` with install + `.env` setup instructions
- 🔲 Register on Packagist as `polsh/laravel-polsh`
- 🔲 Link from API docs page and landing page footer

### 7.8 — Analytics setup (before Product Hunt)
- 🔲 Choose provider: Plausible ($9/mo) or self-hosted Umami (free)
- 🔲 Add analytics script tag to `resources/views/app.blade.php`
- 🔲 Track custom events: `style_applied`, `export_single`, `export_zip`, `upgrade_modal_shown`, `billing_checkout_started`
- 🔲 Verify events appear in analytics dashboard

### 7.9 — Changelog page
- 🔲 Create `Changelog.vue` Inertia page at `/changelog`
- 🔲 Entries for v1.0.0 (MVP), v1.1.0 (billing + teams), v1.2.0 (API + CLI), v1.2.1 (gap fixes)
- 🔲 Link in landing page footer and main nav
- 🔲 OG meta tags on this page

### 7.10 — Performance audit carry-over from Phase 2
- 🔲 Lighthouse landing page: Performance ≥ 90
- 🔲 Lighthouse `/editor`: Performance ≥ 90
- 🔲 First Contentful Paint ≤ 1.5s on landing page
- 🔲 Style switch renders canvas update ≤ 200ms (measure with `performance.now()`)
- 🔲 Batch apply on 10 images ≤ 500ms

### 7.11 — Production carry-over from Phase 6
- 🔲 Domain `polsh.app` — confirmed acquired, DNS live
- 🔲 Hosting decision documented in `README.md` (Laravel Cloud vs Forge + DigitalOcean)
- 🔲 PayMongo **live mode** webhook created (separate from test webhook)
- 🔲 PayMongo live keys added to production `.env`
- 🔲 Error tracking (Sentry or Flare) sending alerts
- 🔲 Product Hunt launch assets created (use Polsh to create its own screenshots — dogfood)

### 7.12 — Export history limit consistency
- 🔲 Verify `SessionController@index()` returns 10 for free users and 50 for Pro
- 🔲 Verify `History.vue` shows upgrade prompt at limit for free users
- 🔲 (Earlier phase prompt incorrectly said 20 — correct value is 10 free / 50 Pro per PRD)

### 7.13 — Team invite notification method
- 🔲 Confirm `TeamController@invite()` uses Laravel `Notification` class (not raw `Mail::`)
- 🔲 `TeamInvitation` notification: Markdown Mailable, lime accent, invite link, expires in 48h
- 🔲 Team invite token stored in `team_invitations` table: `id, team_id, email, token (unique), expires_at, accepted_at (nullable), timestamps` — add migration if missing

### Claude Code prompt for Phase 7

```
I need to complete Phase 7 of Polsh — a consolidation phase that fixes
all gaps from Phases 0–6 before building the community marketplace.

[Paste Appendix A context-reload prompt first, then:]

Work through these tasks in order. Commit after each group.

GROUP A — Visual identity fixes

TASK A1 — Accent color migration
Replace all instances of #7c6fe0 (indigo-purple) with #e0ff4f (electric lime).
Update CSS variables in resources/css/app.css:
  --polsh-accent: #e0ff4f
  --polsh-accent-dim: rgba(224,255,79,0.12)
  --polsh-accent-glow: rgba(224,255,79,0.06)
  --polsh-accent-border: rgba(224,255,79,0.4)
Do NOT change grid-blueprint style JSON — its indigo border is intentional.

TASK A2 — Font migration to DM Mono + DM Sans
Load via Google Fonts. Update Tailwind fontFamily config.
Remove any Geist or Instrument Serif references.
Headings/wordmark/style names → DM Mono. UI/body/controls → DM Sans.

GROUP B — Content additions

TASK B1 — 6 new style JSON files (18 total built-in styles)
Create in resources/js/data/styles/:
- warm-studio.json (warm orange/amber, no border, noise)
- cyber-pink.json (black bg, hot pink neon border #ff2d78)
- slate-card.json (slate blue, subtle border, minimal)
- forest-dark.json (dark green bg, glass border)
- paper-white.json (off-white bg, warm shadow, dark:true)
- retro-amber.json (deep amber bg, amber glow border)
Register all 6 in the style picker. Verify all 18 render on canvas.

GROUP C — Database and controller fixes

TASK C1 — Plan column on users
Migration: add plan enum('free','pro','team') default 'free' to users table.
Update BillingController to set/reset it on subscription events.
Update isPro() to use this column directly (fast lookup).

TASK C2 — Google OAuth
Add Google provider to config/services.php.
Add redirectToGoogle() and handleGoogleCallback() to AuthController.
Add Google OAuth button to login page. Test end-to-end.

TASK C3 — Webhook on async glaze complete
Add webhook_url nullable column to api_keys via migration.
Show webhook_url input in API key creation modal.
In ProcessGlazeJob: POST to webhook_url after success if set.
Document payload in Docs/Api.vue under a new Webhooks section.

TASK C4 — Team invitation table
If team_invitations table doesn't exist, create migration:
id, team_id FK, email, token unique, expires_at, accepted_at nullable, timestamps.
Update TeamController to store token in this table.
Update join route to validate token and expiry.

TASK C5 — Export history limit
Verify SessionController@index() returns 10 for free, 50 for Pro.
Verify History.vue shows upgrade prompt at the free limit.

GROUP D — Launch prep

TASK D1 — Changelog page
Create Changelog.vue at /changelog with v1.0, v1.1, v1.2, v1.2.1 entries.
Add to footer and nav. Add OG meta tags.

TASK D2 — Analytics
Add Plausible analytics script to resources/views/app.blade.php.
Track: style_applied, export_single, export_zip, upgrade_modal_shown,
billing_checkout_started.

TASK D3 — Performance audit
Run Lighthouse on landing page and /editor. Fix anything below 90.
Measure style switch latency and batch apply latency. Log results.

When all tasks are complete and tests pass:

1. Confirm backfilled tags from Phases 0–6 exist:
   git tag -l
   Expected output must include: v1.0.0, v1.1.0, v1.2.0
   If any are missing, run: git tag <missing-tag> HEAD
   then: git push origin --tags

2. Commit and tag Phase 7:
   git add -A
   git commit -m "feat: phase 7 — gap fixes and pre-marketplace polish"
   git tag v1.2.1
   git push && git push origin --tags

3. Confirm final tag list:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1
```

---

## Phase 8 — Community Style Marketplace Core
> **Duration:** ~3 weeks | **Roadmap:** V2.0 Weeks 19–22 | **Status:** 🔲 PENDING
>
> ⚠️ Start a new Claude Code session. Paste Appendix A first.
> Pre-requisite: All Phase 7 items checked off.
> Pre-requisite: DTI registration started (needed for Xendit in Phase 9).

### Overview
Build the marketplace infrastructure: browse, submit, moderate, and install
community styles. Creator payouts (Xendit) come in Phase 9.

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
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1

2. Commit and tag Phase 8:
   git add -A
   git commit -m "feat: phase 8 — community style marketplace core"
   git tag v2.0.0
   git push && git push origin --tags

3. Confirm final tag list:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v2.0.0
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
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v2.0.0

2. Commit and tag Phase 9:
   git add -A
   git commit -m "feat: phase 9 — marketplace payouts, creator profiles, ratings"
   git tag v2.1.0
   git push && git push origin --tags

3. Confirm final tag list:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v2.0.0  v2.1.0
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
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v2.0.0  v2.1.0

2. Commit and tag Phase 10:
   git add -A
   git commit -m "feat: phase 10 — style packs, affiliates, roadmap votes"
   git tag v2.2.0
   git push && git push origin --tags

3. Confirm final tag list:
   git tag -l
   Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v2.0.0  v2.1.0  v2.2.0
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
# Expected: v1.0.0  v1.1.0  v1.2.0  v1.2.1  v2.0.0  v2.1.0  v2.2.0

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
I'm continuing development on Polsh (polsh.app) — a screenshot styling
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
AWS_URL=https://cdn.polsh.app

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
MAIL_FROM_ADDRESS=hello@polsh.app
MAIL_FROM_NAME=Polsh

# Analytics
PLAUSIBLE_DOMAIN=polsh.app

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

*Polsh Complete Implementation Plan · polsh.app*
*Reference: `polsh-docs.md` · `polsh-paymongo-setup.md`*
*Last updated: March 2026*
