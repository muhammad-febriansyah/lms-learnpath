<?php

namespace App\Listeners\Gamification;

use App\Models\User;
use App\Services\Gamification\PointService;
use Illuminate\Auth\Events\Login;

class AwardPointsOnLogin
{
    public function __construct(private readonly PointService $points) {}

    public function handle(Login $event): void
    {
        $user = $event->user;
        if (! $user instanceof User) {
            return;
        }

        $this->points->awardDailyLogin($user);
    }
}
