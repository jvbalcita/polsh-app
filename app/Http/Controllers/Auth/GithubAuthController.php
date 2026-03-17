<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
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

        // Match by github_id first, then fall back to email so existing
        // email-registered accounts can link their GitHub without creating a duplicate.
        $user = User::where('github_id', $githubUser->getId())
            ->orWhere('email', $githubUser->getEmail())
            ->first();

        if ($user) {
            $user->update([
                'github_id' => $githubUser->getId(),
                'github_token' => $githubUser->token,
                'avatar' => $githubUser->getAvatar(),
            ]);
        } else {
            $user = User::create([
                'name' => $githubUser->getName() ?? $githubUser->getNickname() ?? 'GitHub User',
                'email' => $githubUser->getEmail(),
                'github_id' => $githubUser->getId(),
                'github_token' => $githubUser->token,
                'avatar' => $githubUser->getAvatar(),
                // Random password — this account uses GitHub OAuth only.
                'password' => Str::password(32),
            ]);
        }

        Auth::login($user, remember: true);

        return redirect()->route('editor');
    }
}
