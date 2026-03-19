<?php

use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Testing\Fluent\AssertableJson;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated users can visit the api keys page and receive api key props', function () {
    $user = User::factory()->create();
    $apiKey = createApiKeyFor($user, [
        'name' => 'Primary key',
        'key_prefix' => 'pk_live1',
        'webhook_url' => 'https://example.com/hooks/polsh',
    ]);

    $this->actingAs($user)
        ->get(route('api-keys.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/ApiKeys')
            ->has('apiKeys', 1)
            ->where('apiKeys.0.id', $apiKey->id)
            ->where('apiKeys.0.name', 'Primary key')
            ->where('apiKeys.0.key_prefix', 'pk_live1')
            ->where('apiKeys.0.webhook_url', 'https://example.com/hooks/polsh')
            ->has('apiKeys.0.last_used_at')
            ->has('apiKeys.0.requests_today')
            ->has('apiKeys.0.requests_reset_at')
            ->has('apiKeys.0.revoked_at')
            ->has('apiKeys.0.created_at'),
        );
});

test('api keys page returns newest keys first with expected fields', function () {
    $user = User::factory()->create();

    $olderKey = createApiKeyFor($user, [
        'name' => 'Older key',
        'key_prefix' => 'pk_oldr1',
        'created_at' => now()->subMinute(),
        'updated_at' => now()->subMinute(),
    ]);

    $newerKey = createApiKeyFor($user, [
        'name' => 'Newer key',
        'key_prefix' => 'pk_newr1',
        'created_at' => now(),
        'updated_at' => now(),
        'last_used_at' => now()->subSeconds(10),
        'requests_today' => 42,
        'webhook_url' => 'https://example.com/newer',
    ]);

    $this->actingAs($user)
        ->get(route('api-keys.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/ApiKeys')
            ->has('apiKeys', 2)
            ->where('apiKeys.0.id', $newerKey->id)
            ->where('apiKeys.0.name', 'Newer key')
            ->where('apiKeys.0.key_prefix', 'pk_newr1')
            ->where('apiKeys.0.requests_today', 42)
            ->where('apiKeys.0.webhook_url', 'https://example.com/newer')
            ->where('apiKeys.1.id', $olderKey->id)
            ->where('apiKeys.1.name', 'Older key')
            ->where('apiKeys.1.key_prefix', 'pk_oldr1'),
        );
});

test('storing an api key returns created json with id name key and key prefix', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('api-keys.store'), [
        'name' => 'CLI key',
        'webhook_url' => 'https://example.com/api/webhook',
    ]);

    $response
        ->assertCreated()
        ->assertJson(fn (AssertableJson $json) => $json
            ->where('name', 'CLI key')
            ->where('id', fn (int $id): bool => $id > 0)
            ->where('key', fn (string $key): bool => str_starts_with($key, 'pk_'))
            ->where('key_prefix', fn (string $prefix): bool => str_starts_with($prefix, 'pk_'))
            ->etc(),
        );

    $apiKey = ApiKey::query()->findOrFail($response['id']);

    expect($apiKey->name)->toBe('CLI key')
        ->and($apiKey->key_prefix)->toBe($response['key_prefix'])
        ->and($apiKey->key)->not->toBe($response['key'])
        ->and($apiKey->webhook_url)->toBe('https://example.com/api/webhook');
});

test('webhook url is accepted as nullable and persisted', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('api-keys.store'), [
        'name' => 'No webhook key',
        'webhook_url' => null,
    ]);

    $response->assertCreated();

    $apiKey = ApiKey::query()->findOrFail($response['id']);

    expect($apiKey->webhook_url)->toBeNull();
});

test('revoke marks the key as revoked and redirects back', function () {
    $user = User::factory()->create();
    $apiKey = createApiKeyFor($user);

    $this->actingAs($user)
        ->from(route('api-keys.index'))
        ->post(route('api-keys.revoke', $apiKey))
        ->assertRedirect(route('api-keys.index'));

    expect($apiKey->fresh()->revoked_at)->not->toBeNull();
});

test('non owners cannot revoke another users key', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $apiKey = createApiKeyFor($owner);

    $this->actingAs($intruder)
        ->post(route('api-keys.revoke', $apiKey))
        ->assertForbidden();

    expect($apiKey->fresh()->revoked_at)->toBeNull();
});

function createApiKeyFor(User $user, array $overrides = []): ApiKey
{
    return $user->apiKeys()->create(array_merge([
        'name' => 'Test key',
        'key' => hash('sha256', Str::uuid()->toString()),
        'key_prefix' => 'pk_test1',
        'last_used_at' => null,
        'requests_today' => 0,
        'requests_reset_at' => now()->subHour(),
        'revoked_at' => null,
        'webhook_url' => null,
    ], $overrides));
}
