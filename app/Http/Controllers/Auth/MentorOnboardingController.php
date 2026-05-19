<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\InstructorProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Onboarding form for mentors who registered via Google OAuth
 * (didn't fill the multi-step profile during sign-up).
 *
 * Flow: Google sign-up as instructor → status=pending_approval → redirect here.
 * Submit fills the InstructorProfile, logs the user out, sends them to the
 * pending-approval landing page so admin can review.
 */
class MentorOnboardingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $this->ensureEligible($request);

        if (! $user instanceof User) {
            return $user;
        }

        return Inertia::render('auth/mentor-onboarding', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->ensureEligible($request);

        if (! $user instanceof User) {
            return $user;
        }

        $data = $request->validate([
            'headline' => ['required', 'string', 'max:200'],
            'phone' => ['required', 'string', 'max:30'],
            'expertise' => ['required', 'array', 'min:1', 'max:10'],
            'expertise.*' => ['string', 'max:50'],
            'linkedin_url' => ['required', 'url', 'max:255'],
            'cv' => ['required', 'file', 'mimes:pdf', 'max:5120'],
            'bio' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'url', 'max:255'],
        ], [
            'headline.required' => 'Headline wajib diisi.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'expertise.required' => 'Pilih minimal 1 bidang keahlian.',
            'expertise.min' => 'Pilih minimal 1 bidang keahlian.',
            'expertise.max' => 'Maksimal 10 bidang keahlian.',
            'linkedin_url.required' => 'URL LinkedIn wajib diisi.',
            'linkedin_url.url' => 'URL LinkedIn tidak valid.',
            'cv.required' => 'CV wajib diunggah.',
            'cv.mimes' => 'CV harus berformat PDF.',
            'cv.max' => 'Ukuran CV maksimal 5 MB.',
            'bio.max' => 'Bio maksimal 500 karakter.',
            'website.url' => 'URL website tidak valid.',
        ]);

        DB::transaction(function () use ($user, $data, $request) {
            $cv = $request->file('cv');
            $cvPath = $cv->store("instructors/cv/{$user->id}", 'local');

            $user->forceFill(['phone' => $data['phone']])->save();

            InstructorProfile::create([
                'user_id' => $user->id,
                'headline' => $data['headline'],
                'bio' => $data['bio'] ?? null,
                'expertise' => array_values(array_filter(
                    array_map('trim', $data['expertise']),
                )),
                'cv_path' => $cvPath,
                'cv_original_name' => $cv->getClientOriginalName(),
                'cv_uploaded_at' => now(),
                'social_links' => array_filter([
                    'linkedin' => $data['linkedin_url'],
                ]),
                'website' => $data['website'] ?? null,
                'is_verified' => false,
                'is_active' => false,
            ]);
        });

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('auth.pending-approval')
            ->with('success', 'Profil mentor terkirim, menunggu persetujuan admin.');
    }

    /**
     * Bouncer: only pending-approval mentors without a CV-bearing profile may enter.
     */
    private function ensureEligible(Request $request): User|RedirectResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return redirect()->route('login');
        }

        if (! $user->hasRole('instructor')) {
            return redirect()->route('dashboard');
        }

        if (! $user->isPendingApproval()) {
            return redirect()->route('dashboard');
        }

        if ($user->instructorProfile()->whereNotNull('cv_path')->exists()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('auth.pending-approval');
        }

        return $user;
    }
}
