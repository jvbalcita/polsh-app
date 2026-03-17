<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiKeyController extends Controller
{
    public function index(Request $request): Response
    {
        $apiKeys = $request->user()
            ->apiKeys()
            ->latest()
            ->get(['id', 'name', 'key_prefix', 'last_used_at', 'requests_today', 'requests_reset_at', 'revoked_at', 'created_at']);

        return Inertia::render('Dashboard/ApiKeys', [
            'apiKeys' => $apiKeys,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:60'],
        ]);

        // Generate a high-entropy bearer token: "pk_" prefix + 40 random hex chars
        $plaintext = 'pk_'.bin2hex(random_bytes(20));
        $hash = hash('sha256', $plaintext);
        $prefix = substr($plaintext, 0, 8);

        $apiKey = $request->user()->apiKeys()->create([
            'name' => $request->input('name'),
            'key' => $hash,
            'key_prefix' => $prefix,
            'requests_reset_at' => now(),
        ]);

        // Return the plaintext key once — it will never be shown again
        return response()->json([
            'id' => $apiKey->id,
            'name' => $apiKey->name,
            'key' => $plaintext,
            'key_prefix' => $prefix,
        ], 201);
    }

    public function revoke(Request $request, ApiKey $apiKey): RedirectResponse
    {
        abort_unless($request->user()->id === $apiKey->user_id, 403);

        $apiKey->update(['revoked_at' => now()]);

        return back();
    }
}
