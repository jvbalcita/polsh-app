<?php

namespace App\Jobs;

use App\Mail\PaymentFailed;
use App\Mail\SubscriptionRenewalReminder;
use App\Models\Payment;
use App\Models\Subscription;
use App\Services\PayMongoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class CheckSubscriptionRenewals implements ShouldQueue
{
    use Queueable;

    public function handle(PayMongoService $paymongo): void
    {
        $this->sendRenewalReminders();
        $this->chargeRenewals($paymongo);
        $this->expireOverdueSubscriptions();
    }

    /**
     * Send reminder emails 3 days before renewal.
     */
    private function sendRenewalReminders(): void
    {
        Subscription::where('status', 'active')
            ->whereBetween('current_period_end', [now()->addDays(3)->startOfDay(), now()->addDays(3)->endOfDay()])
            ->with('user')
            ->each(function (Subscription $subscription) {
                Mail::to($subscription->user)->queue(new SubscriptionRenewalReminder($subscription));
            });
    }

    /**
     * Attempt renewal for subscriptions that have expired but have a saved payment method (card only).
     * GCash/Maya subscriptions have no saved payment method — only send reminder.
     */
    private function chargeRenewals(PayMongoService $paymongo): void
    {
        // Only charge subscriptions with a real PayMongo payment method resource ID (prefix: pm_).
        // GCash/Maya checkouts store the method type name, not a reusable ID.
        Subscription::where('status', 'active')
            ->where('current_period_end', '<=', now())
            ->where('paymongo_payment_method_id', 'like', 'pm_%')
            ->with('user')
            ->each(function (Subscription $subscription) use ($paymongo) {
                $amount = $subscription->plan === 'pro_yearly' ? 450000 : 50000;
                $description = "Renewal: user:{$subscription->user_id}|plan:{$subscription->plan}";

                try {
                    $intent = $paymongo->chargePaymentMethod(
                        amount: $amount,
                        paymentMethodId: $subscription->paymongo_payment_method_id,
                        description: $description,
                    );

                    $status = $intent['attributes']['status'] ?? '';

                    if ($status === 'succeeded') {
                        $newEnd = $subscription->plan === 'pro_yearly'
                            ? $subscription->current_period_end->addYear()
                            : $subscription->current_period_end->addMonth();

                        $subscription->update([
                            'current_period_start' => $subscription->current_period_end,
                            'current_period_end' => $newEnd,
                        ]);

                        Payment::create([
                            'user_id' => $subscription->user_id,
                            'subscription_id' => $subscription->id,
                            'paymongo_payment_id' => $intent['id'],
                            'amount' => $amount,
                            'currency' => 'PHP',
                            'status' => 'paid',
                            'paid_at' => now(),
                        ]);
                    } else {
                        $this->markPastDue($subscription);
                    }
                } catch (Throwable $e) {
                    Log::error('Subscription renewal failed', [
                        'subscription_id' => $subscription->id,
                        'error' => $e->getMessage(),
                    ]);

                    $this->markPastDue($subscription);
                }
            });
    }

    private function markPastDue(Subscription $subscription): void
    {
        $subscription->update(['status' => 'past_due']);
        Mail::to($subscription->user)->queue(new PaymentFailed($subscription));
    }

    /**
     * Expire subscriptions that have been past_due for 7+ days.
     */
    private function expireOverdueSubscriptions(): void
    {
        Subscription::where('status', 'past_due')
            ->where('current_period_end', '<=', now()->subDays(7))
            ->with('user')
            ->each(function (Subscription $subscription) {
                $subscription->update(['status' => 'expired']);
                $subscription->user->update(['plan' => 'free']);
            });
    }
}
