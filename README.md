# Polsh

[![Laravel 13](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![PHP 8.4.1+](https://img.shields.io/badge/PHP-8.4.1%2B-777BB4?logo=php&logoColor=white)](https://www.php.net)
[![Inertia v3](https://img.shields.io/badge/Inertia-v3-9553E9?logo=inertia&logoColor=white)](https://inertiajs.com)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Tests](https://github.com/jvbalcita/polsh-app/actions/workflows/tests.yml/badge.svg)](https://github.com/jvbalcita/polsh-app/actions/workflows/tests.yml)

[![Shipped](https://larashipped.laravel.cloud/badges/polsh.svg)](https://larashipped.laravel.cloud/@artisanjack/polsh)

> Screenshot styling tool for developers. Drop in a screenshot, pick a style, export a polished PNG/WebP/SVG frame — in seconds.

**Live:** [polsh.work](https://polsh.work)

---

## Features

- **12+ visual styles** — Polaroid, matte film, neon, minimal, and more
- **One-click export** — PNG, WebP, SVG with full resolution fidelity
- **Presets** — save and reuse custom style configurations per user or team
- **Teams** — collaborative workspaces with shared presets (Pro)
- **Export history** — browse and re-export past sessions
- **REST API + API keys** — headless export pipeline for CI/CD workflows
- **GitHub & Google OAuth** — one-click sign-in via Socialite
- **Billing** — PayMongo subscriptions with cancellation and reactivation
- **Support system** — in-app ticket submission, admin replies, status tracking
- **Admin dashboard** — user management, subscription view, activity log, role control
- **Transactional email** — dark-branded welcome, billing, and support notifications

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, PHP 8.4, Laravel Octane |
| Frontend | Vue 3, TypeScript, Inertia.js v2 |
| Styling | Tailwind CSS v4, shadcn-vue |
| Auth | Laravel Fortify + Spatie Permission |
| Billing | PayMongo (PaymentIntent + webhooks) |
| Media | spatie/laravel-medialibrary |
| Activity | spatie/laravel-activitylog |
| Queue | Redis (via Laravel Sail) |
| Testing | Pest v4 |
| Routing | Laravel Wayfinder (type-safe TS routes) |

---

## Local Development

### Prerequisites

- Docker Desktop
- [Laravel Sail](https://laravel.com/docs/sail) (included in vendor)

### Setup

```bash
# Clone
git clone https://github.com/your-org/polsh.git
cd polsh

# Install PHP dependencies
composer install

# Copy environment
cp .env.example .env

# Start all services (Laravel, MySQL, Redis, Mailpit)
vendor/bin/sail up -d

# Generate app key
vendor/bin/sail artisan key:generate

# Run migrations and seed roles
vendor/bin/sail artisan migrate --seed

# Install JS dependencies and build
vendor/bin/sail npm install
vendor/bin/sail npm run build
```

### Start dev server

```bash
# All services at once (Sail + Vite + queue worker)
composer run dev
```

Services:

| Service | URL |
|---|---|
| App | http://localhost |
| Mailpit (email preview) | http://localhost:8025 |
| Telescope | http://localhost/telescope |

### Wayfinder (route types)

After adding or changing routes, regenerate TypeScript route helpers:

```bash
vendor/bin/sail artisan wayfinder:generate
```

---

## Testing

```bash
# Run full suite
vendor/bin/sail artisan test --compact

# Run a specific file or filter
vendor/bin/sail artisan test --compact --filter=UserManagement
vendor/bin/sail artisan test tests/Feature/Admin/UserManagementTest.php
```

All tests use [Pest v4](https://pestphp.com) with `RefreshDatabase` and model factories.

---

## Admin Access

The admin area (`/dashboard`, `/admin/users`, `/admin/support`) requires the `admin` Spatie role.

To promote a local user:

```bash
vendor/bin/sail artisan tinker --execute "App\Models\User::where('email', 'you@example.com')->first()->assignRole('admin');"
```

Or seed a ready-made admin user:

```bash
vendor/bin/sail artisan db:seed --class=AdminUserSeeder
```

---

## Git Worktrees (parallel feature branches)

When you create a linked worktree, run from inside the worktree before `vendor/bin/sail up -d`:

```bash
./bin/setup-worktree-env
```

This copies the main `.env`, assigns unique forwarded ports, and sets a distinct `COMPOSE_PROJECT_NAME` so Sail containers don't collide.

---

## Production Deployment Checklist

> Complete these items before going live.

### Infrastructure

- [ ] Domain `polsh.work` — DNS A/AAAA records pointing to server
- [ ] SSL certificate provisioned (Let's Encrypt via Forge/Coolify, or managed cert)
- [ ] Hosting: **Laravel Cloud** or **Forge + DigitalOcean** — document here once decided
- [ ] Queue worker running (`php artisan queue:work` or Supervisor config)
- [ ] Storage disk configured — run `php artisan storage:link`

### Environment

- [ ] `APP_ENV=production`, `APP_DEBUG=false`
- [ ] `APP_URL=https://polsh.work`
- [ ] `SESSION_DRIVER=database` or `redis`
- [ ] `CACHE_DRIVER=redis`
- [ ] `QUEUE_CONNECTION=redis`

### OAuth

- [ ] GitHub OAuth app — production callback: `https://polsh.work/auth/github/callback`
- [ ] `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` set in production `.env`
- [ ] Google OAuth app — production callback: `https://polsh.work/auth/google/callback`
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` set in production `.env`

### Billing (PayMongo)

- [ ] Live keys: `PAYMONGO_PUBLIC_KEY=pk_live_...`, `PAYMONGO_SECRET_KEY=sk_live_...`
- [ ] Live webhook → `https://polsh.work/billing/webhook`
- [ ] `PAYMONGO_WEBHOOK_SIG` set to live webhook secret
- [ ] End-to-end checkout tested in live mode

### Error Tracking

- [ ] Sentry or Flare project created
- [ ] `SENTRY_LARAVEL_DSN` or `FLARE_KEY` set in production `.env`

### Analytics

- [ ] Plausible site `polsh.work` created
- [ ] Verify events (`style_applied`, `export_single`, `export_zip`) appear in dashboard

### Performance Targets

| Metric | Target |
|---|---|
| Time to Interactive (TTI) | ≤ 2.5 s on 4G (Lighthouse mobile) |
| Largest Contentful Paint (LCP) | ≤ 2.0 s on desktop |
| Editor JS bundle | ≤ 500 KB gzip |
| Single PNG export | ≤ 3 s for 1920 × 1080 canvas |
| API `/v1/polish` p95 latency | ≤ 800 ms (sync path) |
| Queue throughput | ≥ 10 async export jobs/min |

---

## Release History

| Tag | Description |
|---|---|
| `v1.0.0` | MVP — editor, 12 styles, GitHub OAuth, export history |
| `v1.1.0` | Billing & Teams — PayMongo subscriptions, team workspaces |
| `v1.2.0` | API & CLI — REST API, API keys, async export pipeline |
| `v1.2.1` | Gap fixes & pre-marketplace polish |
| `v1.3.0` | Support system — ticket submission, admin replies, status tracking |
| `v1.3.1` | Support system bug fixes and test coverage |
| `v1.4.0` | Admin user management, email overhaul, dark Sonner toasts |
