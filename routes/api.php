<?php

use App\Http\Controllers\Api\V1\PolishController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('auth.api')->group(function () {
    Route::post('polish', [PolishController::class, 'create'])->name('api.v1.polish.create');
    Route::get('polish/status/{jobId}', [PolishController::class, 'status'])->name('api.v1.polish.status');
});
