<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
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

        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            $user->update([
                'avatar' => $googleUser->getAvatar(),
            ]);
        } else {
            $user = User::create([
                'name' => $googleUser->getName() ?? 'Google User',
                'email' => $googleUser->getEmail(),
                'avatar' => $googleUser->getAvatar(),
                // Random password — this account uses Google OAuth only.
                'password' => Str::password(32),
            ]);
        }

        Auth::login($user, remember: true);

        return redirect()->route('editor');
    }
}
