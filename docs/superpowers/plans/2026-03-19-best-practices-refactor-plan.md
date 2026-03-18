# Best Practices Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing Laravel 12 + Inertia/Vue + Tailwind v4 application to better follow project best practices for frontend and backend architecture without changing user-visible behavior, route contracts, or API response shapes.

**Architecture:** The work is split into characterization-first backend refactors, frontend route/state cleanup, shared UI extraction, and design-system/tooling alignment. Security and behavior-changing fixes are intentionally isolated into a later hardening pass so the main refactor preserves existing functionality while making the codebase safer to evolve.

**Tech Stack:** Laravel 12, PHP 8.4, Inertia v2, Vue 3, TypeScript, Tailwind CSS v4, Wayfinder, shadcn-vue/Reka UI, Pest 4, Laravel Sail, Laravel Pint.

---

## File Structure Map

### Frontend files to modify

- `resources/js/pages/Dashboard/ApiKeys.vue` - replace prop mutation and hardcoded endpoints/routes.
- `resources/js/pages/History.vue` - replace hardcoded navigation and endpoint usage, normalize history copy/state handling.
- `resources/js/pages/Docs/Api.vue` - replace hardcoded internal links and prepare shared product-shell extraction.
- `resources/js/pages/Changelog.vue` - replace hardcoded internal links and align with token-driven styling.
- `resources/js/pages/Teams/Settings.vue` - reuse extracted product-shell/pro-gate patterns.
- `resources/js/components/UserMenu.vue` - replace hardcoded route visits and align with the app's other shadcn-based menu patterns.
- `resources/js/components/UserMenuContent.vue` - consolidate duplicated user-menu behavior.
- `resources/js/stores/editor.ts` - replace hardcoded preset endpoints with generated route helpers.
- `resources/js/composables/useExport.ts` - replace hardcoded session endpoint usage with generated route helpers.
- `resources/css/app.css` - remove duplicated base rules and add reusable token-backed styles/utilities.
- `components.json` - fix invalid shadcn-vue configuration.
- `package.json` - remove stale frontend dependencies only if proven unused.

### Backend files to modify

- `app/Http/Controllers/BillingController.php` - move inline validation into Form Requests.
- `app/Http/Controllers/TeamController.php` - move inline validation and ad hoc auth checks into requests/policies.
- `app/Http/Controllers/SessionController.php` - move inline validation and ownership checks into requests/policies.
- `app/Http/Controllers/ApiKeyController.php` - move inline validation and ownership checks into requests/policies.
- `app/Http/Controllers/PresetController.php` - move inline validation and ownership checks into requests/policies.
- `app/Http/Controllers/Api/V1/PolishController.php` - move inline validation into a request class.
- `app/Http/Middleware/HandleInertiaRequests.php` - shape shared auth data explicitly.
- `app/Models/Subscription.php` - fix scope typing.
- `routes/web.php` - replace closure routes for editor/history with controller actions.
- `app/Http/Requests/**` - new request classes for checkout, team, session, preset, API key, and polish flows.
- `app/Policies/**` - new policies for team/session/preset/api key authorization.

### Tests to create or extend

- `tests/Feature/Billing/*` - billing page, checkout, success, cancel, webhook characterization.
- `tests/Feature/Teams/*` - team create/invite/join/leave characterization.
- `tests/Feature/ApiKeys/*` - API key page and JSON endpoints.
- `tests/Feature/Sessions/*` - history page/session JSON flows.
- `tests/Feature/Presets/*` - preset CRUD and membership-based access.
- `tests/Feature/Api/PolishApiTest.php` - polish endpoint validation and response contracts.
- `tests/Feature/Middleware/AuthenticateApiKeyTest.php` - API key middleware behavior.

---

## Frontend Refactor Track

### Task 1: Lock route helper coverage and characterization boundaries

**Files:**

