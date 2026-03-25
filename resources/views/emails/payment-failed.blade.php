@extends('layouts.email')

@section('subject', 'Action required: Your Polsh Pro payment failed')

@section('content')
    <h1 class="title">Payment failed</h1>
    <p class="text">Hi {{ $user->name }},</p>
    <p class="text">
        We were unable to process your payment for
        <span class="highlight">Polsh Pro</span>.
        Your subscription has been paused.
    </p>
    <p class="text">
        To restore your Pro access, visit your billing page to update your payment method or
        start a new subscription.
    </p>
    <a href="{{ route('billing.portal') }}" class="btn">Go to billing →</a>
@endsection

@section('footer-note')
    You're receiving this because your Polsh Pro payment failed.<br>
    &copy; {{ date('Y') }} Polsh. All rights reserved.
@endsection
