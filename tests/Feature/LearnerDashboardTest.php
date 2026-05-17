<?php

use App\Models\Category;
use App\Models\Course;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

it('routes employee to employee dashboard variant', function () {
    $employee = User::factory()->create(['email_verified_at' => now()]);
    $employee->assignRole('employee');

    $this->actingAs($employee)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard-employee'));
});

it('routes user_public to user public dashboard variant', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('user_public');

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard-user-public'));
});

it('redirects admin roles to admin dashboard', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('superadmin');

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertRedirect('/admin/dashboard');
});

it('blocks employee from checkout', function () {
    $employee = User::factory()->create(['email_verified_at' => now()]);
    $employee->assignRole('employee');

    $category = Category::factory()->create();
    $course = Course::factory()->create([
        'category_id' => $category->id,
        'is_published' => true,
        'price' => 99000,
    ]);

    $this->actingAs($employee)
        ->get("/checkout/{$course->slug}")
        ->assertRedirect('/my-courses')
        ->assertSessionHas('info');
});

it('allows user_public to access checkout page route', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('user_public');

    $category = Category::factory()->create();
    $course = Course::factory()->create([
        'category_id' => $category->id,
        'is_published' => true,
        'price' => 99000,
    ]);

    $response = $this->actingAs($user)->get("/checkout/{$course->slug}");

    // Yang dilarang: redirect ke /my-courses (employee block).
    // Boleh: 200 atau redirect ke halaman lain.
    if ($response->status() === 302) {
        expect($response->headers->get('Location'))->not->toBe(url('/my-courses'));
    }
});
