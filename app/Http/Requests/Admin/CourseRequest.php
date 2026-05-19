<?php

namespace App\Http\Requests\Admin;

use App\Models\Course;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        $course = $this->route('course');

        if ($course instanceof Course) {
            return $user->can('update', $course);
        }

        return $user->can('create', Course::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $courseId = $this->route('course')?->id;

        return [
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255',
                Rule::unique('courses', 'slug')->ignore($courseId),
            ],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'thumbnail_existing' => ['nullable', 'string', 'max:255'],
            'thumbnail_remove' => ['nullable', 'boolean'],
            'preview_video_url' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'integer', 'min:0'],
            'compare_at_price' => ['nullable', 'integer', 'min:0', 'gte:price'],
            'level' => ['nullable', 'string', 'max:50'],
            'delivery_format' => ['required', Rule::in(Course::FORMATS)],
            'lms_format' => ['required', Rule::in(Course::LMS_FORMATS)],
            'scorm_package_id' => [
                'nullable',
                Rule::requiredIf(fn () => $this->input('lms_format') === Course::LMS_SCORM),
                'exists:scorm_packages,id',
            ],
            'is_certified' => ['boolean'],
            'language' => ['nullable', 'string', 'max:10'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'schedule_start' => ['nullable', 'date'],
            'schedule_end' => ['nullable', 'date', 'after_or_equal:schedule_start'],
            'schedule_location' => ['nullable', 'string', 'max:255'],
            'max_participants' => ['nullable', 'integer', 'min:1'],
            'pre_test_required' => ['boolean'],
            'post_test_required' => ['boolean'],
            'passing_score' => ['required', 'integer', 'min:0', 'max:100'],
            'max_attempts' => ['required', 'integer', 'min:1', 'max:10'],
            'learning_objectives' => ['nullable', 'array'],
            'learning_objectives.*' => ['string', 'max:500'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['string', 'max:500'],
            'target_audience' => ['nullable', 'array'],
            'target_audience.*' => ['string', 'max:500'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],

            'sections' => ['nullable', 'array'],
            'sections.*.id' => ['nullable', 'integer'],
            'sections.*.title' => ['required_with:sections', 'string', 'max:255'],
            'sections.*.description' => ['nullable', 'string'],
            'sections.*.lessons' => ['nullable', 'array'],
            'sections.*.lessons.*.id' => ['nullable', 'integer'],
            'sections.*.lessons.*.title' => ['required_with:sections.*.lessons', 'string', 'max:255'],
            'sections.*.lessons.*.description' => ['nullable', 'string'],
            'sections.*.lessons.*.duration_minutes' => ['nullable', 'integer', 'min:0'],
            'sections.*.lessons.*.is_preview' => ['nullable', 'boolean'],
            'sections.*.lessons.*.is_required' => ['nullable', 'boolean'],
            'sections.*.lessons.*.video_file' => ['nullable', 'file', 'mimes:mp4', 'max:51200'],
            'sections.*.lessons.*.video_path_existing' => ['nullable', 'string', 'max:500'],
            'sections.*.lessons.*.video_remove' => ['nullable', 'boolean'],
            'sections.*.lessons.*.embed_url' => ['nullable', 'string', 'max:500'],
            'sections.*.lessons.*.youtube_url' => ['nullable', 'string', 'max:500'],
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
            'integer' => ':attribute harus berupa angka bulat.',
            'min' => ':attribute minimal :min.',
            'max' => ':attribute maksimal :max.',
            'exists' => ':attribute tidak valid.',
            'unique' => ':attribute sudah digunakan.',
            'boolean' => ':attribute harus bernilai benar atau salah.',
            'array' => ':attribute harus berupa daftar.',
            'gte' => ':attribute harus lebih besar atau sama dengan harga.',
            'after_or_equal' => ':attribute harus setelah atau sama dengan tanggal mulai.',
            'in' => ':attribute tidak valid.',
            'date' => ':attribute harus berupa tanggal valid.',
            'mimes' => ':attribute harus berformat: :values.',
            'sections.*.lessons.*.video_file.max' => 'Video lesson maksimal 50 MB. Untuk video lebih besar, gunakan embed YouTube.',
            'sections.*.lessons.*.video_file.mimes' => 'Video lesson harus berformat MP4.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'category_id' => 'Kategori',
            'title' => 'Judul course',
            'subtitle' => 'Subtitle',
            'slug' => 'Slug',
            'description' => 'Deskripsi',
            'thumbnail' => 'Thumbnail',
            'preview_video_url' => 'URL video preview',
            'price' => 'Harga',
            'compare_at_price' => 'Harga normal',
            'level' => 'Level',
            'delivery_format' => 'Format kelas',
            'lms_format' => 'Format LMS',
            'scorm_package_id' => 'Paket SCORM',
            'is_certified' => 'Bersertifikat',
            'language' => 'Bahasa',
            'duration_minutes' => 'Durasi',
            'schedule_start' => 'Mulai kelas',
            'schedule_end' => 'Selesai kelas',
            'schedule_location' => 'Lokasi kelas',
            'max_participants' => 'Kapasitas peserta',
            'passing_score' => 'Nilai kelulusan',
            'max_attempts' => 'Maksimal percobaan',
            'learning_objectives' => 'Tujuan pembelajaran',
            'requirements' => 'Prasyarat',
            'target_audience' => 'Target peserta',
            'tag_ids' => 'Tag',
            'sections.*.title' => 'Judul section',
            'sections.*.lessons.*.title' => 'Judul lesson',
            'sections.*.lessons.*.duration_minutes' => 'Durasi lesson',
            'sections.*.lessons.*.video_file' => 'Video lesson',
            'sections.*.lessons.*.embed_url' => 'URL embed',
            'sections.*.lessons.*.youtube_url' => 'URL YouTube',
        ];
    }
}
