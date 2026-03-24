<?php

use App\Http\Controllers\Admin\SupportController as AdminSupportController;
use App\Http\Controllers\Admin\SupportTicketReplyController as AdminSupportTicketReplyController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\SupportTicketReplyController;
use Illuminate\Support\Facades\Route;

Route::get('/support', [SupportController::class, 'create'])->name('support.create');
Route::post('/support', [SupportController::class, 'store'])->name('support.store');

Route::middleware('auth')->group(function () {
    Route::get('/support/tickets', [SupportController::class, 'index'])->name('support.tickets.index');
    Route::get('/support/tickets/{ticket}', [SupportController::class, 'show'])->name('support.tickets.show');
    Route::post('/support/tickets/{ticket}/reply', [SupportTicketReplyController::class, 'store'])->name('support.tickets.reply');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/support', [AdminSupportController::class, 'index'])->name('support.index');
    Route::get('/support/{ticket}', [AdminSupportController::class, 'show'])->name('support.show');
    Route::patch('/support/{ticket}', [AdminSupportController::class, 'update'])->name('support.update');
    Route::post('/support/{ticket}/reply', [AdminSupportTicketReplyController::class, 'store'])->name('support.reply');
});
