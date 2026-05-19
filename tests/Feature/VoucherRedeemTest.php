<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'tester@example.com',
        'email_verified_at' => now(),
    ]);
});

it('lets a user redeem a course voucher and redirects to learn page', function () {
    $course = Course::factory()->create(['slug' => 'tasty-course']);
    Voucher::factory()->create([
        'code' => 'GIFT4U',
        'grant_kind' => 'course',
        'grantable_type' => $course->getMorphClass(),
        'grantable_id' => $course->id,
    ]);

    $this->actingAs($this->user)
        ->post('/redeem', ['code' => 'GIFT4U'])
        ->assertRedirect('/learn/tasty-course');

    expect(Enrollment::query()
        ->where('user_id', $this->user->id)
        ->where('course_id', $course->id)
        ->exists())->toBeTrue();
});

it('shows validation error for invalid code', function () {
    $this->actingAs($this->user)
        ->post('/redeem', ['code' => 'WHATEVER'])
        ->assertSessionHasErrors('code');
});

it('validates required code field', function () {
    $this->actingAs($this->user)
        ->post('/redeem', [])
        ->assertSessionHasErrors('code');
});

it('renders the redeem page for authed users', function () {
    $this->actingAs($this->user)
        ->withoutVite()
        ->get('/redeem')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('student/redeem-voucher/index'));
});

it('redirects guests to login', function () {
    $this->get('/redeem')->assertRedirect('/login');
});

it('credits points for a top-up voucher and redirects back', function () {
    Voucher::factory()->points(250)->create(['code' => 'POINTS250']);

    $this->actingAs($this->user)
        ->post('/redeem', ['code' => 'POINTS250'])
        ->assertRedirect();

    expect((int) $this->user->fresh()->userPoint->total_points)->toBe(250);
});
