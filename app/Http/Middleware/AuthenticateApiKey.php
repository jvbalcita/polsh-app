<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $bearer = $request->bearerToken();

        if (! $bearer) {
            return response()->json(['error' => 'API key required. Pass your key as: Authorization: Bearer {key}'], 401);
        }

        $hash = hash('sha256', $bearer);
        $apiKey = ApiKey::where('key', $hash)->whereNull('revoked_at')->first();

        if (! $apiKey) {
            return response()->json(['error' => 'Invalid or revoked API key.'], 401);
        }

        $user = $apiKey->user;

        if (! $user->isPro()) {
            return response()->json(['error' => 'A Pro subscription is required to use the API.'], 403);
        }

        // Reset daily counter if it was last reset on a previous day
        if (! $apiKey->requests_reset_at->isToday()) {
            $apiKey->requests_today = 0;
            $apiKey->requests_reset_at = now();
            $apiKey->save();
        }

        $dailyLimit = $user->currentTeam() ? 5000 : 500;

        if ($apiKey->requests_today >= $dailyLimit) {
            $retryAfter = now()->endOfDay()->diffInSeconds(now());

            return response()->json([
                'error' => 'Daily rate limit exceeded.',
                'limit' => $dailyLimit,
                'reset_at' => now()->endOfDay()->toIso8601String(),
            ], 429)->header('Retry-After', (string) $retryAfter);
        }

        $apiKey->increment('requests_today');
        $apiKey->update(['last_used_at' => now()]);

        $request->setUserResolver(fn () => $user);
        $request->attributes->set('api_key', $apiKey);

        return $next($request);
    }
}
