<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CourseRequest;
use App\Models\Category;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Lesson;
use App\Models\ScormPackage;
use App\Models\Tag;
use App\Services\Audit\Auditor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isInstructor = $user->hasRole('instructor') && ! $user->hasAnyRole(['superadmin', 'admin_tenant']);

        $courses = Course::query()
            ->with([
                'category:id,name',
                'instructor:id,name',
            ])
            ->withCount([
                'sections',
                'lessons',
                'enrollments',
            ])
            ->when($isInstructor, fn ($q) => $q->forInstructor($user->id))
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($request->integer('category_id'), function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->string('review_status')->toString(), function ($query, $status) {
                $query->where('review_status', $status);
            })
            ->latest('id')
            ->paginate(8)
            ->withQueryString();

        return Inertia::render('admin/courses/index', [
            'courses' => $courses,
            'filters' => $request->only('search', 'category_id', 'review_status'),
            'categoryOptions' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'permissions' => [
                'canCreate' => $user->can('create', Course::class),
                'canReview' => $user->hasPermissionTo('course.review'),
                'isInstructor' => $isInstructor,
            ],
            'reviewStatusOptions' => $this->reviewStatusOptions(),
        ]);
    }

    public function show(Course $course, Request $request): Response
    {
        $this->authorize('view', $course);

        $course->load([
            'category:id,name',
            'instructor:id,name,email',
            'reviewer:id,name',
            'tags:id,name',
            'scormPackage:id,title',
            'sections' => function ($q) {
                $q->select('id', 'course_id', 'title', 'sort_order')
                    ->orderBy('sort_order')
                    ->with(['lessons' => fn ($l) => $l->select('id', 'course_id', 'course_section_id', 'title', 'sort_order', 'is_preview', 'duration_minutes')
                        ->orderBy('sort_order')]);
            },
            'lessons:id,course_id,title,sort_order',
            'preTest' => fn ($q) => $q->withCount('questions'),
            'postTest' => fn ($q) => $q->withCount('questions'),
        ]);
        $course->loadCount(['sections', 'lessons', 'enrollments']);

        $user = $request->user();

        return Inertia::render('admin/courses/show', [
            'course' => $course,
            'permissions' => [
                'canEdit' => $user->can('update', $course),
                'canDelete' => $user->can('delete', $course),
                'canSubmitReview' => $user->can('submitReview', $course),
                'canReview' => $user->can('review', $course),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Course::class);

        return Inertia::render('admin/courses/form', [
            'course' => null,
            ...$this->formData(),
        ]);
    }

    public function store(CourseRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?: Str::slug($data['title']);
        $data['pre_test_required'] = (bool) ($data['pre_test_required'] ?? false);
        $data['post_test_required'] = (bool) ($data['post_test_required'] ?? false);
        $data['is_certified'] = (bool) ($data['is_certified'] ?? false);
        $data['instructor_id'] = $request->user()->id;
        $data['review_status'] = Course::REVIEW_DRAFT;
        $data['is_published'] = false;

        if (($data['lms_format'] ?? null) !== Course::LMS_SCORM) {
            $data['scorm_package_id'] = null;
        }

        $data['thumbnail'] = $this->resolveThumbnail($request, null);

        $tagIds = $data['tag_ids'] ?? [];
        $sectionsInput = $data['sections'] ?? [];
        unset($data['tag_ids'], $data['thumbnail_existing'], $data['thumbnail_remove'], $data['sections']);

        $course = DB::transaction(function () use ($data, $tagIds, $sectionsInput, $request) {
            $course = Course::create($data);
            $course->tags()->sync($tagIds);
            $this->syncCurriculum($course, $sectionsInput, $request);

            return $course;
        });

        return redirect()
            ->route('admin.courses.show', $course)
            ->with('success', 'Course tersimpan sebagai draft. Lengkapi kurikulum lalu ajukan untuk review.');
    }

    public function edit(Course $course): Response
    {
        $this->authorize('update', $course);

        $course->load([
            'tags:id',
            'sections' => fn ($q) => $q->orderBy('sort_order'),
            'sections.lessons' => fn ($q) => $q->orderBy('sort_order'),
        ]);

        return Inertia::render('admin/courses/form', [
            'course' => array_merge($course->toArray(), [
                'tag_ids' => $course->tags->pluck('id')->all(),
                'sections' => $course->sections->map(fn ($section) => [
                    'id' => $section->id,
                    'title' => $section->title,
                    'description' => $section->description,
                    'sort_order' => $section->sort_order,
                    'lessons' => $section->lessons->map(fn ($lesson) => [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'description' => $lesson->description,
                        'duration_minutes' => $lesson->duration_minutes,
                        'is_preview' => $lesson->is_preview,
                        'is_required' => $lesson->is_required,
                        'video_path' => $lesson->video_path,
                        'embed_url' => $lesson->embed_url,
                        'youtube_url' => $lesson->youtube_url,
                        'sort_order' => $lesson->sort_order,
                    ])->all(),
                ])->all(),
            ]),
            ...$this->formData(),
        ]);
    }

    public function update(CourseRequest $request, Course $course): RedirectResponse
    {
        $data = $request->validated();
        $data['pre_test_required'] = (bool) ($data['pre_test_required'] ?? false);
        $data['post_test_required'] = (bool) ($data['post_test_required'] ?? false);
        $data['is_certified'] = (bool) ($data['is_certified'] ?? false);

        if (($data['lms_format'] ?? null) !== Course::LMS_SCORM) {
            $data['scorm_package_id'] = null;
        }

        $data['thumbnail'] = $this->resolveThumbnail($request, $course);

        // Jika sebelumnya rejected, edit membuatnya draft lagi
        if ($course->review_status === Course::REVIEW_REJECTED) {
            $data['review_status'] = Course::REVIEW_DRAFT;
        }

        $tagIds = $data['tag_ids'] ?? [];
        $sectionsInput = $data['sections'] ?? [];
        unset($data['tag_ids'], $data['thumbnail_existing'], $data['thumbnail_remove'], $data['sections']);

        DB::transaction(function () use ($course, $data, $tagIds, $sectionsInput, $request) {
            $course->update($data);
            $course->tags()->sync($tagIds);
            $this->syncCurriculum($course->fresh(), $sectionsInput, $request);
        });

        return redirect()
            ->route('admin.courses.show', $course)
            ->with('success', 'Course berhasil diperbarui.');
    }

    /**
     * Sync nested sections + lessons against the payload. Anything not present
     * in the payload gets deleted (lesson video files removed from disk).
     * No-op for SCORM courses — they don't use the section/lesson model.
     *
     * @param  array<int, array<string, mixed>>  $sectionsInput
     */
    private function syncCurriculum(Course $course, array $sectionsInput, Request $request): void
    {
        if ($course->lms_format === Course::LMS_SCORM) {
            return;
        }

        $lessonType = match ($course->lms_format) {
            Course::LMS_VIDEO => 'video',
            Course::LMS_EMBED_LINK => 'embed_link',
            Course::LMS_EMBED_YOUTUBE => 'youtube',
            default => 'video',
        };

        $keptSectionIds = [];
        $keptLessonIds = [];

        foreach ($sectionsInput as $sIdx => $sectionData) {
            $sectionAttrs = [
                'course_id' => $course->id,
                'title' => $sectionData['title'],
                'description' => $sectionData['description'] ?? null,
                'sort_order' => $sIdx + 1,
            ];

            $section = ! empty($sectionData['id'])
                ? CourseSection::where('course_id', $course->id)->find($sectionData['id'])
                : null;

            if ($section) {
                $section->update($sectionAttrs);
            } else {
                $section = CourseSection::create($sectionAttrs);
            }

            $keptSectionIds[] = $section->id;

            foreach ($sectionData['lessons'] ?? [] as $lIdx => $lessonData) {
                $lessonAttrs = [
                    'course_id' => $course->id,
                    'course_section_id' => $section->id,
                    'type' => $lessonType,
                    'title' => $lessonData['title'],
                    'description' => $lessonData['description'] ?? null,
                    'duration_minutes' => (int) ($lessonData['duration_minutes'] ?? 0),
                    'sort_order' => $lIdx + 1,
                    'is_preview' => (bool) ($lessonData['is_preview'] ?? false),
                    'is_required' => (bool) ($lessonData['is_required'] ?? true),
                    'video_path' => null,
                    'embed_url' => null,
                    'youtube_url' => null,
                    'youtube_video_id' => null,
                ];

                $existingLesson = ! empty($lessonData['id'])
                    ? Lesson::where('course_id', $course->id)->find($lessonData['id'])
                    : null;

                switch ($course->lms_format) {
                    case Course::LMS_VIDEO:
                        $fileKey = "sections.{$sIdx}.lessons.{$lIdx}.video_file";
                        $uploaded = $request->file($fileKey);
                        $removeRequested = (bool) ($lessonData['video_remove'] ?? false);
                        $existingPath = $lessonData['video_path_existing'] ?? $existingLesson?->video_path;

                        if ($uploaded) {
                            if ($existingLesson?->video_path && ! str_starts_with($existingLesson->video_path, 'http')) {
                                Storage::disk('public')->delete($existingLesson->video_path);
                            }
                            $lessonAttrs['video_path'] = $uploaded->store('lessons/videos', 'public');
                        } elseif ($removeRequested) {
                            if ($existingLesson?->video_path && ! str_starts_with($existingLesson->video_path, 'http')) {
                                Storage::disk('public')->delete($existingLesson->video_path);
                            }
                            $lessonAttrs['video_path'] = null;
                        } else {
                            $lessonAttrs['video_path'] = $existingPath;
                        }
                        break;

                    case Course::LMS_EMBED_LINK:
                        $lessonAttrs['embed_url'] = $lessonData['embed_url'] ?? null;
                        break;

                    case Course::LMS_EMBED_YOUTUBE:
                        $url = $lessonData['youtube_url'] ?? null;
                        $lessonAttrs['youtube_url'] = $url;
                        $lessonAttrs['youtube_video_id'] = $this->extractYoutubeId($url);
                        break;
                }

                if ($existingLesson) {
                    $existingLesson->update($lessonAttrs);
                    $keptLessonIds[] = $existingLesson->id;
                } else {
                    $lesson = Lesson::create($lessonAttrs);
                    $keptLessonIds[] = $lesson->id;
                }
            }
        }

        // Delete lessons removed from payload (including their video files).
        Lesson::where('course_id', $course->id)
            ->when($keptLessonIds, fn ($q) => $q->whereNotIn('id', $keptLessonIds))
            ->get()
            ->each(function (Lesson $lesson): void {
                if ($lesson->video_path && ! str_starts_with($lesson->video_path, 'http')) {
                    Storage::disk('public')->delete($lesson->video_path);
                }
                $lesson->delete();
            });

        CourseSection::where('course_id', $course->id)
            ->when($keptSectionIds, fn ($q) => $q->whereNotIn('id', $keptSectionIds))
            ->delete();
    }

    private function extractYoutubeId(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        if (preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Decide the final thumbnail value to persist. Uploaded file wins; otherwise
     * keep the existing path. If `thumbnail_remove=true`, delete and store null.
     */
    private function resolveThumbnail(Request $request, ?Course $course): ?string
    {
        if ($request->boolean('thumbnail_remove')) {
            if ($course?->thumbnail && ! str_starts_with($course->thumbnail, 'http')) {
                Storage::disk('public')->delete($course->thumbnail);
            }

            return null;
        }

        if ($request->hasFile('thumbnail')) {
            if ($course?->thumbnail && ! str_starts_with($course->thumbnail, 'http')) {
                Storage::disk('public')->delete($course->thumbnail);
            }

            return $request->file('thumbnail')->store('courses', 'public');
        }

        return $course?->thumbnail;
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);

        app(Auditor::class)->record('course.deleted', $course, [
            'title' => $course->title,
        ]);

        $course->delete();

        return redirect()
            ->route('admin.courses.index')
            ->with('success', 'Course berhasil dihapus.');
    }

    public function submitReview(Course $course): RedirectResponse
    {
        $this->authorize('submitReview', $course);

        $course->update([
            'review_status' => Course::REVIEW_PENDING,
            'submitted_at' => now(),
            'review_notes' => null,
        ]);

        return redirect()
            ->route('admin.courses.show', $course)
            ->with('success', 'Course diajukan untuk review oleh Super Admin.');
    }

    public function togglePreview(Request $request, Lesson $lesson): RedirectResponse
    {
        $course = $lesson->course;
        $this->authorize('togglePreview', $course);

        $lesson->update(['is_preview' => ! $lesson->is_preview]);

        return back()->with(
            'success',
            $lesson->is_preview
                ? "Lesson \"{$lesson->title}\" sekarang preview gratis."
                : "Lesson \"{$lesson->title}\" tidak lagi preview.",
        );
    }

    public function approve(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('review', $course);

        $course->update([
            'review_status' => Course::REVIEW_PUBLISHED,
            'is_published' => true,
            'published_at' => $course->published_at ?? now(),
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
            'review_notes' => null,
        ]);

        app(Auditor::class)->record('course.published', $course, [
            'title' => $course->title,
        ]);

        return redirect()
            ->route('admin.courses.show', $course)
            ->with('success', 'Course disetujui dan dipublikasi.');
    }

    public function reject(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('review', $course);

        $data = $request->validate([
            'review_notes' => ['required', 'string', 'min:5', 'max:1000'],
        ], [
            'review_notes.required' => 'Catatan revisi wajib diisi.',
            'review_notes.min' => 'Catatan revisi minimal :min karakter.',
        ]);

        $course->update([
            'review_status' => Course::REVIEW_REJECTED,
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
            'review_notes' => $data['review_notes'],
        ]);

        app(Auditor::class)->record('course.rejected', $course, [
            'title' => $course->title,
            'notes' => $data['review_notes'],
        ]);

        return redirect()
            ->route('admin.courses.show', $course)
            ->with('success', 'Course dikembalikan ke instructor dengan catatan revisi.');
    }

    public function bulkApprove(Request $request): RedirectResponse
    {
        $ids = $this->validateBulkIds($request);
        $approved = 0;
        $skipped = 0;

        foreach (Course::query()->whereIn('id', $ids)->get() as $course) {
            if (! $request->user()->can('review', $course)) {
                $skipped++;

                continue;
            }

            $course->update([
                'review_status' => Course::REVIEW_PUBLISHED,
                'is_published' => true,
                'published_at' => $course->published_at ?? now(),
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
                'review_notes' => null,
            ]);

            app(Auditor::class)->record('course.published', $course, [
                'title' => $course->title,
                'bulk' => true,
            ]);
            $approved++;
        }

        return back()->with(
            'success',
            "Disetujui & dipublikasi: {$approved} course".($skipped > 0 ? ", dilewati: {$skipped}" : '').'.',
        );
    }

    public function bulkReject(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
            'review_notes' => ['required', 'string', 'min:5', 'max:1000'],
        ], [
            'review_notes.required' => 'Catatan revisi wajib diisi.',
            'review_notes.min' => 'Catatan revisi minimal :min karakter.',
            'ids.required' => 'Pilih minimal 1 course.',
        ]);

        $rejected = 0;
        $skipped = 0;

        foreach (Course::query()->whereIn('id', $data['ids'])->get() as $course) {
            if (! $request->user()->can('review', $course)) {
                $skipped++;

                continue;
            }

            $course->update([
                'review_status' => Course::REVIEW_REJECTED,
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
                'review_notes' => $data['review_notes'],
            ]);

            app(Auditor::class)->record('course.rejected', $course, [
                'title' => $course->title,
                'notes' => $data['review_notes'],
                'bulk' => true,
            ]);
            $rejected++;
        }

        return back()->with(
            'success',
            "Ditolak dengan catatan: {$rejected} course".($skipped > 0 ? ", dilewati: {$skipped}" : '').'.',
        );
    }

    public function bulkSubmitReview(Request $request): RedirectResponse
    {
        $ids = $this->validateBulkIds($request);
        $submitted = 0;
        $skipped = 0;

        foreach (Course::query()->whereIn('id', $ids)->get() as $course) {
            if (! $request->user()->can('submitReview', $course)) {
                $skipped++;

                continue;
            }

            $course->update([
                'review_status' => Course::REVIEW_PENDING,
                'submitted_at' => now(),
                'review_notes' => null,
            ]);
            $submitted++;
        }

        return back()->with(
            'success',
            "Diajukan untuk review: {$submitted} course".($skipped > 0 ? ", dilewati: {$skipped}" : '').'.',
        );
    }

    /**
     * @return array<int, int>
     */
    private function validateBulkIds(Request $request): array
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ], [
            'ids.required' => 'Pilih minimal 1 course.',
        ]);

        return $data['ids'];
    }

    /**
     * @return array<string, mixed>
     */
    private function formData(): array
    {
        return [
            'categoryOptions' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'tagOptions' => Tag::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'scormPackageOptions' => ScormPackage::query()
                ->orderBy('title')
                ->get(['id', 'title']),
            'lmsFormatOptions' => [
                ['value' => Course::LMS_EMBED_YOUTUBE, 'label' => 'Embed YouTube (rekomendasi)'],
                ['value' => Course::LMS_EMBED_LINK, 'label' => 'Embed Link (Vimeo, dll)'],
                ['value' => Course::LMS_VIDEO, 'label' => 'Upload MP4 (maks 50 MB/lesson)'],
                ['value' => Course::LMS_SCORM, 'label' => 'SCORM Package (maks 50 MB)'],
            ],
            'levelOptions' => [
                ['value' => 'beginner', 'label' => 'Pemula'],
                ['value' => 'intermediate', 'label' => 'Menengah'],
                ['value' => 'advanced', 'label' => 'Lanjutan'],
                ['value' => 'all', 'label' => 'Semua Level'],
            ],
            'languageOptions' => [
                ['value' => 'id', 'label' => 'Bahasa Indonesia'],
                ['value' => 'en', 'label' => 'English'],
            ],
            'formatOptions' => [
                ['value' => 'on_demand', 'label' => 'On-demand (Rekaman)'],
                ['value' => 'online_live', 'label' => 'Online Live'],
                ['value' => 'offline', 'label' => 'Offline (Tatap Muka)'],
                ['value' => 'hybrid', 'label' => 'Hybrid'],
                ['value' => 'bootcamp', 'label' => 'Bootcamp'],
            ],
        ];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function reviewStatusOptions(): array
    {
        return [
            ['value' => Course::REVIEW_DRAFT, 'label' => 'Draft'],
            ['value' => Course::REVIEW_PENDING, 'label' => 'Menunggu Review'],
            ['value' => Course::REVIEW_PUBLISHED, 'label' => 'Terbit'],
            ['value' => Course::REVIEW_REJECTED, 'label' => 'Ditolak'],
        ];
    }
}
