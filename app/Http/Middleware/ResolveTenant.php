<?php

namespace App\Http\Middleware;

use App\Support\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Set tenant context untuk request berdasarkan user yang sedang login.
 *
 * Dijalankan setelah auth middleware. Tenant manager akan dipakai oleh
 * `BelongsToTenant` global scope untuk auto-filter query.
 */
class ResolveTenant
{
    public function __construct(private readonly TenantManager $tenants) {}

    public function handle(Request $request, Closure $next): Response
    {
        $this->tenants->resolveForUser($request->user());

        return $next($request);
    }
}
