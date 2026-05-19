<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function quick(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));

        if (mb_strlen($term) < 2) {
            return response()->json([
                'query' => $term,
                'courses' => [],
                'users' => [],
            ]);
        }

        $user = $request->user();
        $isInstructorOnly = $user
            && $user->hasRole('instructor')
            && ! $user->hasAnyRole(['superadmin', 'admin_tenant', 'hr', 'supervisor']);

        $courses = Course::query()
            ->select(['id', 'title', 'slug', 'thumbnail', 'review_status', 'instructor_id'])
            ->with(['instructor:id,name'])
            ->when($isInstructorOnly, fn ($q) => $q->where('instructor_id', $user->id))
            ->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%");
            })
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'thumbnail' => $course->thumbnail,
                'review_status' => $course->review_status,
                'instructor' => $course->instructor?->name,
                'url' => route('admin.courses.show', $course),
            ]);

        $canSearchUsers = $user && $user->hasAnyRole(['superadmin', 'admin_tenant', 'hr']);

        $users = $canSearchUsers
            ? User::query()
                ->select(['id', 'name', 'email', 'avatar_path'])
                ->with(['roles:id,name'])
                ->where(function ($q) use ($term) {
                    $q->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('username', 'like', "%{$term}%");
                })
                ->orderByDesc('id')
                ->limit(5)
                ->get()
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'avatar' => $u->avatar_url,
                    'role' => $u->roles->first()?->name,
                    'url' => route('admin.users.edit', $u),
                ])
            : collect();

        return response()->json([
            'query' => $term,
            'courses' => $courses,
            'users' => $users,
        ]);
    }
}
