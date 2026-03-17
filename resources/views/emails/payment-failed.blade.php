<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #333; padding: 24px;">
    <h2>Action required: Your Polsh Pro payment failed</h2>
    <p>Hi {{ $subscription->user->name }},</p>
    <p>
        We were unable to process your payment for
        <strong>Polsh Pro {{ $subscription->plan === 'pro_yearly' ? 'Yearly' : 'Monthly' }}</strong>.
        Your subscription has been paused.
    </p>
    <p>
        To restore your Pro access, please visit your billing page and update your payment method
        or start a new subscription.
    </p>
    <p><a href="{{ route('billing.portal') }}" style="color: #e0ff4f;">Go to billing →</a></p>
    <p style="color: #999; font-size: 12px;">Polsh &mdash; Screenshot editor for professionals</p>
</body>
</html>
