<?php

use App\Models\Preset;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Notifications\TeamInvitationNotification;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('settings page shows null team state for users without a current team', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('teams.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teams/Settings')
            ->where('team', null)
            ->has('members', 0)
            ->has('teamPresets', 0)
            ->where('pendingInvitations', []),
        );
});

test('settings page includes empty pending invitations for existing team members', function () {
    $owner = User::factory()->create(['plan' => 'pro']);
    createManagedTeam($owner);

    $this->actingAs($owner)
        ->get(route('teams.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teams/Settings')
            ->where('pendingInvitations', []),
        );
});

test('settings page shows team members and team presets for current team members', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $team = createManagedTeam($owner, [
        'name' => 'Studio Team',
        'slug' => 'studio-team',
    ]);

    attachUserToManagedTeam($team, $member, 'member', now()->subHour());

    $preset = Preset::create([
        'user_id' => $owner->id,
        'team_id' => $team->id,
        'name' => 'Warm Editorial',
        'style_slug' => 'warm-editorial',
        'customizations' => [
            'temperature' => 12,
            'grain' => 4,
        ],
    ]);

    $response = $this->actingAs($member)
        ->get(route('teams.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teams/Settings')
            ->has('team')
            ->has('members', 2)
            ->has('teamPresets', 1),
        );

    expect($response->inertiaProps('team'))->toMatchArray([
        'id' => $team->id,
        'name' => 'Studio Team',
        'slug' => 'studio-team',
        'owner_id' => $owner->id,
    ]);

    expect(collect($response->inertiaProps('members'))->map(fn (array $teamMember): array => [
        'id' => $teamMember['id'],
        'email' => $teamMember['email'],
        'role' => $teamMember['role'],
    ])->all())->toEqualCanonicalizing([
        [
            'id' => $owner->id,
            'email' => $owner->email,
            'role' => 'owner',
        ],
        [
            'id' => $member->id,
            'email' => $member->email,
            'role' => 'member',
        ],
    ]);

    expect($response->inertiaProps('teamPresets'))->toEqual([
        [
            'id' => $preset->id,
            'name' => 'Warm Editorial',
            'style_slug' => 'warm-editorial',
            'user_name' => $owner->name,
            'customizations' => [
                'temperature' => 12,
                'grain' => 4,
            ],
        ],
    ]);
});

test('pro users can create a team and are attached as owner', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    $this->actingAs($user)
        ->post(route('teams.store'), ['name' => 'Launch Crew'])
        ->assertRedirect(route('teams.settings'));

    $team = Team::query()->sole();

    expect($team->name)->toBe('Launch Crew')
        ->and($team->owner_id)->toBe($user->id)
        ->and($team->slug)->toStartWith('launch-crew-');

    $membership = $team->users()->whereKey($user)->first();

    expect($membership)->not->toBeNull()
        ->and($membership->pivot->role)->toBe('owner')
        ->and($membership->pivot->joined_at)->not->toBeNull();
});

test('non pro users are forbidden from creating a team', function () {
    $user = User::factory()->create(['plan' => 'free']);

    $this->actingAs($user)
        ->post(route('teams.store'), ['name' => 'No Access'])
        ->assertForbidden();

    expect(Team::query()->count())->toBe(0);
});

test('non pro users cannot spoof team creation access through request input', function () {
    $user = User::factory()->create(['plan' => 'free']);

    $this->actingAs($user)
        ->post(route('teams.store'), ['name' => 'No Access', 'isPro' => true])
        ->assertForbidden();

    expect(Team::query()->count())->toBe(0);
});

test('team owners can invite by email and a notification is dispatched', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $team = createManagedTeam($owner, ['name' => 'Invite Team']);

    $this->actingAs($owner)
        ->post(route('teams.invite', $team), ['email' => 'invitee@example.com'])
        ->assertRedirect(route('teams.settings'))
        ->assertSessionHas('invited', true);

    $invitation = TeamInvitation::query()->sole();

    expect($invitation->team_id)->toBe($team->id)
        ->and($invitation->email)->toBe('invitee@example.com')
        ->and($invitation->accepted_at)->toBeNull()
        ->and($invitation->expires_at)->not->toBeNull();

    Notification::assertSentOnDemand(
        TeamInvitationNotification::class,
        function (TeamInvitationNotification $notification, array $channels, object $notifiable) use ($team, $invitation): bool {
            return $channels === ['mail']
                && $notifiable->routes['mail'] === 'invitee@example.com'
                && $notification->team->is($team)
                && $notification->invitation->is($invitation);
        }
    );
});

