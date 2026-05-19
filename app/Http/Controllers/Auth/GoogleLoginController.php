<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Google OAuth login/register without Socialite — manual code+state flow.
 * Adopted from sister project pattern.
 *
 * Flow:
 *  - GET /auth/google?intent=login|register&role=user_public|instructor
 *  - GET /auth/google/callback (state + code) → verify id_token via tokeninfo
 *  - Match by email. login intent fails if no user; register intent creates one
 *    with the chosen role (whitelist).
 */
class GoogleLoginController extends Controller
{
    private const ALLOWED_ROLES = ['user_public', 'instructor'];

    public function redirect(Request $request): RedirectResponse
    {
        $clientId = (string) config('services.google.client_id');
        $clientSecret = (string) config('services.google.client_secret');

        if ($clientId === '' || $clientSecret === '') {
            return to_route('login')->withErrors([
                'google' => 'Login Google belum dikonfigurasi.',
            ]);
        }

        $intent = $request->string('intent')->toString() === 'register' ? 'register' : 'login';
        $role = $request->string('role')->toString();
        $role = in_array($role, self::ALLOWED_ROLES, true) ? $role : 'user_public';

        $state = Str::random(40);
        $request->session()->put('google_oauth_state', $state);
        $request->session()->put('google_oauth_intent', $intent);
        $request->session()->put('google_oauth_role', $role);

        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => route('auth.google.callback'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'prompt' => 'select_account',
            'access_type' => 'online',
        ]);

        return redirect()->away("https://accounts.google.com/o/oauth2/v2/auth?{$query}");
    }

    public function callback(Request $request): RedirectResponse
    {
        $state = $request->string('state')->toString();
        $code = $request->string('code')->toString();
        $storedState = (string) $request->session()->pull('google_oauth_state', '');
        $intent = (string) $request->session()->pull('google_oauth_intent', 'login');
        $role = (string) $request->session()->pull('google_oauth_role', 'user_public');

        if ($code === '' || $state === '' || $storedState === '' || ! hash_equals($storedState, $state)) {
            return to_route('login')->withErrors([
                'google' => 'Permintaan login Google tidak valid. Silakan coba lagi.',
            ]);
        }

        $clientId = (string) config('services.google.client_id');
        $clientSecret = (string) config('services.google.client_secret');

        $tokenResponse = Http::asForm()->timeout(10)->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => route('auth.google.callback'),
            'grant_type' => 'authorization_code',
        ]);

        if (! $tokenResponse->successful()) {
            return $this->backWithError($intent, 'Gagal memverifikasi login Google. Silakan coba lagi.');
        }

        $idToken = (string) ($tokenResponse->json('id_token') ?? '');

        if ($idToken === '') {
            return $this->backWithError($intent, 'ID token Google tidak ditemukan.');
        }

        try {
            return $this->authenticateFromIdToken($request, $idToken, $intent, $role);
        } catch (ValidationException $exception) {
            return $this->backWithError(
                $intent,
                $exception->errors()['google'][0] ?? 'Login Google gagal.',
            );
        }
    }

    private function authenticateFromIdToken(
        Request $request,
        string $idToken,
        string $intent,
        string $role,
    ): RedirectResponse {
        $configuredClientId = (string) config('services.google.client_id');

        $response = Http::timeout(10)
            ->get('https://oauth2.googleapis.com/tokeninfo', ['id_token' => $idToken]);

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'google' => 'Token Google tidak valid atau sudah kedaluwarsa.',
            ]);
        }

        $data = $response->json();
        $audience = (string) ($data['aud'] ?? '');
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $emailVerified = filter_var($data['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($audience !== $configuredClientId) {
            throw ValidationException::withMessages([
                'google' => 'Client ID Google tidak cocok dengan konfigurasi sistem.',
            ]);
        }

        if ($email === '' || ! $emailVerified) {
            throw ValidationException::withMessages([
                'google' => 'Email Google harus terverifikasi untuk melanjutkan.',
            ]);
        }

        $user = User::query()->where('email', $email)->first();
        $isNew = false;

        if (! $user instanceof User) {
            if ($intent !== 'register') {
                throw ValidationException::withMessages([
                    'google' => 'Akun belum terdaftar. Silakan daftar dulu dengan email yang sama.',
                ]);
            }

            $assignRole = in_array($role, self::ALLOWED_ROLES, true) ? $role : 'user_public';
            $name = trim((string) ($data['name'] ?? ''));
            $name = $name !== '' ? $name : Str::before($email, '@');

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Str::random(32),
                'email_verified_at' => now(),
                'status' => $assignRole === 'instructor'
                    ? User::STATUS_PENDING_APPROVAL
                    : User::STATUS_ACTIVE,
            ]);
            $user->assignRole($assignRole);
            $isNew = true;
        }

        // Existing mentors that already finished sign-up but admin hasn't approved
        // yet should not be able to log back in via Google either.
        if (! $isNew && $user->isPendingApproval()) {
            $needsOnboarding = $user->hasRole('instructor')
                && ! $user->instructorProfile()->whereNotNull('cv_path')->exists();

            if (! $needsOnboarding) {
                throw ValidationException::withMessages([
                    'google' => 'Akun mentor Anda masih menunggu persetujuan admin. Kami akan kirim email begitu disetujui.',
                ]);
            }
        }

        if ($user->status === User::STATUS_REJECTED) {
            throw ValidationException::withMessages([
                'google' => 'Pendaftaran akun Anda ditolak. Hubungi admin untuk informasi lebih lanjut.',
            ]);
        }

        if ($user->status === User::STATUS_SUSPENDED) {
            throw ValidationException::withMessages([
                'google' => 'Akun Anda dinonaktifkan. Hubungi admin untuk reaktivasi.',
            ]);
        }

        if ($user->email_verified_at === null) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        // Mentor (baru atau belum lengkap profil) wajib mampir ke onboarding.
        if ($user->hasRole('instructor') && $user->isPendingApproval()) {
            return redirect()->route('mentor.onboarding.show');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function backWithError(string $intent, string $message): RedirectResponse
    {
        return to_route($intent === 'register' ? 'register' : 'login')
            ->withErrors(['google' => $message]);
    }
}
