<?php

use App\Mail\PaymentFailed;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use LemonSqueezy\Laravel\Events\WebhookReceived;
use LemonSqueezy\Laravel\Subscription;

function lsBillable(User $user): array
{
    return [
        'billable_id' => $user->id,
        'billable_type' => 'App\\Models\\User',
    ];
}

function webhookPayload(User $user, string $eventName, array $attributes = []): array
{
    return [
        'meta' => [
            'event_name' => $eventName,
            'custom_data' => ['billable_id' => (string) $user->id, 'billable_type' => 'App\\Models\\User'],
        ],
        'data' => ['attributes' => $attributes],
    ];
}

function fakePortalUrl(): void
{
    Http::fake(['api.lemonsqueezy.com/*' => Http::response([
        'data' => ['attributes' => ['urls' => ['customer_portal' => 'https://app.lemonsqueezy.com/billing']]],
    ])]);
}

function fakeCancelResponse(): void
{
    Http::fake(['api.lemonsqueezy.com/*' => Http::response([
        'data' => ['attributes' => [
            'status' => 'cancelled',
            'product_id' => 1,
            'variant_id' => 111,
            'card_brand' => null,
            'card_last_four' => null,
            'pause' => null,
            'trial_ends_at' => null,
            'renews_at' => null,
            'ends_at' => now()->addWeek()->toIso8601String(),
        ]],
    ])]);
}

function fakeResumeResponse(): void
{
    Http::fake(['api.lemonsqueezy.com/*' => Http::response([
        'data' => ['attributes' => [
            'status' => 'active',
            'product_id' => 1,
            'variant_id' => 111,
            'card_brand' => null,
            'card_last_four' => null,
            'pause' => null,
            'trial_ends_at' => null,
            'renews_at' => now()->addMonth()->toIso8601String(),
            'ends_at' => null,
        ]],
    ])]);
}

// ── Billing Portal ────────────────────────────────────────────────────────────

test('guests are redirected to login from billing portal', function () {
    $this->get(route('billing.portal'))->assertRedirect(route('login'));
});

test('portal returns null subscription and isPro false for a free user', function () {
    $user = User::factory()->create(['plan' => 'free']);

    $this->actingAs($user)
        ->get(route('billing.portal'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Billing/Index')
            ->where('subscription', null)
            ->where('isPro', false)
            ->where('portalUrl', null),
        );
});

test('portal returns active subscription with correct shape and isPro true', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    Subscription::factory()->active()->create(array_merge(lsBillable($user), [
        'renews_at' => now()->addMonth(),
        'ends_at' => null,
    ]));

    fakePortalUrl();

    $this->actingAs($user)
        ->get(route('billing.portal'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Billing/Index')
            ->where('isPro', true)
            ->where('subscription.status', 'active')
            ->where('subscription.on_grace_period', false)
            ->has('subscription.renews_at')
            ->has('subscription.ends_at')
            ->has('subscription.plan')
            ->has('portalUrl'),
        );
});

test('portal returns on_grace_period true for a cancelled subscription within its grace period', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    Subscription::factory()->create(array_merge(lsBillable($user), [
        'status' => 'cancelled',
        'ends_at' => now()->addWeek(),
    ]));

    fakePortalUrl();

    $this->actingAs($user)
        ->get(route('billing.portal'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Billing/Index')
            ->where('subscription.status', 'cancelled')
            ->where('subscription.on_grace_period', true)
            ->where('isPro', true),
        );
});

// ── Checkout ──────────────────────────────────────────────────────────────────

test('checkout rejects invalid plan names', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('billing.portal'))
        ->post(route('billing.checkout'), ['plan' => 'enterprise'])
        ->assertSessionHasErrors('plan');
});

test('checkout returns a json url for pro_monthly', function () {
    $user = User::factory()->create();

    Http::fake(['api.lemonsqueezy.com/*' => Http::response([
        'data' => ['attributes' => ['url' => 'https://checkout.lemonsqueezy.com/test?embed=1']],
    ])]);

    $this->actingAs($user)
        ->postJson(route('billing.checkout'), ['plan' => 'pro_monthly'])
        ->assertOk()
        ->assertJsonStructure(['url'])
        ->assertJson(['url' => 'https://checkout.lemonsqueezy.com/test?embed=1']);
});

test('checkout returns a json url for pro_yearly', function () {
    $user = User::factory()->create();

    Http::fake(['api.lemonsqueezy.com/*' => Http::response([
        'data' => ['attributes' => ['url' => 'https://checkout.lemonsqueezy.com/yearly?embed=1']],
    ])]);

    $this->actingAs($user)
        ->postJson(route('billing.checkout'), ['plan' => 'pro_yearly'])
        ->assertOk()
        ->assertJsonStructure(['url']);
});

// ── Cancel ────────────────────────────────────────────────────────────────────

