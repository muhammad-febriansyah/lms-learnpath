<?php

use App\Actions\Marketplace\CreateOrderForLearningPath;
use App\Actions\Marketplace\MarkOrderAsPaid;
use App\DataTransferObjects\Marketplace\CreateLearningPathOrderData;
use App\DataTransferObjects\Marketplace\PakasirWebhookData;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
});

it('creates an order with type learning_path and a LearningPath OrderItem', function () {
    $path = LearningPath::factory()->create([
        'price' => 4_750_000,
        'compare_at_price' => 4_750_000,
        'is_published' => true,
    ]);

    $order = app(CreateOrderForLearningPath::class)->execute(
        new CreateLearningPathOrderData(user: $this->user, path: $path),
    );

    expect($order->type)->toBe('learning_path');
    expect($order->total)->toBe(4_750_000);
    expect($order->items)->toHaveCount(1);
    expect($order->items->first()->purchasable_type)->toBe(LearningPath::class);
    expect($order->items->first()->purchasable_id)->toBe($path->id);
});

it('enrolls user to path + every course when learning_path order is paid', function () {
    $path = LearningPath::factory()->create([
        'price' => 500_000,
        'is_published' => true,
    ]);
    $courses = Course::factory()->count(3)->create();
    $path->courses()->attach(
        $courses->pluck('id')->mapWithKeys(fn ($id, $i) => [$id => ['sort_order' => $i + 1]])->all(),
    );

    $order = app(CreateOrderForLearningPath::class)->execute(
        new CreateLearningPathOrderData(user: $this->user, path: $path),
    );

    app(MarkOrderAsPaid::class)->execute($order, new PakasirWebhookData(
        orderId: $order->order_number,
        amount: $order->total,
        status: 'completed',
        paymentMethod: 'qris',
    ));

    expect(LearningPathEnrollment::query()
        ->where('user_id', $this->user->id)
        ->where('learning_path_id', $path->id)
        ->exists())->toBeTrue();

    expect(Enrollment::query()
        ->where('user_id', $this->user->id)
        ->whereIn('course_id', $courses->pluck('id'))
        ->count())->toBe(3);
});

it('redirects to checkout page when authed user clicks Beli Path', function () {
    $path = LearningPath::factory()->create([
        'price' => 100_000,
        'is_published' => true,
    ]);

    $this->actingAs($this->user)
        ->withoutVite()
        ->get("/checkout/path/{$path->slug}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('checkout/learning-path')
            ->where('path.title', $path->title)
            ->where('path.price', 100_000)
            ->where('quote.total', 100_000)
        );
});

it('redirects free paths back to detail page (no checkout)', function () {
    $path = LearningPath::factory()->create([
        'price' => 0,
        'is_published' => true,
    ]);

    $this->actingAs($this->user)
        ->get("/checkout/path/{$path->slug}")
        ->assertRedirect("/paths/{$path->slug}");
});

it('returns 404 for unpublished paths', function () {
    $path = LearningPath::factory()->create([
        'price' => 100_000,
        'is_published' => false,
    ]);

    $this->actingAs($this->user)
        ->get("/checkout/path/{$path->slug}")
        ->assertNotFound();
});

it('redirects to my-paths if user already enrolled in path', function () {
    $path = LearningPath::factory()->create([
        'price' => 100_000,
        'is_published' => true,
    ]);
    LearningPathEnrollment::create([
        'user_id' => $this->user->id,
        'learning_path_id' => $path->id,
        'status' => 'active',
        'progress_percent' => 0,
        'courses_completed' => 0,
        'enrolled_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get("/checkout/path/{$path->slug}")
        ->assertRedirect('/my-paths');
});

it('renders the path detail page with price and Beli button info', function () {
    $path = LearningPath::factory()->create([
        'price' => 750_000,
        'compare_at_price' => 1_000_000,
        'is_published' => true,
    ]);

    $this->actingAs($this->user)
        ->withoutVite()
        ->get("/paths/{$path->slug}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/paths/show')
            ->where('path.price', 750_000)
            ->where('path.compare_at_price', 1_000_000)
            ->where('path.savings', 250_000)
        );
});
