@extends('layouts.email')

@section('subject', "You've been invited to join {$team->name} on Polsh")

@section('content')
    <h1 class="title">You've been invited to a team</h1>
    <p class="text">
        You've been invited to join <span class="highlight">{{ $team->name }}</span> on Polsh —
        the screenshot styling tool for developers.
    </p>
    <p class="text">
        As a team member, you'll be able to access and share style presets with your teammates.
        This invitation expires in 7 days.
    </p>
    <a href="{{ route('teams.join', $invitation->token) }}" class="btn">Join Team →</a>
@endsection

@section('footer-note')
    If you weren't expecting this invitation, you can safely ignore it.<br>
    Or copy this link: <a href="{{ route('teams.join', $invitation->token) }}" class="link">{{ route('teams.join', $invitation->token) }}</a><br>
    &copy; {{ date('Y') }} Polsh. All rights reserved.
@endsection
