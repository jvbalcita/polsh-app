<?php

namespace App\Http\Controllers;

use App\Http\Requests\Presets\StorePresetRequest;
use App\Models\Preset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PresetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $userPresets = $user->presets()
            ->whereNull('team_id')
            ->latest()
            ->get(['id', 'name', 'style_slug', 'customizations']);

        $team = $user->currentTeam();
        $teamPresets = $team
            ? $team->presets()->latest()->get(['id', 'name', 'style_slug', 'customizations', 'team_id'])
            : collect();

        return response()->json([
            'user' => $userPresets,
            'team' => $teamPresets,
        ]);
    }

    public function store(StorePresetRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $teamId = $validated['team_id'] ?? null;

        if ($teamId !== null) {
            $user = $request->user();
            $isMember = $user->teams()->where('team_id', $teamId)->exists();
            abort_unless($isMember, 403);
        }

        $preset = $request->user()->presets()->create([
            'name' => $validated['name'],
            'style_slug' => $validated['style_slug'],
            'customizations' => $validated['customizations'],
            'team_id' => $teamId,
        ]);

        return response()->json($preset->only(['id', 'name', 'style_slug', 'customizations', 'team_id']), 201);
    }

    public function destroy(Preset $preset): JsonResponse
    {
        Gate::authorize('delete', $preset);

        $preset->delete();

        return response()->json(null, 204);
    }
}
