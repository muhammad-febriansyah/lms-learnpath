<?php

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\User;
use App\Services\AI\QuizGenerator;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    config()->set('services.openai.api_key', 'test-key');
    config()->set('services.openai.model', 'gpt-5');

    Permission::findOrCreate('assessment.manage', 'web');
    $instructorRole = Role::findOrCreate('instructor', 'web');
    $instructorRole->syncPermissions(['assessment.manage']);
    Role::findOrCreate('employee', 'web');

    $this->instructor = User::factory()->create();
    $this->instructor->assignRole('instructor');

    $this->course = Course::factory()->create([
        'title' => 'Analisa Kredit',
        'instructor_id' => $this->instructor->id,
    ]);

    $this->lesson = Lesson::factory()->create([
        'course_id' => $this->course->id,
        'title' => 'Bab 1: Five C',
        'description' => 'Pengenalan 5C analisa kredit untuk Account Officer.',
        'content' => 'Five C terdiri dari Character, Capacity, Capital, Collateral, dan Condition. Setiap aspek menilai dimensi berbeda dari calon debitur. Character menilai integritas, Capacity menilai kemampuan bayar, Capital menilai modal sendiri, Collateral menilai jaminan, Condition menilai konteks ekonomi.',
    ]);

    $this->assessment = Assessment::create([
        'course_id' => $this->course->id,
        'title' => 'Pre-test',
        'type' => 'pre_test',
        'passing_score' => 70,
        'max_attempts' => 3,
        'is_required' => true,
        'sort_order' => 1,
    ]);
});

it('generates and parses MCQ questions from a lesson', function () {
    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'model' => 'gpt-5',
            'choices' => [['message' => ['content' => json_encode([
                'questions' => [
                    [
                        'question' => 'Apa singkatan C pertama di 5C?',
                        'options' => ['Character', 'Capacity', 'Capital', 'Collateral'],
                        'correct_index' => 0,
                        'explanation' => 'C pertama adalah Character.',
                    ],
                    [
                        'question' => 'Aspek apa yang menilai kemampuan bayar debitur?',
                        'options' => ['Character', 'Capacity', 'Condition', 'Collateral'],
                        'correct_index' => 1,
                        'explanation' => 'Capacity = kemampuan bayar.',
                    ],
                ],
            ])]]],
            'usage' => ['total_tokens' => 50],
        ], 200),
    ]);

    $result = app(QuizGenerator::class)->generate(
        course: $this->course,
        lesson: $this->lesson,
        extraContext: '',
        count: 2,
    );

    expect($result)->toHaveCount(2);
    expect($result[0]['question'])->toContain('5C');
    expect($result[0]['options'])->toHaveCount(4);
    expect($result[0]['correct_index'])->toBe(0);
});

it('throws when source material is too short', function () {
    $emptyLesson = Lesson::factory()->create([
        'course_id' => $this->course->id,
        'title' => 'X',
        'description' => null,
        'content' => null,
    ]);

    expect(fn () => app(QuizGenerator::class)->generate(
        course: $this->course,
        lesson: $emptyLesson,
        extraContext: '',
        count: 5,
    ))->toThrow(RuntimeException::class, 'Materi sumber terlalu pendek');
});

it('drops invalid questions (wrong option count or out-of-range correct_index)', function () {
    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'model' => 'gpt-5',
            'choices' => [['message' => ['content' => json_encode([
                'questions' => [
                    ['question' => 'OK', 'options' => ['a', 'b', 'c', 'd'], 'correct_index' => 0, 'explanation' => ''],
                    ['question' => 'Only 3 opts', 'options' => ['a', 'b', 'c'], 'correct_index' => 0],
                    ['question' => 'Bad index', 'options' => ['a', 'b', 'c', 'd'], 'correct_index' => 9],
                ],
            ])]]],
            'usage' => ['total_tokens' => 10],
        ], 200),
    ]);

    $result = app(QuizGenerator::class)->generate(
        course: $this->course,
        lesson: $this->lesson,
        extraContext: '',
        count: 5,
    );

    expect($result)->toHaveCount(1);
    expect($result[0]['question'])->toBe('OK');
});

it('exposes the generate endpoint to instructors with assessment.manage permission', function () {
    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'model' => 'gpt-5',
            'choices' => [['message' => ['content' => json_encode([
                'questions' => [
                    ['question' => 'Q', 'options' => ['a', 'b', 'c', 'd'], 'correct_index' => 0, 'explanation' => ''],
                ],
            ])]]],
            'usage' => ['total_tokens' => 1],
        ], 200),
    ]);

    $this->actingAs($this->instructor)
        ->postJson(route('admin.assessments.questions.generate', ['assessment' => $this->assessment->id]), [
            'lesson_id' => $this->lesson->id,
            'count' => 1,
            'difficulty' => 'medium',
        ])
        ->assertOk()
        ->assertJsonStructure(['questions' => [['question', 'options', 'correct_index']]]);
});

it('persists edited questions via bulk-store and creates real Question rows', function () {
    $this->actingAs($this->instructor)
        ->post(route('admin.assessments.questions.bulk', ['assessment' => $this->assessment->id]), [
            'questions' => [
                [
                    'question_text' => 'Soal pertama dari AI',
                    'points' => 1,
                    'options' => [
                        ['option_text' => 'Salah 1', 'is_correct' => false],
                        ['option_text' => 'Benar', 'is_correct' => true],
                        ['option_text' => 'Salah 2', 'is_correct' => false],
                        ['option_text' => 'Salah 3', 'is_correct' => false],
                    ],
                ],
            ],
        ])
        ->assertSessionHas('success');

    expect(Question::where('assessment_id', $this->assessment->id)->count())->toBe(1);
    $q = Question::first();
    expect($q->question_text)->toBe('Soal pertama dari AI');
    expect($q->options()->where('is_correct', true)->count())->toBe(1);
    expect($q->options()->count())->toBe(4);
});

it('skips questions in bulk-store that have no correct answer', function () {
    $this->actingAs($this->instructor)
        ->post(route('admin.assessments.questions.bulk', ['assessment' => $this->assessment->id]), [
            'questions' => [
                [
                    'question_text' => 'Soal tanpa jawaban benar',
                    'points' => 1,
                    'options' => array_fill(0, 4, ['option_text' => 'x', 'is_correct' => false]),
                ],
            ],
        ])
        ->assertSessionHas('success');

    expect(Question::where('assessment_id', $this->assessment->id)->count())->toBe(0);
});

it('blocks users without assessment.manage permission', function () {
    $emp = User::factory()->create();
    $emp->assignRole('employee');

    $this->actingAs($emp)
        ->postJson(route('admin.assessments.questions.generate', ['assessment' => $this->assessment->id]), [
            'lesson_id' => $this->lesson->id,
            'count' => 1,
        ])
        ->assertForbidden();
});
