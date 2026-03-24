<?php

namespace App\Http\Requests;

use App\Enums\SupportTicketType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupportTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'type' => ['required', Rule::enum(SupportTicketType::class)],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'attachment' => ['nullable', 'file', 'max:10240', 'mimes:jpg,jpeg,png,gif,pdf,txt,doc,docx'],
        ];

        if (! $this->user()) {
            $rules['submitter_name'] = ['required', 'string', 'max:255'];
            $rules['submitter_email'] = ['required', 'email', 'max:255'];
        }

        return $rules;
    }
}
