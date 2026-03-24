<?php

namespace App\Http\Controllers;

use App\Http\Requests\Sessions\StoreSessionRequest;
use App\Models\ExportSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $user->isPro() ? 50 : 10;

        $sessions = ExportSession::where('user_id', $user->id)
            ->latest()
            ->limit($limit)
            ->get(['id', 'style_slug', 'image_count', 'thumbnail_url', 'created_at']);

        return response()->json($sessions);
    }

    public function store(StoreSessionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Extract and store base64 thumbnail to disk
        $dataUrl = $validated['thumbnail_url'];
        $thumbnailUrl = null;

        if (str_starts_with($dataUrl, 'data:image/')) {
            $base64 = substr($dataUrl, strpos($dataUrl, ',') + 1);
            $filename = 'thumbnails/'.Str::uuid().'.png';
            $disk = config('services.polsh.export_disk', 'public');
            Storage::disk($disk)->put($filename, base64_decode($base64));
            $thumbnailUrl = Storage::disk($disk)->url($filename);
        }

        $session = ExportSession::create([
            'user_id' => $request->user()->id,
            'style_slug' => $validated['style_slug'],
            'settings' => $validated['settings'],
            'image_count' => $validated['image_count'],
            'thumbnail_url' => $thumbnailUrl,
        ]);

        return response()->json($session->only(['id', 'style_slug', 'image_count', 'thumbnail_url', 'created_at']), 201);
    }

    public function show(ExportSession $session): JsonResponse
    {
        Gate::authorize('view', $session);

        return response()->json($session->only(['id', 'style_slug', 'settings', 'image_count', 'thumbnail_url', 'created_at']));
    }

    public function destroy(ExportSession $session): JsonResponse
    {
        Gate::authorize('delete', $session);

        // Remove stored thumbnail if it's on our disk
        if ($session->thumbnail_url) {
            $disk = config('services.polsh.export_disk', 'public');
            $path = str_replace(Storage::disk($disk)->url(''), '', $session->thumbnail_url);
            Storage::disk($disk)->delete($path);
        }

        $session->delete();

        return response()->json(null, 204);
    }
}
