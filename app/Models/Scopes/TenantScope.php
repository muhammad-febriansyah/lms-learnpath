<?php

namespace App\Models\Scopes;

use App\Support\TenantManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Auto-filter query berdasarkan tenant_id user yang sedang login.
 *
 * - Bypass kalau TenantManager dalam mode bypass (superadmin / system task).
 * - Bypass kalau tenant context tidak ada (mis. CLI command, migration).
 * - Selain itu: WHERE tenant_id = current_tenant_id.
 */
class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $tenants = app(TenantManager::class);

        if ($tenants->shouldBypass()) {
            return;
        }

        $tenantId = $tenants->id();

        if ($tenantId === null) {
            return;
        }

        $builder->where($model->getTable().'.tenant_id', $tenantId);
    }
}
