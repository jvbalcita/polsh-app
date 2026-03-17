<?php

namespace App\Http\Controllers;

use App\Mail\PaymentFailed;
use App\Models\Payment;
use App\Models\Subscription;
use App\Services\PayMongoService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function checkout(Request $request): RedirectResponse
    {
        $request->validate([
            'plan' => ['required', 'in:pro_monthly,pro_yearly'],
        ]);

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

        // Extract plan from description field
        preg_match('/plan:(\w+)/', $attributes['description'] ?? '', $planMatch);
        $plan = $planMatch[1] ?? 'pro_monthly';

        $this->activateSubscription(
            userId: $user->id,
            plan: $plan,
            sessionId: $sessionId,
            amount: $attributes['line_items'][0]['amount'] ?? 0,
            paymentMethodId: $attributes['payment_method_used'] ?? null,
        );

        return redirect()->route('billing.portal');
    }

    public function cancel(Request $request): RedirectResponse
    {
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

        preg_match('/user:(\d+)/', $attributes['description'] ?? '', $userMatch);
        preg_match('/plan:(\w+)/', $attributes['description'] ?? '', $planMatch);

        $userId = $userMatch[1] ?? null;
        $plan = $planMatch[1] ?? 'pro_monthly';

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
        $periodEnd = $plan === 'pro_yearly'
            ? Carbon::now()->addYear()
            : Carbon::now()->addMonth();

        $subscription = Subscription::create([
            'user_id' => $userId,
            'plan' => $plan,
            'status' => 'active',
            'paymongo_subscription_id' => $sessionId,
            'paymongo_payment_method_id' => $paymentMethodId,
            'current_period_start' => now(),
            'current_period_end' => $periodEnd,
        ]);

        Payment::create([
            'user_id' => $userId,
            'subscription_id' => $subscription->id,
            'paymongo_payment_id' => $sessionId,
            'amount' => $amount,
            'currency' => 'PHP',
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
