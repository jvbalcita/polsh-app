<?php

use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\Auth\GithubAuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EditorController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\PresetController;
use App\Http\Controllers\SessionController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'Welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Editor — accepts optional ?session= query param to restore a previous export
Route::get('editor', EditorController::class)->name('editor');

// GitHub OAuth
Route::get('auth/github', [GithubAuthController::class, 'redirectToGithub'])->name('auth.github');
Route::get('auth/github/callback', [GithubAuthController::class, 'handleGithubCallback'])->name('auth.github.callback');

// Google OAuth
Route::get('auth/google', [GoogleAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// Presets (auth-gated JSON API)
Route::middleware('auth')->group(function () {
    Route::get('presets', [PresetController::class, 'index'])->name('presets.index');
    Route::post('presets', [PresetController::class, 'store'])->name('presets.store');
    Route::delete('presets/{preset}', [PresetController::class, 'destroy'])->name('presets.destroy');
});

// Export sessions (auth-gated JSON API)
Route::middleware('auth')->group(function () {
    Route::get('sessions', [SessionController::class, 'index'])->name('sessions.index');
    Route::post('sessions', [SessionController::class, 'store'])->name('sessions.store');
    Route::get('sessions/{session}', [SessionController::class, 'show'])->name('sessions.show');
    Route::delete('sessions/{session}', [SessionController::class, 'destroy'])->name('sessions.destroy');
});

// Export history page
Route::get('history', HistoryController::class)->middleware('auth')->name('history');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('dashboard/api-keys', [ApiKeyController::class, 'index'])->name('api-keys.index');
    Route::post('dashboard/api-keys', [ApiKeyController::class, 'store'])->name('api-keys.store');
    Route::post('dashboard/api-keys/{apiKey}/revoke', [ApiKeyController::class, 'revoke'])->name('api-keys.revoke');
});

Route::inertia('docs/api', 'Docs/Api')->name('docs.api');

Route::inertia('changelog', 'Changelog')->name('changelog');

// Legal pages
Route::get('/terms-of-service', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/privacy-policy', [LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/refund-policy', [LegalController::class, 'refund'])->name('legal.refund');

// Sitemap
Route::get('/sitemap.xml', static fn () => response()->file(public_path('sitemap.xml')))->name('sitemap');

require __DIR__.'/billing.php';
require __DIR__.'/settings.php';
require __DIR__.'/teams.php';
