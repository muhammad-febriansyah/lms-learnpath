<?php

namespace App\Models;

use Database\Factories\AssessmentAnswerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'assessment_attempt_id',
    'question_id',
    'selected_option_id',
    'answer_text',
    'is_correct',
    'point_earned',
])]
class AssessmentAnswer extends Model
{
    /** @use HasFactory<AssessmentAnswerFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'point_earned' => 'integer',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(QuestionOption::class, 'selected_option_id');
    }
}
