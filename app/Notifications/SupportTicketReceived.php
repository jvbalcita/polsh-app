<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupportTicketReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly SupportTicket $ticket) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("We received your request — {$this->ticket->reference()}")
            ->view('mail.support.received', [
                'ticket' => $this->ticket,
                'isAdmin' => $notifiable instanceof User && $notifiable->hasRole('admin'),
            ]);
    }
}