test('team invitation notification addresses the invitee when rendered as mail', function () {
    Mail::fake();

    $owner = User::factory()->create();
    $team = createManagedTeam($owner, ['name' => 'Invite Team']);
    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => 'invitee@example.com',
        'token' => 'recipient-token',
        'expires_at' => now()->addDay(),
    ]);

    $notifiable = (new AnonymousNotifiable)->route('mail', $invitation->email);
    $mail = new TeamInvitationNotification($team, $invitation)->toMail($notifiable);

    expect($mail->hasTo($invitation->email))->toBeTrue();
});

test('settings page returns pending invitations for matching email addresses', function () {
    $user = User::factory()->create(['email' => 'invitee@example.com', 'plan' => 'pro']);
    $owner = User::factory()->create();
    $team = createManagedTeam($owner, ['name' => 'Invite Team']);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => 'invitee@example.com',
        'token' => 'in-app-token',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($user)
        ->get(route('teams.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teams/Settings')
            ->has('pendingInvitations', 1)
            ->where('pendingInvitations.0.token', $invitation->token)
            ->where('pendingInvitations.0.team.name', 'Invite Team'),
        );
});

test('settings page matches pending invitations case-insensitively by email', function () {
    $user = User::factory()->create(['email' => 'Invitee@Example.com', 'plan' => 'pro']);
    $owner = User::factory()->create();
    $team = createManagedTeam($owner);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => 'invitee@example.com',
        'token' => 'case-insensitive-token',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($user)
        ->get(route('teams.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('pendingInvitations.0.token', $invitation->token),
        );
});

test('settings page hides expired invitations', function () {
    $user = User::factory()->create(['email' => 'invitee@example.com', 'plan' => 'pro']);
    $owner = User::factory()->create();
    $team = createManagedTeam($owner);

    TeamInvitation::create([
        'team_id' => $team->id,
        'email' => $user->email,
        'token' => 'expired-token',
        'expires_at' => now()->subMinute(),
    ]);

    $this->actingAs($user)
        ->get(route('teams.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('pendingInvitations', []));
});

test('settings page hides accepted invitations', function () {
    $user = User::factory()->create(['email' => 'invitee@example.com', 'plan' => 'pro']);
    $owner = User::factory()->create();
    $team = createManagedTeam($owner);

    TeamInvitation::create([
        'team_id' => $team->id,
        'email' => $user->email,
        'token' => 'accepted-token',
        'expires_at' => now()->addDay(),
        'accepted_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('teams.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('pendingInvitations', []));
});

test('settings page hides invitations for other email addresses', function () {
    $user = User::factory()->create(['email' => 'invitee@example.com', 'plan' => 'pro']);
    $owner = User::factory()->create();
    $team = createManagedTeam($owner);

    TeamInvitation::create([
        'team_id' => $team->id,
        'email' => 'someone-else@example.com',
        'token' => 'other-email-token',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($user)
        ->get(route('teams.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('pendingInvitations', []));
});

test('settings page returns pending invitations for invited free users', function () {
    $user = User::factory()->create(['email' => 'invitee@example.com', 'plan' => 'free']);
    $owner = User::factory()->create();
    $team = createManagedTeam($owner, ['name' => 'Invite Team']);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => $user->email,
        'token' => 'free-user-token',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($user)
        ->get(route('teams.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('pendingInvitations.0.token', $invitation->token),
        );
});

test('non owners cannot invite', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = createManagedTeam($owner);

    attachUserToManagedTeam($team, $member);

    $this->actingAs($member)
        ->post(route('teams.invite', $team), ['email' => 'blocked@example.com'])
        ->assertForbidden();

    expect(TeamInvitation::query()->count())->toBe(0);

    Notification::assertNothingSent();
});

test('invited users can join with a pending token', function () {
    $owner = User::factory()->create();
    $invitee = User::factory()->create();
    $team = createManagedTeam($owner);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => $invitee->email,
        'token' => 'pending-token',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($invitee)
        ->get(route('teams.join', $invitation->token))
        ->assertRedirect(route('teams.settings'));

    $membership = $team->fresh()->users()->whereKey($invitee)->first();

    expect($membership)->not->toBeNull()
        ->and($membership->pivot->role)->toBe('member')
        ->and($membership->pivot->joined_at)->not->toBeNull()
        ->and($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('invited users can join only when their authenticated email matches the invitation email', function () {
    $owner = User::factory()->create();
    $invitee = User::factory()->create(['email' => 'invitee@example.com']);
    $team = createManagedTeam($owner);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => 'invitee@example.com',
        'token' => 'matching-email-token',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($invitee)
        ->get(route('teams.join', $invitation->token))
        ->assertRedirect(route('teams.settings'));

    $membership = $team->fresh()->users()->whereKey($invitee)->first();

    expect($membership)->not->toBeNull()
        ->and($membership->pivot->role)->toBe('member')
        ->and($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('mismatched authenticated email is rejected and does not accept the invitation', function () {
    $owner = User::factory()->create();
    $invitee = User::factory()->create(['email' => 'other-user@example.com']);
    $team = createManagedTeam($owner);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => 'invitee@example.com',
        'token' => 'mismatched-email-token',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($invitee)
        ->get(route('teams.join', $invitation->token))
        ->assertForbidden();

    expect($team->fresh()->users()->whereKey($invitee)->exists())->toBeFalse()
        ->and($invitation->fresh()->accepted_at)->toBeNull();
});

test('expired invitations return gone when joining directly', function () {
    $owner = User::factory()->create();
    $invitee = User::factory()->create(['email' => 'invitee@example.com']);
    $team = createManagedTeam($owner);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => $invitee->email,
        'token' => 'expired-join-token',
        'expires_at' => now()->subMinute(),
    ]);

    $this->actingAs($invitee)
        ->get(route('teams.join', $invitation->token))
        ->assertStatus(410);
});

test('accepted invitations return gone when joining directly', function () {
    $owner = User::factory()->create();
    $invitee = User::factory()->create(['email' => 'invitee@example.com']);
    $team = createManagedTeam($owner);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => $invitee->email,
        'token' => 'accepted-join-token',
        'expires_at' => now()->addDay(),
        'accepted_at' => now(),
    ]);

    $this->actingAs($invitee)
        ->get(route('teams.join', $invitation->token))
        ->assertStatus(410);
});

test('mismatched authenticated email remains forbidden when joining directly', function () {
    $owner = User::factory()->create();
    $invitee = User::factory()->create(['email' => 'other-user@example.com']);
    $team = createManagedTeam($owner);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => 'invitee@example.com',
        'token' => 'mismatch-join-token',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($invitee)
        ->get(route('teams.join', $invitation->token))
        ->assertForbidden();
});

test('accepting a surfaced invitation through the join route attaches the member and records acceptance', function () {
    $owner = User::factory()->create();
    $invitee = User::factory()->create(['email' => 'invitee@example.com']);
    $team = createManagedTeam($owner);

    $invitation = TeamInvitation::create([
        'team_id' => $team->id,
        'email' => $invitee->email,
        'token' => 'surfaced-token',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($invitee)
        ->get(route('teams.join', $invitation->token))
        ->assertRedirect(route('teams.settings'));

    expect($team->fresh()->users()->whereKey($invitee)->exists())->toBeTrue()
        ->and($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('non owners can leave a team they belong to', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = createManagedTeam($owner);

    attachUserToManagedTeam($team, $member);

    $this->actingAs($member)
        ->post(route('teams.leave', $team))
        ->assertRedirect(route('teams.settings'));

    expect($team->fresh()->users()->whereKey($member)->exists())->toBeFalse();
});

test('owners cannot leave their own team', function () {
    $owner = User::factory()->create();
    $team = createManagedTeam($owner);

    $this->actingAs($owner)
        ->post(route('teams.leave', $team))
        ->assertForbidden();

    expect($team->fresh()->users()->whereKey($owner)->exists())->toBeTrue();
});

test('non members cannot leave a team they do not belong to', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $team = createManagedTeam($owner);

    $this->actingAs($stranger)
        ->post(route('teams.leave', $team))
        ->assertForbidden();

    expect($team->fresh()->users()->whereKey($stranger)->exists())->toBeFalse();
});

function createManagedTeam(User $owner, array $overrides = []): Team
{
    $team = Team::create(array_merge([
        'name' => 'Team Workspace',
        'slug' => 'team-workspace',
        'owner_id' => $owner->id,
    ], $overrides));

    attachUserToManagedTeam($team, $owner, 'owner');

    return $team;
}

function attachUserToManagedTeam(Team $team, User $user, string $role = 'member', $joinedAt = null): void
{
    $team->users()->attach($user->id, [
        'role' => $role,
        'joined_at' => $joinedAt ?? now(),
    ]);
}
