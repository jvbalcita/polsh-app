# Task Tracker

## Tasks

- [x] Confirm the configured session driver and expected session storage table
- [x] Inspect the live Sail MySQL database state for `migrations` and `sessions`
- [x] Restore the missing schema so database-backed sessions can load again
- [x] Verify the app can see the `sessions` table after recovery
- [x] Add minimal frontend unit test support for editor composables
- [x] Write failing tests for frame overlay geometry and export crop bounds
- [x] Refactor editor canvas geometry to separate card, image, and frame overlay bounds
- [x] Refactor editor export paths to crop to edited card bounds and align SVG output
- [x] Run targeted verification for unit tests, types, lint, and editor feature coverage

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
