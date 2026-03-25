<?php

namespace App\Listeners;

use App\Mail\PaymentFailed;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use LemonSqueezy\Laravel\Events\WebhookReceived;

class SyncUserPlan
{
    public function handle(WebhookReceived $event): void
    {
        $eventName = $event->payload['meta']['event_name'] ?? '';
        $customData = $event->payload['meta']['custom_data'] ?? [];
        $attributes = $event->payload['data']['attributes'] ?? [];

        $userId = (int) ($customData['billable_id'] ?? 0);

        if (! $userId) {
            return;
        }

        $user = User::find($userId);

        if (! $user) {
            return;
        }

        match ($eventName) {
            'subscription_created' => $user->update(['plan' => 'pro']),
            'subscription_updated' => $this->handleUpdated($user, $attributes),
            'subscription_expired' => $user->update(['plan' => 'free']),
            'subscription_payment_failed' => $this->handlePaymentFailed($user),
            default => null,
        };
    }

    private function handleUpdated(User $user, array $attributes): void
    {
        $status = $attributes['status'] ?? '';

        // Only downgrade when truly expired — cancelled users retain access via onGracePeriod()
        if ($status === 'expired') {
            $user->update(['plan' => 'free']);
        } elseif (in_array($status, ['active', 'on_trial'], true)) {
            $user->update(['plan' => 'pro']);
        }
    }

    private function handlePaymentFailed(User $user): void
    {
        Mail::to($user)->queue(new PaymentFailed($user));
    }
}
