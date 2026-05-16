<?php

use App\Models\Badge;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\LearningStreak;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Models\UserBadge;
use App\Services\Gamification\LeaderboardService;

beforeEach(function () {
    $this->service = app(LeaderboardService::class);

    $this->org = Organization::create([
        'name' => 'Acme Inc',
        'slug' => 'acme-inc-leaderboard',
        'contact_name' => 'HR Acme',
        'contact_email' => 'hr@acme.test',
        'seat_quota' => 50,
        'seats_used' => 0,
        'status' => 'active',
    ]);
});

function addMember(Organization $org, User $user, string $role = 'learner'): void
{
    OrganizationMember::create([
        'organization_id' => $org->id,
        'user_id' => $user->id,
        'role' => $role,
        'joined_at' => now(),
    ]);
}

it('returns empty for an org with no members', function () {
    expect($this->service->forOrganization($this->org)->all())->toBe([]);
});

it('computes score per formula: courses*10 + badges*25 + longest_streak*2 + paths*50', function () {
    $user = User::factory()->create(['name' => 'Andi']);
    addMember($this->org, $user);

    // 2 completed courses
    Enrollment::factory()->count(2)->create([
        'user_id' => $user->id,
        'status' => 'completed',
    ]);

    // 3 badges
    $badges = Badge::factory()->count(3)->create();
    foreach ($badges as $b) {
        UserBadge::create([
            'user_id' => $user->id,
            'badge_id' => $b->id,
            'earned_at' => now(),
        ]);
    }

    // streak 5
    LearningStreak::create([
        'user_id' => $user->id,
        'current_streak' => 3,
        'longest_streak' => 5,
        'last_active_date' => today(),
    ]);

    // 1 path completed
    $path = LearningPath::factory()->create();
    LearningPathEnrollment::factory()->completed()->create([
        'user_id' => $user->id,
        'learning_path_id' => $path->id,
    ]);

    $rows = $this->service->forOrganization($this->org);

    // 2*10 + 3*25 + 5*2 + 1*50 = 20 + 75 + 10 + 50 = 155
    expect($rows->first()['score'])->toBe(155);
    expect($rows->first()['rank'])->toBe(1);
    expect($rows->first()['courses_completed'])->toBe(2);
    expect($rows->first()['badges_count'])->toBe(3);
    expect($rows->first()['longest_streak'])->toBe(5);
    expect($rows->first()['paths_completed'])->toBe(1);
});

it('ranks members by score descending', function () {
    $low = User::factory()->create(['name' => 'Low']);
    $mid = User::factory()->create(['name' => 'Mid']);
    $high = User::factory()->create(['name' => 'High']);
    addMember($this->org, $low);
    addMember($this->org, $mid);
    addMember($this->org, $high);

    Enrollment::factory()->create(['user_id' => $low->id, 'status' => 'completed']);
    Enrollment::factory()->count(3)->create(['user_id' => $mid->id, 'status' => 'completed']);
    Enrollment::factory()->count(10)->create(['user_id' => $high->id, 'status' => 'completed']);

    $rows = $this->service->forOrganization($this->org);

    $order = $rows->pluck('user.name')->all();
    expect($order)->toBe(['High', 'Mid', 'Low']);
    expect($rows->pluck('rank')->all())->toBe([1, 2, 3]);
});

it('only includes members of the requested organization', function () {
    $otherOrg = Organization::create([
        'name' => 'Other',
        'slug' => 'other-org-lb',
        'contact_name' => 'X',
        'contact_email' => 'x@y.test',
        'seat_quota' => 10,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    $myMember = User::factory()->create(['name' => 'Mine']);
    $stranger = User::factory()->create(['name' => 'Stranger']);
    addMember($this->org, $myMember);
    addMember($otherOrg, $stranger);

    Enrollment::factory()->create(['user_id' => $myMember->id, 'status' => 'completed']);
    Enrollment::factory()->count(5)->create(['user_id' => $stranger->id, 'status' => 'completed']);

    $rows = $this->service->forOrganization($this->org);

    expect($rows->pluck('user.name')->all())->toBe(['Mine']);
});

it('honors the limit parameter', function () {
    foreach (range(1, 10) as $i) {
        $user = User::factory()->create(['name' => "User {$i}"]);
        addMember($this->org, $user);
        Enrollment::factory()->count($i)->create(['user_id' => $user->id, 'status' => 'completed']);
    }

    $rows = $this->service->forOrganization($this->org, 3);

    expect($rows->count())->toBe(3);
    expect($rows->first()['rank'])->toBe(1);
});

it('rankForMember returns the row of a specific user', function () {
    $user = User::factory()->create();
    addMember($this->org, $user);
    Enrollment::factory()->count(2)->create(['user_id' => $user->id, 'status' => 'completed']);

    $row = $this->service->rankForMember($this->org, $user);

    expect($row)->not->toBeNull();
    expect($row['user_id'])->toBe($user->id);
    expect($row['score'])->toBe(20);
});

it('returns null from rankForMember when the user is not a member', function () {
    $stranger = User::factory()->create();

    $row = $this->service->rankForMember($this->org, $stranger);

    expect($row)->toBeNull();
});

it('excludes non-completed enrollments from course count', function () {
    $user = User::factory()->create();
    addMember($this->org, $user);

    Enrollment::factory()->create(['user_id' => $user->id, 'status' => 'active']);
    Enrollment::factory()->create(['user_id' => $user->id, 'status' => 'completed']);

    $row = $this->service->rankForMember($this->org, $user);

    expect($row['courses_completed'])->toBe(1);
});
