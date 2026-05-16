<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\Organization;
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
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function __construct(
        private readonly MailketingService $mail,
        private readonly InvitationMailComposer $composer,
        private readonly PositionCourseAutoEnrollService $autoEnroll,
    ) {}

    public function index(Request $request): Response
    {
        $org = $this->resolveOrganization($request);

        $members = OrganizationMember::query()
            ->where('organization_id', $org->id)
            ->with([
                'user:id,name,email,avatar_path,phone,status,created_at',
                'user.employeeProfile:id,user_id,position_id',
                'user.employeeProfile.position:id,name',
            ])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->whereHas('user', function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->string('role')->toString(), function ($q, $role) {
                $q->where('role', $role);
            })
            ->latest('joined_at')
            ->paginate(20)
            ->withQueryString();

        $members->getCollection()->transform(fn ($m) => [
            'id' => $m->id,
            'role' => $m->role,
            'joined_at' => $m->joined_at?->toIso8601String(),
            'user' => $m->user ? [
                'id' => $m->user->id,
                'name' => $m->user->name,
                'email' => $m->user->email,
                'phone' => $m->user->phone,
                'avatar_url' => $m->user->avatar_url,
                'status' => $m->user->status,
                'position' => $m->user->employeeProfile?->position?->name,
                'position_id' => $m->user->employeeProfile?->position_id,
            ] : null,
        ]);

        return Inertia::render('business/members/index', [
            'members' => $members,
            'organization' => [
                'name' => $org->name,
                'seat_quota' => $org->seat_quota,
                'seats_used' => $org->seats_used,
                'seats_available' => $org->seatsAvailable(),
            ],
            'filters' => $request->only('search', 'role'),
            'positions' => Position::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Position $p) => ['id' => $p->id, 'name' => $p->name])
                ->all(),
        ]);
    }

    public function directCreate(Request $request): RedirectResponse
    {
        $org = $this->resolveOrganization($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:32'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'employee_number' => ['nullable', 'string', 'max:64'],
            'division' => ['nullable', 'string', 'max:120'],
            'branch' => ['nullable', 'string', 'max:120'],
        ], [
            'required' => ':attribute wajib diisi.',
            'unique' => 'Email sudah terdaftar. Gunakan fitur Undang untuk user yang sudah ada.',
            'email' => 'Email tidak valid.',
            'exists' => 'Jabatan tidak ditemukan.',
        ], [
            'name' => 'Nama karyawan',
            'email' => 'Email',
            'phone' => 'Nomor telepon',
            'position_id' => 'Jabatan',
            'employee_number' => 'NIK / nomor karyawan',
            'division' => 'Divisi',
            'branch' => 'Cabang',
        ]);

        abort_unless($org->hasSeatAvailable(), 422, 'Tidak ada seat tersedia.');

        $tempPassword = Str::password(12, symbols: false);
        $coursesEnrolled = 0;
        $pathsEnrolled = 0;

        DB::transaction(function () use ($data, $org, $tempPassword, &$coursesEnrolled, &$pathsEnrolled) {
            $user = User::create([
                'name' => $data['name'],
                'email' => strtolower($data['email']),
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($tempPassword),
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $user->assignRole('student');

            OrganizationMember::create([
                'organization_id' => $org->id,
                'user_id' => $user->id,
                'role' => 'learner',
                'joined_at' => now(),
            ]);

            $org->increment('seats_used');

            if ($data['position_id'] || $data['employee_number'] ?? null
                || $data['division'] ?? null || $data['branch'] ?? null
            ) {
                EmployeeProfile::create([
                    'user_id' => $user->id,
                    'position_id' => $data['position_id'] ?? null,
                    'employee_number' => $data['employee_number'] ?? null,
                    'division' => $data['division'] ?? null,
                    'branch' => $data['branch'] ?? null,
                    'joined_at' => now()->toDateString(),
                ]);
            }

            if (! empty($data['position_id'])) {
                $fresh = $user->fresh();
                $courseResult = $this->autoEnroll->syncForUser($fresh, $data['position_id']);
                $pathResult = $this->autoEnroll->syncPathsForUser($fresh, $data['position_id']);
                $coursesEnrolled = $courseResult['enrolled'] + $pathResult['child_courses_created'];
                $pathsEnrolled = $pathResult['paths_enrolled'];
            }

            $payload = $this->composer->composeDirectCreate(
                name: $user->name,
                email: $user->email,
                tempPassword: $tempPassword,
                orgName: $org->name,
            );

            $this->mail->send(
                to: $user->email,
                subject: $payload['subject'],
                html: $payload['html'],
            );
        });

        $message = "Akun karyawan dibuat. Password sementara dikirim ke {$data['email']}.";
        $parts = [];
        if ($pathsEnrolled > 0) {
            $parts[] = "{$pathsEnrolled} learning path";
        }
        if ($coursesEnrolled > 0) {
            $parts[] = "{$coursesEnrolled} course";
        }
        if ($parts !== []) {
            $message .= ' '.implode(' dan ', $parts).' otomatis didaftarkan sesuai jabatan.';
        }

        return back()->with('success', $message);
    }

    public function updateRole(Request $request, OrganizationMember $member): RedirectResponse
    {
        $org = $this->resolveOrganization($request);
        abort_unless($member->organization_id === $org->id, 403);

        $data = $request->validate([
            'role' => ['required', 'in:admin,learner'],
        ]);

        $member->update(['role' => $data['role']]);

        return back()->with('success', 'Role member diperbarui.');
    }

    public function resyncEnrollments(Request $request, OrganizationMember $member): RedirectResponse
    {
        $org = $this->resolveOrganization($request);
        abort_unless($member->organization_id === $org->id, 403);

        $user = $member->user()->with('employeeProfile')->first();
        abort_unless($user, 404, 'User tidak ditemukan.');

        $positionId = $user->employeeProfile?->position_id;
        if (! $positionId) {
            return back()->with('info', 'Karyawan ini belum punya jabatan. Set jabatan dulu di profil karyawan.');
        }

        $courseResult = $this->autoEnroll->syncForUser($user, $positionId);
        $pathResult = $this->autoEnroll->syncPathsForUser($user, $positionId);

        $totalCourses = $courseResult['enrolled'] + $pathResult['child_courses_created'];
        $totalPaths = $pathResult['paths_enrolled'];

        if ($totalCourses === 0 && $totalPaths === 0) {
            return back()->with(
                'info',
                'Tidak ada course atau path baru untuk didaftarkan (semua sudah aktif).',
            );
        }

        $parts = [];
        if ($totalPaths > 0) {
            $parts[] = "{$totalPaths} learning path";
        }
        if ($totalCourses > 0) {
            $parts[] = "{$totalCourses} course";
        }

        return back()->with(
            'success',
            implode(' dan ', $parts)." baru didaftarkan otomatis untuk {$user->name}.",
        );
    }

    public function destroy(Request $request, OrganizationMember $member): RedirectResponse
    {
        $org = $this->resolveOrganization($request);
        abort_unless($member->organization_id === $org->id, 403);

        if ($member->user_id === $request->user()->id) {
            return back()->with('error', 'Anda tidak dapat mengeluarkan diri sendiri.');
        }

        $member->delete();
        $org->decrement('seats_used');

        return back()->with('success', 'Member dikeluarkan dari organisasi.');
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
