<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CourseRequest;
use App\Models\Category;
use App\Models\Course;
use App\Models\ScormPackage;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            ->paginate(10)
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
            'sections:id,course_id,title,sort_order',
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

        $tagIds = $data['tag_ids'] ?? [];
        unset($data['tag_ids']);

        $course = Course::create($data);
        $course->tags()->sync($tagIds);

        return redirect()
            ->route('admin.courses.show', $course)
            ->with('success', 'Course tersimpan sebagai draft. Lengkapi kurikulum lalu ajukan untuk review.');
    }

    public function edit(Course $course): Response
    {
        $this->authorize('update', $course);

        $course->load('tags:id');

        return Inertia::render('admin/courses/form', [
            'course' => array_merge($course->toArray(), [
                'tag_ids' => $course->tags->pluck('id')->all(),
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

        // Jika sebelumnya rejected, edit membuatnya draft lagi
        if ($course->review_status === Course::REVIEW_REJECTED) {
            $data['review_status'] = Course::REVIEW_DRAFT;
        }

        $tagIds = $data['tag_ids'] ?? [];
        unset($data['tag_ids']);

        $course->update($data);
        $course->tags()->sync($tagIds);

        return redirect()
            ->route('admin.courses.show', $course)
            ->with('success', 'Course berhasil diperbarui.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);

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

        return redirect()
            ->route('admin.courses.show', $course)
            ->with('success', 'Course dikembalikan ke instructor dengan catatan revisi.');
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
                ['value' => Course::LMS_VIDEO, 'label' => 'Video'],
                ['value' => Course::LMS_EMBED_LINK, 'label' => 'Embed Link'],
                ['value' => Course::LMS_EMBED_YOUTUBE, 'label' => 'Embed YouTube'],
                ['value' => Course::LMS_SCORM, 'label' => 'SCORM Package'],
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
