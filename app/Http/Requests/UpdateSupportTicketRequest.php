<?php

namespace App\Http\Requests;

use App\Enums\SupportTicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupportTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(SupportTicketStatus::class)],
            'assigned_admin_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
