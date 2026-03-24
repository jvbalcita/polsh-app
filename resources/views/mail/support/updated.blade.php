@extends('layouts.email')

@section('subject', "Your request has been updated — {$ticket->reference()}")

@section('content')
    <h1 class="title">Your request has been updated</h1>
    <p class="text">Reference: <span class="highlight">{{ $ticket->reference() }}</span></p>
    <p class="label">Subject</p>
    <p class="value">{{ $ticket->subject }}</p>
    <p class="label">New Status</p>
    <p class="value">{{ $ticket->status->label() }}</p>
    @if($ticket->user_id)
        <hr class="divider">
        <a href="{{ url('/support/tickets/' . $ticket->id) }}" class="btn">View Your Request →</a>
    @endif
@endsection

@section('footer-note')
    You're receiving this because your Polsh support request was updated.<br>
    &copy; {{ date('Y') }} Polsh. All rights reserved.
@endsection
