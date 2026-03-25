<?php

use App\Models\Preset;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Testing\Fluent\AssertableJson;

test('authenticated users can list their own personal presets', function () {
    $user = User::factory()->create();
    createPresetFixture($user, [
        'name' => 'First personal preset',
        'style_slug' => 'first-personal',
        'customizations' => ['grain' => 2],
        'created_at' => now()->subMinute(),
        'updated_at' => now()->subMinute(),
    ]);
    $newestPreset = createPresetFixture($user, [
        'name' => 'Newest personal preset',
        'style_slug' => 'newest-personal',
        'customizations' => ['grain' => 5],
    ]);
    createPresetFixture(User::factory()->create(), [
        'name' => 'Another user preset',
        'style_slug' => 'other-user',
        'customizations' => ['grain' => 9],
    ]);

    $response = $this->actingAs($user)->getJson(route('presets.index'));

    $response
        ->assertOk()
        ->assertJsonCount(2, 'user')
        ->assertJsonCount(0, 'team')
        ->assertJsonPath('user.0.id', $newestPreset->id)
        ->assertJsonPath('user.0.name', 'Newest personal preset')
        ->assertJsonPath('user.0.style_slug', 'newest-personal')
        ->assertJsonPath('user.0.customizations', ['grain' => 5]);
});

test('authenticated users also receive current team presets in the team payload when they belong to a team', function () {
    $user = User::factory()->create();
    $team = createPresetTeam($user, 'Studio Team');

    createPresetFixture($user, [
        'name' => 'Personal preset',
        'style_slug' => 'personal-style',
        'customizations' => ['temperature' => 1],
    ]);
    createPresetFixture($user, [
        'name' => 'Older team preset',
        'style_slug' => 'older-team-style',
        'customizations' => ['temperature' => 2],
        'team_id' => $team->id,
        'created_at' => now()->subMinute(),
        'updated_at' => now()->subMinute(),
    ]);
    $newestTeamPreset = createPresetFixture($user, [
        'name' => 'Newest team preset',
        'style_slug' => 'newest-team-style',
        'customizations' => ['temperature' => 3],
        'team_id' => $team->id,
    ]);

    $response = $this->actingAs($user)->getJson(route('presets.index'));

    $response
        ->assertOk()
        ->assertJsonCount(1, 'user')
        ->assertJsonCount(2, 'team')
        ->assertJsonPath('team.0.id', $newestTeamPreset->id)
        ->assertJsonPath('team.0.name', 'Newest team preset')
        ->assertJsonPath('team.0.style_slug', 'newest-team-style')
        ->assertJsonPath('team.0.customizations', ['temperature' => 3])
        ->assertJsonPath('team.0.team_id', $team->id);
});

test('storing a preset returns created json with id name style slug customizations and team id', function () {
    $user = User::factory()->create();
    $team = createPresetTeam($user, 'Design Team');

    $response = $this->actingAs($user)->postJson(route('presets.store'), [
        'name' => 'Golden Hour',
        'style_slug' => 'golden-hour',
        'customizations' => [
            'grain' => 4,
            'warmth' => 8,
        ],
        'team_id' => $team->id,
    ]);

    $response
        ->assertCreated()
        ->assertJson(fn (AssertableJson $json) => $json
            ->where('id', fn (int $id): bool => $id > 0)
            ->where('name', 'Golden Hour')
            ->where('style_slug', 'golden-hour')
            ->where('customizations', [
                'grain' => 4,
                'warmth' => 8,
            ])
            ->where('team_id', $team->id)
            ->etc()
        );

    $preset = Preset::query()->findOrFail($response['id']);

    expect($preset->user_id)->toBe($user->id)
        ->and($preset->name)->toBe('Golden Hour')
        ->and($preset->style_slug)->toBe('golden-hour')
        ->and($preset->customizations)->toBe([
            'grain' => 4,
            'warmth' => 8,
        ])
        ->and($preset->team_id)->toBe($team->id);
});

test('users can store a personal preset without a team id', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('presets.store'), [
        'name' => 'Solo preset',
        'style_slug' => 'solo-style',
        'customizations' => [
            'clarity' => 6,
        ],
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('name', 'Solo preset')
        ->assertJsonPath('style_slug', 'solo-style')
        ->assertJsonPath('customizations', ['clarity' => 6])
        ->assertJsonPath('team_id', null);

    $preset = Preset::query()->findOrFail($response['id']);

    expect($preset->team_id)->toBeNull();
});

test('invalid preset saves return json validation errors for editor requests', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('presets.store'), [
            'name' => 'Broken preset',
            'style_slug' => '',
            'customizations' => ['clarity' => 6],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['style_slug']);
});

test('users cannot store a preset for a team they do not belong to', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $team = createPresetTeam($owner, 'Owners Team');

    $this->actingAs($intruder)
        ->postJson(route('presets.store'), [
            'name' => 'Forbidden preset',
            'style_slug' => 'forbidden-style',
            'customizations' => [
                'contrast' => 3,
            ],
            'team_id' => $team->id,
        ])
        ->assertForbidden();

    expect(Preset::query()->count())->toBe(0);
});

test('users can delete their own preset', function () {
    $user = User::factory()->create();
    $preset = createPresetFixture($user, [
        'name' => 'Delete me',
        'style_slug' => 'delete-me',
        'customizations' => ['fade' => 1],
    ]);

    $this->actingAs($user)
        ->deleteJson(route('presets.destroy', $preset))
        ->assertNoContent();

    expect(Preset::query()->whereKey($preset)->exists())->toBeFalse();
});

test('users cannot delete another users preset', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $preset = createPresetFixture($owner, [
        'name' => 'Keep me',
        'style_slug' => 'keep-me',
        'customizations' => ['fade' => 2],
    ]);

    $this->actingAs($intruder)
        ->deleteJson(route('presets.destroy', $preset))
        ->assertForbidden();

    expect(Preset::query()->whereKey($preset)->exists())->toBeTrue();
});

function createPresetFixture(User $user, array $overrides = []): Preset
{
    return $user->presets()->create(array_merge([
        'name' => 'Test preset',
        'style_slug' => 'test-style',
        'customizations' => ['grain' => 1],
        'team_id' => null,
    ], $overrides));
}

function createPresetTeam(User $owner, string $name = 'Test Team'): Team
{
    $team = Team::create([
        'name' => $name,
        'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
        'owner_id' => $owner->id,
    ]);

    $owner->teams()->attach($team->id, [
        'role' => 'owner',
        'joined_at' => now(),
    ]);

    return $team;
}
