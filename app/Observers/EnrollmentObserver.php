<?php

namespace App\Observers;

use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Services\Learning\CertificateIssuanceService;
use App\Services\Learning\PathEnrollmentService;

final class EnrollmentObserver
{
    public function __construct(
        private readonly PathEnrollmentService $pathEnrollment,
        private readonly CertificateIssuanceService $certificates,
    ) {}

    public function updated(Enrollment $enrollment): void
    {
        if (! $enrollment->wasChanged(['progress_percent', 'status'])) {
            return;
        }

        if ($enrollment->wasChanged('status') && $enrollment->status === 'completed') {
            $this->certificates->issueForEnrollment($enrollment);
        }

        $this->recomputePaths($enrollment);
    }

    private function recomputePaths(Enrollment $enrollment): void
    {
        $paths = LearningPath::query()
            ->whereHas('courses', fn ($q) => $q->where('courses.id', $enrollment->course_id))
            ->whereHas('enrollments', fn ($q) => $q->where('user_id', $enrollment->user_id))
            ->get();

        if ($paths->isEmpty()) {
            return;
        }

        $user = $enrollment->user;
        if (! $user) {
            return;
        }

        foreach ($paths as $path) {
            $this->pathEnrollment->recomputeProgress($user, $path);
        }
    }
}