test('cancel calls the lemon squeezy api and redirects with cancelled flash', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    $subscription = Subscription::factory()->active()->create(array_merge(lsBillable($user), [
        'lemon_squeezy_id' => 'sub_cancel_test',
    ]));

    fakeCancelResponse();

    $this->actingAs($user)
        ->post(route('billing.cancel'))
        ->assertRedirect(route('billing.portal'))
        ->assertSessionHas('cancelled', true);

    expect($subscription->fresh()?->status)->toBe('cancelled');
});

// ── Reactivate ────────────────────────────────────────────────────────────────

test('reactivate calls the lemon squeezy api and redirects with reactivated flash', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    $subscription = Subscription::factory()->create(array_merge(lsBillable($user), [
        'lemon_squeezy_id' => 'sub_reactivate_test',
        'status' => 'cancelled',
        'ends_at' => now()->addWeek(),
    ]));

    fakeResumeResponse();

    $this->actingAs($user)
        ->post(route('billing.reactivate'))
        ->assertRedirect(route('billing.portal'))
        ->assertSessionHas('reactivated', true);

    expect($subscription->fresh()?->status)->toBe('active');
    expect($subscription->fresh()?->ends_at)->toBeNull();
});

// ── User::isPro() ─────────────────────────────────────────────────────────────

test('isPro returns false for a free user with no subscription', function () {
    $user = User::factory()->create(['plan' => 'free']);
    expect($user->isPro())->toBeFalse();
});

test('isPro returns true when plan column is pro', function () {
    $user = User::factory()->create(['plan' => 'pro']);
    expect($user->isPro())->toBeTrue();
});

test('isPro returns true when plan column is team', function () {
    $user = User::factory()->create(['plan' => 'team']);
    expect($user->isPro())->toBeTrue();
});

test('isPro returns true for a free-plan user with an active ls subscription', function () {
    $user = User::factory()->create(['plan' => 'free']);
    Subscription::factory()->active()->create(lsBillable($user));
    expect($user->isPro())->toBeTrue();
});

test('isPro returns true during the grace period after cancellation', function () {
    $user = User::factory()->create(['plan' => 'free']);
    Subscription::factory()->create(array_merge(lsBillable($user), [
        'status' => 'cancelled',
        'ends_at' => now()->addWeek(),
    ]));
    expect($user->isPro())->toBeTrue();
});

test('isPro returns false when the ls subscription is expired', function () {
    $user = User::factory()->create(['plan' => 'free']);
    Subscription::factory()->expired()->create(lsBillable($user));
    expect($user->isPro())->toBeFalse();
});

// ── SyncUserPlan listener ─────────────────────────────────────────────────────

test('SyncUserPlan sets plan to pro on subscription_created', function () {
    $user = User::factory()->create(['plan' => 'free']);
    event(new WebhookReceived(webhookPayload($user, 'subscription_created')));
    expect($user->refresh()->plan)->toBe('pro');
});

test('SyncUserPlan sets plan to free on subscription_expired', function () {
    $user = User::factory()->create(['plan' => 'pro']);
    event(new WebhookReceived(webhookPayload($user, 'subscription_expired')));
    expect($user->refresh()->plan)->toBe('free');
});

test('SyncUserPlan upgrades plan to pro on subscription_updated with active status', function () {
    $user = User::factory()->create(['plan' => 'free']);
    event(new WebhookReceived(webhookPayload($user, 'subscription_updated', ['status' => 'active'])));
    expect($user->refresh()->plan)->toBe('pro');
});

test('SyncUserPlan downgrades plan to free on subscription_updated with expired status', function () {
    $user = User::factory()->create(['plan' => 'pro']);
    event(new WebhookReceived(webhookPayload($user, 'subscription_updated', ['status' => 'expired'])));
    expect($user->refresh()->plan)->toBe('free');
});

test('SyncUserPlan does not change plan on subscription_updated with cancelled status', function () {
    $user = User::factory()->create(['plan' => 'pro']);
    event(new WebhookReceived(webhookPayload($user, 'subscription_updated', ['status' => 'cancelled'])));
    expect($user->refresh()->plan)->toBe('pro');
});

test('SyncUserPlan queues a PaymentFailed mail on subscription_payment_failed', function () {
    Mail::fake();

    $user = User::factory()->create(['plan' => 'pro']);
    event(new WebhookReceived(webhookPayload($user, 'subscription_payment_failed')));

    Mail::assertQueued(PaymentFailed::class, fn ($mail) => $mail->user->id === $user->id);
});

test('SyncUserPlan does nothing when billable_id is missing from the webhook payload', function () {
    $user = User::factory()->create(['plan' => 'free']);
    event(new WebhookReceived([
        'meta' => ['event_name' => 'subscription_created', 'custom_data' => []],
        'data' => ['attributes' => []],
    ]));
    expect($user->refresh()->plan)->toBe('free');
});
