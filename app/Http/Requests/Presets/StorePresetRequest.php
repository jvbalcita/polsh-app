<?php

namespace App\Http\Requests\Presets;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePresetRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'style_slug' => ['required', 'string', 'max:60'],
            'customizations' => ['required', 'array'],
            'team_id' => ['nullable', 'integer'],
        ];
    }
}
