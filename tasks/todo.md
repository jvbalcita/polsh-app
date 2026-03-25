# Task Tracker

## Tasks

- [x] Mount the shared toaster on the standalone editor page so preset error toasts can render
- [x] Add regression coverage proving the editor page mounts the toaster
- [x] Record the standalone editor toaster verification results in the review section

- [x] Remove the inline preset save error message now that the editor toaster renders correctly
- [x] Add regression coverage proving failed preset saves keep the form open without inline error text
- [x] Record the inline-error removal verification results in the review section

- [x] Show preset save failures through the existing app toaster
- [x] Include preset owner attribution in the shared presets section on the team page
- [x] Add regression coverage for shared preset owner payload and preset save toaster errors
- [ ] Record the toaster + shared preset attribution verification results in the review section

- [x] Surface preset-save validation failures instead of silently closing the save dialog
- [x] Prevent preset saves from posting when no active style slug is available
- [x] Add backend regression coverage for invalid preset JSON validation responses
- [x] Add editor store regression coverage for server-side and client-side preset save failures
- [ ] Record the preset save investigation and verification results in the review section

- [x] Add stable `pendingInvitations` props to both branches of the team settings response
- [x] Load matching pending invitations with shared case-insensitive lookup semantics
- [x] Preserve direct join-route safeguards for expired, accepted, mismatched, and successful invite acceptance
- [x] Surface pending invitations in the Vue team settings page ahead of upgrade and create-team states
- [x] Add frontend render-priority coverage and verify the team settings flow end-to-end

- [x] Trace the LemonSqueezy checkout failure to the exact missing external resource
- [x] Identify the correct published LemonSqueezy Pro variant IDs for the configured store
- [x] Update local LemonSqueezy variant configuration to the valid published IDs
- [x] Clear config cache and verify the updated variant IDs resolve via the LemonSqueezy API
- [ ] Record the LemonSqueezy investigation and production follow-up in the review section

- [x] Trace the team invitation email failure to the exact notification or mailable boundary
- [x] Add a regression test proving team invitation mailables receive the invitee as the `To` recipient
- [x] Fix the invitation notification to propagate the on-demand mail recipient into the mailable
- [x] Run targeted team invitation tests and Pint on changed PHP files
- [x] Record the investigation and verification results in the review section

- [x] Confirm the configured session driver and expected session storage table
- [x] Inspect the live Sail MySQL database state for `migrations` and `sessions`
- [x] Restore the missing schema so database-backed sessions can load again
- [x] Verify the app can see the `sessions` table after recovery
- [x] Add minimal frontend unit test support for editor composables
- [x] Write failing tests for frame overlay geometry and export crop bounds
- [x] Refactor editor canvas geometry to separate card, image, and frame overlay bounds
- [x] Refactor editor export paths to crop to edited card bounds and align SVG output
- [x] Run targeted verification for unit tests, types, lint, and editor feature coverage
- [x] Add premium editor image framing controls and desktop platform chrome support
- [x] Add curated background presets and branded color picker styling

## Review

