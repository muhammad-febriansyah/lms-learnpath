<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\InstructorProfile;
use App\Models\User;
use App\Services\Security\RecaptchaVerifier;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Roles a visitor is allowed to pick during self-registration.
     * superadmin/admin_tenant/hr are managed elsewhere; employee is by-invitation only.
     */
    private const ALLOWED_ROLES = ['user_public', 'instructor'];

    public function __construct(private readonly RecaptchaVerifier $recaptcha) {}

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        $isInstructor = ($input['intended_role'] ?? null) === 'instructor';

        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'intended_role' => ['nullable', 'string', 'in:'.implode(',', self::ALLOWED_ROLES)],
            ...($isInstructor ? $this->instructorRules() : []),
        ], $isInstructor ? $this->instructorMessages() : [])->validate();

        $this->recaptcha->verify(
            isset($input['recaptcha_token']) ? (string) $input['recaptcha_token'] : null,
            'register',
        );

        $role = $isInstructor ? 'instructor' : 'user_public';

        // Instructor needs admin approval before they can login.
        $status = $isInstructor
            ? User::STATUS_PENDING_APPROVAL
            : User::STATUS_ACTIVE;

        return DB::transaction(function () use ($input, $role, $status, $isInstructor) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'phone' => $isInstructor ? ($input['phone'] ?? null) : null,
                'status' => $status,
            ]);

            $user->assignRole($role);

            if ($isInstructor) {
                $this->createInstructorProfile($user, $input);
            }

            return $user;
        });
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function instructorRules(): array
    {
        return [
            'headline' => ['required', 'string', 'max:200'],
            'phone' => ['required', 'string', 'max:30'],
            'expertise' => ['required', 'array', 'min:1', 'max:10'],
            'expertise.*' => ['string', 'max:50'],
            'linkedin_url' => ['required', 'url', 'max:255'],
            'cv' => ['required', 'file', 'mimes:pdf', 'max:5120'],
            'bio' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'url', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function instructorMessages(): array
    {
        return [
            'headline.required' => 'Headline wajib diisi.',
            'headline.max' => 'Headline maksimal 200 karakter.',
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
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function createInstructorProfile(User $user, array $input): void
    {
        /** @var UploadedFile $cv */
        $cv = $input['cv'];
        $cvPath = $cv->store("instructors/cv/{$user->id}", 'local');

        $linkedin = (string) ($input['linkedin_url'] ?? '');

        InstructorProfile::create([
            'user_id' => $user->id,
            'headline' => $input['headline'],
            'bio' => $input['bio'] ?? null,
            'expertise' => array_values(array_filter(
                array_map('trim', $input['expertise'] ?? []),
            )),
            'cv_path' => $cvPath,
            'cv_original_name' => $cv->getClientOriginalName(),
            'cv_uploaded_at' => now(),
            'social_links' => array_filter([
                'linkedin' => $linkedin !== '' ? $linkedin : null,
            ]),
            'website' => $input['website'] ?? null,
            'is_verified' => false,
            'is_active' => false,
        ]);
    }
}
