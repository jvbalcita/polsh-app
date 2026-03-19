<?php

namespace App\Policies;

use App\Models\ExportSession;
use App\Models\User;

class ExportSessionPolicy
{
    public function view(User $user, ExportSession $exportSession): bool
    {
        return $user->id === $exportSession->user_id;
    }

    public function delete(User $user, ExportSession $exportSession): bool
    {
        return $user->id === $exportSession->user_id;
    }
}
