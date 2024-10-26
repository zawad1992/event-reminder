<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'event_type_id' => 'required|exists:event_types,id',
            'is_all_day' => 'nullable|boolean',
            'is_reminder' => 'nullable|boolean',
            'is_recurring' => 'nullable|boolean',
            'recurring_type' => 'nullable|in:1,2,3,4',
            'recurring_count' => 'nullable|integer|min:1',            
            'external_participants' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Please enter a title.',
            'title.max' => 'The title must not exceed 255 characters.',
            'description.max' => 'The description must not exceed 500 characters.',
            'start_date.required' => 'Please select a start date.',
            'start_date.date' => 'The start date must be a valid date.',
            'end_date.required' => 'Please select an end date.',
            'end_date.date' => 'The end date must be a valid date.',
            'start_time.required' => 'Please select a start time.',
            'end_time.required' => 'Please select an end time.',
            'event_type_id.required' => 'Please select an event type.',
            'event_type_id.exists' => 'The selected event type does not exist.',
            'recurring_type.in' => 'Please select a recurring type.',
            'recurring_count.min' => 'The recurring count must be at least 1.',
            'recurring_count.integer' => 'The recurring count must be an integer.',
            'external_participants.string' => 'The external participants must be a string.',

        ];
    }
}
