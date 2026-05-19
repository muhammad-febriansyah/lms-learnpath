<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InstructorProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MyProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->hasRole('instructor'), 403);

        $user->load('instructorProfile');

        return Inertia::render('admin/my-profile/edit', [
            'instructor' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar_url,
                'profile' => $user->instructorProfile ?? [
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

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasRole('instructor'), 403);

        $data = $request->validate([
            'headline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:5000'],
            'expertise' => ['nullable', 'array'],
            'expertise.*' => ['string', 'max:100'],
            'website' => ['nullable', 'url', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'social_links.linkedin' => ['nullable', 'url', 'max:255'],
            'social_links.instagram' => ['nullable', 'url', 'max:255'],
            'social_links.twitter' => ['nullable', 'url', 'max:255'],
            'social_links.youtube' => ['nullable', 'url', 'max:255'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $profile = $user->instructorProfile ?? new InstructorProfile([
            'user_id' => $user->id,
            'is_active' => true,
        ]);

        if ($request->hasFile('photo')) {
            if ($profile->photo_path && Storage::disk('public')->exists($profile->photo_path)) {
                Storage::disk('public')->delete($profile->photo_path);
            }
            $data['photo_path'] = $request->file('photo')->store('instructor-photos', 'public');
        }

        unset($data['photo']);
        $profile->fill($data);
        $profile->user_id = $user->id;
        $profile->save();

        return redirect()
            ->route('admin.my-profile.edit')
            ->with('success', 'Profil mentor berhasil diperbarui.');
    }
}
