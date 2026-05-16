<?php

namespace App\Actions\SkillMatrix;

use App\Models\EmployeeProfile;
use App\Models\PositionCompetencyTarget;
use App\Models\SkillGap;
use App\Models\UserCompetency;
use Illuminate\Support\Facades\DB;

class CalculateSkillGap
{
    /**
     * Recompute skill_gaps for all employees with an assigned position.
     */
    public function executeAll(): int
    {
        $employees = EmployeeProfile::query()
            ->whereNotNull('position_id')
            ->get(['user_id', 'position_id']);

        $count = 0;
        foreach ($employees as $emp) {
            $count += $this->executeForUser($emp->user_id, $emp->position_id);
        }

        return $count;
    }

    /**
     * Recompute skill_gaps for one user given their current position.
     * Returns the number of gap rows written.
     */
    public function executeForUser(int $userId, int $positionId): int
    {
        $targets = PositionCompetencyTarget::query()
            ->where('position_id', $positionId)
            ->get(['competency_id', 'target_level', 'is_required']);

        $actuals = UserCompetency::query()
            ->where('user_id', $userId)
            ->pluck('actual_level', 'competency_id');

        $written = 0;

        DB::transaction(function () use ($targets, $actuals, $userId, $positionId, &$written) {
            foreach ($targets as $target) {
                $actual = (int) ($actuals[$target->competency_id] ?? 0);
                $gap = $target->target_level - $actual;

                $status = match (true) {
                    $actual === 0 => 'no_data',
                    $gap > 0 => 'gap',
                    $gap === 0 => 'on_target',
                    default => 'exceed',
                };

                SkillGap::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'position_id' => $positionId,
                        'competency_id' => $target->competency_id,
                    ],
                    [
                        'target_level' => $target->target_level,
                        'actual_level' => $actual,
                        'gap' => $gap,
                        'status' => $status,
                        'calculated_at' => now(),
                    ],
                );

                $written++;
            }
        });

        return $written;
    }
}
