<?php

namespace App\Services\Learning;

use App\Events\Learning\CertificateIssued;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\LearningPathEnrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Issues a Certificate for a completed Enrollment when the course is
 * marked as `is_certified`. Idempotent: re-running returns the existing
 * certificate without creating duplicates.
 */
final class CertificateIssuanceService
{
    public function issueForEnrollment(Enrollment $enrollment): ?Certificate
    {
        $enrollment->loadMissing('course');

        if (! $enrollment->course || ! $enrollment->course->is_certified) {
            return null;
        }

        if ($enrollment->status !== 'completed') {
            return null;
        }

        $existing = Certificate::query()
            ->where('user_id', $enrollment->user_id)
            ->where('course_id', $enrollment->course_id)
            ->first();

        if ($existing) {
            return $existing;
        }

        return DB::transaction(function () use ($enrollment) {
            $certificate = Certificate::create([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'learning_path_id' => null,
                'subject_type' => Certificate::SUBJECT_COURSE,
                'certificate_number' => $this->generateCertificateNumber('CERT', $enrollment->course_id),
                'verification_code' => $this->generateVerificationCode(),
                'issued_at' => now(),
                'status' => 'issued',
            ]);

            $enrollment->update(['certificate_status' => 'issued']);

            CertificateIssued::dispatch($certificate);

            return $certificate;
        });
    }

    /**
     * Issue a certificate for a completed LearningPathEnrollment. Idempotent.
     */
    public function issueForPathEnrollment(LearningPathEnrollment $pathEnrollment): ?Certificate
    {
        if ($pathEnrollment->status !== 'completed') {
            return null;
        }

        $existing = Certificate::query()
            ->where('user_id', $pathEnrollment->user_id)
            ->where('learning_path_id', $pathEnrollment->learning_path_id)
            ->where('subject_type', Certificate::SUBJECT_PATH)
            ->first();

        if ($existing) {
            return $existing;
        }

        return DB::transaction(function () use ($pathEnrollment) {
            $certificate = Certificate::create([
                'user_id' => $pathEnrollment->user_id,
                'course_id' => null,
                'learning_path_id' => $pathEnrollment->learning_path_id,
                'subject_type' => Certificate::SUBJECT_PATH,
                'certificate_number' => $this->generateCertificateNumber('PATH', $pathEnrollment->learning_path_id),
                'verification_code' => $this->generateVerificationCode(),
                'issued_at' => now(),
                'status' => 'issued',
            ]);

            CertificateIssued::dispatch($certificate);

            return $certificate;
        });
    }

    private function generateCertificateNumber(string $prefix, int $subjectId): string
    {
        $year = now()->year;
        $idPart = str_pad((string) $subjectId, 4, '0', STR_PAD_LEFT);

        do {
            $random = strtoupper(Str::random(6));
            $number = "{$prefix}-{$year}-{$idPart}-{$random}";
        } while (Certificate::where('certificate_number', $number)->exists());

        return $number;
    }

    private function generateVerificationCode(): string
    {
        do {
            $code = strtoupper(Str::random(10));
        } while (Certificate::where('verification_code', $code)->exists());

        return $code;
    }
}
