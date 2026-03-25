<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isPro = $user?->isPro() ?? false;
        $sharedUser = $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar_url,
            'email_verified_at' => $user->email_verified_at?->toJSON(),
            'isAdmin' => $user->hasRole('admin'),
        ] : null;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $sharedUser,
                'plan' => $user?->plan,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'isPro' => $isPro,
            'debug_is_pro' => auth()->check() ? auth()->user()->isPro() : false,
            'imageLimit' => $isPro ? 10 : 3,
            'teamId' => $user?->currentTeam()?->id,
            'seo' => [
                'siteName' => 'Polsh',
                'description' => 'Style your code screenshots in seconds. No Figma, no plugins. Drop in a screenshot, pick a style, and export PNG, WebP, or SVG.',
                'ogImage' => asset('images/og-polsh.png'),
                'twitterCard' => 'summary_large_image',
            ],
        ];
    }
}