- Modify: `tasks/todo.md`
- Review: `resources/js/routes/**`
- Review: `resources/js/pages/Dashboard/ApiKeys.vue`
- Review: `resources/js/pages/History.vue`
- Review: `resources/js/pages/Docs/Api.vue`
- Review: `resources/js/pages/Changelog.vue`
- Review: `resources/js/components/UserMenu.vue`
- Review: `resources/js/stores/editor.ts`
- Review: `resources/js/composables/useExport.ts`

- [ ] **Step 1: Inventory hardcoded route and endpoint usage**

Record every hardcoded `href`, `router.visit(...)`, and `fetch(...)` call in the targeted frontend files, then map each one to an existing Wayfinder helper under `resources/js/routes/**`.

- [ ] **Step 2: Add characterization coverage for affected server-side payloads**

Create or extend backend feature tests so page props and JSON responses used by the frontend are locked before refactoring route/helper usage.

- [ ] **Step 3: Run the characterization tests**

Run: `vendor/bin/sail artisan test --compact --filter=ApiKey --filter=History --filter=Session --filter=Preset`

Expected: current behavior passes before frontend internals change.

- [ ] **Step 4: Commit the characterization baseline**

```bash
git add tests/Feature
git commit -m "test: characterize current frontend data contracts"
```

### Task 2: Refactor API keys page state and navigation

**Files:**

- Modify: `resources/js/pages/Dashboard/ApiKeys.vue`
- Verify: `app/Http/Controllers/ApiKeyController.php`
- Test: `tests/Feature/ApiKeys/ApiKeyManagementTest.php`

- [ ] **Step 1: Write or update the focused failing test**

Add assertions for the API key page props, JSON create response, and revoke behavior so the page contract is explicitly verified.

- [ ] **Step 2: Run the focused test to verify the baseline**

Run: `vendor/bin/sail artisan test --compact tests/Feature/ApiKeys/ApiKeyManagementTest.php`

Expected: PASS before internal refactor, proving the current contract is captured.

- [ ] **Step 3: Move page-owned collection state into a local ref**

Initialize a local `ref<ApiKey[]>([...props.apiKeys])` and update create/revoke logic to mutate local state instead of `props.apiKeys`.

- [ ] **Step 4: Replace hardcoded routes/endpoints with generated helpers**

Use existing Wayfinder route helpers for the page links and JSON calls while preserving methods, request payloads, and returned JSON handling.

- [ ] **Step 5: Run typecheck and the focused test again**

Run: `vendor/bin/sail npm run types:check && vendor/bin/sail artisan test --compact tests/Feature/ApiKeys/ApiKeyManagementTest.php`

Expected: both commands pass.

- [ ] **Step 6: Commit the page refactor**

```bash
git add resources/js/pages/Dashboard/ApiKeys.vue tests/Feature/ApiKeys/ApiKeyManagementTest.php
git commit -m "refactor: align api key page with route helpers"
```

### Task 3: Refactor history page navigation, deletion, and copy drift

**Files:**

- Modify: `resources/js/pages/History.vue`
- Verify: `app/Http/Controllers/SessionController.php`
- Verify: editor/history route definitions moved later from `routes/web.php`
- Test: `tests/Feature/Sessions/HistoryPageTest.php`

- [ ] **Step 1: Add or update a focused history test**

Cover page props, deletion behavior, and the current free-tier history limit shown by the server.

- [ ] **Step 2: Run the focused history test**

Run: `vendor/bin/sail artisan test --compact tests/Feature/Sessions/HistoryPageTest.php`

Expected: PASS before refactor.

- [ ] **Step 3: Replace hardcoded editor/billing links and delete endpoint usage**

Swap hardcoded strings for Wayfinder route helpers while preserving the same query string for `?session={id}` and the same delete request contract.

- [ ] **Step 4: Normalize entitlement copy from one shared source**

Move free/pro history messaging to a shared constant or server prop so the page no longer contradicts itself while still showing the same current limits.

