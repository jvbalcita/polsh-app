<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPolishJob;
use App\Services\PolshImageProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PolishController extends Controller
{
    private const VALID_STYLES = [
        'obsidian-glass', 'neon-halo', 'arctic-white', 'terminal-dark',
        'sakura-mesh', 'aurora', 'product-hunt', 'og-minimal',
        'grid-light', 'dark-studio', 'browser-light', 'browser-dark',
        'warm-studio', 'cyber-pink', 'slate-card', 'forest-dark',
        'paper-white', 'retro-amber',
    ];

    private const VALID_FORMATS = ['png', 'jpeg', 'webp'];

    private const VALID_RATIOS = ['16:9', '4:3', '1:1', '3:2', '21:9'];

    public function create(Request $request, PolshImageProcessor $processor): Response|JsonResponse
    {
        $validated = $request->validate([
            'image_url' => ['required', 'url', 'max:2048'],
            'style' => ['required', 'string', 'in:'.implode(',', self::VALID_STYLES)],
            'format' => ['sometimes', 'string', 'in:'.implode(',', self::VALID_FORMATS)],
            'resolution' => ['sometimes', 'integer', 'in:1,2,4'],
            'aspect_ratio' => ['sometimes', 'string', 'in:'.implode(',', self::VALID_RATIOS)],
            'padding' => ['sometimes', 'integer', 'min:0', 'max:240'],
            'radius' => ['sometimes', 'integer', 'min:0', 'max:80'],
            'shadow_opacity' => ['sometimes', 'numeric', 'min:0', 'max:1'],
            'shadow_blur' => ['sometimes', 'integer', 'min:0', 'max:240'],
            'border_width' => ['sometimes', 'numeric', 'min:0', 'max:8'],
            'noise_grain' => ['sometimes', 'numeric', 'min:0', 'max:0.3'],
        ]);

        $style = $processor->loadStyle($validated['style']);

        if (! $style) {
            return response()->json(['error' => 'Style not found.'], 422);
        }

        $settings = [
            'exportResolution' => $validated['resolution'] ?? 1,
            'exportFormat' => $validated['format'] ?? 'png',
            'aspectRatio' => $validated['aspect_ratio'] ?? '16:9',
            'padding' => $validated['padding'] ?? null,
            'radius' => $validated['radius'] ?? null,
            'shadowOpacity' => $validated['shadow_opacity'] ?? null,
            'shadowBlur' => $validated['shadow_blur'] ?? null,
            'borderWidth' => $validated['border_width'] ?? null,
            'noiseGrain' => $validated['noise_grain'] ?? null,
        ];

        // 4× resolution is expensive — dispatch as an async job (202 Accepted)
        if ((int) $settings['exportResolution'] === 4) {
            $jobId = (string) Str::uuid();

            Cache::put("polsh_job_{$jobId}", ['status' => 'pending'], now()->addHour());

            $apiKey = $request->attributes->get('api_key');

            ProcessPolishJob::dispatch($jobId, $validated['image_url'], $style, $settings, $apiKey?->webhook_url);

            return response()->json([
                'job_id' => $jobId,
                'status' => 'pending',
                'status_url' => url("/api/v1/polish/status/{$jobId}"),
            ], 202);
        }

        // 1× / 2× — inline synchronous processing
        try {
            $binary = $processor->process($validated['image_url'], $style, $settings);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        $mime = match ($settings['exportFormat']) {
            'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            default => 'image/png',
        };

        return response($binary, 200)->header('Content-Type', $mime);
    }

    public function status(string $jobId): JsonResponse
    {
        $state = Cache::get("polsh_job_{$jobId}");

        if (! $state) {
            return response()->json(['error' => 'Job not found or expired.'], 404);
        }

        return response()->json($state);
    }
}
