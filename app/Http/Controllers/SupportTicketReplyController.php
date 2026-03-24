<?php

namespace App\Http\Controllers;

use App\Enums\SupportTicketStatus;
use App\Http\Requests\StoreSupportTicketReplyRequest;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\User;
use App\Notifications\SupportTicketReplied;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class SupportTicketReplyController extends Controller
{
    public function store(StoreSupportTicketReplyRequest $request, SupportTicket $ticket): RedirectResponse
    {
        $this->authorize('reply', $ticket);

        if ($ticket->status === SupportTicketStatus::Closed) {
            throw ValidationException::withMessages([
                'message' => 'This ticket is closed and cannot receive new replies.',
            ]);
        }

        $reply = SupportTicketReply::create([
            'support_ticket_id' => $ticket->id,
            'author_id' => $request->user()->id,
            'is_staff_reply' => false,
            'message' => $request->message,
        ]);

        // Notify assigned admin (fallback to all admins)
        $recipients = $ticket->assigned_admin_id
            ? User::where('id', $ticket->assigned_admin_id)->get()
            : User::role('admin')->get();

        Notification::send($recipients, new SupportTicketReplied($ticket, $reply));

        return back()->with('success', 'Reply sent.');
    }
}