- [ ] **Step 5: Re-run typecheck and the history test**

Run: `vendor/bin/sail npm run types:check && vendor/bin/sail artisan test --compact tests/Feature/Sessions/HistoryPageTest.php`

Expected: both commands pass.

- [ ] **Step 6: Commit the history cleanup**

```bash
git add resources/js/pages/History.vue tests/Feature/Sessions/HistoryPageTest.php
git commit -m "refactor: clean up history page routing and state"
```

### Task 4: Extract shared product-shell UI patterns

**Files:**

- Create: `resources/js/components/ProductPageHeader.vue`
- Create: `resources/js/components/ProductUpgradeCard.vue`
- Modify: `resources/js/pages/Dashboard/ApiKeys.vue`
- Modify: `resources/js/pages/History.vue`
- Modify: `resources/js/pages/Docs/Api.vue`
- Modify: `resources/js/pages/Teams/Settings.vue`
- Modify: `resources/js/components/UserMenu.vue`
- Modify: `resources/js/components/UserMenuContent.vue`

- [ ] **Step 1: Add a focused rendering test where practical**

If this project already snapshot- or response-tests these pages, extend them to assert the key headings/links still render after extraction.

- [ ] **Step 2: Extract the shared topbar/back-link component**

Create a small component that preserves existing page structure and accepts props for title, context label, and trailing action link.

- [ ] **Step 3: Extract the shared pro-gate/upgrade card component**

Use identical text/classes first so behavior and visuals do not change during extraction.

- [ ] **Step 4: Unify user-menu behavior behind one component path**

Replace duplicated routing/menu implementations so both authenticated and unauthenticated menu flows follow the same Wayfinder + shadcn conventions.

- [ ] **Step 5: Run frontend validation after extraction**

Run: `vendor/bin/sail npm run types:check && vendor/bin/sail npm run lint`

Expected: both commands pass.

- [ ] **Step 6: Commit the shared UI extraction**

```bash
git add resources/js/components resources/js/pages
git commit -m "refactor: extract shared product shell components"
```

### Task 5: Consolidate Tailwind token usage and CSS cleanup

**Files:**

- Modify: `resources/css/app.css`
- Modify: `resources/js/pages/Dashboard/ApiKeys.vue`
- Modify: `resources/js/pages/History.vue`
- Modify: `resources/js/pages/Docs/Api.vue`
- Modify: `resources/js/pages/Changelog.vue`
- Modify: `resources/js/pages/Teams/Settings.vue`
- Modify: `resources/js/components/UserMenu.vue`

- [ ] **Step 1: Add token-backed utility/class targets in app CSS**

Create reusable semantic hooks for repeated Polsh surface, accent, border, and text treatments using the existing token set in `resources/css/app.css`.

- [ ] **Step 2: Remove duplicate base layer definitions**

Keep one canonical base layer block and preserve current global typography/background behavior.

- [ ] **Step 3: Replace static inline colors/backgrounds incrementally**

Move repeated static styles into Tailwind classes or semantic utility classes, leaving inline styles only for truly dynamic values.

- [ ] **Step 4: Run lint, typecheck, and build**

Run: `vendor/bin/sail npm run lint && vendor/bin/sail npm run types:check && vendor/bin/sail npm run build`

Expected: all commands pass.

- [ ] **Step 5: Commit the CSS/token cleanup**

```bash
git add resources/css/app.css resources/js/pages resources/js/components
git commit -m "refactor: align product pages with tailwind tokens"
```

### Task 6: Repair shadcn-vue metadata and stale frontend dependencies

**Files:**

- Modify: `components.json`
- Modify: `package.json`
- Modify: `package-lock.json`
- Verify: `resources/js/components/ui/**`

- [ ] **Step 1: Correct the shadcn-vue config file**

Update `components.json` to a valid schema for the current Vue/Tailwind v4 setup and remove unsupported keys.

