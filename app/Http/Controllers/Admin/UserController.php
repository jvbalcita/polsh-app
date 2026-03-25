<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()
            ->with(['roles', 'media'])
            ->withCount(['presets', 'supportTickets']);

        if ($search = $request->string('q')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->string('role')->trim()->value()) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $role));
        }

        if ($plan = $request->string('plan')->trim()->value()) {
            if ($plan === 'pro') {
                $query->where('plan', 'pro');
            } elseif ($plan === 'free') {
                $query->where('plan', 'free');
            }
        }

        $users = $query->latest()->paginate(25)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['q', 'role', 'plan']),
        ]);
    }

    public function show(User $user): Response
    {
        $user->load([
            'roles',
            'media',
            'presets' => fn ($q) => $q->latest()->limit(50),
            'exportSessions' => fn ($q) => $q->latest()->limit(30),
            'supportTickets' => fn ($q) => $q->latest()->limit(30),
            'apiKeys' => fn ($q) => $q->latest()->limit(30),
        ]);

        $activities = Activity::causedBy($user)
            ->latest()
            ->limit(50)
            ->get(['id', 'description', 'subject_type', 'subject_id', 'properties', 'created_at']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user->append('avatar_url'),
            'activities' => $activities,
        ]);
    }

    public function updateRole(User $user, Request $request): RedirectResponse
    {
        $request->validate([
            'role' => ['required', 'string', 'in:admin,user'],
        ]);

        if ($request->role === 'admin') {
            $user->syncRoles(['admin']);
        } else {
            $user->syncRoles([]);
        }

        return back()->with('success', "Role updated to {$request->role}.");
    }
}
