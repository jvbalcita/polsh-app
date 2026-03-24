# Support System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack support ticket system — guest/user submission, user ticket tracking, admin management with replies and status updates, and email notifications on all key events.

**Architecture:** Laravel backend (models, controllers, notifications, seeders) connected to Inertia/Vue3 frontend pages. Tickets stored in `support_tickets` table; replies in `support_ticket_replies`. Three queued notifications (received, updated, replied). One `config/admin.php` + four seeders. Five Vue pages across public and admin areas.

**Tech Stack:** Laravel 12, PHP 8.4, Inertia v2, Vue 3, TypeScript, Pest v4, spatie/laravel-permission, spatie/laravel-activitylog, Tailwind v4, Wayfinder

**Spec:** `.claude/specs/2026-03-24-support-system-design.md`

---

## File Map

### New files
```
config/admin.php
routes/support.php
app/Enums/SupportTicketType.php
app/Enums/SupportTicketStatus.php
app/Models/SupportTicket.php
app/Models/SupportTicketReply.php
app/Policies/SupportTicketPolicy.php
app/Http/Controllers/SupportController.php
app/Http/Controllers/SupportTicketReplyController.php
app/Http/Controllers/Admin/SupportController.php
app/Http/Controllers/Admin/SupportTicketReplyController.php
app/Http/Requests/StoreSupportTicketRequest.php
app/Http/Requests/UpdateSupportTicketRequest.php
app/Http/Requests/StoreSupportTicketReplyRequest.php
app/Notifications/SupportTicketReceived.php
app/Notifications/SupportTicketUpdated.php
app/Notifications/SupportTicketReplied.php
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
bootstrap/app.php                              register routes/support.php
database/seeders/DatabaseSeeder.php           add RoleSeeder, AdminUserSeeder, SupportTicketSeeder
.env.example                                  add ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
resources/js/layouts/PublicLayout.vue         add Support footer link
resources/js/layouts/settings/Layout.vue      add Support sidebar item
resources/js/pages/legal/Terms.vue            replace mailto with /support link
resources/js/pages/legal/Refund.vue           replace mailto links with /support link
resources/js/pages/legal/Privacy.vue          replace mailto link with /support link
```

---

## Task 1: Migrations

**Files:**
- Create: `database/migrations/*_create_support_tickets_table.php`
- Create: `database/migrations/*_create_support_ticket_replies_table.php`

- [ ] **Step 1.1: Generate migrations**

```bash
vendor/bin/sail artisan make:migration create_support_tickets_table --no-interaction
vendor/bin/sail artisan make:migration create_support_ticket_replies_table --no-interaction
```

- [ ] **Step 1.2: Implement support_tickets migration**

Open the generated `*_create_support_tickets_table.php` and replace the `up()` method:

```php
public function up(): void
{
    Schema::create('support_tickets', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
        $table->string('submitter_name');
        $table->string('submitter_email');
        $table->string('type'); // enum enforced at app layer
        $table->string('subject');
        $table->text('description');
        $table->string('status')->default('open');
        $table->foreignId('assigned_admin_id')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('support_tickets');
}
```

- [ ] **Step 1.3: Implement support_ticket_replies migration**

```php
public function up(): void
{
    Schema::create('support_ticket_replies', function (Blueprint $table) {
        $table->id();
        $table->foreignId('support_ticket_id')->constrained()->cascadeOnDelete();
        $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
        $table->boolean('is_staff_reply')->default(false);
        $table->text('message');
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('support_ticket_replies');
}
```

- [ ] **Step 1.4: Run migrations**

```bash
vendor/bin/sail artisan migrate
```

Expected: two new tables created with no errors.

- [ ] **Step 1.5: Commit**

```bash
git add database/migrations/
git commit -m "feat(support): add support_tickets and support_ticket_replies migrations"
```

---

## Task 2: Enums

**Files:**
- Create: `app/Enums/SupportTicketType.php`
- Create: `app/Enums/SupportTicketStatus.php`

- [ ] **Step 2.1: Create SupportTicketType enum**

```bash
vendor/bin/sail artisan make:class Enums/SupportTicketType --no-interaction
```

Replace file contents with:

```php
<?php

namespace App\Enums;

enum SupportTicketType: string
{
    case BugReport = 'bug_report';
    case FeatureRequest = 'feature_request';
    case Assistance = 'assistance';
    case RefundRequest = 'refund_request';

    public function label(): string
    {
        return match ($this) {
            self::BugReport => 'Bug Report',
            self::FeatureRequest => 'Feature Request',
            self::Assistance => 'Get Assistance',
            self::RefundRequest => 'Refund Request',
        };
    }
}
```

- [ ] **Step 2.2: Create SupportTicketStatus enum**

```bash
vendor/bin/sail artisan make:class Enums/SupportTicketStatus --no-interaction
```

Replace file contents with:

```php
<?php

namespace App\Enums;

enum SupportTicketStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Open',
            self::InProgress => 'In Progress',
            self::Resolved => 'Resolved',
            self::Closed => 'Closed',
        };
    }
}
```

- [ ] **Step 2.3: Commit**

```bash
git add app/Enums/
git commit -m "feat(support): add SupportTicketType and SupportTicketStatus enums"
```

---

## Task 3: Models

**Files:**
- Create: `app/Models/SupportTicket.php`
- Create: `app/Models/SupportTicketReply.php`

- [ ] **Step 3.1: Generate models**

```bash
vendor/bin/sail artisan make:model SupportTicket --no-interaction
vendor/bin/sail artisan make:model SupportTicketReply --no-interaction
```

- [ ] **Step 3.2: Implement SupportTicket model**

```php
<?php

namespace App\Models;

use App\Enums\SupportTicketStatus;
use App\Enums\SupportTicketType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class SupportTicket extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'assigned_admin_id'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function casts(): array
    {
        return [
            'type' => SupportTicketType::class,
            'status' => SupportTicketStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(SupportTicketReply::class);
    }

    /** Returns the linked User or a simple object for guests. */
    public function submitter(): User|object
    {
        if ($this->user_id) {
            return $this->user;
        }

        return (object) [
            'name' => $this->submitter_name,
            'email' => $this->submitter_email,
        ];
    }

    public function reference(): string
    {
        return '#POLSH-' . $this->id;
    }
}
```

- [ ] **Step 3.3: Implement SupportTicketReply model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class SupportTicketReply extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['message', 'is_staff_reply'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class, 'support_ticket_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
```

- [ ] **Step 3.4: Commit**

```bash
git add app/Models/SupportTicket.php app/Models/SupportTicketReply.php
git commit -m "feat(support): add SupportTicket and SupportTicketReply models"
```

---

## Task 4: Config, Form Requests, and Policy

**Files:**
- Create: `config/admin.php`
- Create: `app/Http/Requests/StoreSupportTicketRequest.php`
- Create: `app/Http/Requests/UpdateSupportTicketRequest.php`
- Create: `app/Http/Requests/StoreSupportTicketReplyRequest.php`
- Create: `app/Policies/SupportTicketPolicy.php`

- [ ] **Step 4.1: Create config/admin.php**

```php
<?php

return [
    'name' => env('ADMIN_NAME', 'Polsh Admin'),
    'email' => env('ADMIN_EMAIL', 'admin@polsh.work'),
    'password' => env('ADMIN_PASSWORD'),
];
```

- [ ] **Step 4.2: Generate form requests**

```bash
vendor/bin/sail artisan make:request StoreSupportTicketRequest --no-interaction
vendor/bin/sail artisan make:request UpdateSupportTicketRequest --no-interaction
vendor/bin/sail artisan make:request StoreSupportTicketReplyRequest --no-interaction
```

- [ ] **Step 4.3: Implement StoreSupportTicketRequest**

```php
<?php

namespace App\Http\Requests;

use App\Enums\SupportTicketType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupportTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'type' => ['required', Rule::enum(SupportTicketType::class)],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
        ];

        if (! $this->user()) {
            $rules['submitter_name'] = ['required', 'string', 'max:255'];
            $rules['submitter_email'] = ['required', 'email', 'max:255'];
        }

        return $rules;
    }
}
```

- [ ] **Step 4.4: Implement UpdateSupportTicketRequest**

```php
<?php

