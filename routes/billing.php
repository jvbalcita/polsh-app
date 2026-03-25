<?php

use App\Http\Controllers\BillingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/billing', [BillingController::class, 'portal'])->name('billing.portal');
    Route::post('/billing/checkout', [BillingController::class, 'checkout'])->name('billing.checkout');
    Route::get('/billing/portal', [BillingController::class, 'redirectPortal'])->name('billing.redirect-portal');
    Route::post('/billing/cancel', [BillingController::class, 'cancel'])->name('billing.cancel');
    Route::post('/billing/reactivate', [BillingController::class, 'reactivate'])->name('billing.reactivate');
});

// Webhook — signature verified by the package; CSRF excluded in bootstrap/app.php
// The package auto-registers POST /lemon-squeezy/webhook via LemonSqueezyServiceProvider
