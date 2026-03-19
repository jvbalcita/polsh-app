<?php

namespace App\Http\Controllers;

use App\Http\Requests\Teams\InviteTeamMemberRequest;
use App\Http\Requests\Teams\StoreTeamRequest;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Notifications\TeamInvitationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function settings(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam();

        if (! $team) {
            return Inertia::render('Teams/Settings', [
                'team' => null,
                'members' => [],
                'teamPresets' => [],
            ]);
        }

        $team->load(['users', 'presets']);

        $members = $team->users->map(fn ($member) => [
            'id' => $member->id,
            'name' => $member->name,
            'email' => $member->email,
            'avatar' => $member->avatar,
            'role' => $member->pivot->role,
            'joined_at' => $member->pivot->joined_at,
        ]);

        return Inertia::render('Teams/Settings', [
            'team' => $team->only(['id', 'name', 'slug', 'owner_id']),
            'members' => $members,
            'teamPresets' => $team->presets->map->only(['id', 'name', 'style_slug', 'customizations']),
        ]);
    }

    public function store(StoreTeamRequest $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validated();

        $team = Team::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']).'-'.Str::random(4),
            'owner_id' => $user->id,
        ]);

        $team->users()->attach($user->id, [
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        return redirect()->route('teams.settings');
    }

    public function invite(InviteTeamMemberRequest $request, Team $team): RedirectResponse
    {
        Gate::authorize('invite', $team);

        $validated = $request->validated();

        $invitation = TeamInvitation::create([
            'team_id' => $team->id,
            'email' => $validated['email'],
            'token' => Str::uuid(),
            'expires_at' => now()->addHours(48),
        ]);

        Notification::route('mail', $validated['email'])
            ->notify(new TeamInvitationNotification($team, $invitation));

        return redirect()->route('teams.settings')->with('invited', true);
    }

    public function join(Request $request, string $token): RedirectResponse
    {
        $invitation = TeamInvitation::where('token', $token)->firstOrFail();

        abort_unless($invitation->isPending(), 410, 'This invitation has expired or already been used.');

        $user = $request->user();

        abort_unless(
            strcasecmp($user->email, $invitation->email) === 0,
            403,
            'This invitation is for a different email address.'
        );

        if (! $invitation->team->users()->where('user_id', $user->id)->exists()) {
            $invitation->team->users()->attach($user->id, [
                'role' => 'member',
                'joined_at' => now(),
            ]);
        }

        $invitation->update(['accepted_at' => now()]);

        return redirect()->route('teams.settings');
    }

    public function leave(Request $request, Team $team): RedirectResponse
    {
        Gate::authorize('leave', $team);

        $user = $request->user();

        $team->users()->detach($user->id);

        return redirect()->route('teams.settings');
    }
}
