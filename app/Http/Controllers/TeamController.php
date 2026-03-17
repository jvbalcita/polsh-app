<?php

namespace App\Http\Controllers;

use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\TeamInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($request->boolean('isPro') || $user->isPro(), 403, 'Pro subscription required.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:60'],
        ]);

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

    public function invite(Request $request, Team $team): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->isTeamOwner($team), 403);

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $invitation = TeamInvitation::create([
            'team_id' => $team->id,
            'email' => $validated['email'],
            'token' => Str::uuid(),
            'expires_at' => now()->addDays(7),
        ]);

        Mail::to($validated['email'])->queue(new TeamInvitationMail($team, $invitation));

        return redirect()->route('teams.settings')->with('invited', true);
    }

    public function join(Request $request, string $token): RedirectResponse
    {
        $invitation = TeamInvitation::where('token', $token)->firstOrFail();

        abort_unless($invitation->isPending(), 410, 'This invitation has expired or already been used.');

        $user = $request->user();

        // Don't add if already a member
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
        $user = $request->user();

        // Owners cannot leave their own team
        abort_if($user->isTeamOwner($team), 403, 'Owners cannot leave their team.');

        $team->users()->detach($user->id);

        return redirect()->route('teams.settings');
    }
}
