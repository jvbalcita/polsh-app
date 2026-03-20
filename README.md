# Polsh

Screenshot styling tool for developers. Drop in a screenshot, pick a style, export a stunning PNG/WebP/SVG frame in seconds.

**Stack:** Laravel 12 · Inertia 2 · Vue 3 · TypeScript · Tailwind v4 · shadcn-vue

---

## Local Development

```bash
# Start all services
composer run dev

# Or individually
vendor/bin/sail up -d
npm run dev
```

### Git Worktrees + Sail

When you create a linked worktree, run this from inside the worktree before `vendor/bin/sail up -d`:

```bash
./bin/setup-worktree-env
```

That copies the main repo `.env`, assigns worktree-specific forwarded ports, and sets a unique `COMPOSE_PROJECT_NAME` so Sail containers do not collide with the main workspace.

---

## Production Deployment Checklist

> These items must be completed before going live. Track completion here.

### Infrastructure

- [ ] Domain `polsh.app` — DNS A/AAAA records pointing to server
- [ ] SSL certificate provisioned (Let's Encrypt via Forge/Coolify, or managed cert)
- [ ] Hosting decision: **Laravel Cloud** or **Laravel Forge + DigitalOcean** — document chosen provider here once decided
- [ ] Queue worker running (`php artisan queue:work` or Supervisor config)
- [ ] Storage disk configured for `public` and export disks — run `php artisan storage:link`

### Environment

- [ ] `APP_ENV=production`, `APP_DEBUG=false`
- [ ] `APP_URL=https://polsh.app`
- [ ] `SESSION_DRIVER=database` or `redis` (not `cookie` in production)
- [ ] `CACHE_DRIVER=redis`
- [ ] `QUEUE_CONNECTION=redis`

### OAuth

- [ ] GitHub OAuth app created at `github.com/settings/developers` with production callback: `https://polsh.app/auth/github/callback`
- [ ] `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` set in production `.env`
- [ ] Google OAuth app created at `console.cloud.google.com` with production callback: `https://polsh.app/auth/google/callback`
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set in production `.env`

### Billing (PayMongo)

- [ ] PayMongo live mode keys obtained and set: `PAYMONGO_PUBLIC_KEY=pk_live_...`, `PAYMONGO_SECRET_KEY=sk_live_...`
- [ ] PayMongo **live** webhook created pointing to `https://polsh.app/billing/webhook`
- [ ] `PAYMONGO_WEBHOOK_SIG` set to the live webhook secret
- [ ] Test a live checkout end-to-end (small amount) before launch

### Error Tracking

- [ ] Sentry or Flare project created
- [ ] `SENTRY_LARAVEL_DSN` or `FLARE_KEY` set in production `.env`
- [ ] Test that errors surface in the dashboard

### Analytics

- [ ] Plausible site `polsh.app` created at plausible.io
- [ ] Verify events (`style_applied`, `export_single`, `export_zip`, `upgrade_modal_shown`, `billing_checkout_started`) appear in Plausible dashboard after first traffic

### Product Hunt Launch Assets

- [ ] Hero image created using Polsh (dogfood — use the tool to style its own screenshots)
- [ ] Gallery images (5–8 screenshots showing different styles)
- [ ] 60-char tagline written
- [ ] 240-char short description written
- [ ] Maker comment drafted
- [ ] Scheduled launch date confirmed on producthunt.com

### Performance Targets

> Measure against these after first production deployment.

- [ ] **Time to Interactive (TTI)** ≤ 2.5 s on 4G (Lighthouse mobile)
- [ ] **Largest Contentful Paint (LCP)** ≤ 2.0 s on desktop
- [ ] **Editor JS bundle** ≤ 500 KB gzip (check `npm run build` output)
- [ ] **Single PNG export** ≤ 3 s for a 1920×1080 canvas
- [ ] **API `/v1/polish` p95 latency** ≤ 800 ms (synchronous path, no queue)
- [ ] **Queue job throughput** ≥ 10 async export jobs/min on a single worker

---

## Git Tags

| Tag      | Description                                           |
| -------- | ----------------------------------------------------- |
| `v1.0.0` | MVP — editor, 12 styles, GitHub OAuth, export history |
| `v1.1.0` | Billing & Teams — PayMongo, team workspaces           |
| `v1.2.0` | API & CLI — REST API, API keys, async export          |
| `v1.2.1` | Gap fixes & pre-marketplace polish                    |
