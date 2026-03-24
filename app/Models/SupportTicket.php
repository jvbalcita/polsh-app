<?php

namespace App\Models;

use App\Enums\SupportTicketStatus;
use App\Enums\SupportTicketType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class SupportTicket extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'assigned_admin_id'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function casts(): array
    {
        return [
            'type' => SupportTicketType::class,
            'status' => SupportTicketStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(SupportTicketReply::class);
    }

    /** Returns the linked User or a simple object for guests. */
    public function submitter(): User|object
    {
        if ($this->user_id) {
            return $this->user;
        }

        return (object) [
            'name' => $this->submitter_name,
            'email' => $this->submitter_email,
        ];
    }

    public function reference(): string
    {
        return '#POLSH-'.$this->id;
    }
}
