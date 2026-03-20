<?php

namespace App\Policies;

use App\Models\Preset;
use App\Models\User;

class PresetPolicy
{
    public function delete(User $user, Preset $preset): bool
    {
        return $user->id === $preset->user_id;
    }
}
