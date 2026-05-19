<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InstructorProfile;
use App\Models\User;
use App\Notifications\InstructorApproved;
use App\Notifications\InstructorRejected;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InstructorController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('user.view'), 403);

        $instructors = User::query()
            ->role('instructor')
            ->with(['instructorProfile'])
            ->withCount('instructedCourses')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->string('verified')->toString(), function ($query, $verified) {
                $query->whereHas('instructorProfile', function ($q) use ($verified) {
                    $q->where('is_verified', $verified === 'yes');
                });
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderByRaw("CASE status WHEN 'pending_approval' THEN 0 ELSE 1 END")
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/instructors/index', [
            'instructors' => $instructors,
            'filters' => $request->only('search', 'verified', 'status'),
            'stats' => [
                'total' => User::role('instructor')->count(),
                'pending' => User::role('instructor')->where('status', User::STATUS_PENDING_APPROVAL)->count(),
                'verified' => InstructorProfile::where('is_verified', true)->count(),
                'active' => InstructorProfile::where('is_active', true)->count(),
                'with_courses' => User::role('instructor')->has('instructedCourses')->count(),
            ],
        ]);
    }

    public function show(Request $request, User $instructor): Response
    {
        abort_unless($request->user()?->can('user.view'), 403);
        abort_unless($instructor->hasRole('instructor'), 404);

        $instructor->load(['instructorProfile', 'roles:id,name']);

        $courses = $instructor->instructedCourses()
            ->withCount('enrollments')
            ->orderByDesc('id')
            ->get(['id', 'instructor_id', 'title', 'slug', 'subtitle', 'thumbnail', 'level', 'is_published', 'review_status', 'created_at'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'slug' => $c->slug,
                'subtitle' => $c->subtitle,
                'thumbnail' => $c->thumbnail,
                'level' => $c->level,
                'is_published' => (bool) $c->is_published,
                'review_status' => $c->review_status,
                'enrollments_count' => (int) $c->enrollments_count,
                'created_at' => $c->created_at?->toIso8601String(),
            ]);

        $publishedCourses = $courses->where('is_published', true)->count();
        $totalEnrollments = (int) $courses->sum('enrollments_count');

        $profile = $instructor->instructorProfile;

        return Inertia::render('admin/instructors/show', [
            'instructor' => [
                'id' => $instructor->id,
                'name' => $instructor->name,
                'email' => $instructor->email,
                'phone' => $instructor->phone,
                'status' => $instructor->status,
                'avatar' => $instructor->avatar_url,
                'created_at' => $instructor->created_at?->toIso8601String(),
                'email_verified_at' => $instructor->email_verified_at?->toIso8601String(),
                'profile' => $profile ? [
                    'headline' => $profile->headline,
                    'bio' => $profile->bio,
                    'expertise' => $profile->expertise ?? [],
                    'photo_path' => $profile->photo_path,
                    'social_links' => $profile->social_links ?? [],
                    'website' => $profile->website,
                    'is_verified' => (bool) $profile->is_verified,
                    'is_active' => (bool) $profile->is_active,
                    'updated_at' => $profile->updated_at?->toIso8601String(),
                    'cv' => $profile->cv_path ? [
                        'original_name' => $profile->cv_original_name,
                        'uploaded_at' => $profile->cv_uploaded_at?->toIso8601String(),
                        'download_url' => route('admin.instructors.cv.download', $instructor),
                    ] : null,
                ] : null,
            ],
            'courses' => $courses->values(),
            'stats' => [
                'total_courses' => $courses->count(),
                'published_courses' => $publishedCourses,
                'draft_courses' => $courses->count() - $publishedCourses,
                'total_enrollments' => $totalEnrollments,
            ],
        ]);
    }

    public function edit(Request $request, User $instructor): Response
    {
        abort_unless($request->user()?->can('user.update'), 403);
        abort_unless($instructor->hasRole('instructor'), 404);

        $instructor->load('instructorProfile');
        $profile = $instructor->instructorProfile;

        return Inertia::render('admin/instructors/edit', [
            'instructor' => [
                'id' => $instructor->id,
                'name' => $instructor->name,
                'email' => $instructor->email,
                'phone' => $instructor->phone,
                'avatar' => $instructor->avatar_url,
                'profile' => $profile ? [
                    'headline' => $profile->headline,
                    'bio' => $profile->bio,
                    'expertise' => $profile->expertise ?? [],
                    'photo_path' => $profile->photo_path,
                    'social_links' => $profile->social_links ?? [],
                    'website' => $profile->website,
                    'is_verified' => $profile->is_verified,
                    'is_active' => $profile->is_active,
                    'cv' => $profile->cv_path ? [
                        'original_name' => $profile->cv_original_name,
                        'uploaded_at' => $profile->cv_uploaded_at?->toIso8601String(),
                        'download_url' => route('admin.instructors.cv.download', $instructor),
                    ] : null,
                ] : [
                    'headline' => null,
                    'bio' => null,
                    'expertise' => [],
                    'photo_path' => null,
                    'social_links' => [],
                    'website' => null,
                    'is_verified' => false,
                    'is_active' => true,
                    'cv' => null,
                ],
            ],
        ]);
    }

    public function update(Request $request, User $instructor): RedirectResponse
    {
        abort_unless($request->user()?->can('user.update'), 403);
        abort_unless($instructor->hasRole('instructor'), 404);

        $data = $request->validate([
            'headline' => ['nullable', 'string', 'max:200'],
            'bio' => ['nullable', 'string', 'max:5000'],
            'expertise' => ['nullable', 'array'],
            'expertise.*' => ['string', 'max:50'],
            'website' => ['nullable', 'url', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'social_links.linkedin' => ['nullable', 'string', 'max:255'],
            'social_links.instagram' => ['nullable', 'string', 'max:255'],
            'social_links.youtube' => ['nullable', 'string', 'max:255'],
            'social_links.twitter' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'cv' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'is_verified' => ['boolean'],
            'is_active' => ['boolean'],
        ], [
            'headline.max' => 'Headline maksimal 200 karakter.',
            'bio.max' => 'Bio maksimal 5000 karakter.',
            'website.url' => 'Website harus berupa URL valid.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.max' => 'Foto maksimal 2 MB.',
            'cv.mimes' => 'CV harus berformat PDF.',
            'cv.max' => 'Ukuran CV maksimal 5 MB.',
        ]);

        $profile = $instructor->instructorProfile()->firstOrNew([]);

        $profile->fill([
            'user_id' => $instructor->id,
            'headline' => $data['headline'] ?? null,
            'bio' => $data['bio'] ?? null,
            'expertise' => array_values(array_filter($data['expertise'] ?? [])),
            'social_links' => array_filter($data['social_links'] ?? []),
            'website' => $data['website'] ?? null,
            'is_verified' => (bool) ($data['is_verified'] ?? false),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        if ($request->hasFile('photo')) {
            if ($profile->photo_path && Storage::disk('public')->exists($profile->photo_path)) {
                Storage::disk('public')->delete($profile->photo_path);
            }

            $profile->photo_path = $request->file('photo')->store('instructors', 'public');
        }

        if ($request->hasFile('cv')) {
            if ($profile->cv_path && Storage::disk('local')->exists($profile->cv_path)) {
                Storage::disk('local')->delete($profile->cv_path);
            }

            $cv = $request->file('cv');
            $profile->cv_path = $cv->store("instructors/cv/{$instructor->id}", 'local');
            $profile->cv_original_name = $cv->getClientOriginalName();
            $profile->cv_uploaded_at = now();
        }

        $profile->save();

        return redirect()
            ->route('admin.instructors.index')
            ->with('success', 'Profil instruktur berhasil diperbarui.');
    }

    public function downloadCv(Request $request, User $instructor): StreamedResponse
    {
        abort_unless($request->user()?->can('user.view'), 403);
        abort_unless($instructor->hasRole('instructor'), 404);

        $profile = $instructor->instructorProfile;

        abort_unless(
            $profile && $profile->cv_path && Storage::disk('local')->exists($profile->cv_path),
            404,
        );

        $filename = $profile->cv_original_name
            ?: 'cv-'.str($instructor->name)->slug().'.pdf';

        return Storage::disk('local')->download($profile->cv_path, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    public function toggleVerified(Request $request, User $instructor): RedirectResponse
    {
        abort_unless($request->user()?->can('user.update'), 403);
        abort_unless($instructor->hasRole('instructor'), 404);

        $profile = $instructor->instructorProfile()->firstOrCreate(
            ['user_id' => $instructor->id],
            ['is_active' => true],
        );

        $profile->update([
            'is_verified' => ! $profile->is_verified,
        ]);

        return back()->with(
            'success',
            $profile->is_verified ? 'Instruktur telah diverifikasi.' : 'Verifikasi instruktur dicabut.',
        );
    }

    public function approve(Request $request, User $instructor): RedirectResponse
    {
        abort_unless($request->user()?->can('user.update'), 403);
        abort_unless($instructor->hasRole('instructor'), 404);

        if (! $instructor->isPendingApproval()) {
            return back()->with('info', 'Mentor ini sudah dalam status aktif.');
        }

        $instructor->update(['status' => User::STATUS_ACTIVE]);

        $instructor->instructorProfile()->firstOrCreate(
            ['user_id' => $instructor->id],
            ['is_active' => true, 'is_verified' => true],
        );

        try {
            $instructor->notify(new InstructorApproved);
        } catch (\Throwable $e) {
            report($e);
        }

        return back()->with('success', "Mentor {$instructor->name} berhasil disetujui.");
    }

    public function reject(Request $request, User $instructor): RedirectResponse
    {
        abort_unless($request->user()?->can('user.update'), 403);
        abort_unless($instructor->hasRole('instructor'), 404);

        if (! $instructor->isPendingApproval()) {
            return back()->with('info', 'Mentor ini bukan dalam status menunggu approval.');
        }

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $instructor->update(['status' => User::STATUS_REJECTED]);

        try {
            $instructor->notify(new InstructorRejected($data['reason'] ?? null));
        } catch (\Throwable $e) {
            report($e);
        }

        return back()->with('success', "Pendaftaran mentor {$instructor->name} ditolak.");
    }
}
