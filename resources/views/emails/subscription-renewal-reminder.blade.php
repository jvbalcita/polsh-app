@extends('layouts.email')

@section('subject', 'Your Polsh Pro subscription renews in 3 days')

@section('content')
    <h1 class="title">Your subscription renews soon</h1>
    <p class="text">Hi {{ $subscription->user->name }},</p>
    <p class="text">
        Your <span class="highlight">Polsh Pro {{ $subscription->plan === 'pro_yearly' ? 'Yearly' : 'Monthly' }}</span>
        subscription will automatically renew on
        <span class="highlight">{{ $subscription->current_period_end->format('F j, Y') }}</span>.
    </p>
    @if($subscription->paymongo_payment_method_id)
        <p class="text">Your saved payment method will be charged automatically.</p>
    @else
        <p class="text">
            Since you paid via GCash or Maya, your subscription will not auto-renew.
            Visit your billing page to subscribe again before your access expires.
        </p>
    @endif
    <a href="{{ route('billing.portal') }}" class="btn">Manage your subscription →</a>
@endsection

@section('footer-note')
    You're receiving this as a renewal reminder for your Polsh Pro subscription.<br>
    &copy; {{ date('Y') }} Polsh. All rights reserved.
@endsection
