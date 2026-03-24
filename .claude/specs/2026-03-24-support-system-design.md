# Support System — Design Spec

> **Project:** Polsh (`polsh.work`)
> **Date:** 2026-03-24
> **Status:** Approved (rev 2 — post spec-review fixes)

---

## Overview

A built-in support ticket system allowing users (authenticated and guest) to submit requests across four categories: bug reports, feature requests, general assistance, and refund requests. Admins manage all tickets via an admin panel, can update statuses, assign tickets, and reply. Users track their own tickets and can reply to staff responses. All key events trigger email notifications.

The entry point is a dedicated `/support` page linked from the public footer, the authenticated settings sidebar, and all legal pages that previously pointed to `mailto:support@polsh.work`.

---

## 1. Data Model

### `support_tickets`

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `user_id` | `bigint` nullable FK → `users` | `null` for guest submissions |
| `submitter_name` | `string` | pre-filled from user if authenticated |
| `submitter_email` | `string` | pre-filled from user if authenticated |
| `type` | `enum` | `bug_report`, `feature_request`, `assistance`, `refund_request` |
| `subject` | `string` | |
| `description` | `text` | |
| `status` | `enum` | `open`, `in_progress`, `resolved`, `closed` |
| `assigned_admin_id` | `bigint` nullable FK → `users` | which admin owns the ticket |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

### `support_ticket_replies`

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `support_ticket_id` | `bigint` FK | |
| `author_id` | `bigint` nullable FK → `users` | null for guest-submitted tickets (admin-only reply) |
| `is_staff_reply` | `boolean` | distinguishes staff vs user replies |
| `message` | `text` | |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

### Model notes

- Both models implement `LogsActivity` (spatie/laravel-activitylog).
- `SupportTicket` exposes a `submitter()` helper returning either the linked `User` record or a guest value-object built from `submitter_name` / `submitter_email` — controllers always use the same interface.
- `SupportTicket` casts `type` and `status` as enums (`SupportTicketType`, `SupportTicketStatus`).
- **Guest reply scope:** Guest tickets (`user_id` is null) are reply-only from the admin side. Guests receive email notifications but cannot log in to reply. The user-facing reply route (`POST /support/tickets/{ticket}/reply`) is `auth only` and enforced by the `SupportTicketPolicy` — guest submitters cannot access it. This is an explicit design decision: guests are encouraged to create an account if they need ongoing conversation.

---

## 2. Routes & Controllers

### File: `routes/support.php`

Registered in `bootstrap/app.php` alongside the other route files.

**Public + authenticated user routes:**

```
GET  /support                          SupportController@create        guest or auth
POST /support                          SupportController@store         guest or auth
GET  /support/tickets                  SupportController@index         auth only
GET  /support/tickets/{ticket}         SupportController@show          auth + owns ticket
POST /support/tickets/{ticket}/reply   SupportTicketReplyController@store   auth + owns ticket
```

**Admin routes** (prefix `/admin`, middleware `role:admin`):

```
GET   /admin/support                          Admin\SupportController@index
GET   /admin/support/{ticket}                 Admin\SupportController@show
PATCH /admin/support/{ticket}                 Admin\SupportController@update
POST  /admin/support/{ticket}/reply           Admin\SupportTicketReplyController@store
```

### Controllers

- `App\Http\Controllers\SupportController` — public-facing: create form, store, user ticket list and detail.
- `App\Http\Controllers\SupportTicketReplyController` — user reply submission.
- `App\Http\Controllers\Admin\SupportController` — admin ticket list, detail, status update.
- `App\Http\Controllers\Admin\SupportTicketReplyController` — admin reply submission.

All controllers are thin: validate via Form Request → mutate model → dispatch job/notification → return Inertia response.

### Form Requests

- `StoreSupportTicketRequest` — requires `type`, `subject`, `description`; requires `submitter_name` + `submitter_email` only when guest.
- `UpdateSupportTicketRequest` — admin only; validates `status` enum and optional `assigned_admin_id`.
- `StoreSupportTicketReplyRequest` — requires non-empty `message`.

### Authorization

- `SupportTicketPolicy` — `view` and `reply` gates check `user_id === auth()->id()` for user-facing routes.
- **Closed-ticket guard:** `StoreSupportTicketReplyRequest` (or the controller before persisting) rejects replies to tickets with `status === closed` with a 422 response. Client-side disabled state is a UX hint only.
- Admin routes protected by `role:admin` middleware; no additional policy needed.

