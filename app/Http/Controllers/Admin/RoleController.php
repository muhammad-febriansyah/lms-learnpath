<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    private const LOCKED_ROLES = ['superadmin'];

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('role.manage'), 403);

        $roles = Role::query()
            ->withCount(['permissions', 'users'])
            ->orderBy('id')
            ->get();

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'lockedRoles' => self::LOCKED_ROLES,
        ]);
    }

    public function edit(Request $request, Role $role): Response
    {
        abort_unless($request->user()?->can('role.manage'), 403);

        $role->load('permissions:id,name');

        return Inertia::render('admin/roles/form', [
            'role' => [
                ...$role->toArray(),
                'permission_ids' => $role->permissions->pluck('id')->all(),
                'is_locked' => in_array($role->name, self::LOCKED_ROLES, true),
            ],
            'permissionGroups' => $this->groupedPermissions(),
            'usersCount' => $role->users()->count(),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        abort_unless($request->user()?->can('role.manage'), 403);

        $data = $request->validate([
            'name' => [
                'required', 'string', 'max:128', 'alpha_dash',
                Rule::unique('roles', 'name')->ignore($role->id),
            ],
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ], [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'max' => ':attribute maksimal :max karakter.',
            'alpha_dash' => ':attribute hanya boleh huruf, angka, tanda hubung, underscore.',
            'unique' => ':attribute sudah digunakan.',
            'exists' => ':attribute tidak valid.',
            'array' => ':attribute harus berupa daftar.',
        ], [
            'name' => 'Nama role',
            'permission_ids' => 'Permission',
        ]);

        if (in_array($role->name, self::LOCKED_ROLES, true)) {
            return back()->with('error', 'Role bawaan tidak dapat diubah namanya. Permission masih dapat di-update.');
        }

        $role->update(['name' => $data['name']]);
        $role->syncPermissions(
            Permission::query()->whereIn('id', $data['permission_ids'] ?? [])->get()
        );

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return redirect()
            ->route('admin.roles.index')
            ->with('success', 'Role berhasil diperbarui.');
    }

    public function syncPermissions(Request $request, Role $role): RedirectResponse
    {
        abort_unless($request->user()?->can('role.manage'), 403);

        $data = $request->validate([
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ], [
            'array' => ':attribute harus berupa daftar.',
            'exists' => ':attribute tidak valid.',
        ], [
            'permission_ids' => 'Permission',
        ]);

        $role->syncPermissions(
            Permission::query()->whereIn('id', $data['permission_ids'] ?? [])->get()
        );

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return back()->with('success', 'Permission role berhasil diperbarui.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function groupedPermissions(): array
    {
        $groups = [
            'Course & Lesson' => ['course.', 'lesson.'],
            'Assessment & Certificate' => ['assessment.', 'certificate.'],
            'Enrollment' => ['enrollment.'],
            'User & Role' => ['user.', 'role.'],
            'Skill Matrix' => ['position.', 'competency.', 'skill_matrix.', 'ojt.', 'supervisor_review.'],
            'Marketplace' => ['order.', 'payment.', 'review.', 'tag.', 'category.'],
            'Settings & Report' => ['settings.', 'report.'],
        ];

        $all = Permission::query()->orderBy('name')->get(['id', 'name']);

        $result = [];
        $assigned = collect();

        foreach ($groups as $label => $prefixes) {
            $items = $all->filter(function ($p) use ($prefixes) {
                foreach ($prefixes as $prefix) {
                    if (str_starts_with($p->name, $prefix)) {
                        return true;
                    }
                }

                return false;
            })->values();

            if ($items->isNotEmpty()) {
                $result[] = [
                    'label' => $label,
                    'items' => $items->map(fn ($p) => [
                        'id' => $p->id,
                        'name' => $p->name,
                        'label' => Str::headline(str_replace('.', ' ', $p->name)),
                    ])->all(),
                ];
                $assigned = $assigned->merge($items->pluck('id'));
            }
        }

        $other = $all->whereNotIn('id', $assigned)->values();

        if ($other->isNotEmpty()) {
            $result[] = [
                'label' => 'Lainnya',
                'items' => $other->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'label' => Str::headline(str_replace('.', ' ', $p->name)),
                ])->all(),
            ];
        }

        return $result;
    }
}
