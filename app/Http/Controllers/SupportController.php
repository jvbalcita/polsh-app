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
        $subscription = null;

        if ($user = auth()->user()) {
            $subscription = $user->subscriptions()
                ->active()
                ->latest()
                ->first(['plan', 'status', 'paymongo_subscription_id', 'current_period_start', 'current_period_end']);
        }

        return Inertia::render('Support/Create', [
            'subscription' => $subscription,
        ]);
    }

    public function store(StoreSupportTicketRequest $request): RedirectResponse
    {
        $user = $request->user();

        $attachmentPath = $request->hasFile('attachment')
            ? $request->file('attachment')->store('support-attachments', config('services.polsh.export_disk', 'public'))
            : null;

        $ticket = SupportTicket::create([
            'user_id' => $user?->id,
            'submitter_name' => $user?->name ?? $request->submitter_name,
            'submitter_email' => $user?->email ?? $request->submitter_email,
            'type' => $request->type,
            'subject' => $request->subject,
            'description' => $request->description,
            'attachment_path' => $attachmentPath,
            'status' => SupportTicketStatus::Open,
        ]);

        // Notify submitter
        Notification::route('mail', $ticket->submitter_email)
            ->notify(new SupportTicketReceived($ticket));

        // Notify all admins
        User::role('admin')->each(fn (User $admin) => $admin->notify(new SupportTicketReceived($ticket)));

        if ($user) {
            return redirect()->route('support.tickets.index')
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
