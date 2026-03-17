<?php

use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/teams/settings', [TeamController::class, 'settings'])->name('teams.settings');
    Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('/teams/join/{token}', [TeamController::class, 'join'])->name('teams.join');
    Route::post('/teams/{team}/invite', [TeamController::class, 'invite'])->name('teams.invite');
    Route::post('/teams/{team}/leave', [TeamController::class, 'leave'])->name('teams.leave');
});