namespace App\Http\Requests;

use App\Enums\SupportTicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupportTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(SupportTicketStatus::class)],
            'assigned_admin_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
```

- [ ] **Step 4.5: Implement StoreSupportTicketReplyRequest**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupportTicketReplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:5000'],
        ];
    }
}
```

- [ ] **Step 4.6: Generate and implement SupportTicketPolicy**

```bash
vendor/bin/sail artisan make:policy SupportTicketPolicy --model=SupportTicket --no-interaction
```

Replace the generated file with:

```php
<?php

namespace App\Policies;

use App\Models\SupportTicket;
use App\Models\User;

class SupportTicketPolicy
{
    public function view(User $user, SupportTicket $ticket): bool
    {
        return $ticket->user_id === $user->id;
    }

    public function reply(User $user, SupportTicket $ticket): bool
    {
        return $ticket->user_id === $user->id;
    }
}
```

- [ ] **Step 4.7: Commit**

```bash
git add config/admin.php app/Http/Requests/ app/Policies/SupportTicketPolicy.php
git commit -m "feat(support): add config/admin, form requests, and ticket policy"
```

---

## Task 5: Seeders

**Files:**
- Create: `database/seeders/RoleSeeder.php`
- Create: `database/seeders/AdminUserSeeder.php`
- Create: `database/seeders/SupportTicketSeeder.php`
- Create: `database/seeders/ProductionSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Modify: `.env.example`

- [ ] **Step 5.1: Generate seeders**

```bash
vendor/bin/sail artisan make:seeder RoleSeeder --no-interaction
vendor/bin/sail artisan make:seeder AdminUserSeeder --no-interaction
vendor/bin/sail artisan make:seeder SupportTicketSeeder --no-interaction
vendor/bin/sail artisan make:seeder ProductionSeeder --no-interaction
```

- [ ] **Step 5.2: Implement RoleSeeder**

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    }
}
```

- [ ] **Step 5.3: Implement AdminUserSeeder**

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = config('admin.password');

        if (! $password) {
            $this->command->warn('ADMIN_PASSWORD not set in .env — skipping admin seeder.');

            return;
        }

        $admin = User::firstOrCreate(
            ['email' => config('admin.email')],
            [
                'name' => config('admin.name'),
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ],
        );

        $admin->assignRole('admin');

        $this->command->info("Admin user ready: {$admin->email}");
    }
}
```

- [ ] **Step 5.4: Implement SupportTicketSeeder (dev only)**

```php
<?php

namespace Database\Seeders;

use App\Enums\SupportTicketStatus;
use App\Enums\SupportTicketType;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\User;
use Illuminate\Database\Seeder;

class SupportTicketSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::role('admin')->first();
        $user = User::doesntHave('roles')->first() ?? User::factory()->create();

        $types = SupportTicketType::cases();
        $statuses = SupportTicketStatus::cases();

        foreach (range(1, 12) as $i) {
            $ticket = SupportTicket::create([
                'user_id' => $i % 3 === 0 ? null : $user->id,
                'submitter_name' => $i % 3 === 0 ? 'Guest User' : $user->name,
                'submitter_email' => $i % 3 === 0 ? 'guest@example.com' : $user->email,
                'type' => $types[array_rand($types)]->value,
                'subject' => "Sample support request #{$i}",
                'description' => "This is a sample description for support request #{$i}. It contains enough detail to look realistic in the admin panel.",
                'status' => $statuses[array_rand($statuses)]->value,
                'assigned_admin_id' => $i % 2 === 0 ? $admin?->id : null,
            ]);

            SupportTicketReply::create([
                'support_ticket_id' => $ticket->id,
                'author_id' => $admin?->id,
                'is_staff_reply' => true,
                'message' => "Thank you for reaching out. We have received your request and will respond shortly.",
            ]);
        }
    }
}
```

- [ ] **Step 5.5: Implement ProductionSeeder**

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
```

- [ ] **Step 5.6: Update DatabaseSeeder to include new seeders**

Open `database/seeders/DatabaseSeeder.php`. Add to the `run()` method (before or after existing calls):

```php
$this->call([
    RoleSeeder::class,
    AdminUserSeeder::class,
    SupportTicketSeeder::class,
]);
```

- [ ] **Step 5.7: Add ADMIN_* keys to .env.example**

Add to `.env.example`:

```
ADMIN_NAME="Polsh Admin"
ADMIN_EMAIL=admin@polsh.work
ADMIN_PASSWORD=your-secure-password-here
```

Also add the same keys to your local `.env` with real values for development.

- [ ] **Step 5.8: Run pint**

```bash
vendor/bin/sail bin pint --dirty --format agent
```

- [ ] **Step 5.9: Commit**

```bash
git add database/seeders/ config/admin.php .env.example
git commit -m "feat(support): add role, admin, and dev support ticket seeders"
```

---

## Task 6: Notifications and Mail Views

**Files:**
- Create: `app/Notifications/SupportTicketReceived.php`
- Create: `app/Notifications/SupportTicketUpdated.php`
- Create: `app/Notifications/SupportTicketReplied.php`
- Create: `resources/views/mail/support/received.blade.php`
- Create: `resources/views/mail/support/updated.blade.php`
- Create: `resources/views/mail/support/replied.blade.php`

- [ ] **Step 6.1: Generate notifications**

```bash
vendor/bin/sail artisan make:notification SupportTicketReceived --no-interaction
vendor/bin/sail artisan make:notification SupportTicketUpdated --no-interaction
vendor/bin/sail artisan make:notification SupportTicketReplied --no-interaction
```

- [ ] **Step 6.2: Implement SupportTicketReceived**

```php
<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupportTicketReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly SupportTicket $ticket) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject("We received your request — {$this->ticket->reference()}")
            ->markdown('mail.support.received', [
                'ticket' => $this->ticket,
                'isAdmin' => $notifiable instanceof \App\Models\User && $notifiable->hasRole('admin'),
            ]);

        return $message;
    }
}
```

- [ ] **Step 6.3: Implement SupportTicketUpdated**

```php
<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupportTicketUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly SupportTicket $ticket) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Your request has been updated — {$this->ticket->reference()}")
            ->markdown('mail.support.updated', ['ticket' => $this->ticket]);
    }
}
```

- [ ] **Step 6.4: Implement SupportTicketReplied**

```php
<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupportTicketReplied extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly SupportTicket $ticket,
        public readonly SupportTicketReply $reply,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New reply on your request — {$this->ticket->reference()}")
            ->markdown('mail.support.replied', [
                'ticket' => $this->ticket,
                'reply' => $this->reply,
            ]);
    }
}
```

- [ ] **Step 6.5: Create mail view directory**

```bash
mkdir -p resources/views/mail/support
```

- [ ] **Step 6.6: Create received.blade.php**

```blade
@component('mail::message')
# We received your request — {{ $ticket->reference() }}

**Type:** {{ $ticket->type->label() }}
**Subject:** {{ $ticket->subject }}

{{ $ticket->description }}

@if(!$isAdmin && $ticket->user_id)
@component('mail::button', ['url' => url('/support/tickets/' . $ticket->id)])
View Your Request
@endcomponent
@endif

We'll get back to you as soon as possible.

Thanks,
**Polsh Support**
@endcomponent
```

- [ ] **Step 6.7: Create updated.blade.php**

```blade
@component('mail::message')
# Your request has been updated — {{ $ticket->reference() }}

**Subject:** {{ $ticket->subject }}
**New Status:** {{ $ticket->status->label() }}

@if($ticket->user_id)
@component('mail::button', ['url' => url('/support/tickets/' . $ticket->id)])
View Your Request
@endcomponent
@endif

Thanks,
**Polsh Support**
@endcomponent
```

