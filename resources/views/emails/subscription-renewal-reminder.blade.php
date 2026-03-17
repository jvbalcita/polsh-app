<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #333; padding: 24px;">
    <h2>Your Polsh Pro subscription renews in 3 days</h2>
    <p>Hi {{ $subscription->user->name }},</p>
    <p>
        Your <strong>Polsh Pro {{ $subscription->plan === 'pro_yearly' ? 'Yearly' : 'Monthly' }}</strong>
        subscription will automatically renew on
        <strong>{{ $subscription->current_period_end->format('F j, Y') }}</strong>.
    </p>
    @if($subscription->paymongo_payment_method_id)
        <p>Your saved payment method will be charged automatically.</p>
    @else
        <p>
            Since you paid via GCash or Maya, your subscription will not auto-renew.
            Visit your billing page to subscribe again before your access expires.
        </p>
    @endif
    <p><a href="{{ route('billing.portal') }}" style="color: #e0ff4f;">Manage your subscription →</a></p>
    <p style="color: #999; font-size: 12px;">Polsh &mdash; Screenshot editor for professionals</p>
</body>
</html>
