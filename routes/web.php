<?php

use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\Auth\GithubAuthController;
use App\Http\Controllers\PresetController;
use App\Http\Controllers\SessionController;
use App\Models\ExportSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::inertia('/', 'Welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Editor — accepts optional ?session= query param to restore a previous export
Route::get('editor', function (Request $request) {
    $sessionData = null;

    if ($request->filled('session') && $request->user()) {
        $session = ExportSession::where('id', $request->integer('session'))
            ->where('user_id', $request->user()->id)
            ->first();

        if ($session) {
            $sessionData = $session->only(['style_slug', 'settings']);
        }
    }

    return Inertia::render('Editor', ['sessionData' => $sessionData]);
})->name('editor');

// GitHub OAuth
Route::get('auth/github', [GithubAuthController::class, 'redirectToGithub'])->name('auth.github');
Route::get('auth/github/callback', [GithubAuthController::class, 'handleGithubCallback'])->name('auth.github.callback');

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
Route::get('history', function (Request $request) {
    $sessions = ExportSession::where('user_id', $request->user()->id)
        ->latest()
        ->limit(20)
        ->get(['id', 'style_slug', 'settings', 'image_count', 'thumbnail_url', 'created_at']);

    return Inertia::render('History', ['sessions' => $sessions]);
})->middleware('auth')->name('history');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');

    Route::get('dashboard/api-keys', [ApiKeyController::class, 'index'])->name('api-keys.index');
    Route::post('dashboard/api-keys', [ApiKeyController::class, 'store'])->name('api-keys.store');
    Route::post('dashboard/api-keys/{apiKey}/revoke', [ApiKeyController::class, 'revoke'])->name('api-keys.revoke');
});

Route::inertia('docs/api', 'Docs/Api')->name('docs.api');

require __DIR__.'/billing.php';
require __DIR__.'/settings.php';
require __DIR__.'/teams.php';
