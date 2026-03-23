<?php

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use App\Services\PayMongoService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;

test('authenticated users can visit the billing portal and receive subscription and is pro props', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    $subscription = Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'active',
        'paymongo_subscription_id' => 'cs_portal_test',
        'paymongo_payment_method_id' => 'pm_portal_test',
        'current_period_start' => now()->subDay(),
        'current_period_end' => now()->addMonth(),
    ]);

    $this->actingAs($user)
        ->get(route('billing.portal'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Billing/Index')
            ->has('subscription')
            ->where('subscription.id', $subscription->id)
            ->where('subscription.plan', 'pro_monthly')
            ->where('subscription.status', 'active')
            ->where('isPro', true),
        );
});

test('subscription active scope keeps only active unexpired subscriptions and returns a builder', function () {
    $user = User::factory()->create();

    $activeSubscription = Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'active',
        'paymongo_subscription_id' => 'cs_scope_active',
        'paymongo_payment_method_id' => 'pm_scope_active',
        'current_period_start' => now()->subDay(),
        'current_period_end' => now()->addDay(),
    ]);

    Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'active',
        'paymongo_subscription_id' => 'cs_scope_expired',
        'paymongo_payment_method_id' => 'pm_scope_expired',
        'current_period_start' => now()->subWeek(),
        'current_period_end' => now()->subSecond(),
    ]);

    Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'cancelled',
        'paymongo_subscription_id' => 'cs_scope_cancelled',
        'paymongo_payment_method_id' => 'pm_scope_cancelled',
        'current_period_start' => now()->subDay(),
        'current_period_end' => now()->addDay(),
        'cancelled_at' => now(),
    ]);

    $scopeMethod = new ReflectionMethod(Subscription::class, 'scopeActive');

    expect($scopeMethod->getReturnType()?->getName())->toBe(Builder::class);
    expect(Subscription::query()->active()->pluck('id')->all())->toBe([$activeSubscription->id]);
});

test('checkout validates allowed plans', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->from(route('billing.portal'))
        ->post(route('billing.checkout'), [
            'plan' => 'enterprise',
        ]);

    $response
        ->assertSessionHasErrors('plan')
        ->assertRedirect(route('billing.portal'));
});

test('checkout redirects to the paymongo checkout url when given a valid plan', function () {
    $user = User::factory()->create();

    $this->mock(PayMongoService::class, function (MockInterface $mock): void {
        $mock->shouldReceive('createCheckoutSession')
            ->once()
            ->andReturn([
                'id' => 'cs_valid_plan',
                'attributes' => [
                    'checkout_url' => 'https://paymongo.test/checkout/cs_valid_plan',
                ],
            ]);
    });

    $this->actingAs($user)
        ->post(route('billing.checkout'), [
            'plan' => 'pro_monthly',
        ])
        ->assertRedirect('https://paymongo.test/checkout/cs_valid_plan');
});

test('success redirects with error when session id is missing', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('billing.success'))
        ->assertRedirect(route('billing.portal'))
        ->assertSessionHas('error', 'Invalid session.');
});

test('success activates a subscription and updates the users plan when paymongo returns a paid session', function () {
    $user = User::factory()->create(['plan' => 'free']);

    $this->mock(PayMongoService::class, function (MockInterface $mock) use ($user): void {
        $mock->shouldReceive('retrieveCheckoutSession')
            ->once()
            ->with('cs_paid_session')
            ->andReturn([
                'attributes' => [
                    'status' => 'paid',
                    'description' => "user:{$user->id}|plan:pro_yearly",
                    'payment_method_used' => 'pm_paid_session',
                    'line_items' => [[
                        'amount' => 450000,
                    ]],
                ],
            ]);
    });

    $this->actingAs($user)
        ->get(route('billing.success', ['session_id' => 'cs_paid_session']))
        ->assertRedirect(route('billing.portal'));

    $subscription = Subscription::query()->where('paymongo_subscription_id', 'cs_paid_session')->first();

    expect($subscription)->not->toBeNull();
    expect($subscription?->plan)->toBe('pro_yearly');
    expect($subscription?->status)->toBe('active');
    expect($subscription?->paymongo_payment_method_id)->toBe('pm_paid_session');

    $payment = Payment::query()->where('paymongo_payment_id', 'cs_paid_session')->first();

    expect($payment)->not->toBeNull();
    expect($payment?->amount)->toBe(450000);
    expect($payment?->status)->toBe('paid');
    expect($payment?->currency)->toBe('PHP');

    expect($user->refresh()->plan)->toBe('pro');
});