- [ ] **Step 6.8: Create replied.blade.php**

```blade
@component('mail::message')
# New reply on your request — {{ $ticket->reference() }}

**Subject:** {{ $ticket->subject }}

---

{{ $reply->message }}

---

@if($ticket->user_id)
@component('mail::button', ['url' => url('/support/tickets/' . $ticket->id)])
View & Reply
@endcomponent
@endif

Thanks,
**Polsh Support**
@endcomponent
```

- [ ] **Step 6.9: Run pint**

```bash
vendor/bin/sail bin pint --dirty --format agent
```

- [ ] **Step 6.10: Commit**

```bash
git add app/Notifications/ resources/views/mail/support/
git commit -m "feat(support): add queued notifications and mail views for ticket events"
```

---

## Task 7: Routes and Controllers

**Files:**
- Create: `routes/support.php`
- Create: `app/Http/Controllers/SupportController.php`
- Create: `app/Http/Controllers/SupportTicketReplyController.php`
- Create: `app/Http/Controllers/Admin/SupportController.php`
- Create: `app/Http/Controllers/Admin/SupportTicketReplyController.php`
- Modify: `bootstrap/app.php`

- [ ] **Step 7.1: Generate controllers**

```bash
vendor/bin/sail artisan make:controller SupportController --no-interaction
vendor/bin/sail artisan make:controller SupportTicketReplyController --no-interaction
vendor/bin/sail artisan make:controller Admin/SupportController --no-interaction
vendor/bin/sail artisan make:controller Admin/SupportTicketReplyController --no-interaction
```

- [ ] **Step 7.2: Implement SupportController**

```php
<?php

namespace App\Http\Controllers;

use App\Enums\SupportTicketStatus;
use App\Http\Requests\StoreSupportTicketRequest;
use App\Models\SupportTicket;
use App\Notifications\SupportTicketReceived;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Support/Create');
    }

    public function store(StoreSupportTicketRequest $request): RedirectResponse
    {
        $user = $request->user();

        $ticket = SupportTicket::create([
            'user_id' => $user?->id,
            'submitter_name' => $user?->name ?? $request->submitter_name,
            'submitter_email' => $user?->email ?? $request->submitter_email,
            'type' => $request->type,
            'subject' => $request->subject,
            'description' => $request->description,
            'status' => SupportTicketStatus::Open,
        ]);

        // Notify submitter
        Notification::route('mail', $ticket->submitter_email)
            ->notify(new SupportTicketReceived($ticket));

        // Notify all admins
        User::role('admin')->each(fn (User $admin) => $admin->notify(new SupportTicketReceived($ticket)));

        if ($user) {
            return redirect()->route('support.tickets.show', $ticket)
                ->with('success', "Request submitted — {$ticket->reference()}");
        }

        return back()->with('success', "Request submitted — {$ticket->reference()}. We'll email you at {$ticket->submitter_email}.");
    }

    public function index(): Response
    {
        $tickets = auth()->user()
            ->supportTickets()
            ->latest()
            ->get(['id', 'type', 'subject', 'status', 'created_at']);

        return Inertia::render('Support/Index', ['tickets' => $tickets]);
    }

    public function show(SupportTicket $ticket): Response
    {
        $this->authorize('view', $ticket);

        $ticket->load(['replies.author']);

        return Inertia::render('Support/Show', ['ticket' => $ticket]);
    }
}
```

- [ ] **Step 7.3: Add supportTickets relationship to User model**

Open `app/Models/User.php` and add:

```php
public function supportTickets(): HasMany
{
    return $this->hasMany(SupportTicket::class);
}
```

Also add the import at the top: `use Illuminate\Database\Eloquent\Relations\HasMany;`

- [ ] **Step 7.4: Implement SupportTicketReplyController**

```php
<?php

namespace App\Http\Controllers;

use App\Enums\SupportTicketStatus;
use App\Http\Requests\StoreSupportTicketReplyRequest;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Notifications\SupportTicketReplied;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Notification;

class SupportTicketReplyController extends Controller
{
    public function store(StoreSupportTicketReplyRequest $request, SupportTicket $ticket): RedirectResponse
    {
        $this->authorize('reply', $ticket);

        if ($ticket->status === SupportTicketStatus::Closed) {
            throw ValidationException::withMessages([
                'message' => 'This ticket is closed and cannot receive new replies.',
            ]);
        }

        $reply = SupportTicketReply::create([
            'support_ticket_id' => $ticket->id,
            'author_id' => $request->user()->id,
            'is_staff_reply' => false,
            'message' => $request->message,
        ]);

        // Notify assigned admin (fallback to all admins)
        $recipients = $ticket->assigned_admin_id
            ? User::where('id', $ticket->assigned_admin_id)->get()
            : User::role('admin')->get();

        Notification::send($recipients, new SupportTicketReplied($ticket, $reply));

        return back()->with('success', 'Reply sent.');
    }
}
```

- [ ] **Step 7.5: Implement Admin\SupportController**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSupportTicketRequest;
use App\Models\SupportTicket;
use App\Models\User;
use App\Notifications\SupportTicketUpdated;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function index(): Response
    {
        $tickets = SupportTicket::query()
            ->with(['user', 'assignedAdmin'])
            ->when(request('status'), fn ($q, $v) => $q->where('status', $v))
            ->when(request('type'), fn ($q, $v) => $q->where('type', $v))
            ->when(request('assigned'), fn ($q, $v) => $q->where('assigned_admin_id', $v))
            ->latest()
            ->paginate(25);

        $admins = User::role('admin')->get(['id', 'name']);

        return Inertia::render('Admin/Support/Index', [
            'tickets' => $tickets,
            'admins' => $admins,
            'filters' => request()->only(['status', 'type', 'assigned']),
        ]);
    }

    public function show(SupportTicket $ticket): Response
    {
        $ticket->load(['user', 'assignedAdmin', 'replies.author']);
        $admins = User::role('admin')->get(['id', 'name']);

        return Inertia::render('Admin/Support/Show', [
            'ticket' => $ticket,
            'admins' => $admins,
        ]);
    }

    public function update(UpdateSupportTicketRequest $request, SupportTicket $ticket): RedirectResponse
    {
        $ticket->update($request->only('status', 'assigned_admin_id'));

        Notification::route('mail', $ticket->submitter_email)
            ->notify(new SupportTicketUpdated($ticket));

        return back()->with('success', 'Ticket updated.');
    }
}
```

- [ ] **Step 7.6: Implement Admin\SupportTicketReplyController**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupportTicketReplyRequest;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Notifications\SupportTicketReplied;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;

class SupportTicketReplyController extends Controller
{
    public function store(StoreSupportTicketReplyRequest $request, SupportTicket $ticket): RedirectResponse
    {
        $reply = SupportTicketReply::create([
            'support_ticket_id' => $ticket->id,
            'author_id' => $request->user()->id,
            'is_staff_reply' => true,
            'message' => $request->message,
        ]);

        Notification::route('mail', $ticket->submitter_email)
            ->notify(new SupportTicketReplied($ticket, $reply));

        return back()->with('success', 'Reply sent.');
    }
}
```

- [ ] **Step 7.7: Create routes/support.php**

```php
<?php

use App\Http\Controllers\Admin\SupportController as AdminSupportController;
use App\Http\Controllers\Admin\SupportTicketReplyController as AdminSupportTicketReplyController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\SupportTicketReplyController;
use Illuminate\Support\Facades\Route;

Route::get('/support', [SupportController::class, 'create'])->name('support.create');
Route::post('/support', [SupportController::class, 'store'])->name('support.store');

Route::middleware('auth')->group(function () {
    Route::get('/support/tickets', [SupportController::class, 'index'])->name('support.tickets.index');
    Route::get('/support/tickets/{ticket}', [SupportController::class, 'show'])->name('support.tickets.show');
    Route::post('/support/tickets/{ticket}/reply', [SupportTicketReplyController::class, 'store'])->name('support.tickets.reply');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/support', [AdminSupportController::class, 'index'])->name('support.index');
    Route::get('/support/{ticket}', [AdminSupportController::class, 'show'])->name('support.show');
    Route::patch('/support/{ticket}', [AdminSupportController::class, 'update'])->name('support.update');
    Route::post('/support/{ticket}/reply', [AdminSupportTicketReplyController::class, 'store'])->name('support.reply');
});
```

