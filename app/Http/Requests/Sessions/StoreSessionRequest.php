<?php

namespace App\Http\Requests\Sessions;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSessionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'style_slug' => ['required', 'string', 'max:60'],
            'settings' => ['required', 'array'],
            'image_count' => ['required', 'integer', 'min:1'],
            'thumbnail_url' => ['required', 'string'],
        ];
    }
}
