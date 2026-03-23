<?php

namespace App\Http\Controllers;

use App\Http\Requests\Billing\CheckoutRequest;
use App\Mail\PaymentFailed;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use App\Services\PayMongoService;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(private readonly PayMongoService $paymongo) {}

    public function portal(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Billing/Index', [
            'subscription' => $user->subscriptions()
                ->whereIn('status', ['active', 'cancelled'])
                ->where('current_period_end', '>', now())
                ->latest('current_period_end')
                ->first(),
            'isPro' => $user->isPro(),
        ]);
    }

    public function checkout(CheckoutRequest $request): RedirectResponse
    {
        $user = $request->user();
        $plan = $request->input('plan');

        $amounts = ['pro_monthly' => 50000, 'pro_yearly' => 450000];
        $names = ['pro_monthly' => 'Polsh Pro Monthly', 'pro_yearly' => 'Polsh Pro Yearly'];

        // Detect monthly → yearly upgrade so we can cancel the old sub after payment
        $oldSub = null;
        if ($plan === 'pro_yearly') {
            $oldSub = $user->subscriptions()
                ->where('status', 'active')
                ->where('plan', 'pro_monthly')
                ->where('current_period_end', '>', now())
                ->latest('current_period_end')
                ->first();
        }

        $description = "user:{$user->id}|plan:{$plan}";
        if ($oldSub) {
            $description .= "|switch:1|old_sub:{$oldSub->id}";
        }

        $session = $this->paymongo->createCheckoutSession([
            'billing' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'line_items' => [[
                'currency' => 'PHP',
                'amount' => $amounts[$plan],
                'name' => $names[$plan],
                'description' => $names[$plan],
                'quantity' => 1,
            ]],
            'payment_method_types' => ['card', 'gcash', 'paymaya'],
            'success_url' => route('billing.success').'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('editor'),
            // Encode user context for webhook recovery
            'description' => $description,
        ]);

        session(['paymongo_checkout_id' => $session['id']]);

        return redirect($session['attributes']['checkout_url']);
    }

    public function success(Request $request): RedirectResponse
    {
        // Prefer the session-stored ID (reliable) over the URL param, which PayMongo
        // may not substitute (e.g. GCash returns literal '{CHECKOUT_SESSION_ID}').
        $sessionId = session()->pull('paymongo_checkout_id')
            ?: $request->input('session_id');
        $user = $request->user();

        if (! $sessionId || $sessionId === '{CHECKOUT_SESSION_ID}') {
            return redirect()->route('billing.portal')->with('error', 'Invalid session.');
        }

        // Idempotency guard — webhook may have already processed this
        if (Subscription::where('paymongo_subscription_id', $sessionId)->exists()) {
            return redirect()->route('billing.portal');
        }

        $session = $this->paymongo->retrieveCheckoutSession($sessionId);
        $attributes = $session['attributes'];

        if ($attributes['status'] !== 'paid') {
            return redirect()->route('billing.portal')->with('error', 'Payment not completed.');
        }

        ['userId' => $checkoutUserId, 'plan' => $plan, 'oldSubId' => $oldSubId] = $this->extractCheckoutMetadata(
            $attributes['description'] ?? ''
        );

        $this->activateSubscription(
            userId: $checkoutUserId ?? $user->id,
            plan: $plan,
            sessionId: $sessionId,
            amount: $attributes['line_items'][0]['amount'] ?? 0,
            paymentMethodId: $attributes['payment_method_used'] ?? null,
        );

        if ($oldSubId) {
            Subscription::query()
                ->where('id', $oldSubId)
                ->where('status', 'active')
                ->update(['status' => 'cancelled', 'cancelled_at' => now()]);
        }

        return redirect()->route('billing.portal');
    }

    public function cancel(Request $request): RedirectResponse
    {
        // Marks subscription as cancelled — plan remains 'pro' until period expires.
        // ProcessSubscriptionRenewals job resets plan to 'free' on expiry.
        $request->user()->cancelSubscription();

        return redirect()->route('billing.portal')->with('cancelled', true);
    }

    public function reactivate(Request $request): RedirectResponse
    {
        $request->user()->reactivateSubscription();

        return redirect()->route('billing.portal')->with('reactivated', true);
    }

    public function webhook(Request $request): JsonResponse
    {
        $signature = $request->header('Paymongo-Signature', '');
        $rawBody = $request->getContent();

        if (! $this->paymongo->verifyWebhookSignature($rawBody, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $event = $request->input('data.attributes');
        $type = $event['type'] ?? '';
        $resource = $event['data'] ?? [];

        match ($type) {
            'checkout_session.payment.paid' => $this->handleCheckoutPaid($resource),
            'payment.failed' => $this->handlePaymentFailed($resource),
            default => null,
        };

        return response()->json(['status' => 'ok']);
    }

    private function handleCheckoutPaid(array $resource): void
    {
        $sessionId = $resource['id'];
        $attributes = $resource['attributes'];

        // Idempotency guard — success() redirect may have already processed this
        if (Subscription::where('paymongo_subscription_id', $sessionId)->exists()) {
            return;
        }

        ['userId' => $userId, 'plan' => $plan, 'oldSubId' => $oldSubId] = $this->extractCheckoutMetadata(
            $attributes['description'] ?? ''
        );

        if (! $userId) {
            return;
        }

        $this->activateSubscription(
            userId: (int) $userId,
            plan: $plan,
            sessionId: $sessionId,
            amount: $attributes['line_items'][0]['amount'] ?? 0,
            paymentMethodId: $attributes['payment_method_used'] ?? null,
        );

        if ($oldSubId) {
            Subscription::query()
                ->where('id', $oldSubId)
                ->where('status', 'active')
                ->update(['status' => 'cancelled', 'cancelled_at' => now()]);
        }
    }

    private function handlePaymentFailed(array $resource): void
    {
        $paymongoPaymentId = $resource['id'];

        $payment = Payment::where('paymongo_payment_id', $paymongoPaymentId)->first();

        if (! $payment?->subscription) {
            return;
        }

        $subscription = $payment->subscription;
        $subscription->update(['status' => 'past_due']);

        Mail::to($subscription->user)->queue(new PaymentFailed($subscription));
    }

    private function activateSubscription(
        int $userId,
        string $plan,
        string $sessionId,
        int $amount,
        ?string $paymentMethodId
    ): void {
        $startedAt = now();
        $periodEnd = $plan === 'pro_yearly'
            ? Carbon::parse($startedAt)->addYear()
            : Carbon::parse($startedAt)->addMonth();

        DB::transaction(function () use ($amount, $paymentMethodId, $periodEnd, $plan, $sessionId, $startedAt, $userId): void {
            try {
                $subscription = Subscription::create([
                    'user_id' => $userId,
                    'plan' => $plan,
                    'status' => 'active',
                    'paymongo_subscription_id' => $sessionId,
                    'paymongo_payment_method_id' => $paymentMethodId,
                    'current_period_start' => $startedAt,
                    'current_period_end' => $periodEnd,
                ]);
            } catch (QueryException $exception) {
                $subscription = Subscription::query()
                    ->where('paymongo_subscription_id', $sessionId)
                    ->first();

                if (! $subscription) {
                    throw $exception;
                }
            }

            try {
                $payment = Payment::create([
                    'user_id' => $userId,
                    'subscription_id' => $subscription->id,
                    'paymongo_payment_id' => $sessionId,
                    'amount' => $amount,
                    'currency' => 'PHP',
                    'status' => 'paid',
                    'paid_at' => $startedAt,
                ]);
            } catch (QueryException $exception) {
                $payment = Payment::query()
                    ->where('paymongo_payment_id', $sessionId)
                    ->first();

                if (! $payment) {
                    throw $exception;
                }
            }

            $payment->update(['subscription_id' => $subscription->id]);

            User::query()->where('id', $userId)->update(['plan' => 'pro']);
        });
    }

    /**
     * @return array{userId: int|null, plan: string, oldSubId: int|null}
     */
    private function extractCheckoutMetadata(string $description): array
    {
        preg_match('/user:(\d+)/', $description, $userMatch);
        preg_match('/plan:(\w+)/', $description, $planMatch);
        preg_match('/old_sub:(\d+)/', $description, $oldSubMatch);

        return [
            'userId' => isset($userMatch[1]) ? (int) $userMatch[1] : null,
            'plan' => $planMatch[1] ?? 'pro_monthly',
            'oldSubId' => isset($oldSubMatch[1]) ? (int) $oldSubMatch[1] : null,
        ];
    }
}
