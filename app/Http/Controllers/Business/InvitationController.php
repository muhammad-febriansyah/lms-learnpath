<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\Organization;
use App\Models\OrganizationInvitation;
use App\Models\OrganizationMember;
use App\Models\Position;
use App\Models\User;
use App\Services\Learning\PositionCourseAutoEnrollService;
use App\Services\Mail\InvitationMailComposer;
use App\Services\Mail\MailketingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function __construct(
        private readonly MailketingService $mail,
        private readonly InvitationMailComposer $composer,
        private readonly PositionCourseAutoEnrollService $autoEnroll,
    ) {}

    public function index(Request $request): Response
    {
        $org = $this->resolveOrganization($request);

        $invitations = OrganizationInvitation::query()
            ->where('organization_id', $org->id)
            ->with('position:id,name')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $invitations->getCollection()->transform(fn ($i) => [
            'id' => $i->id,
            'email' => $i->email,
            'name' => $i->name,
            'role' => $i->role,
            'employee_number' => $i->employee_number,
            'division' => $i->division,
            'branch' => $i->branch,
            'position' => $i->position ? ['id' => $i->position->id, 'name' => $i->position->name] : null,
            'token' => $i->token,
            'invite_url' => route('business.invitations.accept', ['token' => $i->token]),
            'expires_at' => $i->expires_at?->toIso8601String(),
            'last_sent_at' => $i->last_sent_at?->toIso8601String(),
            'accepted_at' => $i->accepted_at?->toIso8601String(),
            'is_pending' => $i->isPending(),
            'is_expired' => $i->isExpired(),
            'created_at' => $i->created_at?->toIso8601String(),
        ]);

        return Inertia::render('business/invitations/index', [
            'invitations' => $invitations,
            'organization' => [
                'name' => $org->name,
                'seat_quota' => $org->seat_quota,
                'seats_used' => $org->seats_used,
                'seats_available' => $org->seatsAvailable(),
            ],
            'positions' => Position::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'division'])
                ->map(fn (Position $p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'division' => $p->division,
                ])
                ->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $org = $this->resolveOrganization($request);

        $data = $request->validate([
            'emails' => ['required', 'string'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'division' => ['nullable', 'string', 'max:120'],
            'branch' => ['nullable', 'string', 'max:120'],
        ], [
            'emails.required' => 'Daftar email wajib diisi.',
            'exists' => 'Jabatan tidak ditemukan.',
        ]);

        $emails = collect(preg_split('/[\s,;]+/', $data['emails']))
            ->map(fn ($e) => trim(strtolower($e)))
            ->filter(fn ($e) => filter_var($e, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values();

        if ($emails->isEmpty()) {
            return back()->withErrors(['emails' => 'Tidak ada email valid yang terdeteksi.']);
        }

        [$created, $skipped, $sent] = $this->createInvitations(
            $org,
            $request->user(),
            $emails->map(fn ($e) => [
                'email' => $e,
                'name' => null,
                'position_id' => $data['position_id'] ?? null,
                'employee_number' => null,
                'division' => $data['division'] ?? null,
                'branch' => $data['branch'] ?? null,
            ])->all(),
        );

        $message = "{$created} undangan dibuat, {$sent} email terkirim.";
        if ($skipped > 0) {
            $message .= " {$skipped} email dilewati (sudah jadi member / sudah diundang).";
        }

        return back()->with('success', $message);
    }

    public function bulkUpload(Request $request): RedirectResponse
    {
        $org = $this->resolveOrganization($request);

        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ], [
            'file.required' => 'File CSV wajib diunggah.',
            'file.mimes' => 'File harus berformat CSV.',
            'file.max' => 'Ukuran file maksimal 2MB.',
        ]);

        $rows = $this->parseCsv($data['file']->getRealPath());

        if (empty($rows)) {
            return back()->withErrors(['file' => 'CSV kosong atau format tidak terbaca.']);
        }

        $positionsByName = Position::query()
            ->pluck('id', 'name')
            ->mapWithKeys(fn ($id, $name) => [strtolower(trim($name)) => $id]);

        $payload = collect($rows)
            ->map(function (array $row) use ($positionsByName) {
                $email = trim(strtolower($row['email'] ?? ''));
                if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return null;
                }

                return [
                    'email' => $email,
                    'name' => trim((string) ($row['name'] ?? '')) ?: null,
                    'employee_number' => trim((string) ($row['employee_number'] ?? '')) ?: null,
                    'position_id' => $positionsByName->get(strtolower(trim((string) ($row['position'] ?? '')))),
                    'division' => trim((string) ($row['division'] ?? '')) ?: null,
                    'branch' => trim((string) ($row['branch'] ?? '')) ?: null,
                ];
            })
            ->filter()
            ->unique('email')
            ->values()
            ->all();

        if (empty($payload)) {
            return back()->withErrors(['file' => 'Tidak ada baris dengan email valid.']);
        }

        [$created, $skipped, $sent] = $this->createInvitations($org, $request->user(), $payload);

        $message = "Bulk upload: {$created} undangan dibuat, {$sent} email terkirim.";
        if ($skipped > 0) {
            $message .= " {$skipped} dilewati.";
        }

        return back()->with('success', $message);
    }

    public function resend(Request $request, OrganizationInvitation $invitation): RedirectResponse
    {
        $org = $this->resolveOrganization($request);
        abort_unless($invitation->organization_id === $org->id, 403);

        if ($invitation->isAccepted()) {
            return back()->with('info', 'Undangan sudah diterima sebelumnya.');
        }

        if ($invitation->isExpired()) {
            $invitation->update(['expires_at' => now()->addDays(14)]);
        }

        $invitation->loadMissing('organization');
        $sent = $this->dispatchInvitationEmail($invitation);

        $invitation->update(['last_sent_at' => now()]);

        return back()->with(
            $sent ? 'success' : 'error',
            $sent
                ? 'Email undangan dikirim ulang.'
                : 'Gagal mengirim email. Cek konfigurasi Mailketing.',
        );
    }

    public function destroy(Request $request, OrganizationInvitation $invitation): RedirectResponse
    {
        $org = $this->resolveOrganization($request);
        abort_unless($invitation->organization_id === $org->id, 403);

        $invitation->delete();

        return back()->with('success', 'Undangan dibatalkan.');
    }

    public function showAccept(string $token): Response
    {
        $invitation = OrganizationInvitation::query()
            ->where('token', $token)
            ->with(['organization:id,name,slug,logo_path', 'position:id,name'])
            ->first();

        return Inertia::render('business/invitations/accept', [
            'invitation' => $invitation ? [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'name' => $invitation->name,
                'role' => $invitation->role,
                'position' => $invitation->position?->name,
                'is_expired' => $invitation->isExpired(),
                'is_accepted' => $invitation->isAccepted(),
                'organization' => $invitation->organization ? [
                    'name' => $invitation->organization->name,
                    'logo' => $invitation->organization->logo_path,
                ] : null,
            ] : null,
            'user_logged_in' => auth()->check(),
            'existing_user' => $invitation ? User::where('email', $invitation->email)->exists() : false,
        ]);
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = OrganizationInvitation::query()
            ->where('token', $token)
            ->firstOrFail();

        if ($invitation->isExpired() || $invitation->isAccepted()) {
            return redirect()
                ->route('business.invitations.accept', ['token' => $token])
                ->with('error', 'Undangan tidak valid atau sudah kedaluwarsa.');
        }

        $org = Organization::find($invitation->organization_id);
        abort_unless($org && $org->hasSeatAvailable(), 422, 'Tidak ada seat tersedia.');

        $existingUser = User::where('email', $invitation->email)->first();

        if (! auth()->check() && ! $existingUser) {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:150'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ], [
                'required' => ':attribute wajib diisi.',
                'confirmed' => 'Konfirmasi password tidak cocok.',
            ], [
                'name' => 'Nama lengkap',
                'password' => 'Password',
            ]);

            $user = User::create([
                'name' => $invitation->name ?: $data['name'],
                'email' => $invitation->email,
                'password' => Hash::make($data['password']),
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $user->assignRole('student');

            auth()->login($user);
        } elseif (! auth()->check() && $existingUser) {
            return redirect()
                ->route('login')
                ->with('info', 'Silakan login untuk menerima undangan.');
        } else {
            $user = auth()->user();
            if ($user->email !== $invitation->email) {
                return back()->with('error', 'Email akun Anda tidak sesuai dengan undangan ('.$invitation->email.').');
            }
        }

        $coursesEnrolled = 0;
        $pathsEnrolled = 0;

        DB::transaction(function () use ($invitation, $user, $org, &$coursesEnrolled, &$pathsEnrolled) {
            OrganizationMember::create([
                'organization_id' => $org->id,
                'user_id' => $user->id,
                'role' => $invitation->role,
                'joined_at' => now(),
            ]);

            $org->increment('seats_used');

            $this->ensureEmployeeProfile($user, $invitation);

            $invitation->update([
                'accepted_at' => now(),
                'accepted_user_id' => $user->id,
            ]);

            if ($invitation->position_id) {
                $fresh = $user->fresh();
                $courseResult = $this->autoEnroll->syncForUser($fresh, $invitation->position_id);
                $pathResult = $this->autoEnroll->syncPathsForUser($fresh, $invitation->position_id);
                $coursesEnrolled = $courseResult['enrolled'] + $pathResult['child_courses_created'];
                $pathsEnrolled = $pathResult['paths_enrolled'];
            }
        });

        $message = "Selamat datang di {$org->name}!";
        $parts = [];
        if ($pathsEnrolled > 0) {
            $parts[] = "{$pathsEnrolled} learning path";
        }
        if ($coursesEnrolled > 0) {
            $parts[] = "{$coursesEnrolled} course";
        }
        if ($parts !== []) {
            $message .= ' '.implode(' dan ', $parts).' otomatis didaftarkan sesuai jabatan Anda.';
        } else {
            $message .= ' Anda sekarang punya akses ke semua course.';
        }

        return redirect('/dashboard')->with('success', $message);
    }

    /**
     * @param  array<int, array{email: string, name: ?string, position_id: ?int, employee_number: ?string, division: ?string, branch: ?string}>  $rows
     * @return array{0: int, 1: int, 2: int}  [created, skipped, sent]
     */
    private function createInvitations(Organization $org, User $inviter, array $rows): array
    {
        $available = $org->seatsAvailable();
        $pendingInvites = $org->invitations()
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->count();

        $remaining = max(0, $available - $pendingInvites);

        $created = 0;
        $skipped = 0;
        $sent = 0;

        foreach ($rows as $row) {
            if ($created >= $remaining) {
                $skipped++;

                continue;
            }

            $email = $row['email'];

            $existingUser = User::where('email', $email)->first();
            if ($existingUser && $org->members()->where('user_id', $existingUser->id)->exists()) {
                $skipped++;

                continue;
            }

            if ($org->invitations()->where('email', $email)->whereNull('accepted_at')->exists()) {
                $skipped++;

                continue;
            }

            $invitation = OrganizationInvitation::create([
                'organization_id' => $org->id,
                'invited_by_user_id' => $inviter->id,
                'email' => $email,
                'name' => $row['name'],
                'role' => 'learner',
                'position_id' => $row['position_id'],
                'employee_number' => $row['employee_number'],
                'division' => $row['division'],
                'branch' => $row['branch'],
            ]);

            $created++;

            $invitation->loadMissing('organization');
            if ($this->dispatchInvitationEmail($invitation)) {
                $invitation->update(['last_sent_at' => now()]);
                $sent++;
            }
        }

        return [$created, $skipped, $sent];
    }

    private function dispatchInvitationEmail(OrganizationInvitation $invitation): bool
    {
        $payload = $this->composer->compose($invitation);

        return $this->mail->send(
            to: $invitation->email,
            subject: $payload['subject'],
            html: $payload['html'],
        );
    }

    private function ensureEmployeeProfile(User $user, OrganizationInvitation $invitation): void
    {
        if (! $invitation->position_id && ! $invitation->employee_number
            && ! $invitation->division && ! $invitation->branch) {
            return;
        }

        EmployeeProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'position_id' => $invitation->position_id,
                'employee_number' => $invitation->employee_number,
                'division' => $invitation->division,
                'branch' => $invitation->branch,
                'joined_at' => now()->toDateString(),
            ],
        );
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function parseCsv(string $path): array
    {
        $rows = [];
        $handle = fopen($path, 'r');
        if (! $handle) {
            return [];
        }

        $headers = fgetcsv($handle);
        if (! $headers) {
            fclose($handle);

            return [];
        }

        $headers = array_map(fn ($h) => strtolower(trim((string) $h)), $headers);

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) === 1 && trim((string) $row[0]) === '') {
                continue;
            }
            $padded = array_pad($row, count($headers), '');
            $rows[] = array_combine($headers, array_slice($padded, 0, count($headers)));
        }

        fclose($handle);

        return $rows;
    }

    private function resolveOrganization(Request $request): Organization
    {
        $org = $request->user()
            ?->organizations()
            ->wherePivot('role', 'admin')
            ->first();

        abort_unless($org, 403, 'Anda bukan admin organisasi.');

        return $org;
    }
}
