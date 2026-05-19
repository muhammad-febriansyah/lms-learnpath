<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BundleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('bundle.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $bundleId = $this->route('bundle')?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('bundles', 'slug')->ignore($bundleId),
            ],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'thumbnail_remove' => ['nullable', 'boolean'],
            'price' => ['required', 'integer', 'min:0'],
            'compare_at_price' => ['nullable', 'integer', 'min:0', 'gte:price'],
            'course_ids' => ['required', 'array', 'min:1'],
            'course_ids.*' => ['integer', 'exists:courses,id'],
            'is_published' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'integer' => ':attribute harus berupa angka.',
            'max' => ':attribute maksimal :max karakter.',
            'min' => ':attribute minimal :min.',
            'unique' => ':attribute sudah digunakan.',
            'regex' => ':attribute hanya boleh huruf kecil, angka, dan tanda hubung.',
            'array' => ':attribute harus berupa daftar.',
            'gte' => ':attribute harus lebih besar atau sama dengan harga.',
            'exists' => ':attribute tidak ditemukan.',
            'boolean' => ':attribute harus benar atau salah.',
            'image' => ':attribute harus berupa gambar.',
            'mimes' => ':attribute harus berformat png, jpg, jpeg, atau webp.',
            'thumbnail.max' => 'Thumbnail maksimal 2 MB.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'Judul paket',
            'slug' => 'Slug',
            'description' => 'Deskripsi',
            'thumbnail' => 'Thumbnail',
            'price' => 'Harga paket',
            'compare_at_price' => 'Harga normal',
            'course_ids' => 'Daftar kursus',
            'is_published' => 'Status publish',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        $data['is_published'] = (bool) ($data['is_published'] ?? false);
        $data['thumbnail_remove'] = (bool) ($data['thumbnail_remove'] ?? false);

        return $data;
    }
}