---

## 3. Notifications & Mail

Three `Notification` classes, all sent via the `mail` channel using a shared Markdown mail template (`resources/views/mail/support/`). All notifications are queued (implement `ShouldQueue`).

### `SupportTicketReceived`
- **Sent to:** submitter (guest email or user email) + all admin users
- **Trigger:** immediately after `SupportController@store`
- **Subject:** `We received your request — #POLSH-{id}`
- **Body:** ticket type, subject, description summary; link to `/support/tickets/{id}` included only for authenticated users

### `SupportTicketUpdated`
- **Sent to:** submitter
- **Trigger:** `Admin\SupportController@update` (status change)
- **Subject:** `Your request has been updated — #POLSH-{id}`
- **Body:** new status label; link to ticket (authenticated users only)

### `SupportTicketReplied`
- **Sent to:** submitter (when admin replies) or `assigned_admin_id` when user replies (falls back to all admins if unassigned)
- **Trigger:** either `SupportTicketReplyController@store` or `Admin\SupportTicketReplyController@store`
- **Subject:** `New reply on your request — #POLSH-{id}`
- **Body:** the reply message; link to ticket

### Mail design
- Shared Markdown layout: dark Polsh branding, `#e0ff4f` accent, DM Mono ticket ID, polsh.work footer.
- All notifications dispatched via `dispatch()` — uses the `database` queue connection already configured.

---

## 4. Admin Setup (Roles & Seeders)

### Role

One new Spatie permission role: `admin`. Created via `RoleSeeder` using `firstOrCreate` (idempotent).

### Seeder structure

```
DatabaseSeeder           ← dev default (php artisan db:seed)
  RoleSeeder             ← creates 'admin' role
  AdminUserSeeder        ← creates admin from .env
  SupportTicketSeeder    ← fake tickets + replies for local dev

ProductionSeeder         ← prod (php artisan db:seed --class=ProductionSeeder)
  RoleSeeder
  AdminUserSeeder
```

### `config/admin.php`

A dedicated config file bridges `.env` → seeder (per project rule: no `env()` outside config files):

```php
return [
    'name'     => env('ADMIN_NAME', 'Polsh Admin'),
    'email'    => env('ADMIN_EMAIL', 'admin@polsh.work'),
    'password' => env('ADMIN_PASSWORD', null),
];
```

### `AdminUserSeeder`

Reads via `config('admin.*')`:

```php
User::firstOrCreate(
    ['email' => config('admin.email')],
    ['name' => config('admin.name'), 'password' => bcrypt(config('admin.password'))]
)->assignRole('admin');
```

Safe to re-run (idempotent). Password is hashed via `bcrypt()`. Throws if `ADMIN_PASSWORD` is null in production.

### `.env.example` additions

```
ADMIN_NAME="Polsh Admin"
ADMIN_EMAIL=admin@polsh.work
ADMIN_PASSWORD=your-secure-password-here
```

---

## 5. Frontend Pages

All Vue pages use Inertia v2 patterns (`defineProps`, `<Form>`, `<Link>`). TypeScript throughout.

### `Support/Create.vue` — public support form

- **Layout:** `PublicLayout`
- **Route:** `GET /support`
- Four type selector cards (Bug Report, Feature Request, Get Assistance, Refund Request) — clicking one sets the `type` field
- Subject input + description textarea
- If guest: name + email fields shown
- If authenticated: name/email hidden, "Submitting as {name}" note displayed
- On success: authenticated → redirect to `/support/tickets/{id}`; guest → inline confirmation with ticket reference `#POLSH-{id}`

### `Support/Index.vue` — user's ticket list

- **Layout:** `AppLayout`
- **Route:** `GET /support/tickets`
- Table: type badge, subject, status badge (colour-coded), date submitted, "View" link
- Empty state with link to `/support`

### `Support/Show.vue` — user's ticket detail

- **Layout:** `AppLayout`
- **Route:** `GET /support/tickets/{ticket}`
- Ticket header: type, status badge, subject, original description
- Reply thread: staff replies have a lime left-border accent + "Polsh Support" label; user replies are plain
- Reply form at bottom; disabled with a note when status is `closed`

