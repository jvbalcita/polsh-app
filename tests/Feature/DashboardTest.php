<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->seed(RoleSeeder::class);
    $user = User::factory()->create();
    $user->assignRole('admin');
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard shares the expected shaped auth props', function () {
    $this->seed(RoleSeeder::class);
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('auth.user', [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar_url,
                'email_verified_at' => $user->email_verified_at?->toJSON(),
                'isAdmin' => $user->hasRole('admin'),
            ])
            ->where('auth.plan', $user->plan)
            ->where('isPro', $user->isPro())
            ->where('imageLimit', $user->isPro() ? 10 : 3)
            ->where('teamId', null),
        );
});
