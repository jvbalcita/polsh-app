<?php

namespace App\Http\Controllers;

use App\Enums\SupportTicketStatus;
use App\Http\Requests\StoreSupportTicketRequest;
use App\Models\SupportTicket;
use App\Models\User;
use App\Notifications\SupportTicketReceived;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Support/Create');
    }

    public function store(StoreSupportTicketRequest $request): RedirectResponse
    {
        $user = $request->user();

        $ticket = SupportTicket::create([
            'user_id' => $user?->id,
            'submitter_name' => $user?->name ?? $request->submitter_name,
            'submitter_email' => $user?->email ?? $request->submitter_email,
            'type' => $request->type,
            'subject' => $request->subject,
            'description' => $request->description,
            'status' => SupportTicketStatus::Open,
        ]);

        // Notify submitter
        Notification::route('mail', $ticket->submitter_email)
            ->notify(new SupportTicketReceived($ticket));

        // Notify all admins
        User::role('admin')->each(fn (User $admin) => $admin->notify(new SupportTicketReceived($ticket)));

        if ($user) {
            return redirect()->route('support.tickets.show', $ticket)
                ->with('success', "Request submitted — {$ticket->reference()}");
        }

        return back()->with('success', "Request submitted — {$ticket->reference()}. We'll email you at {$ticket->submitter_email}.");
    }

    public function index(): Response
    {
        $tickets = auth()->user()
            ->supportTickets()
            ->latest()
            ->get(['id', 'type', 'subject', 'status', 'created_at']);

        return Inertia::render('Support/Index', ['tickets' => $tickets]);
    }

    public function show(SupportTicket $ticket): Response
    {
        $this->authorize('view', $ticket);

        $ticket->load(['replies.author']);

        return Inertia::render('Support/Show', ['ticket' => $ticket]);
    }
}
