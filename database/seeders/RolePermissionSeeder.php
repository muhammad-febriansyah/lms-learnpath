<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            // Course
            'course.view', 'course.create', 'course.update', 'course.delete', 'course.publish',
            'course.submit_review', 'course.review',
            // Lesson
            'lesson.manage',
            // Assessment
            'assessment.manage', 'assessment.grade',
            // Enrollment
            'enrollment.view', 'enrollment.manage',
            // Certificate
            'certificate.view', 'certificate.issue', 'certificate.revoke',
            // User & roles
            'user.view', 'user.create', 'user.update', 'user.delete', 'role.manage',
            // Skill matrix
            'position.manage', 'competency.manage', 'skill_matrix.view', 'skill_matrix.manage',
            'ojt.create', 'ojt.review', 'supervisor_review.create', 'supervisor_review.approve',
            // Marketplace
            'order.view', 'order.manage', 'payment.view',
            'review.moderate', 'tag.manage', 'category.manage', 'coupon.manage', 'bundle.manage', 'learning_path.manage',
            // Settings
            'settings.view', 'settings.update',
            // Reports
            'report.view',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'web');
        }

        /**
         * Six-role tenant structure (Fase 1):
         * - superadmin    : platform owner (lihat semua tenant)
         * - admin_tenant  : admin perusahaan klien
         * - hr            : pengelola L&D di tenant
         * - employee      : karyawan tenant (ikut training)
         * - instructor    : pengajar / mentor pembuat course
         * - user_public   : marketplace customer B2C
         *
         * Note: `supervisor` dipertahankan (deprecated) sampai Fase 3 yang menggantinya
         * dengan flag is_supervisor di EmployeeProfile.
         */
        $roles = [
            'superadmin' => $permissions,
            'admin_tenant' => array_diff($permissions, [
                'role.manage', 'user.delete',
                // Admin tenant hanya lihat course (course CRUD oleh instructor).
                'course.create', 'course.update', 'course.delete', 'course.publish', 'course.review',
            ]),
            'hr' => [
                'user.view', 'user.create', 'user.update',
                'position.manage', 'competency.manage', 'skill_matrix.view', 'skill_matrix.manage',
                'enrollment.view', 'enrollment.manage', 'report.view',
            ],
            'employee' => [
                'course.view', 'enrollment.view', 'certificate.view', 'skill_matrix.view',
            ],
            'instructor' => [
                'course.view', 'course.create', 'course.update', 'course.delete',
                'course.submit_review',
                'lesson.manage', 'assessment.manage', 'assessment.grade',
                'enrollment.view', 'certificate.view', 'learning_path.manage',
            ],
            'user_public' => [
                'course.view', 'enrollment.view', 'certificate.view',
            ],
            // Deprecated — akan dihapus di Fase 3 (digantikan flag is_supervisor di EmployeeProfile).
            'supervisor' => [
                'enrollment.view', 'skill_matrix.view',
                'ojt.create', 'ojt.review', 'supervisor_review.create', 'supervisor_review.approve',
            ],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($perms);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