- `config/session.php` uses the `database` session driver and defaults to the `sessions` table.
- Laravel is connected to MySQL database `polsh-db-dev`, but the live schema currently has no `migrations` table and no `sessions` table.
- This points to an environment/database reset or an empty MySQL volume rather than an application code regression.
- Running `vendor/bin/sail artisan migrate -vvv` recreated the full schema, including `sessions`.
- Verification now shows `Schema::hasTable('sessions') === true`, `migrations` contains 23 rows, and `DB::table('sessions')->count()` succeeds.
- Updated the guest header sign-in CTA in `resources/js/components/UserMenu.vue` to route to the shared login page instead of jumping straight into GitHub OAuth.
- Added `tests/Feature/Pages/GuestSignInLinkTest.php` to guard the login-route intent for the guest sign-in button.
- Added a minimal Vitest + jsdom setup in `package.json`, `vite.config.ts`, and `tsconfig.json` so editor composables can be tested directly.
- Refactored `resources/js/composables/useCanvas.ts` to separate card bounds, image bounds, frame overlays, and export bounds, with framed images rendering full-bleed under the selected chrome.
- Updated `resources/js/components/editor/CanvasStage.vue` to render the image before frame chrome and to register cropped export bounds with the export composable.
- Updated `resources/js/composables/useExport.ts` so raster exports crop to the edited artifact, session thumbnails use the same crop, and SVG exports now mirror frame chrome, noise, glow/shadow bleed, custom canvas sizes, and escaped text safely.
- Added focused regression coverage in `resources/js/composables/useCanvas.test.ts` and `resources/js/composables/useExport.test.ts` for framed image fill, cropped raster export, and SVG chrome/output parity.
- Fresh verification on the latest code: `vendor/bin/sail npm run test:unit` passed with 5 tests, `vendor/bin/sail npm run lint:check` passed, `vendor/bin/sail npm run types:check` passed, and `vendor/bin/sail artisan test --compact tests/Feature/Editor/EditorPageTest.php` passed with 4 tests / 48 assertions.
- Added `resources/js/composables/editorPresentation.ts` and `resources/js/composables/editorPresentation.test.ts` to centralize smart-fit image placement, desktop window controls, and curated background preset data.
- Extended `resources/js/types/editor.ts` with per-image transform state and desktop platform state so each image keeps its own zoom/pan/platform configuration.
- Updated `resources/js/composables/useCanvas.ts` and `resources/js/composables/useExport.ts` to share smart-fit image math, add Windows desktop controls to browser/terminal/minimal frames, and keep SVG export placement aligned with the live editor preview.
- Updated `resources/js/components/editor/CanvasStage.vue` to render the new desktop controls in-canvas and refreshed `resources/js/components/editor/ControlPanel.vue` with background preset grids, branded color pickers, browser title editing, platform toggles, and image zoom/pan reset controls.
- Fresh verification for this premium editor pass: `./node_modules/.bin/vitest run resources/js/composables/editorPresentation.test.ts resources/js/composables/useCanvas.test.ts resources/js/composables/useExport.test.ts --environment jsdom` passed with 11 tests, `./node_modules/.bin/eslint ...` passed on all changed editor files, and `npm run build` passed.
- `./node_modules/.bin/vue-tsc --noEmit` still fails on pre-existing missing Wayfinder route type imports like `@/routes` and `@/routes/billing`; that issue predates this editor pass and was not introduced by these changes.
- Team invitations are created in `app/Http/Controllers/TeamController.php`, which uses `Notification::route('mail', $validated['email'])` to send an on-demand `TeamInvitationNotification`.
- The root cause was `app/Notifications/TeamInvitationNotification.php`: its `toMail()` method returned a `TeamInvitationMail` without assigning any recipient, which Laravel requires when a notification returns a full mailable.
- Added a regression test in `tests/Feature/Teams/TeamManagementTest.php` that builds an `AnonymousNotifiable`, renders the team invitation notification to mail, and asserts the mailable has the invitee as its `To` recipient.
- Fixed `app/Notifications/TeamInvitationNotification.php` to copy the mail route from `AnonymousNotifiable` into the mailable and fall back to the invitation email for non-anonymous notifiables.
- Verification passed: `vendor/bin/sail artisan test --compact tests/Feature/Teams/TeamManagementTest.php --filter='team invitation notification addresses the invitee when rendered as mail'`, `vendor/bin/sail artisan test --compact tests/Feature/Teams/TeamManagementTest.php --filter='team owners can invite by email and a notification is dispatched'`, `vendor/bin/sail artisan test --compact tests/Feature/Teams/TeamManagementTest.php`, and `vendor/bin/sail bin pint --dirty --format agent`.
- The Lemon Squeezy checkout failure comes from stale env config, not from the billing controller: `app/Http/Controllers/BillingController.php` correctly passes the configured variant ID into the Lemon Squeezy package checkout flow.
- Direct API verification showed `LEMON_SQUEEZY_STORE=319604` is valid, but the previous `LEMON_SQUEEZY_VARIANT_PRO_MONTHLY=1445152` and `LEMON_SQUEEZY_VARIANT_PRO_YEARLY=1445161` both return `404` from Lemon Squeezy, which matches the logged `The related resource does not exist.` error from `Checkout->url()`.
- Enumerating the store's current product variants showed the published replacements for `Polsh Pro` are monthly `1443802` and yearly `1443820`; local `.env` was updated to those values.
- Verification passed: `vendor/bin/sail artisan config:clear`, direct API checks for store `319604`, and direct API checks confirming variants `1443802` and `1443820` both resolve successfully.
- Production needs the same config correction for `LEMON_SQUEEZY_VARIANT_PRO_MONTHLY` and `LEMON_SQUEEZY_VARIANT_PRO_YEARLY`, followed by config cache clear / redeploy so Laravel reads the updated values.
- `app/Models/TeamInvitation.php` now provides reusable `pending()` and `pendingForEmail()` scopes so the settings-page discovery query shares the same pending semantics as token acceptance and uses explicit case-insensitive email matching.
- `app/Http/Controllers/TeamController.php` now always returns `pendingInvitations`, loads matching invites for users without a team, and leaves the existing `join()` route as the single acceptance path.
- `resources/js/pages/Teams/Settings.vue` now prioritizes `team` first, then pending invitations, then the Pro upgrade card, then the create-team form; it renders invitation cards with team details, inviter name when available, expiry text, and an `Accept invitation` action using the existing `teams.join` route.
- Added backend coverage in `tests/Feature/Teams/TeamManagementTest.php` for stable `pendingInvitations` props, matching and case-insensitive discovery, hidden expired/accepted/mismatched invitations, invited free users, and direct join-route regression cases.
- Added frontend coverage in `resources/js/pages/Teams/Settings.test.ts` proving the invitation state renders ahead of both the upgrade card and create-team form, and that existing team members still see team management even when `isPro` is false.
- Verification passed: `vendor/bin/sail artisan test --compact tests/Feature/Teams/TeamManagementTest.php`, `vendor/bin/sail npm run test:unit -- resources/js/pages/Teams/Settings.test.ts --environment jsdom`, and `vendor/bin/sail bin pint --dirty --format agent`.
- `vendor/bin/sail npm run types:check` still fails on pre-existing missing generated route modules such as `@/routes/legal`, `@/routes/security`, `@/routes/api-keys`, `@/routes/sessions`, and several auth-related routes; those failures were not introduced by this team invite work.
- Preset saves in the editor go through `resources/js/stores/editor.ts` via raw `fetch('/presets')`, so Laravel validation failures were returning proper JSON 422 payloads but the client collapsed them to `null` and `resources/js/components/editor/ControlPanel.vue` closed the save form anyway.
- `resources/js/stores/editor.ts` now parses failed preset-save responses and throws the first validation message, and it also blocks the request early with a clearer client-side error when there is no active `styleSlug` to save.
- `resources/js/components/editor/ControlPanel.vue` now keeps the preset dialog open on save failure and renders the returned error inline with `InputError` instead of silently dismissing the form.
- Added backend regression coverage in `tests/Feature/Presets/PresetManagementTest.php` proving invalid preset saves return JSON validation errors for the editor client.
- Added store regression coverage in `resources/js/stores/editor.test.ts` for both server-returned validation errors and the no-active-style client guard.
- Verification passed: `vendor/bin/sail artisan test --compact tests/Feature/Presets/PresetManagementTest.php`, `vendor/bin/sail npm run test:unit -- resources/js/stores/editor.test.ts --environment jsdom`, `vendor/bin/sail npm exec eslint resources/js/components/editor/ControlPanel.vue resources/js/stores/editor.ts resources/js/stores/editor.test.ts`, and `vendor/bin/sail bin pint --dirty --format agent`.
- `resources/js/stores/editor.ts` now also calls `toast.error(...)` with the same normalized preset-save failure message, so the existing app toaster shows validation and client-side guard errors even though preset saving still uses raw JSON fetches rather than Inertia forms.
- `app/Http/Controllers/TeamController.php` now eager loads preset owners and includes `user_name` in each `teamPresets` item so the team settings page can attribute shared presets to the teammate who created them.
- `resources/js/pages/Teams/Settings.vue` now renders `Shared by {{ preset.user_name }}` under each shared preset when owner attribution is available.
- Added regression coverage in `tests/Feature/Teams/TeamManagementTest.php` asserting the team settings payload includes the shared preset owner's name, and extended `resources/js/stores/editor.test.ts` to assert the preset error path triggers the existing toaster.
- Verification passed: `vendor/bin/sail artisan test --compact tests/Feature/Teams/TeamManagementTest.php --filter='settings page shows team members and team presets for current team members'`, `vendor/bin/sail npm run test:unit -- resources/js/stores/editor.test.ts --environment jsdom`, `vendor/bin/sail npm exec eslint resources/js/pages/Teams/Settings.vue resources/js/stores/editor.ts resources/js/stores/editor.test.ts`, and `vendor/bin/sail bin pint --dirty --format agent`.
- The reason the toast still did not render after the earlier store change was that `resources/js/pages/Editor.vue` is a standalone page and was not mounting the shared Sonner `<Toaster />` used by the app layouts, so `toast.error(...)` had no renderer on that page.
- `resources/js/pages/Editor.vue` now mounts the shared `Toaster` via `Teleport` to `body`, matching the existing layout pattern used elsewhere in the app.
- Added `resources/js/pages/Editor.test.ts` to prove the standalone editor page mounts the shared toaster so future toast-based editor feedback has a rendering target.
- Verification passed: `vendor/bin/sail npm run test:unit -- resources/js/pages/Editor.test.ts --environment jsdom`, `vendor/bin/sail npm run test:unit -- resources/js/stores/editor.test.ts --environment jsdom`, and `vendor/bin/sail npm exec eslint resources/js/pages/Editor.vue resources/js/pages/Editor.test.ts resources/js/stores/editor.ts resources/js/stores/editor.test.ts`.
- `resources/js/components/editor/ControlPanel.vue` no longer renders the inline preset error below the save controls, so failed saves now rely on the shared toaster while keeping the form open for retry.
- Added `resources/js/components/editor/ControlPanel.test.ts` to assert that a failed preset save keeps the save form open without showing the old inline error message.
- Verification passed: `vendor/bin/sail npm run test:unit -- resources/js/components/editor/ControlPanel.test.ts --environment jsdom`, `vendor/bin/sail npm run test:unit -- resources/js/stores/editor.test.ts --environment jsdom`, `vendor/bin/sail npm run test:unit -- resources/js/pages/Editor.test.ts --environment jsdom`, and `vendor/bin/sail npm exec eslint resources/js/components/editor/ControlPanel.vue resources/js/components/editor/ControlPanel.test.ts`.
