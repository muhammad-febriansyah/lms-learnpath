<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
        $enrollments = Enrollment::query()
            ->with([
                'user:id,name,email',
                'course:id,title,slug',
            ])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('course', function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('enrolled_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/enrollments/index', [
            'enrollments' => $enrollments,
            'filters' => $request->only('search', 'status'),
            'stats' => [
                'total' => Enrollment::count(),
                'active' => Enrollment::where('status', 'active')->count(),
                'completed' => Enrollment::where('status', 'completed')->count(),
                'expired' => Enrollment::where('status', 'expired')->count(),
            ],
        ]);
    }
}
