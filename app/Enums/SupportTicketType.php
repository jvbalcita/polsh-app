<?php

namespace App\Enums;

enum SupportTicketType: string
{
    case BugReport = 'bug_report';
    case FeatureRequest = 'feature_request';
    case Assistance = 'assistance';
    case RefundRequest = 'refund_request';

    public function label(): string
    {
        return match ($this) {
            self::BugReport => 'Bug Report',
            self::FeatureRequest => 'Feature Request',
            self::Assistance => 'Get Assistance',
            self::RefundRequest => 'Refund Request',
        };
    }
}
