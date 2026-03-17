<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiKey extends Model
{
    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'requests_reset_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    protected $hidden = ['key'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('revoked_at');
    }
}
