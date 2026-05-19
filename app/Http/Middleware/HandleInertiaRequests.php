<?php

namespace App\Http\Middleware;

use App\Models\AboutSetting;
use App\Models\Category;
use App\Services\Security\RecaptchaVerifier;
use App\Support\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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

        $gamification = null;
        if ($user) {
            $point = $user->userPoint;
            $streak = $user->learningStreak;
            $gamification = [
                'total_points' => (int) ($point?->total_points ?? 0),
                'lifetime_points' => (int) ($point?->lifetime_points ?? 0),
                'level' => $point?->level ?? 'bronze',
                'current_streak' => (int) ($streak?->current_streak ?? 0),
                'longest_streak' => (int) ($streak?->longest_streak ?? 0),
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
            'gamification' => $gamification,
            'tenant' => $this->resolveTenantPayload(),
            'site' => fn () => $this->resolveSitePayload(),
            'about' => fn () => $this->resolveAboutPayload(),
            'navCategories' => fn () => $this->resolveNavCategoriesPayload(),
            'flash' => [
                'toast' => $toast,
                'success' => $session->get('success'),
                'error' => $session->get('error'),
                'info' => $session->get('info'),
                'bulk_preview' => $session->get('bulk_preview'),
                'assign_preview' => $session->get('assign_preview'),
                'new_scorm_package_id' => $session->get('new_scorm_package_id'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'recaptcha' => [
                'enabled' => app(RecaptchaVerifier::class)->isEnabled(),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveSitePayload(): array
    {
        $site = Setting::publicForFrontend()->all();

        $site['site_logo_url'] = Setting::imageUrl('site_logo');
        $site['site_favicon_url'] = Setting::imageUrl('site_favicon');
        $site['seo_og_image_url'] = Setting::imageUrl('seo_og_image');

        return $site;
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
            'display_name' => $tenant->display_name,
            'tagline' => $tenant->tagline,
            'slug' => $tenant->slug,
            'logo_url' => $tenant->logo_path
                ? asset('storage/'.$tenant->logo_path)
                : null,
            'brand_primary_color' => $tenant->brand_primary_color,
            'industry' => $tenant->industry,
            'seat_quota' => $tenant->seat_quota,
            'seats_used' => $tenant->seats_used,
            'seats_available' => $tenant->seatsAvailable(),
        ];
    }

    /**
     * Top categories used by the public navbar mega-menu.
     * Cached for 15 minutes to keep page loads cheap.
     *
     * @return array<int, array{name: string, slug: string, courses_count: int}>
     */
    private function resolveNavCategoriesPayload(): array
    {
        return Cache::remember('nav:public-categories:v1', now()->addMinutes(15), function () {
            return Category::query()
                ->select(['id', 'name', 'slug'])
                ->where('is_active', true)
                ->whereHas('courses', fn ($q) => $q->where('is_published', true))
                ->withCount(['courses' => fn ($q) => $q->where('is_published', true)])
                ->orderByDesc('courses_count')
                ->orderBy('name')
                ->limit(8)
                ->get()
                ->map(fn (Category $c) => [
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'courses_count' => $c->courses_count,
                ])
                ->toArray();
        });
    }

    /**
     * @return array<string, mixed>|null
     */
    private function resolveAboutPayload(): ?array
    {
        $about = AboutSetting::query()->find(1);

        if (! $about) {
            return null;
        }

        return [
            'title' => $about->title,
            'tagline' => $about->tagline,
            'contact_email' => $about->contact_email,
            'contact_phone' => $about->contact_phone,
            'contact_address' => $about->contact_address,
            'social_facebook' => $about->social_facebook,
            'social_instagram' => $about->social_instagram,
            'social_twitter' => $about->social_twitter,
            'social_linkedin' => $about->social_linkedin,
            'social_youtube' => $about->social_youtube,
        ];
    }
}
