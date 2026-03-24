<?php

namespace Database\Seeders;

use App\Enums\SupportTicketStatus;
use App\Enums\SupportTicketType;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\User;
use Illuminate\Database\Seeder;

class SupportTicketSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::role('admin')->first();
        $user = User::doesntHave('roles')->first() ?? User::factory()->create();

        $types = SupportTicketType::cases();
        $statuses = SupportTicketStatus::cases();

        foreach (range(1, 12) as $i) {
            $ticket = SupportTicket::create([
                'user_id' => $i % 3 === 0 ? null : $user->id,
                'submitter_name' => $i % 3 === 0 ? 'Guest User' : $user->name,
                'submitter_email' => $i % 3 === 0 ? 'guest@example.com' : $user->email,
                'type' => $types[array_rand($types)]->value,
                'subject' => "Sample support request #{$i}",
                'description' => "This is a sample description for support request #{$i}. It contains enough detail to look realistic in the admin panel.",
                'status' => $statuses[array_rand($statuses)]->value,
                'assigned_admin_id' => $i % 2 === 0 ? $admin?->id : null,
            ]);

            SupportTicketReply::create([
                'support_ticket_id' => $ticket->id,
                'author_id' => $admin?->id,
                'is_staff_reply' => true,
                'message' => 'Thank you for reaching out. We have received your request and will respond shortly.',
            ]);
        }
    }
}