- [ ] **Step 7.8: Register routes/support.php in bootstrap/app.php**

Open `bootstrap/app.php`. In the `withRouting()` call, add:

```php
then: function () {
    Route::middleware('web')
        ->group(base_path('routes/support.php'));
},
```

If `then:` already exists, add to the existing closure. Check the current structure of the file first.

- [ ] **Step 7.9: Run pint**

```bash
vendor/bin/sail bin pint --dirty --format agent
```

- [ ] **Step 7.10: Generate Wayfinder routes**

```bash
vendor/bin/sail artisan wayfinder:generate
```

- [ ] **Step 7.11: Verify routes are registered**

```bash
vendor/bin/sail artisan route:list --path=support
```

Expected: All 8 support routes listed.

- [ ] **Step 7.12: Commit**

```bash
git add routes/support.php app/Http/Controllers/SupportController.php app/Http/Controllers/SupportTicketReplyController.php app/Http/Controllers/Admin/ app/Models/User.php bootstrap/app.php resources/js/routes/
git commit -m "feat(support): add routes, controllers, and register support route file"
```

---

## Task 8: Tests

**Files:**
- Create: `tests/Feature/SupportTest.php`

- [ ] **Step 8.1: Generate test file**

```bash
vendor/bin/sail artisan make:test SupportTest --pest --no-interaction
```

- [ ] **Step 8.2: Implement full test suite**

Replace the generated file with:

```php
<?php

use App\Enums\SupportTicketStatus;
use App\Enums\SupportTicketType;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\User;
use App\Notifications\SupportTicketReceived;
use App\Notifications\SupportTicketReplied;
use App\Notifications\SupportTicketUpdated;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Notification;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\patch;
use function Pest\Laravel\post;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeAdmin(): User
{
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    return $admin;
}

function makeTicket(array $attrs = []): SupportTicket
{
    return SupportTicket::create(array_merge([
        'submitter_name' => 'Test User',
        'submitter_email' => 'test@example.com',
        'type' => SupportTicketType::Assistance,
        'subject' => 'Help needed',
        'description' => 'I need help with something.',
        'status' => SupportTicketStatus::Open,
    ], $attrs));
}

// ── Guest submission ───────────────────────────────────────────────────────────

it('guest can submit a support ticket', function () {
    Notification::fake();

    post('/support', [
        'submitter_name' => 'John Guest',
        'submitter_email' => 'john@example.com',
        'type' => 'bug_report',
        'subject' => 'App crashes on export',
        'description' => 'When I click export the page goes blank.',
    ])->assertRedirect();

    expect(SupportTicket::count())->toBe(1);
    expect(SupportTicket::first()->user_id)->toBeNull();
});

it('guest submission fails without name or email', function () {
    post('/support', [
        'type' => 'bug_report',
        'subject' => 'Something broke',
        'description' => 'It is broken.',
    ])->assertSessionHasErrors(['submitter_name', 'submitter_email']);
});

it('guest submission fails without required ticket fields', function () {
    post('/support', [
        'submitter_name' => 'John',
        'submitter_email' => 'john@example.com',
    ])->assertSessionHasErrors(['type', 'subject', 'description']);
});

// ── Authenticated submission ──────────────────────────────────────────────────

it('authenticated user can submit a ticket without providing name or email', function () {
    Notification::fake();
    $user = User::factory()->create();

    actingAs($user)->post('/support', [
        'type' => 'feature_request',
        'subject' => 'Dark mode please',
        'description' => 'Would love a dark mode option.',
    ])->assertRedirect();

    $ticket = SupportTicket::first();
    expect($ticket->user_id)->toBe($user->id);
    expect($ticket->submitter_email)->toBe($user->email);
});

// ── User ticket tracking ───────────────────────────────────────────────────────

it('authenticated user can view their own ticket list', function () {
    $user = User::factory()->create();
    makeTicket(['user_id' => $user->id]);

    actingAs($user)->get('/support/tickets')->assertOk()->assertInertia(
        fn ($page) => $page->component('Support/Index')->has('tickets', 1)
    );
});

it('authenticated user can view their own ticket', function () {
    $user = User::factory()->create();
    $ticket = makeTicket(['user_id' => $user->id]);

    actingAs($user)->get("/support/tickets/{$ticket->id}")->assertOk()->assertInertia(
        fn ($page) => $page->component('Support/Show')
    );
});

it('authenticated user cannot view another users ticket', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $ticket = makeTicket(['user_id' => $other->id]);

    actingAs($user)->get("/support/tickets/{$ticket->id}")->assertForbidden();
});

// ── User replies ───────────────────────────────────────────────────────────────

it('authenticated user can reply to their own open ticket', function () {
    Notification::fake();
    $user = User::factory()->create();
    $ticket = makeTicket(['user_id' => $user->id]);

    actingAs($user)->post("/support/tickets/{$ticket->id}/reply", [
        'message' => 'Any update on this?',
    ])->assertRedirect();

    expect(SupportTicketReply::count())->toBe(1);
    expect(SupportTicketReply::first()->is_staff_reply)->toBeFalse();
});

it('authenticated user cannot reply to a closed ticket', function () {
    $user = User::factory()->create();
    $ticket = makeTicket(['user_id' => $user->id, 'status' => SupportTicketStatus::Closed]);

    actingAs($user)->post("/support/tickets/{$ticket->id}/reply", [
        'message' => 'Hello?',
    ])->assertSessionHasErrors('message');
});

// ── Admin access ───────────────────────────────────────────────────────────────

it('admin can view all tickets', function () {
    makeTicket();
    makeTicket();

    actingAs(makeAdmin())->get('/admin/support')->assertOk()->assertInertia(
        fn ($page) => $page->component('Admin/Support/Index')->has('tickets.data', 2)
    );
});

it('non-admin cannot access admin support panel', function () {
    $user = User::factory()->create();
    actingAs($user)->get('/admin/support')->assertForbidden();
});

it('admin can update ticket status', function () {
    Notification::fake();
    $ticket = makeTicket();

    actingAs(makeAdmin())->patch("/admin/support/{$ticket->id}", [
        'status' => 'in_progress',
        'assigned_admin_id' => null,
    ])->assertRedirect();

    expect($ticket->fresh()->status)->toBe(SupportTicketStatus::InProgress);
});

it('admin can assign ticket to themselves', function () {
    Notification::fake();
    $admin = makeAdmin();
    $ticket = makeTicket();

    actingAs($admin)->patch("/admin/support/{$ticket->id}", [
        'status' => 'in_progress',
        'assigned_admin_id' => $admin->id,
    ])->assertRedirect();

    expect($ticket->fresh()->assigned_admin_id)->toBe($admin->id);
});

it('admin can reply to any ticket', function () {
    Notification::fake();
    $ticket = makeTicket();

    actingAs(makeAdmin())->post("/admin/support/{$ticket->id}/reply", [
        'message' => 'We are looking into this.',
    ])->assertRedirect();

    $reply = SupportTicketReply::first();
    expect($reply->is_staff_reply)->toBeTrue();
});

// ── Notifications ─────────────────────────────────────────────────────────────

it('SupportTicketReceived notification is sent on ticket creation', function () {
    Notification::fake();

    post('/support', [
        'submitter_name' => 'Test',
        'submitter_email' => 'test@example.com',
        'type' => 'assistance',
        'subject' => 'Help',
        'description' => 'Need help.',
    ]);

    Notification::assertSentOnDemand(SupportTicketReceived::class);
});

it('SupportTicketUpdated notification is sent on status change', function () {
    Notification::fake();
    $ticket = makeTicket();

    actingAs(makeAdmin())->patch("/admin/support/{$ticket->id}", [
        'status' => 'resolved',
        'assigned_admin_id' => null,
    ]);

    Notification::assertSentOnDemand(SupportTicketUpdated::class);
});

it('SupportTicketReplied notification is sent to submitter when admin replies', function () {
    Notification::fake();
    $ticket = makeTicket();

    actingAs(makeAdmin())->post("/admin/support/{$ticket->id}/reply", [
        'message' => 'Here is our response.',
    ]);

    Notification::assertSentOnDemand(SupportTicketReplied::class);
});
```

