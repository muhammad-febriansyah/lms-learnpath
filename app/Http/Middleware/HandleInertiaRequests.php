<?php

namespace App\Http\Middleware;

use App\Services\Security\RecaptchaVerifier;
use App\Support\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $session = $request->session();

        $roleLabels = [
            'superadmin' => 'Super Admin',
            'admin_tenant' => 'Admin Tenant',
            'hr' => 'HR',
            'instructor' => 'Instruktur',
            'supervisor' => 'Supervisor',
            'employee' => 'Karyawan',
            'user_public' => 'Pengguna Publik',
        ];
        $primaryRole = $user?->getRoleNames()->first();
        $userPayload = null;
        if ($user) {
            $userPayload = $user->toArray();
            $userPayload['role_label'] = $primaryRole ? ($roleLabels[$primaryRole] ?? ucfirst($primaryRole)) : 'Pengguna';
        }

        $toast = $session->get('toast');
        if (! $toast) {
            foreach (['success', 'error', 'info', 'warning'] as $type) {
                if ($message = $session->get($type)) {
                    $toast = ['type' => $type, 'message' => $message];
                    break;
                }
            }
        }

        $notifications = null;
        if ($user) {
            $unreadCount = $user->unreadNotifications()->count();
            $recent = $user->notifications()->latest()->limit(10)->get();
            $notifications = [
                'unread_count' => $unreadCount,
                'items' => $recent->map(fn ($n) => [
                    'id' => $n->id,
                    'type' => $n->data['type'] ?? 'info',
                    'title' => $n->data['title'] ?? 'Notifikasi',
                    'description' => $n->data['description'] ?? '',
                    'href' => $n->data['href'] ?? null,
                    'read' => $n->read_at !== null,
                    'created_at' => $n->created_at?->toIso8601String(),
                ])->all(),
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $userPayload,
                'roles' => $user ? $user->getRoleNames()->values()->all() : [],
                'permissions' => $user ? $user->getAllPermissions()->pluck('name')->values()->all() : [],
            ],
            'notifications' => $notifications,
            'tenant' => $this->resolveTenantPayload(),
            'site' => fn () => Setting::publicForFrontend()->all(),
            'flash' => [
                'toast' => $toast,
                'success' => $session->get('success'),
                'error' => $session->get('error'),
                'info' => $session->get('info'),
                'bulk_preview' => $session->get('bulk_preview'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'recaptcha' => [
                'enabled' => app(RecaptchaVerifier::class)->isEnabled(),
            ],
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function resolveTenantPayload(): ?array
    {
        $tenant = tenant();
        if (! $tenant) {
            return null;
        }

        return [
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'logo_url' => $tenant->logo_path
                ? asset('storage/'.$tenant->logo_path)
                : null,
            'industry' => $tenant->industry,
            'seat_quota' => $tenant->seat_quota,
            'seats_used' => $tenant->seats_used,
            'seats_available' => $tenant->seatsAvailable(),
        ];
    }
}
