<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('course.view');
    }

    public function view(User $user, Course $course): bool
    {
        if ($user->hasAnyRole(['superadmin', 'admin_tenant'])) {
            return true;
        }

        if ($user->hasRole('instructor')) {
            return $course->instructor_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('course.create') && $user->hasRole('instructor');
    }

    public function update(User $user, Course $course): bool
    {
        if (! $user->hasPermissionTo('course.update')) {
            return false;
        }

        if (! $user->hasRole('instructor')) {
            return false;
        }

        if ($course->instructor_id !== $user->id) {
            return false;
        }

        return in_array($course->review_status, [Course::REVIEW_DRAFT, Course::REVIEW_REJECTED], true);
    }

    /**
     * Quick action — toggle is_preview on a lesson within this course.
     * Allowed for superadmin (cross-tenant) or the course's instructor,
     * regardless of review status (preview can be set on published courses too).
     */
    public function togglePreview(User $user, Course $course): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->hasRole('instructor') && $course->instructor_id === $user->id;
    }

    public function delete(User $user, Course $course): bool
    {
        if (! $user->hasPermissionTo('course.delete')) {
            return false;
        }

        if (! $user->hasRole('instructor')) {
            return false;
        }

        if ($course->instructor_id !== $user->id) {
            return false;
        }

        return $course->review_status === Course::REVIEW_DRAFT;
    }

    public function submitReview(User $user, Course $course): bool
    {
        if (! $user->hasPermissionTo('course.submit_review')) {
            return false;
        }

        if ($course->instructor_id !== $user->id) {
            return false;
        }

        return in_array($course->review_status, [Course::REVIEW_DRAFT, Course::REVIEW_REJECTED], true);
    }

    public function review(User $user, Course $course): bool
    {
        return $user->hasPermissionTo('course.review')
            && $course->review_status === Course::REVIEW_PENDING;
    }
}