- [ ] **Step 8.3: Run tests to make sure they fail (TDD check)**

```bash
vendor/bin/sail artisan test --compact --filter=SupportTest
```

Expected: Tests fail because Vue pages don't exist yet (Inertia assertions will fail). That's fine — we'll implement pages next.

- [ ] **Step 8.4: Commit tests**

```bash
git add tests/Feature/SupportTest.php
git commit -m "test(support): add full Pest test suite for support system"
```

---

## Task 9: Vue Pages

**Files:**
- Create: `resources/js/pages/Support/Create.vue`
- Create: `resources/js/pages/Support/Index.vue`
- Create: `resources/js/pages/Support/Show.vue`
- Create: `resources/js/pages/Admin/Support/Index.vue`
- Create: `resources/js/pages/Admin/Support/Show.vue`

- [ ] **Step 9.1: Create Support/Create.vue**

```vue
<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';
import PublicLayout from '@/layouts/PublicLayout.vue';

const page = usePage();
const user = page.props.auth?.user as { name: string; email: string } | null;

const types = [
    { value: 'bug_report', label: 'Bug Report', icon: '🐛', desc: 'Something is not working as expected' },
    { value: 'feature_request', label: 'Feature Request', icon: '✨', desc: 'Suggest an idea or improvement' },
    { value: 'assistance', label: 'Get Assistance', icon: '💬', desc: 'General help or questions' },
    { value: 'refund_request', label: 'Refund Request', icon: '💳', desc: 'Request a refund for your subscription' },
];

const form = useForm({
    type: '' as string,
    subject: '',
    description: '',
    submitter_name: '',
    submitter_email: '',
});

const submitted = ref(false);
const ticketRef = ref('');

function selectType(value: string) {
    form.type = value;
}

function submit() {
    form.post('/support', {
        onSuccess: () => {
            if (!user) {
                submitted.value = true;
                ticketRef.value = (page.props.flash as any)?.success ?? '';
            }
        },
    });
}
</script>

<template>
    <Head title="Support — Polsh" />
    <PublicLayout>
        <div class="support-page">
            <div class="support-container">
                <div class="support-header">
                    <h1 class="support-title">How can we help?</h1>
                    <p class="support-sub">We typically respond within 1–2 business days.</p>
                </div>

                <!-- Guest success state -->
                <div v-if="submitted" class="support-success">
                    <div class="success-icon">✓</div>
                    <h2 class="success-heading">Request received</h2>
                    <p class="success-msg">{{ ticketRef }}</p>
                    <p class="success-note">We'll follow up at your email address.</p>
                </div>

                <form v-else class="support-form" @submit.prevent="submit">
                    <!-- Flash success for auth users -->
                    <div v-if="$page.props.flash?.success" class="flash-success">
                        {{ $page.props.flash.success }}
                    </div>

                    <!-- Type selector -->
                    <div class="field-group">
                        <label class="field-label">What do you need help with?</label>
                        <div class="type-grid">
                            <button
                                v-for="t in types"
                                :key="t.value"
                                type="button"
                                class="type-card"
                                :class="{ 'type-card--active': form.type === t.value }"
                                @click="selectType(t.value)"
                            >
                                <span class="type-icon">{{ t.icon }}</span>
                                <span class="type-label">{{ t.label }}</span>
                                <span class="type-desc">{{ t.desc }}</span>
                            </button>
                        </div>
                        <p v-if="form.errors.type" class="field-error">{{ form.errors.type }}</p>
                    </div>

                    <!-- Guest fields -->
                    <template v-if="!user">
                        <div class="field-row">
                            <div class="field-group">
                                <label class="field-label" for="submitter_name">Your name</label>
                                <input id="submitter_name" v-model="form.submitter_name" class="field-input" type="text" placeholder="Full name" required />
                                <p v-if="form.errors.submitter_name" class="field-error">{{ form.errors.submitter_name }}</p>
                            </div>
                            <div class="field-group">
                                <label class="field-label" for="submitter_email">Email address</label>
                                <input id="submitter_email" v-model="form.submitter_email" class="field-input" type="email" placeholder="you@example.com" required />
                                <p v-if="form.errors.submitter_email" class="field-error">{{ form.errors.submitter_email }}</p>
                            </div>
                        </div>
                    </template>

                    <!-- Auth user info -->
                    <div v-else class="submitter-info">
                        Submitting as <strong>{{ user.name }}</strong> ({{ user.email }})
                    </div>

                    <!-- Subject -->
                    <div class="field-group">
                        <label class="field-label" for="subject">Subject</label>
                        <input id="subject" v-model="form.subject" class="field-input" type="text" placeholder="Brief summary of your request" required />
                        <p v-if="form.errors.subject" class="field-error">{{ form.errors.subject }}</p>
                    </div>

                    <!-- Description -->
                    <div class="field-group">
                        <label class="field-label" for="description">Description</label>
                        <textarea id="description" v-model="form.description" class="field-textarea" rows="6" placeholder="Please provide as much detail as possible..." required />
                        <p v-if="form.errors.description" class="field-error">{{ form.errors.description }}</p>
                    </div>

                    <button type="submit" class="submit-btn" :disabled="form.processing || !form.type">
                        {{ form.processing ? 'Sending...' : 'Submit request' }}
                    </button>
                </form>
            </div>
        </div>
    </PublicLayout>
</template>

<style scoped>
.support-page { padding: 4rem 0 6rem; }
.support-container { max-width: 42rem; margin: 0 auto; padding: 0 1.5rem; }
.support-header { margin-bottom: 2.5rem; }
.support-title { font-family: 'DM Sans', sans-serif; font-size: clamp(1.75rem, 4vw, 2.25rem); font-weight: 700; color: #f0f0f2; letter-spacing: -0.035em; margin: 0 0 0.5rem; }
.support-sub { font-family: 'DM Sans', sans-serif; font-size: 1rem; color: #6a6a7a; margin: 0; }
.support-form { display: flex; flex-direction: column; gap: 1.5rem; }
.support-success { text-align: center; padding: 3rem 2rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; background: #111114; }
.success-icon { font-size: 2rem; color: #e0ff4f; margin-bottom: 1rem; }
.success-heading { font-family: 'DM Sans', sans-serif; font-size: 1.25rem; font-weight: 600; color: #f0f0f2; margin: 0 0 0.5rem; }
.success-msg { font-family: 'DM Mono', monospace; font-size: 0.875rem; color: #e0ff4f; margin: 0 0 0.5rem; }
.success-note { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; margin: 0; }
.flash-success { background: rgba(224,255,79,0.08); border: 1px solid rgba(224,255,79,0.2); color: #e0ff4f; padding: 0.75rem 1rem; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; }
.field-group { display: flex; flex-direction: column; gap: 0.5rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field-label { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #6a6a7a; text-transform: uppercase; letter-spacing: 0.08em; }
.field-input, .field-textarea { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.625rem 0.875rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; outline: none; transition: border-color 0.15s ease; width: 100%; box-sizing: border-box; }
.field-input:focus, .field-textarea:focus { border-color: rgba(224,255,79,0.4); }
.field-textarea { resize: vertical; }
.field-error { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #ff6b6b; margin: 0; }
.type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.type-card { display: flex; flex-direction: column; gap: 0.25rem; padding: 1rem; background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; text-align: left; transition: border-color 0.15s ease, background 0.15s ease; }
.type-card--active { border-color: rgba(224,255,79,0.5); background: rgba(224,255,79,0.04); }
.type-icon { font-size: 1.25rem; }
.type-label { font-family: 'DM Mono', monospace; font-size: 0.875rem; color: #f0f0f2; }
.type-desc { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #6a6a7a; }
.submitter-info { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
.submitter-info strong { color: #f0f0f2; }
.submit-btn { font-family: 'DM Mono', monospace; font-size: 0.875rem; font-weight: 500; background: #e0ff4f; color: #0a0a0c; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; transition: opacity 0.15s ease; align-self: flex-start; }
.submit-btn:hover:not(:disabled) { opacity: 0.88; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 600px) { .type-grid, .field-row { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 9.2: Create Support/Index.vue**

```vue
<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';