test('success does not create duplicate subscriptions or payments when the same session is processed twice', function () {
    $user = User::factory()->create(['plan' => 'free']);

    $this->mock(PayMongoService::class, function (MockInterface $mock) use ($user): void {
        $mock->shouldReceive('retrieveCheckoutSession')
            ->once()
            ->with('cs_duplicate_success')
            ->andReturn([
                'attributes' => [
                    'status' => 'paid',
                    'description' => "user:{$user->id}|plan:pro_monthly",
                    'payment_method_used' => 'pm_duplicate_success',
                    'line_items' => [[
                        'amount' => 50000,
                    ]],
                ],
            ]);
    });

    $this->actingAs($user)
        ->get(route('billing.success', ['session_id' => 'cs_duplicate_success']))
        ->assertRedirect(route('billing.portal'));

    $this->actingAs($user)
        ->get(route('billing.success', ['session_id' => 'cs_duplicate_success']))
        ->assertRedirect(route('billing.portal'));

    expect(Subscription::query()->where('paymongo_subscription_id', 'cs_duplicate_success')->count())->toBe(1);
    expect(Payment::query()->where('paymongo_payment_id', 'cs_duplicate_success')->count())->toBe(1);
});

test('success applies a paid session to the user encoded in the checkout metadata', function () {
    $checkoutOwner = User::factory()->create(['plan' => 'free']);
    $otherUser = User::factory()->create(['plan' => 'free']);

    $this->mock(PayMongoService::class, function (MockInterface $mock) use ($checkoutOwner): void {
        $mock->shouldReceive('retrieveCheckoutSession')
            ->once()
            ->with('cs_replayed_session')
            ->andReturn([
                'attributes' => [
                    'status' => 'paid',
                    'description' => "user:{$checkoutOwner->id}|plan:pro_monthly",
                    'payment_method_used' => 'pm_replayed_session',
                    'line_items' => [[
                        'amount' => 50000,
                    ]],
                ],
            ]);
    });

    $this->actingAs($otherUser)
        ->get(route('billing.success', ['session_id' => 'cs_replayed_session']))
        ->assertRedirect(route('billing.portal'));

    expect($checkoutOwner->refresh()->plan)->toBe('pro')
        ->and($otherUser->refresh()->plan)->toBe('free');
});

test('success reuses an existing payment record for the same checkout session', function () {
    $user = User::factory()->create(['plan' => 'free']);

    Payment::create([
        'user_id' => $user->id,
        'paymongo_payment_id' => 'cs_existing_payment',
        'amount' => 50000,
        'currency' => 'PHP',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $this->mock(PayMongoService::class, function (MockInterface $mock) use ($user): void {
        $mock->shouldReceive('retrieveCheckoutSession')
            ->once()
            ->with('cs_existing_payment')
            ->andReturn([
                'attributes' => [
                    'status' => 'paid',
                    'description' => "user:{$user->id}|plan:pro_monthly",
                    'payment_method_used' => 'pm_existing_payment',
                    'line_items' => [[
                        'amount' => 50000,
                    ]],
                ],
            ]);
    });

    $this->actingAs($user)
        ->get(route('billing.success', ['session_id' => 'cs_existing_payment']))
        ->assertRedirect(route('billing.portal'));

    expect(Payment::query()->where('paymongo_payment_id', 'cs_existing_payment')->count())->toBe(1);
    expect(Subscription::query()->where('paymongo_subscription_id', 'cs_existing_payment')->count())->toBe(1);
});

test('subscriptions enforce paymongo session uniqueness at the database layer', function () {
    $user = User::factory()->create();

    Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'active',
        'paymongo_subscription_id' => 'cs_unique_enforced',
        'paymongo_payment_method_id' => 'pm_unique_enforced',
        'current_period_start' => now(),
        'current_period_end' => now()->addMonth(),
    ]);

    expect(fn () => Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'active',
        'paymongo_subscription_id' => 'cs_unique_enforced',
        'paymongo_payment_method_id' => 'pm_unique_enforced_2',
        'current_period_start' => now(),
        'current_period_end' => now()->addMonth(),
    ]))->toThrow(QueryException::class);
});

