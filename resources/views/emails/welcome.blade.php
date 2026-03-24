@extends('layouts.email')

@section('subject', "Welcome to Polsh, {$user->name}!")

@section('content')
    <h1 class="title">Welcome to Polsh, {{ $user->name }}!</h1>
    <p class="text">
        You're all set. Polsh is the screenshot styling tool built for developers — drop in a
        screenshot, pick a style, and export a stunning PNG, WebP, or SVG in seconds.
    </p>
    <p class="text">No Figma plugins. No watermarks. Works entirely in your browser.</p>
    <a href="{{ route('editor') }}" class="btn">Open the editor →</a>
    <hr class="divider">
    <p class="text" style="margin-bottom: 0;">
        Questions? Reply to this email or visit
        <a href="{{ route('support.create') }}" class="link">our support page</a>.
    </p>
@endsection

@section('footer-note')
    You're receiving this because you created a Polsh account with {{ $user->email }}.<br>
    &copy; {{ date('Y') }} Polsh. All rights reserved.
@endsection
