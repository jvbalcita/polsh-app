<?php

use App\Http\Controllers\Settings\BillingController;
use App\Http\Controllers\Settings\ConnectedProviderController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('settings/avatar', [ProfileController::class, 'uploadAvatar'])->name('profile.avatar');

    Route::get('settings/billing', [BillingController::class, 'edit'])->name('billing.edit');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');
    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::delete('settings/security/providers/{provider}', [ConnectedProviderController::class, 'destroy'])
        ->name('security.providers.destroy');
});
