<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TeamPolicy
{
    public function invite(User $user, Team $team): bool
    {
        return $user->isTeamOwner($team);
    }

    public function leave(User $user, Team $team): Response
    {
        if (! $team->users()->whereKey($user)->exists()) {
            return Response::deny('You are not a member of this team.');
        }

        if ($user->isTeamOwner($team)) {
            return Response::deny('Owners cannot leave their team.');
        }

        return Response::allow();
    }
}
