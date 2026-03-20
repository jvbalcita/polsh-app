<?php

namespace App\Http\Controllers;

use App\Models\ExportSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $limit = $user->isPro() ? 50 : 10;

        $sessions = ExportSession::where('user_id', $user->id)
            ->latest()
            ->limit($limit)
            ->get(['id', 'style_slug', 'settings', 'image_count', 'thumbnail_url', 'created_at']);

        return Inertia::render('History', ['sessions' => $sessions]);
    }
}
