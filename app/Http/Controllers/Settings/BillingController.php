<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/Billing', [
            'plan' => $user->plan ?? 'free',
            'subscriptionEndsAt' => $user->subscriptionEndsAt()?->toDateString(),
            'isPro' => $user->isPro(),
        ]);
    }
}
