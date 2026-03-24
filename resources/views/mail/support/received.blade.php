@extends('layouts.email')

@section('subject', "We received your request — {$ticket->reference()}")

@section('content')
    <h1 class="title">We received your request</h1>
    <p class="text">Reference: <span class="highlight">{{ $ticket->reference() }}</span></p>
    <p class="label">Type</p>
    <p class="value">{{ $ticket->type->label() }}</p>
    <p class="label">Subject</p>
    <p class="value">{{ $ticket->subject }}</p>
    <p class="label">Message</p>
    <p class="text">{{ $ticket->description }}</p>
    <hr class="divider">
    @if(!$isAdmin && $ticket->user_id)
        <a href="{{ url('/support/tickets/' . $ticket->id) }}" class="btn">View Your Request →</a>
        <hr class="divider">
    @endif
    <p class="text" style="margin-bottom: 0;">We'll get back to you as soon as possible.</p>
@endsection

@section('footer-note')
    You're receiving this because you submitted a support request to Polsh.<br>
    &copy; {{ date('Y') }} Polsh. All rights reserved.
@endsection
