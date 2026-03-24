@extends('layouts.email')

@section('subject', "New reply on your request — {$ticket->reference()}")

@section('content')
    <h1 class="title">New reply on your request</h1>
    <p class="text">Reference: <span class="highlight">{{ $ticket->reference() }}</span></p>
    <p class="label">Subject</p>
    <p class="value">{{ $ticket->subject }}</p>
    <hr class="divider">
    <p class="text">{{ $reply->message }}</p>
    <hr class="divider">
    @if($ticket->user_id)
        <a href="{{ url('/support/tickets/' . $ticket->id) }}" class="btn">View & Reply →</a>
    @endif
@endsection

@section('footer-note')
    You're receiving this because there's a new reply on your Polsh support request.<br>
    &copy; {{ date('Y') }} Polsh. All rights reserved.
@endsection
