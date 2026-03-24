<?php

namespace App\Listeners;

use App\Mail\WelcomeEmail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail
{
    public function handle(Registered $event): void
    {
        Mail::to($event->user)->queue(new WelcomeEmail($event->user));
    }
}
