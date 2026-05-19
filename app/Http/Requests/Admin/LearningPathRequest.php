<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LearningPathRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('learning_path.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $pathId = $this->route('learning_path')?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('learning_paths', 'slug')->ignore($pathId),
            ],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'thumbnail_remove' => ['nullable', 'boolean'],
            'level' => ['nullable', Rule::in(['beginner', 'intermediate', 'advanced'])],
            'duration_weeks' => ['nullable', 'integer', 'min:1', 'max:104'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'target_audience' => ['nullable', 'array'],
            'target_audience.*' => ['string', 'max:255'],
            'outcomes' => ['nullable', 'array'],
            'outcomes.*' => ['string', 'max:500'],
            'price' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'compare_at_price' => ['nullable', 'integer', 'min:0', 'max:100000000', 'gte:price'],
            'is_published' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'Judul',
            'slug' => 'Slug',
            'subtitle' => 'Subjudul',
            'description' => 'Deskripsi',
            'level' => 'Level',
            'duration_weeks' => 'Durasi (minggu)',
            'position_id' => 'Jabatan',
            'price' => 'Harga jual',
            'compare_at_price' => 'Harga coret',
        ];
    }
}
