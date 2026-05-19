<?php

use App\Models\Bundle;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\User;
use App\Models\Voucher;
use App\Services\Voucher\InvalidVoucherException;
use App\Services\Voucher\VoucherService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['email' => 'tester@example.com']);
    $this->service = app(VoucherService::class);
});

it('redeems a course voucher and creates enrollment', function () {
    $course = Course::factory()->create();
    $voucher = Voucher::factory()->create([
        'code' => 'COURSE-A1B2',
        'grant_kind' => 'course',
        'grantable_type' => $course->getMorphClass(),
        'grantable_id' => $course->id,
    ]);

    $redemption = $this->service->redeem($this->user, 'course-a1b2');

    expect($redemption->voucher_id)->toBe($voucher->id);
    expect(Enrollment::query()
        ->where('user_id', $this->user->id)
        ->where('course_id', $course->id)
        ->exists())->toBeTrue();
    expect($voucher->fresh()->uses_count)->toBe(1);
});

it('redeems a bundle voucher and enrolls user in all bundle courses', function () {
    $bundle = Bundle::factory()->create();
    $courses = Course::factory()->count(3)->create();
    $bundle->courses()->attach($courses->pluck('id'));

    Voucher::factory()->create([
        'code' => 'BUNDLE-PACK',
        'grant_kind' => 'bundle',
        'grantable_type' => $bundle->getMorphClass(),
        'grantable_id' => $bundle->id,
    ]);

    $this->service->redeem($this->user, 'BUNDLE-PACK');

    expect(Enrollment::query()
        ->where('user_id', $this->user->id)
        ->whereIn('course_id', $courses->pluck('id'))
        ->count())->toBe(3);
});

it('redeems a points voucher and credits points to balance', function () {
    Voucher::factory()->points(500)->create([
        'code' => 'TOPUP500',
    ]);

    $redemption = $this->service->redeem($this->user, 'TOPUP500');

    expect($redemption->points_credited)->toBe(500);
    expect((int) $this->user->fresh()->userPoint->total_points)->toBe(500);
});

it('rejects a non-existent code', function () {
    expect(fn () => $this->service->redeem($this->user, 'BADCODE'))
        ->toThrow(InvalidVoucherException::class, 'tidak ditemukan');
});

it('rejects an inactive voucher', function () {
    $course = Course::factory()->create();
    Voucher::factory()->create([
        'code' => 'OFFCODE',
        'is_active' => false,
        'grantable_type' => $course->getMorphClass(),
        'grantable_id' => $course->id,
    ]);

    expect(fn () => $this->service->redeem($this->user, 'OFFCODE'))
        ->toThrow(InvalidVoucherException::class, 'tidak aktif');
});

it('rejects a voucher outside its validity window', function () {
    $course = Course::factory()->create();
    Voucher::factory()->create([
        'code' => 'FUTURE1',
        'valid_from' => now()->addDay(),
        'grantable_type' => $course->getMorphClass(),
        'grantable_id' => $course->id,
    ]);

    expect(fn () => $this->service->redeem($this->user, 'FUTURE1'))
        ->toThrow(InvalidVoucherException::class, 'masa berlaku');
});

it('blocks single_use_per_user voucher on second attempt', function () {
    Voucher::factory()->points(100)->create([
        'code' => 'ONCE',
        'max_uses' => 10,
        'single_use_per_user' => true,
    ]);

    $this->service->redeem($this->user, 'ONCE');

    expect(fn () => $this->service->redeem($this->user, 'ONCE'))
        ->toThrow(InvalidVoucherException::class, 'sudah Anda pakai');
});

it('rejects voucher when max_uses reached', function () {
    Voucher::factory()->points(50)->create([
        'code' => 'CAPPED',
        'max_uses' => 1,
        'uses_count' => 1,
    ]);

    expect(fn () => $this->service->redeem($this->user, 'CAPPED'))
        ->toThrow(InvalidVoucherException::class, 'habis');
});

it('rejects voucher bound to different email', function () {
    Voucher::factory()->points(100)->create([
        'code' => 'BOUND',
        'bound_email' => 'someone-else@example.com',
    ]);

    expect(fn () => $this->service->redeem($this->user, 'BOUND'))
        ->toThrow(InvalidVoucherException::class, 'email lain');
});

it('allows voucher bound to the user email (case-insensitive)', function () {
    Voucher::factory()->points(100)->create([
        'code' => 'BOUNDOK',
        'bound_email' => 'TESTER@example.com',
    ]);

    $redemption = $this->service->redeem($this->user, 'BOUNDOK');
    expect($redemption)->not->toBeNull();
});

it('rejects course voucher if user already enrolled', function () {
    $course = Course::factory()->create();
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percent' => 0,
        'pre_test_status' => 'not_started',
        'post_test_status' => 'not_started',
        'certificate_status' => 'not_issued',
        'enrolled_at' => now(),
    ]);

    Voucher::factory()->create([
        'code' => 'ALREADYIN',
        'grantable_type' => $course->getMorphClass(),
        'grantable_id' => $course->id,
    ]);

    expect(fn () => $this->service->redeem($this->user, 'ALREADYIN'))
        ->toThrow(InvalidVoucherException::class, 'sudah terdaftar');
});

it('redeems a learning path voucher and creates path enrollment', function () {
    $path = LearningPath::factory()->create();
    $courses = Course::factory()->count(2)->create();
    $path->courses()->attach(
        $courses->pluck('id')->mapWithKeys(fn ($id, $i) => [$id => ['sort_order' => $i + 1]])->all(),
    );

    Voucher::factory()->create([
        'code' => 'PATHV1',
        'grant_kind' => 'learning_path',
        'grantable_type' => $path->getMorphClass(),
        'grantable_id' => $path->id,
    ]);

    $this->service->redeem($this->user, 'PATHV1');

    expect(LearningPathEnrollment::query()
        ->where('user_id', $this->user->id)
        ->where('learning_path_id', $path->id)
        ->exists())->toBeTrue();
});

it('normalizes the code (lowercase, padded whitespace)', function () {
    Voucher::factory()->points(50)->create(['code' => 'CASE10']);

    $redemption = $this->service->redeem($this->user, '  case10 ');

    expect($redemption)->not->toBeNull();
});

it('records the result_summary on the redemption row', function () {
    $course = Course::factory()->create(['title' => 'Yoga 101', 'slug' => 'yoga-101']);
    Voucher::factory()->create([
        'code' => 'SUMMARYV',
        'grantable_type' => $course->getMorphClass(),
        'grantable_id' => $course->id,
    ]);

    $redemption = $this->service->redeem($this->user, 'SUMMARYV');

    expect($redemption->result_summary['kind'])->toBe('course');
    expect($redemption->result_summary['title'])->toBe('Yoga 101');
    expect($redemption->result_summary['href'])->toBe('/learn/yoga-101');
});
