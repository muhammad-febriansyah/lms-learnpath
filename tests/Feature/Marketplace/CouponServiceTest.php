<?php

use App\Models\Coupon;
use App\Models\Course;
use App\Services\Marketplace\CouponService;

beforeEach(function () {
    $this->service = app(CouponService::class);
});

it('returns empty quote when no code is provided', function () {
    $course = Course::factory()->create(['price' => 100_000]);

    $quote = $this->service->quote(null, $course);

    expect($quote->valid)->toBeFalse();
    expect($quote->discount)->toBe(0);
    expect($quote->total)->toBe(100_000);
    expect($quote->error)->toBeNull();
});

it('rejects unknown code', function () {
    $course = Course::factory()->create(['price' => 100_000]);

    $quote = $this->service->quote('NOPE', $course);

    expect($quote->valid)->toBeFalse();
    expect($quote->error)->toContain('tidak ditemukan');
});

it('rejects inactive coupon', function () {
    $course = Course::factory()->create(['price' => 100_000]);
    Coupon::factory()->inactive()->create(['code' => 'OFFNOW']);

    $quote = $this->service->quote('OFFNOW', $course);

    expect($quote->valid)->toBeFalse();
    expect($quote->error)->toContain('tidak aktif');
});

it('rejects exhausted coupon', function () {
    $course = Course::factory()->create(['price' => 100_000]);
    Coupon::factory()->exhausted()->create(['code' => 'GONE']);

    $quote = $this->service->quote('GONE', $course);

    expect($quote->valid)->toBeFalse();
    expect($quote->error)->toContain('habis');
});

it('applies percentage discount and caps with max_discount', function () {
    $course = Course::factory()->create(['price' => 1_000_000]);
    Coupon::factory()
        ->percentage(20, maxDiscount: 50_000)
        ->create(['code' => 'PCT20']);

    $quote = $this->service->quote('PCT20', $course);

    expect($quote->valid)->toBeTrue();
    expect($quote->discount)->toBe(50_000);
    expect($quote->total)->toBe(950_000);
});

it('applies percentage discount without cap when max_discount is null', function () {
    $course = Course::factory()->create(['price' => 1_000_000]);
    Coupon::factory()->percentage(15)->create(['code' => 'PCT15']);

    $quote = $this->service->quote('PCT15', $course);

    expect($quote->valid)->toBeTrue();
    expect($quote->discount)->toBe(150_000);
    expect($quote->total)->toBe(850_000);
});

it('applies fixed discount and clamps to subtotal', function () {
    $course = Course::factory()->create(['price' => 50_000]);
    Coupon::factory()->fixed(75_000)->create(['code' => 'FIXED75']);

    $quote = $this->service->quote('FIXED75', $course);

    expect($quote->valid)->toBeTrue();
    expect($quote->discount)->toBe(50_000);
    expect($quote->total)->toBe(0);
});

it('rejects coupon scoped to a different course', function () {
    $allowed = Course::factory()->create(['price' => 100_000]);
    $other = Course::factory()->create(['price' => 100_000]);
    $coupon = Coupon::factory()->create([
        'code' => 'ONLYME',
        'applicable_to' => Coupon::SCOPE_SPECIFIC,
    ]);
    $coupon->courses()->attach($allowed);

    $quote = $this->service->quote('ONLYME', $other);

    expect($quote->valid)->toBeFalse();
    expect($quote->error)->toContain('tidak berlaku');
});

it('accepts coupon scoped to an allowed course', function () {
    $course = Course::factory()->create(['price' => 100_000]);
    $coupon = Coupon::factory()->percentage(10)->create([
        'code' => 'ALLOW',
        'applicable_to' => Coupon::SCOPE_SPECIFIC,
    ]);
    $coupon->courses()->attach($course);

    $quote = $this->service->quote('ALLOW', $course);

    expect($quote->valid)->toBeTrue();
    expect($quote->discount)->toBe(10_000);
});

it('normalizes code with whitespace and case', function () {
    $course = Course::factory()->create(['price' => 100_000]);
    Coupon::factory()->percentage(10)->create(['code' => 'HEY10']);

    $quote = $this->service->quote('  hey10  ', $course);

    expect($quote->valid)->toBeTrue();
});
