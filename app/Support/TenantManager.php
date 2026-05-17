<?php

namespace App\Support;

use App\Models\Organization;
use App\Models\User;

/**
 * Tenant resolver — menjaga "tenant aktif" untuk request saat ini.
 *
 * Cara kerja:
 * - Resolved by ResolveTenant middleware berdasarkan user yang login.
 * - User dengan organization_members → tenant = organization pertama.
 * - Superadmin tanpa membership → no tenant context (lihat semua data).
 * - Bisa di-override sementara via `runWithTenant()` (untuk admin context switch).
 */
class TenantManager
{
    private ?Organization $current = null;

    private bool $bypassed = false;

    public function set(?Organization $organization): void
    {
        $this->current = $organization;
    }

    public function current(): ?Organization
    {
        return $this->current;
    }

    public function id(): ?int
    {
        return $this->current?->id;
    }

    /**
     * Bypass scoping (untuk superadmin yang perlu lihat lintas tenant).
     */
    public function bypass(): void
    {
        $this->bypassed = true;
    }

    public function shouldBypass(): bool
    {
        return $this->bypassed;
    }

    /**
     * Resolve tenant dari user yang login.
     */
    public function resolveForUser(?User $user): void
    {
        if (! $user) {
            $this->current = null;

            return;
        }

        // Superadmin platform → bypass scope, no tenant context.
        if ($user->hasRole('superadmin')) {
            $this->current = null;
            $this->bypassed = true;

            return;
        }

        // Lainnya → ambil tenant dari first organization membership.
        $this->current = $user->organizations()->first();
    }

    /**
     * Jalankan callback dengan tenant context tertentu.
     */
    public function runWithTenant(?Organization $tenant, \Closure $callback): mixed
    {
        $previous = $this->current;
        $previousBypass = $this->bypassed;

        $this->current = $tenant;
        $this->bypassed = false;

        try {
            return $callback();
        } finally {
            $this->current = $previous;
            $this->bypassed = $previousBypass;
        }
    }

    /**
     * Jalankan callback dengan tenant scope di-bypass (lihat semua data).
     */
    public function runWithoutTenant(\Closure $callback): mixed
    {
        $previousBypass = $this->bypassed;
        $this->bypassed = true;

        try {
            return $callback();
        } finally {
            $this->bypassed = $previousBypass;
        }
    }
}
