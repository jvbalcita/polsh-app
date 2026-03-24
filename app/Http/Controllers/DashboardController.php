<?php

namespace App\Http\Controllers;

use App\Enums\SupportTicketStatus;
use App\Models\SupportTicket;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $stats = [
            'total' => SupportTicket::query()->count(),
            'open' => SupportTicket::query()->where('status', SupportTicketStatus::Open)->count(),
            'in_progress' => SupportTicket::query()->where('status', SupportTicketStatus::InProgress)->count(),
            'resolved' => SupportTicket::query()->where('status', SupportTicketStatus::Resolved)->count(),
            'closed' => SupportTicket::query()->where('status', SupportTicketStatus::Closed)->count(),
        ];

        $recentTickets = SupportTicket::query()
            ->with('user:id,name')
            ->latest()
            ->limit(8)
            ->get(['id', 'user_id', 'submitter_name', 'type', 'subject', 'status', 'created_at']);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentTickets' => $recentTickets,
        ]);
    }
}
