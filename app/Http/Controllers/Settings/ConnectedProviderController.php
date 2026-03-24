<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ConnectedProviderController extends Controller
{
    public function destroy(Request $request, string $provider): RedirectResponse
    {
        abort_unless(
            $request->user()->password !== null,
            403,
            'Set a password before disconnecting a provider.'
        );

        match ($provider) {
            'github' => $request->user()->update(['github_id' => null, 'github_token' => null]),
            default => abort(404),
        };

        return back();
    }
}