- [ ] **Step 2: Verify dependency usage before removal**

Search the codebase to confirm whether `lucide-react`, `radix-ui`, and `shadcn` are truly unused.

- [ ] **Step 3: Remove only the proven-unused packages**

Run: `vendor/bin/sail npm uninstall lucide-react radix-ui shadcn`

Expected: lockfile and package manifest update cleanly without affecting runtime code.

- [ ] **Step 4: Revalidate the toolchain**

Run: `vendor/bin/sail npm run lint && vendor/bin/sail npm run types:check && vendor/bin/sail npm run build`

Expected: all commands pass and shadcn tooling no longer errors on config shape.

- [ ] **Step 5: Commit the metadata cleanup**

```bash
git add components.json package.json package-lock.json
git commit -m "chore: fix shadcn vue project metadata"
```

---

## Backend Refactor Track

### Task 7: Add characterization coverage for backend contracts

**Files:**

- Create: `tests/Feature/Billing/BillingFlowTest.php`
- Create: `tests/Feature/Teams/TeamManagementTest.php`
- Create: `tests/Feature/ApiKeys/ApiKeyManagementTest.php`
- Create: `tests/Feature/Sessions/SessionManagementTest.php`
- Create: `tests/Feature/Presets/PresetManagementTest.php`
- Create: `tests/Feature/Api/PolishApiTest.php`
- Create: `tests/Feature/Middleware/AuthenticateApiKeyTest.php`

- [ ] **Step 1: Write focused feature tests for each domain**

Capture current redirects, validation failures, access rules, JSON shapes, and successful flows for billing, teams, sessions, presets, API keys, middleware, and the polish API.

- [ ] **Step 2: Run the new targeted suite**

Run: `vendor/bin/sail artisan test --compact tests/Feature/Billing tests/Feature/Teams tests/Feature/ApiKeys tests/Feature/Sessions tests/Feature/Presets tests/Feature/Api tests/Feature/Middleware`

Expected: current behavior passes before refactor.

- [ ] **Step 3: Commit the backend baseline tests**

```bash
git add tests/Feature
git commit -m "test: characterize backend domain contracts"
```

### Task 8: Extract Form Requests from controllers

**Files:**

- Create: `app/Http/Requests/Billing/CheckoutRequest.php`
- Create: `app/Http/Requests/Teams/StoreTeamRequest.php`
- Create: `app/Http/Requests/Teams/InviteTeamMemberRequest.php`
- Create: `app/Http/Requests/Sessions/StoreSessionRequest.php`
- Create: `app/Http/Requests/ApiKeys/StoreApiKeyRequest.php`
- Create: `app/Http/Requests/Presets/StorePresetRequest.php`
- Create: `app/Http/Requests/Api/V1/StorePolishRequest.php`
- Modify: `app/Http/Controllers/BillingController.php`
- Modify: `app/Http/Controllers/TeamController.php`
- Modify: `app/Http/Controllers/SessionController.php`
- Modify: `app/Http/Controllers/ApiKeyController.php`
- Modify: `app/Http/Controllers/PresetController.php`
- Modify: `app/Http/Controllers/Api/V1/PolishController.php`

- [ ] **Step 1: Create one request class per inline validation block**

Match existing validation rules exactly so no request payloads or error shapes change.

- [ ] **Step 2: Swap controllers to typed request injection**

Keep controller methods focused on coordination and response generation only.

- [ ] **Step 3: Run targeted backend tests after each controller migration**

Run: `vendor/bin/sail artisan test --compact tests/Feature/Billing tests/Feature/Teams tests/Feature/ApiKeys tests/Feature/Sessions tests/Feature/Presets tests/Feature/Api/PolishApiTest.php`

Expected: all targeted tests still pass.

- [ ] **Step 4: Run Pint**

Run: `vendor/bin/sail bin pint --dirty --format agent`

Expected: formatting completes with no remaining dirty PHP style issues.

