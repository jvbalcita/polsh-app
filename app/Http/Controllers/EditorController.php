<?php

namespace App\Http\Controllers;

use App\Models\ExportSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EditorController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $sessionData = null;

        if ($request->filled('session') && $request->user()) {
            $session = ExportSession::where('id', $request->integer('session'))
                ->where('user_id', $request->user()->id)
                ->first();

            if ($session) {
                $sessionData = $session->only(['style_slug', 'settings']);
            }
        }

        return Inertia::render('Editor', ['sessionData' => $sessionData]);
    }
}
