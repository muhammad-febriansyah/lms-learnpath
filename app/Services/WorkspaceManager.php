<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Session\Session;

final class WorkspaceManager
{
    private const SESSION_KEY = 'workspace_active_role';

    /**
     * @var list<string>
     */
    private const ROLE_PRIORITY = [
        'superadmin',
        'admin_tenant',
        'hr',
        'supervisor',
        'instructor',
        'employee',
        'user_public',
    ];

    public function __construct(private readonly Session $session) {}

    public function currentRole(User $user): ?string
    {
        $stored = (string) $this->session->get(self::SESSION_KEY, '');
        $available = $this->availableRoles($user);

        if ($stored !== '' && in_array($stored, $available, true)) {
            return $stored;
        }

        foreach (self::ROLE_PRIORITY as $role) {
            if (in_array($role, $available, true)) {
                return $role;
            }
        }

        return $available[0] ?? null;
    }

    /**
     * @return list<string>
     */
    public function availableRoles(User $user): array
    {
        return $user->getRoleNames()->values()->all();
    }

    public function switchRole(User $user, string $role): bool
    {
        if (! in_array($role, $this->availableRoles($user), true)) {
            return false;
        }

        $this->session->put(self::SESSION_KEY, $role);

        return true;
    }
}
