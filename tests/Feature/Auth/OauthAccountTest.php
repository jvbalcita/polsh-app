<?php

use App\Models\OauthAccount;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

function makeSocialiteUser(array $attributes = []): SocialiteUser
{
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->token = $attributes['token'] ?? 'github-token-123';
    $socialiteUser->refreshToken = $attributes['refresh_token'] ?? null;
    $socialiteUser->shouldReceive('getId')->andReturn($attributes['id'] ?? '12345');
    $socialiteUser->shouldReceive('getName')->andReturn($attributes['name'] ?? 'Jane Dev');
    $socialiteUser->shouldReceive('getNickname')->andReturn($attributes['nickname'] ?? 'janedev');
    $socialiteUser->shouldReceive('getEmail')->andReturn($attributes['email'] ?? 'jane@example.com');
    $socialiteUser->shouldReceive('getAvatar')->andReturn($attributes['avatar'] ?? 'https://avatars.example.com/jane.png');

    return $socialiteUser;
}

test('github creates new user and oauth account on first login', function () {
    $socialiteUser = makeSocialiteUser(['refresh_token' => 'github-refresh-token-abc']);

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.github.callback'));

    $response->assertRedirect(route('editor'));
    $this->assertAuthenticated();

    $user = User::query()->where('email', 'jane@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->name)->toBe('Jane Dev');
    expect($user->email_verified_at)->not->toBeNull();

    $oauthAccount = OauthAccount::query()
        ->where('provider', 'github')
        ->where('provider_user_id', '12345')
        ->first();

    expect($oauthAccount)->not->toBeNull();
    expect($oauthAccount->user_id)->toBe($user->id);
    expect($oauthAccount->token)->toBe('github-token-123');
    expect($oauthAccount->refresh_token)->toBe('github-refresh-token-abc');
    expect($oauthAccount->email)->toBe('jane@example.com');
});

test('github callback redirects with error when email is not public', function () {
    $socialiteUser = makeSocialiteUser(['email' => null]);

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.github.callback'));

    $response->assertRedirect(route('login'));
    $this->assertGuest();
    expect(User::query()->count())->toBe(0);
});

test('github links existing email-registered user instead of creating duplicate', function () {
    $existingUser = User::factory()->create([
        'email' => 'jane@example.com',
        'name' => 'Jane Existing',
    ]);

    $socialiteUser = makeSocialiteUser(['id' => '99999']);

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.github.callback'));

    $response->assertRedirect(route('editor'));

    expect(User::query()->count())->toBe(1);

    $oauthAccount = OauthAccount::query()
        ->where('provider', 'github')
        ->where('provider_user_id', '99999')
        ->first();

    expect($oauthAccount)->not->toBeNull();
    expect($oauthAccount->user_id)->toBe($existingUser->id);
});

test('github second login updates token without creating duplicate records', function () {
    $user = User::factory()->create(['email' => 'jane@example.com']);

    OauthAccount::create([
        'user_id' => $user->id,
        'provider' => 'github',
        'provider_user_id' => '12345',
        'token' => 'old-token',
        'email' => 'jane@example.com',
    ]);

    $socialiteUser = makeSocialiteUser(['token' => 'new-token-456']);

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.github.callback'));

    $response->assertRedirect(route('editor'));

    expect(OauthAccount::query()->count())->toBe(1);

    $oauthAccount = OauthAccount::query()->first();
    expect($oauthAccount->token)->toBe('new-token-456');
});

test('google creates new user and oauth account on first login', function () {
    $socialiteUser = makeSocialiteUser([
        'id' => 'google-id-789',
        'email' => 'google@example.com',
        'name' => 'Google User',
        'token' => 'google-token-abc',
    ]);

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('editor'));
    $this->assertAuthenticated();

    $user = User::query()->where('email', 'google@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->email_verified_at)->not->toBeNull();

    $oauthAccount = OauthAccount::query()
        ->where('provider', 'google')
        ->where('provider_user_id', 'google-id-789')
        ->first();

    expect($oauthAccount)->not->toBeNull();
    expect($oauthAccount->user_id)->toBe($user->id);
    expect($oauthAccount->token)->toBe('google-token-abc');
});

test('google second login is idempotent and updates token without duplicate record', function () {
    $user = User::factory()->create(['email' => 'google@example.com']);

    OauthAccount::create([
        'user_id' => $user->id,
        'provider' => 'google',
        'provider_user_id' => 'google-id-789',
        'token' => 'old-google-token',
        'email' => 'google@example.com',
    ]);

    $socialiteUser = makeSocialiteUser([
        'id' => 'google-id-789',
        'email' => 'google@example.com',
        'token' => 'new-google-token',
    ]);

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('editor'));

    expect(OauthAccount::query()->count())->toBe(1);

    $oauthAccount = OauthAccount::query()->first();
    expect($oauthAccount->token)->toBe('new-google-token');
});
