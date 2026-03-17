# Laravel + Inertia/Vue Project Guidelines

## Foundations

- This project runs inside Laravel Sail. Prefix all PHP/Artisan/Composer/Node commands with `vendor/bin/sail`.
- Generate files with `vendor/bin/sail artisan make:* --no-interaction`.
- Run Pint before finalizing: `vendor/bin/sail bin pint --dirty --format agent`.

## Naming Conventions

- Use domain- or behavior-based names for files, classes, and tests.
- Never use milestone labels in filenames (`phase`, `mvp`, `v2`, `final`, `temp`).
- Prefer names that describe user-facing behavior or domain intent (e.g., `LaunchReadinessTest`, `DiscoveryFiltersTest`).

## Architecture

- Prefer Laravel's built-in primitives first: Form Requests, Policies/Gates, Jobs, Events, Notifications, Resources.
- Don't add new base folders or architecture layers unless the codebase already uses them.
- Keep controllers thin: input/auth → coordination → response. Nothing else.
- Use **Actions/Services** when: the operation has real domain meaning, is reused across multiple controllers/jobs, or is complex enough to deserve its own tests. Don't create them just to slim controllers.
- **CRUDDY design is fine**: resourceful controllers, clear verbs, predictable routes. Use custom action routes for non-CRUD domain verbs (approve, publish, archive, sync).

### Query Scopes

- Use Eloquent scopes for **reusable query constraints** (filters, visibility, tenant constraints).
- Keep scopes strictly query-focused — no business logic.

### Events

- Events are for **side effects and decoupling** (audit logs, notifications, cache warming, integrations).
- Keep listeners small and testable. If the operation must happen inline, do it directly or via a synchronously-dispatched job.

## Comments & PHPDoc

- Prefer clear names + strict types over comments. Comment the **why**, not the what.
- Use PHPDoc blocks (not inline `//`) for: relationship return types, complex array shapes, non-obvious scopes/attributes.
- If a model method needs a paragraph of explanation, extract an Action/Service and write tests.

## Eloquent & Database

- Never use `$fillable`/`$guarded` — the app runs `Model::unguard()` globally.
- Prefer Eloquent relationships over manual joins; avoid `DB::` unless truly necessary.
- Prevent N+1 queries via eager loading.
- When modifying a column in a migration, include all previously-defined attributes or they'll be dropped.
- Define casts via a `casts()` method (follow sibling model conventions).
- For complex boolean logic, **always group `orWhere` using nested closures** to ensure correct SQL parentheses:

```php
$query
    ->where('team_id', $teamId)
    ->where(function ($q) use ($term) {
        $q->where('name', 'like', "%{$term}%")
            ->orWhere('email', 'like', "%{$term}%");
    });
```

## Controllers, Requests, Authorization

- Always use Form Request classes (rules + messages) — no inline validation.
- Use Policies/Gates and authorization middleware.
- Prefer named routes and `route()` for URL generation.

## Queues

- Use queued jobs (`ShouldQueue`) for expensive work and integrations.
- Keep jobs small — push real domain work into an Action/Service the job calls (so it's testable without the queue).

## Configuration

- Never call `env()` outside config files. Always use `config('key')`.

## Testing

- Every change must be tested. Prefer feature tests; use factories for model creation.
- Pest is the default. Create tests with `vendor/bin/sail artisan make:test --pest`.
- Run only relevant tests: `vendor/bin/sail artisan test --compact` (filter when needed).

## Activity Logging (spatie/laravel-activitylog)

- All new domain models **must** implement `LogsActivity`.
- Use `->logOnly([...])`, `->logOnlyDirty()`, and `->dontSubmitEmptyLogs()`.
- Never log: `token`, `password`, `two_factor_secret`, `refresh_token`, `created_at`, `updated_at`.

```php
public function getActivitylogOptions(): LogOptions
{
    return LogOptions::defaults()
        ->logOnly(['name', 'email'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
}
```

## Permissions (spatie/laravel-permission)

- `User` carries `HasRoles`.
- Assign roles at registration or via admin tooling — never hard-code role checks in views.
- Gate role-specific routes via `can:` middleware or `Gate::allows()`.

## `tap()` Usage

Use `tap()` for small, obvious side-effects that return the original value. Keep callbacks short (a few lines). Don't hide real business logic inside them.

```php
return tap(User::query()->findOrFail($id), function (User $user) {
    $user->forceFill(['last_seen_at' => now()])->save();
});
```

## Routing Organization

Split routes by **area** (not by model): `web.php`, `auth.php`, `admin.php`, `settings.php`, `api.php`, `console.php`.

- Group by `middleware` + `prefix` + `name` consistently.
- Prefer `Route::resource()` for CRUD. Use explicit action routes for non-CRUD domain verbs.
- **Always use named routes.** URLs in frontend must come from Wayfinder — no hardcoded paths in Vue/TS.
