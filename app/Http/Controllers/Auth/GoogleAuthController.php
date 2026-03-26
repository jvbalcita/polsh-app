<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OauthAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();

        $oauthAccount = OauthAccount::query()
            ->where('provider', 'google')
            ->where('provider_user_id', $googleUser->getId())
            ->first();

        $user = $oauthAccount?->user
            ?? User::query()->where('email', $googleUser->getEmail())->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName() ?? 'Google User',
                'email' => $googleUser->getEmail(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => now(),
                'password' => null,
            ]);
        } else {
            $user->update(['avatar' => $googleUser->getAvatar()]);
        }

        OauthAccount::updateOrCreate(
            ['provider' => 'google', 'provider_user_id' => $googleUser->getId()],
            [
                'user_id' => $user->id,
                'token' => $googleUser->token,
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'avatar' => $googleUser->getAvatar(),
            ]
        );

        Auth::login($user, remember: true);

        return redirect()->route('editor');
    }
}
