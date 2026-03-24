<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A variant of Laravel's built-in `password.confirm` middleware that only
 * enforces password confirmation for users who actually have a password set.
 *
 * OAuth-only users (password === null) are passed through without prompting,
 * since they have no password to confirm and would otherwise be locked out.
 */
class EnsurePasswordConfirmedIfHasPassword
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->password !== null) {
            $confirmedAt = (int) $request->session()->get('auth.password_confirmed_at', 0);
            $timeout = (int) config('auth.password_timeout', 10800);

            if (time() - $confirmedAt > $timeout) {
                return $request->expectsJson()
                    ? response()->json(['message' => 'Password confirmation required.'], 423)
                    : redirect()->guest(route('password.confirm'));
            }
        }

        return $next($request);
    }
}
