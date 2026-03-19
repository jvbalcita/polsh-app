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
                ->where('status', 'active')
                ->where('current_period_end', '>', now())
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
            'payment_method_types' => ['card', 'gcash', 'maya'],
            'success_url' => route('billing.success').'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('editor'),
            // Encode user context for webhook recovery
            'description' => "user:{$user->id}|plan:{$plan}",
        ]);

        return redirect($session['attributes']['checkout_url']);
    }

    public function success(Request $request): RedirectResponse
    {
        $sessionId = $request->input('session_id');
        $user = $request->user();

        if (! $sessionId) {
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

        ['userId' => $checkoutUserId, 'plan' => $plan] = $this->extractCheckoutMetadata(
            $attributes['description'] ?? ''
        );

        $this->activateSubscription(
            userId: $checkoutUserId ?? $user->id,
            plan: $plan,
            sessionId: $sessionId,
            amount: $attributes['line_items'][0]['amount'] ?? 0,
            paymentMethodId: $attributes['payment_method_used'] ?? null,
        );

        return redirect()->route('billing.portal');
    }

    public function cancel(Request $request): RedirectResponse
    {
        // Marks subscription as cancelled — plan remains 'pro' until period expires.
        // ProcessSubscriptionRenewals job resets plan to 'free' on expiry.
        $request->user()->cancelSubscription();

        return redirect()->route('billing.portal')->with('cancelled', true);
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

        ['userId' => $userId, 'plan' => $plan] = $this->extractCheckoutMetadata(
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
     * @return array{userId: int|null, plan: string}
     */
    private function extractCheckoutMetadata(string $description): array
    {
        preg_match('/user:(\d+)/', $description, $userMatch);
        preg_match('/plan:(\w+)/', $description, $planMatch);

        return [
            'userId' => isset($userMatch[1]) ? (int) $userMatch[1] : null,
            'plan' => $planMatch[1] ?? 'pro_monthly',
        ];
    }
}
