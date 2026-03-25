<?php

namespace App\Http\Controllers;

use App\Http\Requests\Billing\CheckoutRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function portal(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user->subscription();

        return Inertia::render('Billing/Index', [
            'subscription' => $subscription ? [
                'plan' => $this->variantToPlan($subscription->variant_id),
                'status' => $subscription->status,
                'renews_at' => $subscription->renews_at,
                'ends_at' => $subscription->ends_at,
                'on_grace_period' => $subscription->onGracePeriod(),
            ] : null,
            'isPro' => $user->isPro(),
            'portalUrl' => $subscription ? $user->customerPortalUrl() : null,
        ]);
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $user = $request->user();
        $plan = $request->input('plan');

        $variantId = $plan === 'pro_yearly'
            ? config('services.lemon_squeezy.variant_pro_yearly')
            : config('services.lemon_squeezy.variant_pro_monthly');

        $url = $user->checkout((string) $variantId)
            ->embed()
            ->redirectTo(route('billing.portal'))
            ->url();

        return response()->json(['url' => $url]);
    }

    public function redirectPortal(Request $request): RedirectResponse
    {
        return $request->user()->redirectToCustomerPortal();
    }

    public function cancel(Request $request): RedirectResponse
    {
        $request->user()->subscription()?->cancel();

        return redirect()->route('billing.portal')->with('cancelled', true);
    }

    public function reactivate(Request $request): RedirectResponse
    {
        $request->user()->subscription()?->resume();

        return redirect()->route('billing.portal')->with('reactivated', true);
    }

    /**
     * Map a Lemon Squeezy variant ID back to a plan slug for the frontend.
     */
    private function variantToPlan(string $variantId): string
    {
        return match ($variantId) {
            (string) config('services.lemon_squeezy.variant_pro_yearly') => 'pro_yearly',
            default => 'pro_monthly',
        };
    }
}
