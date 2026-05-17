<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventEmployeeCheckout
{
    /**
     * Employee tidak boleh checkout course \(course di-assign HR\).
     * Redirect ke my-courses dengan pesan info.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('employee') && ! $user->hasAnyRole(['superadmin', 'admin_tenant', 'hr'])) {
            return redirect()
                ->route('my-courses.index')
                ->with('info', 'Sebagai karyawan, course Anda di-assign oleh HR. Tidak perlu checkout sendiri.');
        }

        return $next($request);
    }
}
