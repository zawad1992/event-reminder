<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventUploadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'event_file' => 'required|mimes:csv|max:2048',  // Only allow CSV files
        ];
    }

    public function messages(): array
    {
        return [
            'event_file.required' => 'Please select a CSV file to upload.',
            'event_file.mimes' => 'The file must be a CSV file.',
            'event_file.max' => 'The CSV file size must not exceed 2 MB.',
        ];
    }
}
