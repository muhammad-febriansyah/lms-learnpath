<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InstructorProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

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
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/instructors/index', [
            'instructors' => $instructors,
            'filters' => $request->only('search', 'verified'),
            'stats' => [
                'total' => User::role('instructor')->count(),
                'verified' => InstructorProfile::where('is_verified', true)->count(),
                'active' => InstructorProfile::where('is_active', true)->count(),
                'with_courses' => User::role('instructor')->has('instructedCourses')->count(),
            ],
        ]);
    }

    public function edit(Request $request, User $instructor): Response
    {
        abort_unless($request->user()?->can('user.update'), 403);
        abort_unless($instructor->hasRole('instructor'), 404);

        $instructor->load('instructorProfile');

        return Inertia::render('admin/instructors/edit', [
            'instructor' => [
                'id' => $instructor->id,
                'name' => $instructor->name,
                'email' => $instructor->email,
                'phone' => $instructor->phone,
                'avatar' => $instructor->avatar,
                'profile' => $instructor->instructorProfile ?? [
                    'headline' => null,
                    'bio' => null,
                    'expertise' => [],
                    'photo_path' => null,
                    'social_links' => [],
                    'website' => null,
                    'is_verified' => false,
                    'is_active' => true,
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
            'is_verified' => ['boolean'],
            'is_active' => ['boolean'],
        ], [
            'headline.max' => 'Headline maksimal 200 karakter.',
            'bio.max' => 'Bio maksimal 5000 karakter.',
            'website.url' => 'Website harus berupa URL valid.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.max' => 'Foto maksimal 2 MB.',
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

        $profile->save();

        return redirect()
            ->route('admin.instructors.index')
            ->with('success', 'Profil instruktur berhasil diperbarui.');
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
}