const props = defineProps<{
    tickets: Array<{
        id: number;
        type: string;
        subject: string;
        status: string;
        created_at: string;
    }>;
}>();

const statusColors: Record<string, string> = {
    open: '#6a6a7a',
    in_progress: '#e0ff4f',
    resolved: '#4fff8a',
    closed: '#3a3a4a',
};

const typeLabels: Record<string, string> = {
    bug_report: 'Bug Report',
    feature_request: 'Feature Request',
    assistance: 'Assistance',
    refund_request: 'Refund',
};
</script>

<template>
    <Head title="My Support Tickets" />
    <AppLayout>
        <div class="tickets-page">
            <div class="tickets-header">
                <h1 class="tickets-title">My Support Tickets</h1>
                <Link href="/support" class="new-ticket-btn">New request</Link>
            </div>

            <div v-if="tickets.length === 0" class="empty-state">
                <p class="empty-text">No support requests yet.</p>
                <Link href="/support" class="new-ticket-btn">Submit a request</Link>
            </div>

            <div v-else class="tickets-list">
                <Link
                    v-for="ticket in tickets"
                    :key="ticket.id"
                    :href="`/support/tickets/${ticket.id}`"
                    class="ticket-row"
                >
                    <span class="ticket-type">{{ typeLabels[ticket.type] ?? ticket.type }}</span>
                    <span class="ticket-subject">{{ ticket.subject }}</span>
                    <span class="ticket-status" :style="{ color: statusColors[ticket.status] }">
                        {{ ticket.status.replace('_', ' ') }}
                    </span>
                    <span class="ticket-date">{{ new Date(ticket.created_at).toLocaleDateString() }}</span>
                </Link>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.tickets-page { max-width: 56rem; margin: 0 auto; padding: 2rem 1.5rem; }
