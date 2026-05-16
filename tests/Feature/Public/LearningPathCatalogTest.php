<?php

use App\Models\Course;
use App\Models\LearningPath;
use App\Models\Position;

it('renders the public learning path catalog', function () {
    $path = LearningPath::factory()->create(['title' => 'Roadmap Test', 'total_courses' => 0]);
    $courses = Course::factory()->count(2)->create();
    $path->courses()->sync([
        $courses[0]->id => ['sort_order' => 1, 'is_required' => true],
        $courses[1]->id => ['sort_order' => 2, 'is_required' => true],
    ]);

    $response = $this->get('/paths');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/paths/index')
        ->has('paths.data', 1)
        ->where('paths.data.0.title', 'Roadmap Test')
        ->where('paths.data.0.courses_count', 2)
    );
});

it('hides draft (unpublished) paths from the public catalog', function () {
    LearningPath::factory()->create();
    LearningPath::factory()->draft()->create();

    $response = $this->get('/paths');

    $response->assertInertia(fn ($page) => $page->has('paths.data', 1));
});

it('shows the path detail page with ordered courses', function () {
    $position = Position::factory()->create(['name' => 'Account Officer']);
    $path = LearningPath::factory()->create([
        'title' => 'Roadmap AO',
        'position_id' => $position->id,
    ]);

    $courses = Course::factory()->count(3)->create();
    $path->courses()->sync([
        $courses[2]->id => ['sort_order' => 1, 'is_required' => true],
        $courses[0]->id => ['sort_order' => 2, 'is_required' => true],
        $courses[1]->id => ['sort_order' => 3, 'is_required' => false],
    ]);

    $response = $this->get("/paths/{$path->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/paths/show')
        ->where('path.title', 'Roadmap AO')
        ->where('path.position.name', 'Account Officer')
        ->has('path.courses', 3)
        ->where('path.courses.0.id', $courses[2]->id)
        ->where('path.courses.0.sort_order', 1)
        ->where('path.courses.2.is_required', false)
    );
});

it('returns 404 for a draft path detail page', function () {
    $path = LearningPath::factory()->draft()->create();

    $this->get("/paths/{$path->slug}")->assertNotFound();
});

it('filters paths by level', function () {
    LearningPath::factory()->create(['level' => 'beginner']);
    LearningPath::factory()->create(['level' => 'advanced']);

    $this->get('/paths?level=beginner')
        ->assertInertia(fn ($page) => $page->has('paths.data', 1)
            ->where('paths.data.0.level', 'beginner'));
});