test('cancel marks active subscriptions cancelled and redirects with cancelled flash', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    $activeSubscription = Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'active',
        'paymongo_subscription_id' => 'cs_cancel_active',
        'paymongo_payment_method_id' => 'pm_cancel_active',
        'current_period_start' => now()->subWeek(),
        'current_period_end' => now()->addWeek(),
    ]);

    $expiredSubscription = Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_yearly',
        'status' => 'expired',
        'paymongo_subscription_id' => 'cs_cancel_expired',
        'paymongo_payment_method_id' => 'pm_cancel_expired',
        'current_period_start' => now()->subYear(),
        'current_period_end' => now()->subMonth(),
    ]);

    $this->actingAs($user)
        ->post(route('billing.cancel'))
        ->assertRedirect(route('billing.portal'))
        ->assertSessionHas('cancelled', true);

    expect($activeSubscription->fresh()?->status)->toBe('cancelled');
    expect($activeSubscription->fresh()?->cancelled_at)->not->toBeNull();

    expect($expiredSubscription->fresh()?->status)->toBe('expired');
    expect($expiredSubscription->fresh()?->cancelled_at)->toBeNull();
});

test('portal returns a cancelled subscription and isPro true when the period has not expired', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    $cancelledSubscription = Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'cancelled',
        'paymongo_subscription_id' => 'cs_portal_cancelled',
        'paymongo_payment_method_id' => 'pm_portal_cancelled',
        'current_period_start' => now()->subWeek(),
        'current_period_end' => now()->addWeek(),
        'cancelled_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('billing.portal'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Billing/Index')
            ->where('subscription.id', $cancelledSubscription->id)
            ->where('subscription.status', 'cancelled')
            ->where('isPro', true),
        );
});

test('portal returns null subscription and isPro false when cancelled subscription has expired', function () {
    $user = User::factory()->create(['plan' => 'free']);

    Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'cancelled',
        'paymongo_subscription_id' => 'cs_portal_expired_cancelled',
        'paymongo_payment_method_id' => 'pm_portal_expired_cancelled',
        'current_period_start' => now()->subMonth(),
        'current_period_end' => now()->subDay(),
        'cancelled_at' => now()->subWeek(),
    ]);

    $this->actingAs($user)
        ->get(route('billing.portal'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Billing/Index')
            ->where('subscription', null)
            ->where('isPro', false),
        );
});

test('reactivate restores a cancelled subscription to active and redirects with reactivated flash', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    $cancelledSubscription = Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'cancelled',
        'paymongo_subscription_id' => 'cs_reactivate',
        'paymongo_payment_method_id' => 'pm_reactivate',
        'current_period_start' => now()->subWeek(),
        'current_period_end' => now()->addWeek(),
        'cancelled_at' => now()->subDay(),
    ]);

    $this->actingAs($user)
        ->post(route('billing.reactivate'))
        ->assertRedirect(route('billing.portal'))
        ->assertSessionHas('reactivated', true);

    expect($cancelledSubscription->fresh()?->status)->toBe('active');
    expect($cancelledSubscription->fresh()?->cancelled_at)->toBeNull();
});

