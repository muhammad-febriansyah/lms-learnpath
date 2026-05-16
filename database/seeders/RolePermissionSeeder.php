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

        $roles = [
            'super_admin' => $permissions,
            'admin' => array_diff($permissions, [
                'role.manage', 'user.delete',
                // Admin hanya bisa lihat course; tidak bisa CRUD atau review
                'course.create', 'course.update', 'course.delete', 'course.publish', 'course.review',
            ]),
            'hr' => [
                'user.view', 'user.create', 'user.update',
                'position.manage', 'competency.manage', 'skill_matrix.view', 'skill_matrix.manage',
                'enrollment.view', 'enrollment.manage', 'report.view',
            ],
            'instructor' => [
                'course.view', 'course.create', 'course.update', 'course.delete',
                'course.submit_review',
                'lesson.manage', 'assessment.manage', 'assessment.grade',
                'enrollment.view', 'certificate.view', 'learning_path.manage',
            ],
            'supervisor' => [
                'enrollment.view', 'skill_matrix.view',
                'ojt.create', 'ojt.review', 'supervisor_review.create', 'supervisor_review.approve',
            ],
            'student' => [
                'course.view', 'enrollment.view', 'certificate.view',
            ],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($perms);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
