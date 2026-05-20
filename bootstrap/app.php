<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreventEmployeeCheckout;
use App\Http\Middleware\ResolveTenant;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\VerifyPakasirWebhook;
use App\Http\Middleware\VerifyRecaptcha;
use App\Support\Setting;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'api/webhooks/*',
        ]);

        $middleware->web(append: [
            ResolveTenant::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'pakasir.webhook' => VerifyPakasirWebhook::class,
            'employee.no_checkout' => PreventEmployeeCheckout::class,
            'recaptcha' => VerifyRecaptcha::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render Inertia-based error pages for typical HTTP exceptions.
        // Skip JSON/API requests and local debug mode (so dev still sees stack traces).
        $exceptions->respond(function ($response, $exception, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return $response;
            }

            $status = $response->getStatusCode();

            if (! in_array($status, [403, 404, 419, 429, 500, 503], true)) {
                return $response;
            }

            // In debug mode, still show Laravel's stack trace for 500/503 so devs
            // can diagnose; but render the pretty page for user-facing 4xx.
            if (app()->hasDebugModeEnabled() && in_array($status, [500, 503], true)) {
                return $response;
            }

            $message = $exception instanceof HttpExceptionInterface
                ? trim($exception->getMessage())
                : '';

            $site = Setting::publicForFrontend()->all();
            $site['site_logo_url'] = Setting::imageUrl('site_logo');
            $site['site_favicon_url'] = Setting::imageUrl('site_favicon');
            $site['seo_og_image_url'] = Setting::imageUrl('seo_og_image');

            return Inertia::render('errors/index', [
                'status' => $status,
                'message' => $message !== '' ? $message : null,
                'site' => $site,
            ])
                ->toResponse($request)
                ->setStatusCode($status);
        });
    })->create();
