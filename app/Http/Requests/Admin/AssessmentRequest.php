<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('assessment.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['pre_test', 'post_test', 'quiz'])],
            'description' => ['nullable', 'string'],
            'passing_score' => ['required', 'integer', 'min:0', 'max:100'],
            'max_attempts' => ['required', 'integer', 'min:1', 'max:99'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:600'],
            'is_required' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'course_id' => 'Course',
            'title' => 'Judul',
            'type' => 'Tipe',
            'passing_score' => 'Nilai lulus',
            'max_attempts' => 'Maks percobaan',
            'duration_minutes' => 'Durasi (menit)',
        ];
    }
}
