<?php

namespace App\Notifications;

use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\TeamInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Notification;

class TeamInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Team $team,
        public readonly TeamInvitation $invitation,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): TeamInvitationMail
    {
        $mail = new TeamInvitationMail($this->team, $this->invitation);

        if ($notifiable instanceof AnonymousNotifiable) {
            return $mail->to($notifiable->routeNotificationFor('mail'));
        }

        return $mail->to($this->invitation->email);
    }
}
