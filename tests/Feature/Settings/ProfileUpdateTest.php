<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response->assertSessionHasNoErrors()->assertRedirect();

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response->assertSessionHasNoErrors()->assertRedirect();

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('phone number can be updated', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->post(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => '+62 812 3456 7890',
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->phone)->toBe('+62 812 3456 7890');
});
