<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Validasi webhook Pakasir:
 *  - IP whitelist (env PAKASIR_ALLOWED_IPS)
 *  - Shared secret token via header X-Pakasir-Signature (env PAKASIR_WEBHOOK_SECRET)
 *
 * Kalau kedua-duanya tidak di-set di env (mis. saat development lokal pakai
 * paymentsimulation), middleware membiarkan request lewat — supaya developer
 * tidak terblokir. Di production env, set secret + IP whitelist supaya aktif.
 */
final class VerifyPakasirWebhook
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedIps = (array) config('services.pakasir.allowed_ips', []);
        if (count($allowedIps) > 0) {
            $ip = $request->ip();
            if (! in_array($ip, $allowedIps, true)) {
                abort(403, 'Source IP not allowed.');
            }
        }

        $secret = (string) config('services.pakasir.webhook_secret', '');
        if ($secret !== '') {
            $provided = (string) $request->header('X-Pakasir-Signature', '');
            if (! hash_equals($secret, $provided)) {
                abort(401, 'Invalid signature.');
            }
        }

        return $next($request);
    }
}