.tickets-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
.tickets-title { font-family: 'DM Sans', sans-serif; font-size: 1.5rem; font-weight: 600; color: #f0f0f2; letter-spacing: -0.025em; margin: 0; }
.new-ticket-btn { font-family: 'DM Mono', monospace; font-size: 0.8125rem; background: #e0ff4f; color: #0a0a0c; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0; }
.empty-text { font-family: 'DM Sans', sans-serif; color: #6a6a7a; margin: 0; }
.tickets-list { display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
.ticket-row { display: grid; grid-template-columns: 130px 1fr 110px 100px; align-items: center; gap: 1rem; padding: 1rem 1.25rem; background: #111114; border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; transition: background 0.1s ease; }
.ticket-row:last-child { border-bottom: none; }
.ticket-row:hover { background: #141417; }
.ticket-type { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #6a6a7a; text-transform: uppercase; letter-spacing: 0.06em; }
.ticket-subject { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #f0f0f2; }
.ticket-status { font-family: 'DM Mono', monospace; font-size: 0.75rem; text-transform: capitalize; text-align: right; }
.ticket-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; text-align: right; }
</style>
```

- [ ] **Step 9.3: Create Support/Show.vue**

```vue
<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';

const props = defineProps<{
    ticket: {
        id: number;
        type: string;
        subject: string;
        description: string;
        status: string;
        submitter_name: string;
        created_at: string;
        replies: Array<{
            id: number;
            is_staff_reply: boolean;
            message: string;
            created_at: string;
            author: { name: string } | null;
        }>;
    };
}>();

const isClosed = props.ticket.status === 'closed';

const form = useForm({ message: '' });

function submitReply() {
    form.post(`/support/tickets/${props.ticket.id}/reply`, {
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
    <Head :title="`${ticket.subject} — Support`" />
    <AppLayout>
        <div class="show-page">
            <!-- Ticket header -->
            <div class="ticket-header">
                <div class="ticket-meta">
                    <span class="ticket-ref">#POLSH-{{ ticket.id }}</span>
                    <span class="ticket-status" :class="`status--${ticket.status}`">
                        {{ ticket.status.replace('_', ' ') }}
                    </span>
                </div>
                <h1 class="ticket-subject">{{ ticket.subject }}</h1>
                <p class="ticket-desc">{{ ticket.description }}</p>
            </div>

            <!-- Reply thread -->
            <div class="reply-thread">
                <div
                    v-for="reply in ticket.replies"
                    :key="reply.id"
                    class="reply"
                    :class="{ 'reply--staff': reply.is_staff_reply }"
                >
                    <div class="reply-header">
                        <span class="reply-author">
                            {{ reply.is_staff_reply ? 'Polsh Support' : (reply.author?.name ?? 'You') }}
                        </span>
                        <span class="reply-date">{{ new Date(reply.created_at).toLocaleDateString() }}</span>
                    </div>
                    <p class="reply-message">{{ reply.message }}</p>
                </div>
            </div>

            <!-- Reply form -->
            <div class="reply-form-wrap">
                <div v-if="isClosed" class="closed-note">
                    This ticket is closed. Open a new request if you need further help.
                </div>
                <form v-else @submit.prevent="submitReply" class="reply-form">
                    <textarea
                        v-model="form.message"
                        class="reply-textarea"
                        rows="4"
                        placeholder="Write a reply..."
                        required
                    />
                    <p v-if="form.errors.message" class="field-error">{{ form.errors.message }}</p>
                    <button type="submit" class="reply-btn" :disabled="form.processing">
                        {{ form.processing ? 'Sending...' : 'Send reply' }}
                    </button>
                </form>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.show-page { max-width: 48rem; margin: 0 auto; padding: 2rem 1.5rem 4rem; display: flex; flex-direction: column; gap: 2rem; }
.ticket-header { border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; background: #111114; }
.ticket-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.875rem; }
.ticket-ref { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #e0ff4f; }
.ticket-status { font-family: 'DM Mono', monospace; font-size: 0.75rem; text-transform: capitalize; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: #8a8a9a; }
.status--open { color: #8a8a9a; }
.status--in_progress { color: #e0ff4f; }
.status--resolved { color: #4fff8a; }
.status--closed { color: #4a4a5a; }
.ticket-subject { font-family: 'DM Sans', sans-serif; font-size: 1.25rem; font-weight: 600; color: #f0f0f2; letter-spacing: -0.025em; margin: 0 0 0.75rem; }
.ticket-desc { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #8a8a9a; line-height: 1.65; margin: 0; white-space: pre-wrap; }
.reply-thread { display: flex; flex-direction: column; gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
.reply { padding: 1.25rem 1.5rem; background: #111114; }
.reply--staff { border-left: 3px solid rgba(224,255,79,0.4); background: rgba(224,255,79,0.02); }
.reply-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.625rem; }
.reply-author { font-family: 'DM Mono', monospace; font-size: 0.8125rem; color: #f0f0f2; }
.reply-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; }
.reply-message { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #8a8a9a; line-height: 1.65; margin: 0; white-space: pre-wrap; }
.reply-form-wrap { }
.closed-note { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; padding: 1rem 1.25rem; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; background: #111114; }
.reply-form { display: flex; flex-direction: column; gap: 0.75rem; }
.reply-textarea { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem 1rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; outline: none; resize: vertical; width: 100%; box-sizing: border-box; }
.reply-textarea:focus { border-color: rgba(224,255,79,0.4); }
.field-error { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #ff6b6b; margin: 0; }
.reply-btn { font-family: 'DM Mono', monospace; font-size: 0.8125rem; background: #e0ff4f; color: #0a0a0c; padding: 0.625rem 1.25rem; border-radius: 7px; border: none; cursor: pointer; align-self: flex-start; }
.reply-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
```

- [ ] **Step 9.4: Create Admin/Support/Index.vue**

```vue
<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { ref } from 'vue';

const props = defineProps<{
    tickets: {
        data: Array<{
            id: number;
            type: string;
            subject: string;
            status: string;
            submitter_name: string;
            assigned_admin_id: number | null;
            updated_at: string;
            assigned_admin: { name: string } | null;
        }>;
        current_page: number;
        last_page: number;
    };
    admins: Array<{ id: number; name: string }>;
    filters: { status?: string; type?: string; assigned?: string };
}>();

const statusColors: Record<string, string> = {
    open: '#8a8a9a',
    in_progress: '#e0ff4f',
    resolved: '#4fff8a',
    closed: '#3a3a4a',
};

const typeLabels: Record<string, string> = {
    bug_report: 'Bug', feature_request: 'Feature', assistance: 'Assist', refund_request: 'Refund',
};

const statusFilter = ref(props.filters.status ?? '');
const typeFilter = ref(props.filters.type ?? '');

function applyFilters() {
    router.get('/admin/support', {
        status: statusFilter.value || undefined,
        type: typeFilter.value || undefined,
    }, { preserveState: true, replace: true });
}
</script>

<template>
    <Head title="Admin — Support Tickets" />
    <AppLayout>
        <div class="admin-page">
            <div class="admin-header">
                <h1 class="admin-title">Support Tickets</h1>
                <div class="filters">
                    <select v-model="statusFilter" class="filter-select" @change="applyFilters">
                        <option value="">All statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select v-model="typeFilter" class="filter-select" @change="applyFilters">
                        <option value="">All types</option>
                        <option value="bug_report">Bug Report</option>
                        <option value="feature_request">Feature Request</option>
                        <option value="assistance">Assistance</option>
                        <option value="refund_request">Refund Request</option>
                    </select>
                </div>
            </div>

            <div class="tickets-table">
                <div class="table-header">
                    <span>Submitter</span>
                    <span>Type</span>
                    <span>Subject</span>
                    <span>Status</span>
                    <span>Assigned</span>
                    <span>Updated</span>
                </div>
                <Link
                    v-for="ticket in tickets.data"
                    :key="ticket.id"
                    :href="`/admin/support/${ticket.id}`"
                    class="table-row"
                >
                    <span class="cell-name">{{ ticket.submitter_name }}</span>
                    <span class="cell-type">{{ typeLabels[ticket.type] ?? ticket.type }}</span>
                    <span class="cell-subject">{{ ticket.subject }}</span>
                    <span class="cell-status" :style="{ color: statusColors[ticket.status] }">{{ ticket.status.replace('_', ' ') }}</span>
                    <span class="cell-assigned">{{ ticket.assigned_admin?.name ?? '—' }}</span>
                    <span class="cell-date">{{ new Date(ticket.updated_at).toLocaleDateString() }}</span>
                </Link>
            </div>

            <!-- Pagination -->
            <div v-if="tickets.last_page > 1" class="pagination">
                <span class="page-info">Page {{ tickets.current_page }} of {{ tickets.last_page }}</span>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.admin-page { max-width: 72rem; margin: 0 auto; padding: 2rem 1.5rem; }
.admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.admin-title { font-family: 'DM Sans', sans-serif; font-size: 1.5rem; font-weight: 600; color: #f0f0f2; letter-spacing: -0.025em; margin: 0; }
.filters { display: flex; gap: 0.75rem; }
.filter-select { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 7px; padding: 0.4375rem 0.875rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none; cursor: pointer; }
.tickets-table { border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
.table-header { display: grid; grid-template-columns: 140px 80px 1fr 110px 120px 90px; gap: 1rem; padding: 0.75rem 1.25rem; background: #0e0e11; border-bottom: 1px solid rgba(255,255,255,0.07); }
.table-header span { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #4a4a5a; text-transform: uppercase; letter-spacing: 0.1em; }
.table-row { display: grid; grid-template-columns: 140px 80px 1fr 110px 120px 90px; gap: 1rem; padding: 0.875rem 1.25rem; background: #111114; border-bottom: 1px solid rgba(255,255,255,0.04); text-decoration: none; transition: background 0.1s ease; align-items: center; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #141417; }
.cell-name { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #f0f0f2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-type { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #6a6a7a; }
.cell-subject { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #c0c0d0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-status { font-family: 'DM Mono', monospace; font-size: 0.75rem; text-transform: capitalize; }
.cell-assigned { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; }
.pagination { display: flex; justify-content: center; padding: 1.5rem 0; }
.page-info { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #6a6a7a; }
</style>
```

- [ ] **Step 9.5: Create Admin/Support/Show.vue**

```vue
<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { ref } from 'vue';

const props = defineProps<{
    ticket: {
        id: number;
        type: string;
        subject: string;
        description: string;
        status: string;
        submitter_name: string;
        submitter_email: string;
        assigned_admin_id: number | null;
        created_at: string;
        replies: Array<{
            id: number;
            is_staff_reply: boolean;
            message: string;
            created_at: string;
            author: { name: string } | null;
        }>;
    };
    admins: Array<{ id: number; name: string }>;
}>();

const statusForm = useForm({
    status: props.ticket.status,
    assigned_admin_id: props.ticket.assigned_admin_id,
});

const replyForm = useForm({ message: '' });

function saveStatus() {
    statusForm.patch(`/admin/support/${props.ticket.id}`, { preserveScroll: true });
}

function submitReply() {
    replyForm.post(`/admin/support/${props.ticket.id}/reply`, {
        preserveScroll: true,
        onSuccess: () => replyForm.reset(),
    });
}
</script>

<template>
    <Head :title="`#POLSH-${ticket.id} — Admin Support`" />
    <AppLayout>
        <div class="admin-show">
            <!-- Left column: thread -->
            <div class="thread-col">
                <div class="ticket-header">
                    <div class="ticket-meta">
                        <span class="ticket-ref">#POLSH-{{ ticket.id }}</span>
                        <span class="ticket-type-badge">{{ ticket.type.replace('_', ' ') }}</span>
                    </div>
                    <h1 class="ticket-subject">{{ ticket.subject }}</h1>
                    <div class="ticket-submitter">From: {{ ticket.submitter_name }} ({{ ticket.submitter_email }})</div>
                    <p class="ticket-desc">{{ ticket.description }}</p>
                </div>

                <div class="reply-thread">
                    <div
                        v-for="reply in ticket.replies"
                        :key="reply.id"
                        class="reply"
                        :class="{ 'reply--staff': reply.is_staff_reply }"
                    >
                        <div class="reply-header">
                            <span class="reply-author">{{ reply.is_staff_reply ? 'Polsh Support' : (reply.author?.name ?? ticket.submitter_name) }}</span>
                            <span class="reply-date">{{ new Date(reply.created_at).toLocaleDateString() }}</span>
                        </div>
                        <p class="reply-msg">{{ reply.message }}</p>
                    </div>
                </div>

                <!-- Admin reply form -->
                <form @submit.prevent="submitReply" class="reply-form">
                    <div class="reply-form-label">Staff reply</div>
                    <textarea v-model="replyForm.message" class="reply-textarea" rows="5" placeholder="Write a response..." required />
                    <p v-if="replyForm.errors.message" class="field-error">{{ replyForm.errors.message }}</p>
                    <button type="submit" class="reply-btn" :disabled="replyForm.processing">
                        {{ replyForm.processing ? 'Sending...' : 'Send reply' }}
                    </button>
                </form>
            </div>

            <!-- Right column: metadata -->
            <div class="meta-col">
                <div class="meta-card">
                    <h2 class="meta-heading">Manage</h2>

                    <div class="meta-field">
                        <label class="meta-label">Status</label>
                        <select v-model="statusForm.status" class="meta-select">
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div class="meta-field">
                        <label class="meta-label">Assigned to</label>
                        <select v-model="statusForm.assigned_admin_id" class="meta-select">
                            <option :value="null">Unassigned</option>
                            <option v-for="admin in admins" :key="admin.id" :value="admin.id">{{ admin.name }}</option>
                        </select>
                    </div>

                    <button class="save-btn" :disabled="statusForm.processing" @click="saveStatus">
                        {{ statusForm.processing ? 'Saving...' : 'Save changes' }}
                    </button>
                </div>

                <div class="meta-card">
                    <h2 class="meta-heading">Submitter</h2>
                    <p class="meta-text">{{ ticket.submitter_name }}</p>
                    <p class="meta-email">{{ ticket.submitter_email }}</p>
                    <p class="meta-date">Submitted {{ new Date(ticket.created_at).toLocaleDateString() }}</p>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.admin-show { max-width: 72rem; margin: 0 auto; padding: 2rem 1.5rem; display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }
.thread-col { display: flex; flex-direction: column; gap: 1.5rem; }
.ticket-header { border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; background: #111114; }
.ticket-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.ticket-ref { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #e0ff4f; }
.ticket-type-badge { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #6a6a7a; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 4px; }
.ticket-subject { font-family: 'DM Sans', sans-serif; font-size: 1.25rem; font-weight: 600; color: #f0f0f2; letter-spacing: -0.025em; margin: 0 0 0.5rem; }
.ticket-submitter { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #6a6a7a; margin-bottom: 0.875rem; }
.ticket-desc { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #8a8a9a; line-height: 1.65; margin: 0; white-space: pre-wrap; }
.reply-thread { display: flex; flex-direction: column; gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
.reply { padding: 1.25rem 1.5rem; background: #111114; }
.reply--staff { border-left: 3px solid rgba(224,255,79,0.4); background: rgba(224,255,79,0.02); }
.reply-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.625rem; }
.reply-author { font-family: 'DM Mono', monospace; font-size: 0.8125rem; color: #f0f0f2; }
.reply-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; }
.reply-msg { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #8a8a9a; line-height: 1.65; margin: 0; white-space: pre-wrap; }
.reply-form { display: flex; flex-direction: column; gap: 0.75rem; }
.reply-form-label { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #4a4a5a; text-transform: uppercase; letter-spacing: 0.08em; }
.reply-textarea { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem 1rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; outline: none; resize: vertical; width: 100%; box-sizing: border-box; }
.reply-textarea:focus { border-color: rgba(224,255,79,0.4); }
.field-error { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #ff6b6b; margin: 0; }
.reply-btn { font-family: 'DM Mono', monospace; font-size: 0.8125rem; background: #e0ff4f; color: #0a0a0c; padding: 0.625rem 1.25rem; border-radius: 7px; border: none; cursor: pointer; align-self: flex-start; }
.reply-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.meta-col { display: flex; flex-direction: column; gap: 1rem; }
.meta-card { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }
.meta-heading { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #4a4a5a; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
.meta-field { display: flex; flex-direction: column; gap: 0.375rem; }
.meta-label { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #6a6a7a; }
.meta-select { background: #0e0e11; border: 1px solid rgba(255,255,255,0.08); border-radius: 7px; padding: 0.5rem 0.75rem; color: #f0f0f2; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none; width: 100%; }
.save-btn { font-family: 'DM Mono', monospace; font-size: 0.8125rem; background: rgba(255,255,255,0.07); color: #f0f0f2; border: 1px solid rgba(255,255,255,0.1); padding: 0.5625rem 1rem; border-radius: 7px; cursor: pointer; align-self: stretch; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.meta-text { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #f0f0f2; margin: 0; }
.meta-email { font-family: 'DM Mono', monospace; font-size: 0.8125rem; color: #6a6a7a; margin: 0; }
.meta-date { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #4a4a5a; margin: 0; }
@media (max-width: 900px) { .admin-show { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 9.6: Build frontend**

```bash
vendor/bin/sail npm run build
```

Expected: builds without errors.

- [ ] **Step 9.7: Commit pages**

```bash
git add resources/js/pages/Support/ resources/js/pages/Admin/
git commit -m "feat(support): add all 5 Vue pages for user and admin ticket management"
```

---

## Task 10: Navigation and Legal Page Updates

**Files:**
- Modify: `resources/js/layouts/PublicLayout.vue`
- Modify: `resources/js/layouts/settings/Layout.vue`
- Modify: `resources/js/pages/legal/Terms.vue`
- Modify: `resources/js/pages/legal/Refund.vue`
- Modify: `resources/js/pages/legal/Privacy.vue`

- [ ] **Step 10.1: Add Support link to PublicLayout.vue footer**

Open `resources/js/layouts/PublicLayout.vue`. In the Legal footer column, add before Terms of Service:

```html
<Link href="/support" class="pub-footer-link">Support</Link>
```

- [ ] **Step 10.2: Add Support link to settings sidebar**

Open `resources/js/layouts/settings/Layout.vue`. Add a support nav item (look at existing nav item pattern and follow it). Add after the existing nav items or in a logical position:

```html
<Link href="/support" class="...existing class...">Support</Link>
```

Match the exact class names used by sibling nav items.

- [ ] **Step 10.3: Replace mailto links in Terms.vue**

In `resources/js/pages/legal/Terms.vue`, replace:
```html
<a href="mailto:support@polsh.work">support@polsh.work</a>
```
with:
```html
<Link href="/support">our support page</Link>
```

- [ ] **Step 10.4: Replace mailto links in Refund.vue**

In `resources/js/pages/legal/Refund.vue`, replace all `mailto:support@polsh.work` references with a link to `/support`.

- [ ] **Step 10.5: Replace mailto links in Privacy.vue**

In `resources/js/pages/legal/Privacy.vue`, replace `mailto:privacy@polsh.work` references with a link to `/support`.

- [ ] **Step 10.6: Build and verify links render**

```bash
vendor/bin/sail npm run build
```

- [ ] **Step 10.7: Commit**

```bash
git add resources/js/layouts/PublicLayout.vue resources/js/layouts/settings/Layout.vue resources/js/pages/legal/
git commit -m "feat(support): add support links to nav, footer, and legal pages"
```

---

## Task 11: Run Full Test Suite

- [ ] **Step 11.1: Run all support tests**

```bash
vendor/bin/sail artisan test --compact --filter=SupportTest
```

Expected: All tests pass.

- [ ] **Step 11.2: Run full test suite to catch regressions**

```bash
vendor/bin/sail artisan test --compact
```

Expected: All tests pass (including the 4 existing LegalPagesTest tests).

- [ ] **Step 11.3: Run pint**

```bash
vendor/bin/sail bin pint --dirty --format agent
```

- [ ] **Step 11.4: Final commit**

```bash
git add -A
git commit -m "feat(support): complete support ticket system implementation"
```

---

## Verification

After all tasks complete:

- [ ] `/support` renders the public form (guest + auth)
- [ ] Guest submission creates a ticket with `user_id = null`
- [ ] Auth submission creates a ticket linked to the user
- [ ] `/support/tickets` lists the user's own tickets
- [ ] `/support/tickets/{id}` shows ticket detail with replies
- [ ] `/admin/support` accessible only with `admin` role
- [ ] Admin can update status and assign tickets
- [ ] Admin can post staff replies
- [ ] User can reply to open tickets
- [ ] User cannot reply to closed tickets (422)
- [ ] Notifications dispatched to queue on all key events
- [ ] Support link appears in PublicLayout footer and settings sidebar
- [ ] Legal pages link to `/support` instead of `mailto:`
- [ ] `php artisan db:seed --class=ProductionSeeder` creates admin user from .env
- [ ] All tests pass
