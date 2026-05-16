<?php

namespace App\Actions\SkillMatrix;

use App\Models\OjtAssessment;
use App\Models\SupervisorReview;
use App\Models\UserCompetency;

class SyncUserCompetencyFromSources
{
    /**
     * Rebuild user_competencies entry for one user+competency by combining the
     * latest signal from supervisor reviews (highest weight) and OJT assessments.
     *
     * Priority: supervisor_review (confidence 90) > ojt (confidence 70) > course (50).
     * Course-derived levels are handled by CourseCompletedListener.
     */
    public function execute(int $userId, int $competencyId): UserCompetency
    {
        $review = SupervisorReview::query()
            ->where('user_id', $userId)
            ->where('competency_id', $competencyId)
            ->where('approval_status', 'approved')
            ->latest('reviewed_at')
            ->first();

        $ojt = OjtAssessment::query()
            ->where('user_id', $userId)
            ->where('competency_id', $competencyId)
            ->where('status', 'approved')
            ->latest('assessed_at')
            ->first();

        $existing = UserCompetency::query()
            ->where('user_id', $userId)
            ->where('competency_id', $competencyId)
            ->first();

        $source = 'no_data';
        $sourceId = null;
        $actualLevel = 0;
        $confidence = 0;
        $lastEvaluatedAt = null;

        if ($review) {
            $source = 'supervisor_review';
            $sourceId = $review->id;
            $actualLevel = $review->actual_level;
            $confidence = 90;
            $lastEvaluatedAt = $review->reviewed_at;
        } elseif ($ojt) {
            $source = 'ojt';
            $sourceId = $ojt->id;
            $actualLevel = $ojt->actual_level;
            $confidence = 70;
            $lastEvaluatedAt = $ojt->assessed_at;
        } elseif ($existing && $existing->source === 'course') {
            return $existing;
        }

        return UserCompetency::updateOrCreate(
            [
                'user_id' => $userId,
                'competency_id' => $competencyId,
            ],
            [
                'actual_level' => $actualLevel,
                'source' => $source,
                'source_id' => $sourceId,
                'confidence_score' => $confidence,
                'last_evaluated_at' => $lastEvaluatedAt,
            ],
        );
    }
}
