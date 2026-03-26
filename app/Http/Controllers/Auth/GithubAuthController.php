<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OauthAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GithubAuthController extends Controller
{
    public function redirectToGithub(): RedirectResponse
    {
        return Socialite::driver('github')->redirect();
    }

    public function handleGithubCallback(): RedirectResponse
    {
        $githubUser = Socialite::driver('github')->user();

        $oauthAccount = OauthAccount::query()
            ->where('provider', 'github')
            ->where('provider_user_id', $githubUser->getId())
            ->first();

        $user = $oauthAccount?->user
            ?? User::query()->where('email', $githubUser->getEmail())->first();

        if (! $user) {
            $user = User::create([
                'name' => $githubUser->getName() ?? $githubUser->getNickname() ?? 'GitHub User',
                'email' => $githubUser->getEmail(),
                'avatar' => $githubUser->getAvatar(),
                'email_verified_at' => now(),
                'password' => null,
            ]);
        } else {
            $user->update(['avatar' => $githubUser->getAvatar()]);
        }

        OauthAccount::updateOrCreate(
            ['provider' => 'github', 'provider_user_id' => $githubUser->getId()],
            [
                'user_id' => $user->id,
                'token' => $githubUser->token,
                'name' => $githubUser->getName() ?? $githubUser->getNickname(),
                'email' => $githubUser->getEmail(),
                'avatar' => $githubUser->getAvatar(),
            ]
        );

        Auth::login($user, remember: true);

        return redirect()->route('editor');
    }
}
