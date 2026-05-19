<?php

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
});

function makeNotif(User $user, array $data, ?string $readAt = null): DatabaseNotification
{
    return DatabaseNotification::create([
        'id' => (string) Str::uuid(),
        'type' => 'App\\Notifications\\Stub',
        'notifiable_type' => $user->getMorphClass(),
        'notifiable_id' => $user->id,
        'data' => $data,
        'read_at' => $readAt,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

it('renders the notifications index with paginated items and counts', function () {
    makeNotif($this->user, ['type' => 'training_assigned', 'title' => 'A', 'description' => 'a']);
    makeNotif($this->user, ['type' => 'message', 'title' => 'B', 'description' => 'b'], readAt: now()->toDateTimeString());

    $this->actingAs($this->user)
        ->get('/notifications')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->where('counts.all', 2)
            ->where('counts.unread', 1)
            ->has('notifications.data', 2)
        );
});

it('filters by bucket', function () {
    makeNotif($this->user, ['type' => 'training_assigned', 'title' => 'Training X', 'description' => '...']);
    makeNotif($this->user, ['type' => 'message', 'title' => 'Pesan baru', 'description' => '...']);
    makeNotif($this->user, ['type' => 'order_paid', 'title' => 'Order paid', 'description' => '...']);

    $this->actingAs($this->user)
        ->get('/notifications?bucket=training')
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Training X')
        );
});

it('filters by unread_only', function () {
    makeNotif($this->user, ['type' => 'message', 'title' => 'unread']);
    makeNotif($this->user, ['type' => 'message', 'title' => 'read'], readAt: now()->toDateTimeString());

    $this->actingAs($this->user)
        ->get('/notifications?unread_only=1')
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'unread')
        );
});

it('marks a single notification as read', function () {
    $n = makeNotif($this->user, ['type' => 'message', 'title' => 'x']);

    $this->actingAs($this->user)
        ->post("/notifications/{$n->id}/read");

    expect($n->fresh()->read_at)->not->toBeNull();
});

it('marks all unread notifications as read', function () {
    makeNotif($this->user, ['type' => 'message', 'title' => 'a']);
    makeNotif($this->user, ['type' => 'message', 'title' => 'b']);

    $this->actingAs($this->user)
        ->post('/notifications/read-all')
        ->assertSessionHas('success');

    expect($this->user->unreadNotifications()->count())->toBe(0);
});

it('deletes all read notifications via destroyRead', function () {
    makeNotif($this->user, ['type' => 'message', 'title' => 'kept']);
    makeNotif($this->user, ['type' => 'message', 'title' => 'goodbye'], readAt: now()->toDateTimeString());

    $this->actingAs($this->user)
        ->delete('/notifications/read')
        ->assertSessionHas('success');

    expect($this->user->notifications()->count())->toBe(1);
    expect($this->user->notifications()->first()->data['title'])->toBe('kept');
});

it('does not let user A read user B notifications', function () {
    $other = User::factory()->create();
    $n = makeNotif($other, ['type' => 'message', 'title' => 'hers']);

    $this->actingAs($this->user)
        ->get('/notifications')
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 0)
        );

    expect($n->fresh()->read_at)->toBeNull();
});
