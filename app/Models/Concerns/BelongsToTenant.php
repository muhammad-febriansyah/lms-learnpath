<?php

namespace App\Models\Concerns;

use App\Models\Organization;
use App\Models\Scopes\TenantScope;
use App\Support\TenantManager;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tandai model sebagai milik per-tenant.
 *
 * Efek:
 * - Saat create, kolom `tenant_id` otomatis diisi dari TenantManager.
 * - Saat query, hasil otomatis di-filter berdasarkan tenant aktif.
 * - Tetap bisa load relasi `tenant()` untuk eager loading info perusahaan.
 */
trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        // Auto-fill tenant_id ketika create.
        static::creating(function ($model): void {
            if (empty($model->tenant_id)) {
                $tenantId = app(TenantManager::class)->id();
                if ($tenantId !== null) {
                    $model->tenant_id = $tenantId;
                }
            }
        });

        // Auto-scope by tenant_id pada semua query.
        static::addGlobalScope(new TenantScope);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }
}
