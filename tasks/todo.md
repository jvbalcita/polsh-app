# Task Tracker

## Tasks

- [x] Confirm the configured session driver and expected session storage table
- [x] Inspect the live Sail MySQL database state for `migrations` and `sessions`
- [x] Restore the missing schema so database-backed sessions can load again
- [x] Verify the app can see the `sessions` table after recovery

## Review

- `config/session.php` uses the `database` session driver and defaults to the `sessions` table.
- Laravel is connected to MySQL database `polsh-db-dev`, but the live schema currently has no `migrations` table and no `sessions` table.
- This points to an environment/database reset or an empty MySQL volume rather than an application code regression.
- Running `vendor/bin/sail artisan migrate -vvv` recreated the full schema, including `sessions`.
- Verification now shows `Schema::hasTable('sessions') === true`, `migrations` contains 23 rows, and `DB::table('sessions')->count()` succeeds.
- Updated the guest header sign-in CTA in `resources/js/components/UserMenu.vue` to route to the shared login page instead of jumping straight into GitHub OAuth.
- Added `tests/Feature/Pages/GuestSignInLinkTest.php` to guard the login-route intent for the guest sign-in button.
