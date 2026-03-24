<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSupportTicketRequest;
use App\Models\SupportTicket;
use App\Models\User;
use App\Notifications\SupportTicketUpdated;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function index(): Response
    {
        $tickets = SupportTicket::query()
            ->with(['user', 'assignedAdmin'])
            ->when(request('status'), fn ($q, $v) => $q->where('status', $v))
            ->when(request('type'), fn ($q, $v) => $q->where('type', $v))
            ->when(request('assigned'), fn ($q, $v) => $q->where('assigned_admin_id', $v))
            ->latest()
            ->paginate(25);

        $admins = User::role('admin')->get(['id', 'name']);

        return Inertia::render('Admin/Support/Index', [
            'tickets' => $tickets,
            'admins' => $admins,
            'filters' => request()->only(['status', 'type', 'assigned']),
        ]);
    }

    public function show(SupportTicket $ticket): Response
    {
        $ticket->load(['user', 'assignedAdmin', 'replies.author']);
        $admins = User::role('admin')->get(['id', 'name']);

        return Inertia::render('Admin/Support/Show', [
            'ticket' => $ticket,
            'admins' => $admins,
        ]);
    }

    public function attachment(SupportTicket $ticket): RedirectResponse
    {
        abort_if(! $ticket->attachment_path, 404);

        $disk = config('services.polsh.export_disk', 'public');

        try {
            $url = Storage::disk($disk)->temporaryUrl($ticket->attachment_path, now()->addMinutes(15));
        } catch (\RuntimeException) {
            $url = Storage::disk($disk)->url($ticket->attachment_path);
        }

        return redirect()->away($url);
    }

    public function update(UpdateSupportTicketRequest $request, SupportTicket $ticket): RedirectResponse
    {
        $ticket->update($request->only('status', 'assigned_admin_id'));

        Notification::route('mail', $ticket->submitter_email)
            ->notify(new SupportTicketUpdated($ticket));

        return back()->with('success', 'Ticket updated.');
    }
}
