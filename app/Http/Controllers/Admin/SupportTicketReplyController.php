<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupportTicketReplyRequest;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Notifications\SupportTicketReplied;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;

class SupportTicketReplyController extends Controller
{
    public function store(StoreSupportTicketReplyRequest $request, SupportTicket $ticket): RedirectResponse
    {
        $reply = SupportTicketReply::create([
            'support_ticket_id' => $ticket->id,
            'author_id' => $request->user()->id,
            'is_staff_reply' => true,
            'message' => $request->message,
        ]);

        Notification::route('mail', $ticket->submitter_email)
            ->notify(new SupportTicketReplied($ticket, $reply));

        return back()->with('success', 'Reply sent.');
    }
}