### `Admin/Support/Index.vue` — admin ticket list

- **Layout:** `AppLayout`
- **Route:** `GET /admin/support`
- Filters: status, type, assigned admin (query-string driven, Inertia partial reloads)
- Table: submitter name, type badge, subject, status badge, assigned-to, last-activity date

### `Admin/Support/Show.vue` — admin ticket detail

- **Layout:** `AppLayout`
- **Route:** `GET /admin/support/{ticket}`
- Two-column: reply thread (left/main), ticket metadata panel (right/sidebar)
- Sidebar: status dropdown, assign-to-admin select, submitter info
- Reply form below thread with "Staff reply" label
- Save status button updates independently of reply submission

### Navigation changes

| Location | Change |
|---|---|
| `PublicLayout.vue` footer — Legal column | Add "Support" link above Terms of Service |
| `resources/js/layouts/settings/Layout.vue` sidebar | Add "Support" nav item |
| `legal/Terms.vue` | Replace `mailto:` link with `<Link href="/support">` |
| `legal/Refund.vue` | Replace both `mailto:` links with `<Link href="/support">` |
| `legal/Privacy.vue` | Replace `mailto:privacy@...` with `<Link href="/support">` |

---

## 6. Tests

File: `tests/Feature/SupportTest.php`

- Guest can submit a ticket (name + email required)
- Guest submission fails validation without name or email (422)
- Authenticated user can submit a ticket (name/email pre-filled, name + email not required in payload)
- Authenticated user can view their own tickets
- Authenticated user cannot view another user's ticket (403)
- Authenticated user can reply to their own open ticket
- Authenticated user cannot reply to a closed ticket (422, server-side guard)
- Admin can view all tickets
- Admin can update ticket status
- Admin can assign ticket to themselves or another admin
- Admin can reply to any ticket
- `SupportTicketReceived` notification sent on creation
- `SupportTicketReplied` notification sent on admin reply
- `SupportTicketReplied` notification sent to assigned admin (or all admins) on user reply
- `SupportTicketUpdated` notification sent on status change
- Non-admin cannot access `/admin/support` (403)

---

## 7. File Summary

### New files

```
config/admin.php
routes/support.php
app/Http/Controllers/SupportController.php
app/Http/Controllers/SupportTicketReplyController.php
app/Http/Controllers/Admin/SupportController.php
app/Http/Controllers/Admin/SupportTicketReplyController.php
app/Http/Requests/StoreSupportTicketRequest.php
app/Http/Requests/UpdateSupportTicketRequest.php
app/Http/Requests/StoreSupportTicketReplyRequest.php
app/Models/SupportTicket.php
app/Models/SupportTicketReply.php
app/Enums/SupportTicketType.php
app/Enums/SupportTicketStatus.php
app/Notifications/SupportTicketReceived.php
app/Notifications/SupportTicketUpdated.php
app/Notifications/SupportTicketReplied.php
app/Policies/SupportTicketPolicy.php
database/migrations/*_create_support_tickets_table.php
database/migrations/*_create_support_ticket_replies_table.php
database/seeders/RoleSeeder.php
database/seeders/AdminUserSeeder.php
database/seeders/SupportTicketSeeder.php
database/seeders/ProductionSeeder.php
resources/views/mail/support/received.blade.php
resources/views/mail/support/updated.blade.php
resources/views/mail/support/replied.blade.php
resources/js/pages/Support/Create.vue
resources/js/pages/Support/Index.vue
resources/js/pages/Support/Show.vue
resources/js/pages/Admin/Support/Index.vue
resources/js/pages/Admin/Support/Show.vue
tests/Feature/SupportTest.php
```

### Modified files

```
bootstrap/app.php                         register routes/support.php
database/seeders/DatabaseSeeder.php       add RoleSeeder, AdminUserSeeder, SupportTicketSeeder
.env.example                              add ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
resources/js/layouts/PublicLayout.vue     add Support footer link
resources/js/layouts/settings/Layout.vue add Support sidebar item
resources/js/pages/legal/Terms.vue        replace mailto with /support link
resources/js/pages/legal/Refund.vue       replace mailto with /support link
resources/js/pages/legal/Privacy.vue      replace mailto with /support link
```
