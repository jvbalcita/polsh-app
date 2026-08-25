<?php

use App\Models\ExportSession;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

test('session index honors current limits', function (string $plan, int $expectedLimit) {
    $user = User::factory()->create(['plan' => $plan]);

    createManagedSessions($user, $expectedLimit + 2);
    createManagedSessions(User::factory()->create(), 2);

    $response = $this->actingAs($user)->getJson(route('sessions.index'));

    $response
        ->assertOk()
        ->assertJsonCount($expectedLimit)
        ->assertJsonPath('0.style_slug', 'style-'.($expectedLimit + 2))
        ->assertJsonPath(($expectedLimit - 1).'.style_slug', 'style-3');
})->with([
    'free' => ['free', 10],
    'pro' => ['pro', 50],
    'team' => ['team', 50],
]);

test('session destroy returns no content and deletes owned sessions', function () {
    $user = User::factory()->create();

    $session = ExportSession::create([
        'user_id' => $user->id,
        'style_slug' => 'mono-film',
        'settings' => ['grain' => 5],
        'image_count' => 2,
        'thumbnail_url' => null,
    ]);

    $this->actingAs($user)
        ->deleteJson(route('sessions.destroy', $session))
        ->assertNoContent();

    expect(ExportSession::query()->whereKey($session)->exists())->toBeFalse();
});

test('users cannot show another users session', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();

    $session = ExportSession::create([
        'user_id' => $owner->id,
        'style_slug' => 'owner-only',
        'settings' => ['clarity' => 4],
        'image_count' => 1,
        'thumbnail_url' => null,
    ]);

    $this->actingAs($intruder)
        ->getJson(route('sessions.show', $session))
        ->assertForbidden();
});

test('users cannot delete another users session', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();

    $session = ExportSession::create([
        'user_id' => $owner->id,
        'style_slug' => 'owner-only',
        'settings' => ['clarity' => 4],
        'image_count' => 1,
        'thumbnail_url' => null,
    ]);

    $this->actingAs($intruder)
        ->deleteJson(route('sessions.destroy', $session))
        ->assertForbidden();

    expect(ExportSession::query()->whereKey($session)->exists())->toBeTrue();
});

test('export session policy mirrors ownership rules', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();

    $session = ExportSession::create([
        'user_id' => $owner->id,
        'style_slug' => 'owner-only',
        'settings' => ['clarity' => 4],
        'image_count' => 1,
        'thumbnail_url' => null,
    ]);

    expect(Gate::getPolicyFor(ExportSession::class))->not->toBeNull()
        ->and(Gate::forUser($owner)->allows('view', $session))->toBeTrue()
        ->and(Gate::forUser($owner)->allows('delete', $session))->toBeTrue()
        ->and(Gate::forUser($intruder)->denies('view', $session))->toBeTrue()
        ->and(Gate::forUser($intruder)->denies('delete', $session))->toBeTrue();
});

test('storing a session with a data url thumbnail persists and returns expected json fields', function () {
    $disk = config('services.polsh.export_disk', 'public');
    Storage::fake($disk);

    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->postJson(route('sessions.store'), [
            'style_slug' => 'soft-glow',
            'settings' => [
                'styleSlug' => 'soft-glow',
                'saturation' => 14,
            ],
            'image_count' => 4,
            'thumbnail_url' => 'data:image/png;base64,'.base64_encode(base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z0ioAAAAASUVORK5CYII=')),
        ]);

    $response
        ->assertCreated()
        ->assertJsonStructure(['id', 'style_slug', 'image_count', 'thumbnail_url', 'created_at'])
        ->assertJsonPath('style_slug', 'soft-glow')
        ->assertJsonPath('image_count', 4);

    $session = ExportSession::query()->sole();

    expect($session->user_id)->toBe($user->id)
        ->and($session->style_slug)->toBe('soft-glow')
        ->and($session->settings)->toBe([
            'styleSlug' => 'soft-glow',
            'saturation' => 14,
        ]);

    if ($disk === 'public') {
        expect($session->thumbnail_url)->toStartWith('/storage/thumbnails/');
        expect(Storage::disk($disk)->exists(str_replace('/storage/', '', $session->thumbnail_url)))->toBeTrue();
    }
});

function createManagedSessions(User $user, int $count): void
{
    foreach (range(1, $count) as $index) {
        ExportSession::create([
            'user_id' => $user->id,
            'style_slug' => 'style-'.$index,
            'settings' => ['temperature' => $index],
            'image_count' => $index,
            'thumbnail_url' => null,
            'created_at' => now()->subMinutes($count - $index),
            'updated_at' => now()->subMinutes($count - $index),
        ]);
    }
}
