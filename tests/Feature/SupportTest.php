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
