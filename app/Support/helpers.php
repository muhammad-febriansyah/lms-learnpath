<?php

use App\Models\Organization;
use App\Support\TenantManager;

if (! function_exists('tenant')) {
    /**
     * Return tenant aktif untuk request saat ini.
     */
    function tenant(): ?Organization
    {
        return app(TenantManager::class)->current();
    }
}

if (! function_exists('tenant_id')) {
    /**
     * Return tenant_id aktif (shorthand).
     */
    function tenant_id(): ?int
    {
        return app(TenantManager::class)->id();
    }
}

if (! function_exists('tenancy')) {
    /**
     * Akses TenantManager instance untuk operasi advanced
     * (runWithTenant, runWithoutTenant, bypass, dll).
     */
    function tenancy(): TenantManager
    {
        return app(TenantManager::class);
    }
}
