<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use LemonSqueezy\Laravel\Billable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia, MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use Billable, HasFactory, HasRoles, InteractsWithMedia, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'github_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function presets(): HasMany
    {
        return $this->hasMany(Preset::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class)
            ->withPivot(['role', 'joined_at']);
    }

    public function currentTeam(): ?Team
    {
        return $this->teams()->first();
    }

    public function isTeamOwner(Team $team): bool
    {
        return $this->id === $team->owner_id;
    }

    public function isPro(): bool
    {
        if (in_array($this->plan, ['pro', 'team'], true)) {
            return true;
        }

        return $this->subscription()?->valid() ?? false;
    }

    public function subscriptionEndsAt(): ?CarbonInterface
    {
        $subscription = $this->subscription();

        if (! $subscription) {
            return null;
        }

        return $subscription->onGracePeriod()
            ? $subscription->ends_at
            : $subscription->renews_at;
    }

    public function exportSessions(): HasMany
    {
        return $this->hasMany(ExportSession::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')->singleFile();
    }

    /**
     * Resolves the display avatar with a priority fallback chain:
     * 1. Custom uploaded avatar (media library — user-owned, self-hosted)
     * 2. OAuth provider avatar URL (users.avatar column — provider-owned, external CDN)
     * 3. null — caller should render initials fallback
     *
     * Eager-load `media` when displaying avatars in list contexts to avoid N+1:
     * User::query()->with('media')->get()
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('avatar') ?: ($this->avatar ?: null);
    }
}