test('reactivate does not affect already expired subscriptions', function () {
    $user = User::factory()->create(['plan' => 'free']);

    $expiredSubscription = Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'cancelled',
        'paymongo_subscription_id' => 'cs_reactivate_expired',
        'paymongo_payment_method_id' => 'pm_reactivate_expired',
        'current_period_start' => now()->subMonth(),
        'current_period_end' => now()->subDay(),
        'cancelled_at' => now()->subWeek(),
    ]);

    $this->actingAs($user)
        ->post(route('billing.reactivate'))
        ->assertRedirect(route('billing.portal'));

    expect($expiredSubscription->fresh()?->status)->toBe('cancelled');
});

test('webhook rejects invalid signatures', function () {
    $this->mock(PayMongoService::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verifyWebhookSignature')
            ->once()
            ->andReturn(false);
    });

    $this->withHeaders([
        'Paymongo-Signature' => 't=123,te=invalid',
    ])->postJson(route('paymongo.webhook'), [
        'data' => [
            'attributes' => [
                'type' => 'checkout_session.payment.paid',
                'data' => [
                    'id' => 'cs_invalid_signature',
                    'attributes' => [
                        'description' => 'user:1|plan:pro_monthly',
                        'line_items' => [[
                            'amount' => 50000,
                        ]],
                    ],
                ],
            ],
        ],
    ])->assertStatus(400)
        ->assertJson([
            'error' => 'Invalid signature',
        ]);
});

test('webhook returns ok for a valid signature and paid event', function () {
    $user = User::factory()->create(['plan' => 'free']);

    $this->mock(PayMongoService::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verifyWebhookSignature')
            ->once()
            ->andReturn(true);
    });

    $this->withHeaders([
        'Paymongo-Signature' => 't=123,te=valid',
    ])->postJson(route('paymongo.webhook'), [
        'data' => [
            'attributes' => [
                'type' => 'checkout_session.payment.paid',
                'data' => [
                    'id' => 'cs_webhook_paid',
                    'attributes' => [
                        'description' => "user:{$user->id}|plan:pro_monthly",
                        'payment_method_used' => 'pm_webhook_paid',
                        'line_items' => [[
                            'amount' => 50000,
                        ]],
                    ],
                ],
            ],
        ],
    ])->assertOk()
        ->assertJson([
            'status' => 'ok',
        ]);

    $subscription = Subscription::query()->where('paymongo_subscription_id', 'cs_webhook_paid')->first();

    expect($subscription)->not->toBeNull();
    expect($subscription?->plan)->toBe('pro_monthly');
    expect($subscription?->status)->toBe('active');
    expect($subscription?->paymongo_payment_method_id)->toBe('pm_webhook_paid');

    $payment = Payment::query()->where('paymongo_payment_id', 'cs_webhook_paid')->first();

    expect($payment)->not->toBeNull();
    expect($payment?->amount)->toBe(50000);
    expect($payment?->status)->toBe('paid');

    expect($user->refresh()->plan)->toBe('pro');
});

test('webhook does not create duplicate subscriptions or payments when the same session is processed twice', function () {
    $user = User::factory()->create(['plan' => 'free']);

    $this->mock(PayMongoService::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verifyWebhookSignature')
            ->twice()
            ->andReturn(true);
    });

    $payload = [
        'data' => [
            'attributes' => [
                'type' => 'checkout_session.payment.paid',
                'data' => [
                    'id' => 'cs_duplicate_webhook',
                    'attributes' => [
                        'description' => "user:{$user->id}|plan:pro_monthly",
                        'payment_method_used' => 'pm_duplicate_webhook',
                        'line_items' => [[
                            'amount' => 50000,
                        ]],
                    ],
                ],
            ],
        ],
    ];

    $this->withHeaders([
        'Paymongo-Signature' => 't=123,te=valid',
    ])->postJson(route('paymongo.webhook'), $payload)->assertOk();

    $this->withHeaders([
        'Paymongo-Signature' => 't=123,te=valid',
    ])->postJson(route('paymongo.webhook'), $payload)->assertOk();

    expect(Subscription::query()->where('paymongo_subscription_id', 'cs_duplicate_webhook')->count())->toBe(1);
    expect(Payment::query()->where('paymongo_payment_id', 'cs_duplicate_webhook')->count())->toBe(1);
});

