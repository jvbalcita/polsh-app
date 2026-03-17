<?php

use App\Http\Controllers\BillingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/billing', [BillingController::class, 'portal'])->name('billing.portal');
    Route::post('/billing/checkout', [BillingController::class, 'checkout'])->name('billing.checkout');
    Route::get('/billing/success', [BillingController::class, 'success'])->name('billing.success');
    Route::post('/billing/cancel', [BillingController::class, 'cancel'])->name('billing.cancel');
});

// Webhook — signature verified in controller; CSRF excluded in bootstrap/app.php
Route::post('/paymongo/webhook', [BillingController::class, 'webhook'])->name('paymongo.webhook');
