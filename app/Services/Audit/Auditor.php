<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\User;
use App\Support\TenantManager;
use Illuminate\Database\Eloquent\Model;

/**
 * Append-only audit recorder. One entry point for both event listeners
 * and direct controller calls — auto-captures the current request's
 * user, IP, user-agent, and tenant.
 */
final class Auditor
{
    /**
     * Record an audit row.
     *
     * @param  string  $action  domain.verb, e.g. "course.published", "auth.login"
     * @param  Model|null  $subject  the affected entity (optional)
     * @param  array<string,mixed>|null  $changes  before/after diff or arbitrary metadata
     * @param  User|null  $actor  override actor (otherwise pulls from request())
     */
    public function record(
        string $action,
        ?Model $subject = null,
        ?array $changes = null,
        ?User $actor = null,
    ): AuditLog {
        $request = request();
        $actor ??= $request?->user();
        $tenant = app(TenantManager::class)->current();

        return AuditLog::create([
            'tenant_id' => $tenant?->id,
            'user_id' => $actor?->id,
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'changes' => $changes,
            'ip' => $request?->ip(),
            'user_agent' => $request ? mb_substr((string) $request->userAgent(), 0, 255) : null,
        ]);
    }
}
