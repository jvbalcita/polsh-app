<?php

use App\Models\ExportSession;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can visit editor and receive null session data', function () {
    $response = $this->get(route('editor'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Editor')
            ->where('sessionData', null),
        );
});

test('editor returns null session data when no session query is provided', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('editor'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Editor')
            ->where('sessionData', null),
        );
});

test('editor restores session data for an authenticated owner', function () {
    $user = User::factory()->create();
    $session = ExportSession::create([
        'user_id' => $user->id,
        'style_slug' => 'polaroid-dream',
        'settings' => ['contrast' => 12, 'grain' => 8],
        'image_count' => 3,
        'thumbnail_url' => '/storage/thumbnails/editor-owner.png',
    ]);

    $this->actingAs($user)
        ->get(route('editor', ['session' => $session->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Editor')
            ->where('sessionData', [
                'style_slug' => 'polaroid-dream',
                'settings' => ['contrast' => 12, 'grain' => 8],
            ]),
        );
});

test('editor returns null session data for an unowned session query', function () {
    $user = User::factory()->create();
    $session = ExportSession::create([
        'user_id' => User::factory()->create()->id,
        'style_slug' => 'editorial-pop',
        'settings' => ['exposure' => 4],
        'image_count' => 2,
        'thumbnail_url' => '/storage/thumbnails/editor-unowned.png',
    ]);

    $this->actingAs($user)
        ->get(route('editor', ['session' => $session->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Editor')
            ->where('sessionData', null),
        );
});