- [ ] **Step 5: Commit the Form Request extraction**

```bash
git add app/Http/Requests app/Http/Controllers
git commit -m "refactor: move controller validation into form requests"
```

### Task 9: Introduce policies for ownership and access checks

**Files:**

- Create: `app/Policies/TeamPolicy.php`
- Create: `app/Policies/ExportSessionPolicy.php`
- Create: `app/Policies/ApiKeyPolicy.php`
- Create: `app/Policies/PresetPolicy.php`
- Modify: `app/Http/Controllers/TeamController.php`
- Modify: `app/Http/Controllers/SessionController.php`
- Modify: `app/Http/Controllers/ApiKeyController.php`
- Modify: `app/Http/Controllers/PresetController.php`

- [ ] **Step 1: Write or extend authorization-focused tests**

Assert that the same users can and cannot perform the same actions as before the refactor.

- [ ] **Step 2: Implement policies to mirror current behavior**

Translate `abort_if` and `abort_unless` ownership checks into policy methods without changing who is authorized.

- [ ] **Step 3: Replace controller checks with `authorize()` calls**

Keep routes, bindings, and response behavior intact.

- [ ] **Step 4: Run the authorization-focused suite**

Run: `vendor/bin/sail artisan test --compact tests/Feature/Teams tests/Feature/ApiKeys tests/Feature/Sessions tests/Feature/Presets`

Expected: all affected tests pass.

- [ ] **Step 5: Run Pint and commit**

```bash
vendor/bin/sail bin pint --dirty --format agent
git add app/Policies app/Http/Controllers tests/Feature
git commit -m "refactor: move domain authorization into policies"
```

### Task 10: Move editor and history closure routes into controllers

**Files:**

- Create: `app/Http/Controllers/EditorController.php`
- Create or extend: `app/Http/Controllers/HistoryController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Sessions/HistoryPageTest.php`
- Test: `tests/Feature/Editor/EditorPageTest.php`

- [ ] **Step 1: Add focused route/page tests if missing**

Cover the editor session restore query flow and history page Inertia payload shape.

- [ ] **Step 2: Move the editor closure into a controller action**

Keep the `editor` route name, session lookup logic, middleware behavior, and page prop shape unchanged.

- [ ] **Step 3: Move the history closure into a controller action**

Keep the `history` route name, auth requirement, limit logic, and Inertia page prop shape unchanged.

- [ ] **Step 4: Run the focused route tests**

Run: `vendor/bin/sail artisan test --compact tests/Feature/Editor/EditorPageTest.php tests/Feature/Sessions/HistoryPageTest.php`

Expected: both tests pass.

- [ ] **Step 5: Run Pint and commit**

```bash
vendor/bin/sail bin pint --dirty --format agent
git add app/Http/Controllers routes/web.php tests/Feature
git commit -m "refactor: move page closures into controllers"
```

### Task 11: Tighten Inertia shared auth data

**Files:**

- Modify: `app/Http/Middleware/HandleInertiaRequests.php`
- Review: `resources/js/**`
- Test: auth/settings/dashboard page feature tests

- [ ] **Step 1: Search every frontend consumer of `page.props.auth.user`**

List exactly which keys are used so the new shared payload is explicit and complete.

- [ ] **Step 2: Replace full model sharing with a minimal shaped array**

Share only the fields the frontend actually reads, plus the existing `plan`, `isPro`, `imageLimit`, and `teamId` data.

- [ ] **Step 3: Run auth/settings/dashboard feature tests and typecheck**

Run: `vendor/bin/sail artisan test --compact tests/Feature/Auth tests/Feature/Settings tests/Feature/DashboardTest.php && vendor/bin/sail npm run types:check`

Expected: all tests and typecheck pass.

- [ ] **Step 4: Run Pint and commit**

```bash
vendor/bin/sail bin pint --dirty --format agent
git add app/Http/Middleware/HandleInertiaRequests.php resources/js tests/Feature
git commit -m "refactor: shape shared inertia auth props"
```

