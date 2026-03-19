<?php

use App\Models\ExportSession;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected away from history', function () {
    $this->get(route('history'))->assertRedirect(route('login'));
});

test('authenticated users can visit history and receive session props', function () {
    $user = User::factory()->create();

    $session = ExportSession::create([
        'user_id' => $user->id,
        'style_slug' => 'polaroid-dream',
        'settings' => ['contrast' => 12, 'grain' => 8],
        'image_count' => 3,
        'thumbnail_url' => '/storage/thumbnails/history-test.png',
    ]);

    $this->actingAs($user)
        ->get(route('history'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('History')
            ->has('sessions', 1)
            ->where('sessions.0.id', $session->id)
            ->where('sessions.0.style_slug', 'polaroid-dream')
            ->where('sessions.0.settings', ['contrast' => 12, 'grain' => 8])
            ->where('sessions.0.image_count', 3)
            ->where('sessions.0.thumbnail_url', '/storage/thumbnails/history-test.png')
            ->has('sessions.0.created_at'),
        );
});

test('history page honors current session limits', function (string $plan, int $expectedLimit) {
    $user = User::factory()->create(['plan' => $plan]);

    createExportSessions($user, $expectedLimit + 2);
    createExportSessions(User::factory()->create(), 2);

    $oldestVisibleStyle = 'style-3';
    $newestStyle = 'style-'.($expectedLimit + 2);

    $this->actingAs($user)
        ->get(route('history'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('History')
            ->has('sessions', $expectedLimit)
            ->where('sessions.0.style_slug', $newestStyle)
            ->where('sessions.'.($expectedLimit - 1).'.style_slug', $oldestVisibleStyle),
        );
})->with([
    'free' => ['free', 10],
    'pro' => ['pro', 50],
    'team' => ['team', 50],
]);

function createExportSessions(User $user, int $count): void
{
    foreach (range(1, $count) as $index) {
        ExportSession::create([
            'user_id' => $user->id,
            'style_slug' => 'style-'.$index,
            'settings' => ['exposure' => $index],
            'image_count' => $index,
            'thumbnail_url' => '/storage/thumbnails/style-'.$index.'.png',
            'created_at' => now()->subMinutes($count - $index),
            'updated_at' => now()->subMinutes($count - $index),
        ]);
    }
}