test('checkout success cancels old monthly subscription when switching to yearly', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    $oldSubscription = Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'active',
        'paymongo_subscription_id' => 'cs_old_monthly',
        'paymongo_payment_method_id' => 'pm_old_monthly',
        'current_period_start' => now()->subDay(),
        'current_period_end' => now()->addWeeks(3),
    ]);

    $this->mock(PayMongoService::class, function (MockInterface $mock) use ($user, $oldSubscription): void {
        $mock->shouldReceive('retrieveCheckoutSession')
            ->once()
            ->with('cs_yearly_switch')
            ->andReturn([
                'attributes' => [
                    'status' => 'paid',
                    'description' => "user:{$user->id}|plan:pro_yearly|switch:1|old_sub:{$oldSubscription->id}",
                    'payment_method_used' => 'pm_yearly_switch',
                    'line_items' => [['amount' => 450000]],
                ],
            ]);
    });

    session(['paymongo_checkout_id' => 'cs_yearly_switch']);

    $this->actingAs($user)
        ->get(route('billing.success', ['session_id' => 'cs_yearly_switch']))
        ->assertRedirect(route('billing.portal'));

    expect(Subscription::query()->where('paymongo_subscription_id', 'cs_yearly_switch')->first()?->plan)->toBe('pro_yearly');
    expect($oldSubscription->fresh()?->status)->toBe('cancelled');
    expect($oldSubscription->fresh()?->cancelled_at)->not->toBeNull();
    // Old sub period_end should be unchanged (user keeps access until it expires)
    expect($oldSubscription->fresh()?->current_period_end->gt(now()))->toBeTrue();
});

test('webhook cancels old monthly subscription when processing yearly switch payment', function () {
    $user = User::factory()->create(['plan' => 'pro']);

    $oldSubscription = Subscription::create([
        'user_id' => $user->id,
        'plan' => 'pro_monthly',
        'status' => 'active',
        'paymongo_subscription_id' => 'cs_old_monthly_wh',
        'paymongo_payment_method_id' => 'pm_old_monthly_wh',
        'current_period_start' => now()->subDay(),
        'current_period_end' => now()->addWeeks(3),
    ]);

    $this->mock(PayMongoService::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verifyWebhookSignature')
            ->once()
            ->andReturn(true);
    });

    $payload = [
        'data' => [
            'attributes' => [
                'type' => 'checkout_session.payment.paid',
                'data' => [
                    'id' => 'cs_yearly_switch_wh',
                    'attributes' => [
                        'description' => "user:{$user->id}|plan:pro_yearly|switch:1|old_sub:{$oldSubscription->id}",
                        'payment_method_used' => 'pm_yearly_switch_wh',
                        'line_items' => [['amount' => 450000]],
                    ],
                ],
            ],
        ],
    ];

    $this->withHeaders([
        'Paymongo-Signature' => 't=123,te=valid',
    ])->postJson(route('paymongo.webhook'), $payload)->assertOk();

    expect(Subscription::query()->where('paymongo_subscription_id', 'cs_yearly_switch_wh')->first()?->plan)->toBe('pro_yearly');
    expect($oldSubscription->fresh()?->status)->toBe('cancelled');
    expect($oldSubscription->fresh()?->cancelled_at)->not->toBeNull();
    expect($oldSubscription->fresh()?->current_period_end->gt(now()))->toBeTrue();
});