### Task 12: Apply small non-behavioral model cleanup

**Files:**

- Modify: `app/Models/Subscription.php`
- Modify: `app/Models/User.php` (only if centralizing current-team lookup without changing semantics)

- [ ] **Step 1: Add focused tests for current-team dependent behavior if missing**

Protect the current semantics before touching helper methods.

- [ ] **Step 2: Fix scope typing and centralize helper semantics**

Return `Builder` from `scopeActive()` and wrap current-team lookup in an explicit helper without changing results.

- [ ] **Step 3: Run focused tests and Pint**

Run: `vendor/bin/sail artisan test --compact tests/Feature/Teams tests/Feature/ApiKeys && vendor/bin/sail bin pint --dirty --format agent`

Expected: tests pass and formatting is clean.

- [ ] **Step 4: Commit the cleanup**

```bash
git add app/Models tests/Feature
git commit -m "refactor: clean up model helper typing"
```

---

## Separate Hardening Track (Behavior-Changing; Do After Refactor)

### Task 13: Security and correctness hardening

**Files:**

- Modify: `app/Models/User.php`
- Modify: `config/fortify.php` consumers as needed
- Modify: `app/Http/Controllers/TeamController.php`
- Modify: `app/Http/Controllers/BillingController.php`
- Modify: `database/migrations/*subscriptions*`
- Modify: `app/Services/PolshImageProcessor.php`
- Test: new focused hardening tests for each change

- [ ] **Step 1: Add tests that prove the current bug/security gaps**

Cover email verification enforcement, invitation email mismatch handling, concurrent billing idempotency behavior, and remote image fetch constraints.

- [ ] **Step 2: Implement one hardening fix at a time**

Use separate commits for:

- `MustVerifyEmail` wiring
- team invitation email enforcement
- atomic billing idempotency plus DB uniqueness
- hardened remote image retrieval using Laravel HTTP client controls

- [ ] **Step 3: Run each focused hardening test suite after every fix**

Run only the tests for the domain being changed so regressions are obvious and isolated.

- [ ] **Step 4: Run final backend regression suite and Pint**

Run: `vendor/bin/sail artisan test --compact tests/Feature/Billing tests/Feature/Teams tests/Feature/Api tests/Feature/Middleware && vendor/bin/sail bin pint --dirty --format agent`

Expected: all hardening tests pass and formatting is clean.

---

## Final Verification Checklist

- [ ] Run: `vendor/bin/sail artisan test --compact tests/Feature/Billing tests/Feature/Teams tests/Feature/ApiKeys tests/Feature/Sessions tests/Feature/Presets tests/Feature/Api tests/Feature/Middleware tests/Feature/Auth tests/Feature/Settings tests/Feature/DashboardTest.php`
- [ ] Run: `vendor/bin/sail npm run lint`
- [ ] Run: `vendor/bin/sail npm run types:check`
- [ ] Run: `vendor/bin/sail npm run build`
- [ ] Run: `vendor/bin/sail bin pint --dirty --format agent`
- [ ] Manually smoke test: editor restore flow, history deletion/reopen, API key create/revoke, billing portal/upgrade paths, docs navigation, team settings, auth/settings pages.

---

## Suggested Commit Order

1. `test: characterize current frontend data contracts`
2. `refactor: align api key page with route helpers`
3. `refactor: clean up history page routing and state`
4. `refactor: extract shared product shell components`
5. `refactor: align product pages with tailwind tokens`
6. `chore: fix shadcn vue project metadata`
7. `test: characterize backend domain contracts`
8. `refactor: move controller validation into form requests`
9. `refactor: move domain authorization into policies`
10. `refactor: move page closures into controllers`
11. `refactor: shape shared inertia auth props`
12. `refactor: clean up model helper typing`
13. Hardening commits split by security/correctness fix
