<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsurePasswordConfirmedIfHasPassword;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware as ControllerMiddleware;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class SecurityController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     *
     * Applies `password.confirm` when Fortify 2FA is enabled with `confirmPassword: true`.
     */
    public static function middleware(): array
    {
        if (Features::canManageTwoFactorAuthentication() && Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword')) {
            return [new ControllerMiddleware(EnsurePasswordConfirmedIfHasPassword::class, only: ['edit'])];
        }

        return [];
    }

    /**
     * Show the user's security settings page.
     */
    public function edit(TwoFactorAuthenticationRequest $request): Response
    {
        $user = $request->user();

        $props = [
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
            'hasPassword' => $user->password !== null,
            'connectedProviders' => array_values(array_filter([
                $user->github_id !== null ? 'github' : null,
            ])),
        ];

        if (Features::canManageTwoFactorAuthentication()) {
            $request->ensureStateIsValid();

            $props['twoFactorEnabled'] = $user->hasEnabledTwoFactorAuthentication();
            $props['requiresConfirmation'] = Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm');
        }

        return Inertia::render('settings/Security', $props);
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => $request->password,
        ]);

        return back();
    }
}
