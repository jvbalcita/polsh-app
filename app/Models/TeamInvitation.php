<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamInvitation extends Model
{
    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now());
    }

    public function scopePendingForEmail(Builder $query, string $email): Builder
    {
        return $query->pending()->whereRaw('LOWER(email) = ?', [mb_strtolower(trim($email))]);
    }

    public function isPending(): bool
    {
        return $this->accepted_at === null && now()->isBefore($this->expires_at);
    }
}
