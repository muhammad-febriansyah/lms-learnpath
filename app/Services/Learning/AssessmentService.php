<?php

namespace App\Services\Learning;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\AssessmentAttempt;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\Gamification\BadgeAwardingService;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Handles assessment taking flow: starting an attempt, scoring submitted
 * answers, and applying side-effects on the parent Enrollment.
 */
final class AssessmentService
{
    /**
     * Get the in-progress attempt for the user if any, or create a new one.
     * Throws when the user has reached max_attempts.
     */
    public function startAttempt(User $user, Assessment $assessment): AssessmentAttempt
    {
        $assessment->loadMissing('course');

        $enrollment = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $assessment->course_id)
            ->first();

        if (! $enrollment) {
            throw new RuntimeException('Anda belum terdaftar di kursus ini.');
        }

        $resumable = AssessmentAttempt::query()
            ->where('assessment_id', $assessment->id)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->latest('id')
            ->first();

        if ($resumable) {
            return $resumable;
        }

        $submittedCount = AssessmentAttempt::query()
            ->where('assessment_id', $assessment->id)
            ->where('user_id', $user->id)
            ->where('status', 'submitted')
            ->count();

        if ($submittedCount >= (int) $assessment->max_attempts) {
            throw new RuntimeException('Anda sudah mencapai batas maksimal percobaan untuk assessment ini.');
        }

        return AssessmentAttempt::create([
            'assessment_id' => $assessment->id,
            'user_id' => $user->id,
            'course_id' => $assessment->course_id,
            'started_at' => now(),
            'score' => 0,
            'status' => 'in_progress',
            'passed' => false,
        ]);
    }

    /**
     * Submit answers for an in-progress attempt. $answers is keyed by
     * question_id and contains the selected_option_id (int).
     *
     * @param  array<int, int|null>  $answers
     */
    public function submitAttempt(AssessmentAttempt $attempt, array $answers): AssessmentAttempt
    {
        if ($attempt->status === 'submitted') {
            return $attempt;
        }

        $attempt->loadMissing(['assessment.questions.options']);
        $assessment = $attempt->assessment;
        $questions = $assessment->questions;

        $totalPoints = (int) $questions->sum('points');
        if ($totalPoints === 0) {
            throw new RuntimeException('Assessment ini belum memiliki soal.');
        }

        return DB::transaction(function () use ($attempt, $assessment, $questions, $answers, $totalPoints) {
            $earned = 0;

            // Clean previous answer rows (in case of resume submit edge case)
            AssessmentAnswer::where('assessment_attempt_id', $attempt->id)->delete();

            foreach ($questions as $question) {
                $selectedOptionId = $answers[$question->id] ?? null;
                $selectedOption = $selectedOptionId
                    ? $question->options->firstWhere('id', (int) $selectedOptionId)
                    : null;

                $isCorrect = $selectedOption && $selectedOption->is_correct;
                $point = $isCorrect ? (int) $question->points : 0;
                $earned += $point;

                AssessmentAnswer::create([
                    'assessment_attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'selected_option_id' => $selectedOption?->id,
                    'is_correct' => $isCorrect,
                    'point_earned' => $point,
                ]);
            }

            $scorePercent = (int) round(($earned / $totalPoints) * 100);
            $scorePercent = max(0, min(100, $scorePercent));
            $passed = $scorePercent >= (int) $assessment->passing_score;

            $attempt->update([
                'submitted_at' => now(),
                'score' => $scorePercent,
                'status' => 'submitted',
                'passed' => $passed,
            ]);

            $this->applyEnrollmentSideEffects($attempt->fresh(), $assessment, $passed);

            // Gamification: award perfect-score badge if applicable
            if ($scorePercent === 100) {
                $user = $attempt->user;
                if ($user) {
                    App::make(BadgeAwardingService::class)->evaluateForUser($user);
                }
            }

            return $attempt->fresh();
        });
    }

    private function applyEnrollmentSideEffects(
        AssessmentAttempt $attempt,
        Assessment $assessment,
        bool $passed,
    ): void {
        $enrollment = Enrollment::query()
            ->where('user_id', $attempt->user_id)
            ->where('course_id', $attempt->course_id)
            ->first();

        if (! $enrollment) {
            return;
        }

        $statusValue = $passed ? 'passed' : 'failed';

        if ($assessment->type === 'pre_test') {
            $enrollment->update(['pre_test_status' => $statusValue]);

            return;
        }

        if ($assessment->type === 'post_test') {
            $update = ['post_test_status' => $statusValue];

            $lessonsDone = (int) $enrollment->progress_percent >= 100;
            $alreadyCompleted = $enrollment->status === 'completed';

            if ($passed && $lessonsDone && ! $alreadyCompleted) {
                $update['status'] = 'completed';
                $update['completed_at'] = now();
            }

            $enrollment->update($update);
        }
    }
}
