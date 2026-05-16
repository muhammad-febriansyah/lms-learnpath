<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AssessmentQuestionRequest extends FormRequest
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
            'question_text' => ['required', 'string', 'max:2000'],
            'points' => ['required', 'integer', 'min:1', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'options' => ['required', 'array', 'min:2', 'max:6'],
            'options.*.option_text' => ['required', 'string', 'max:1000'],
            'options.*.is_correct' => ['required', 'boolean'],
        ];
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function ($v) {
            $options = $this->input('options', []);
            $correctCount = collect($options)->where('is_correct', true)->count();
            if ($correctCount < 1) {
                $v->errors()->add('options', 'Minimal satu opsi harus ditandai sebagai jawaban benar.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'question_text' => 'Teks soal',
            'points' => 'Poin',
        ];
    }
}
