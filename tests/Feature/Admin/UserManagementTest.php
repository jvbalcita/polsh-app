<?php

use App\Mail\WelcomeEmail;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    // Regular users have no explicit role; Spatie Permission guards by role absence
    $this->user = User::factory()->create();
});

it('allows admin to view user list', function () {
    actingAs($this->admin)
        ->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Users/Index'));
});

it('allows admin to search users by name', function () {
    actingAs($this->admin)
        ->get('/admin/users?q='.urlencode($this->user->name))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 1)
        );
});

it('allows admin to filter users by role', function () {
    actingAs($this->admin)
        ->get('/admin/users?role=admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 1)
        );
});

it('allows admin to view user detail', function () {
    actingAs($this->admin)
        ->get("/admin/users/{$this->user->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Users/Show'));
});

it('allows admin to change user role', function () {
    actingAs($this->admin)
        ->patch("/admin/users/{$this->user->id}/role", ['role' => 'admin'])
        ->assertRedirect();

    expect($this->user->fresh()->hasRole('admin'))->toBeTrue();
});

it('prevents non-admin from accessing user list', function () {
    actingAs($this->user)
        ->get('/admin/users')
        ->assertForbidden();
});

it('prevents guest from accessing user list', function () {
    $this->get('/admin/users')->assertRedirect('/login');
});

it('sends welcome email when a new user registers', function () {
    Mail::fake();

    $newUser = User::factory()->make();

    event(new Registered($newUser));

    Mail::assertQueued(WelcomeEmail::class, fn ($mail) => $mail->hasTo($newUser->email));
});
