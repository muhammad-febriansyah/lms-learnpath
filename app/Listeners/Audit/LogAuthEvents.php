<?php

namespace App\Listeners\Audit;

use App\Services\Audit\Auditor;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;

class LogAuthEvents
{
    public function __construct(
        private readonly Auditor $auditor,
    ) {}

    public function onLogin(Login $event): void
    {
        $this->auditor->record('auth.login', $event->user, actor: $event->user);
    }

    public function onLogout(Logout $event): void
    {
        if (! $event->user) {
            return;
        }
        $this->auditor->record('auth.logout', $event->user, actor: $event->user);
    }

    public function onFailed(Failed $event): void
    {
        $email = $event->credentials['email'] ?? null;
        $this->auditor->record('auth.failed', changes: ['email' => $email]);
    }
}
