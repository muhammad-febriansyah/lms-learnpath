<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    private const STATUS_ACTIVE = 'active';

    private const STATUS_SUSPENDED = 'suspended';

    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin($request);

        $tenants = Organization::query()
            ->with(['subscriptionPlan:id,name,code'])
            ->withCount(['members'])
            ->when($request->string('search')->toString(), function ($q, $term) {
                $q->where(function ($qq) use ($term) {
                    $qq->where('name', 'like', "%{$term}%")
                        ->orWhere('display_name', 'like', "%{$term}%")
                        ->orWhere('slug', 'like', "%{$term}%")
                        ->orWhere('contact_email', 'like', "%{$term}%");
                });
            })
            ->when($request->string('status')->toString(), function ($q, $status) {
                $q->where('status', $status);
            })
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $tenants->through(fn (Organization $org) => $this->transformList($org));

        return Inertia::render('admin/tenants/index', [
            'tenants' => $tenants,
            'filters' => $request->only('search', 'status'),
            'stats' => [
                'total' => Organization::count(),
                'active' => Organization::where('status', self::STATUS_ACTIVE)->count(),
                'suspended' => Organization::where('status', self::STATUS_SUSPENDED)->count(),
                'expiring_soon' => Organization::query()
                    ->whereNotNull('contract_ends_at')
                    ->whereBetween('contract_ends_at', [now(), now()->addDays(30)])
                    ->count(),
                'total_seats' => (int) Organization::sum('seat_quota'),
                'used_seats' => (int) Organization::sum('seats_used'),
            ],
        ]);
    }

    public function show(Request $request, Organization $tenant): Response
    {
        $this->authorizeSuperAdmin($request);

        $tenant->load(['subscriptionPlan', 'wallet']);
        $tenant->loadCount(['members', 'invitations']);

        $admins = OrganizationMember::query()
            ->where('organization_id', $tenant->id)
            ->where('role', 'admin')
            ->with('user:id,name,email,phone,avatar_path')
            ->get()
            ->map(fn (OrganizationMember $m) => [
                'id' => $m->user?->id,
                'name' => $m->user?->name,
                'email' => $m->user?->email,
                'phone' => $m->user?->phone,
                'avatar' => $m->user?->avatar_url,
                'joined_at' => $m->joined_at?->toIso8601String(),
            ])
            ->filter(fn ($r) => $r['id'] !== null)
            ->values();

        $recentMembers = OrganizationMember::query()
            ->where('organization_id', $tenant->id)
            ->with('user:id,name,email,avatar_path')
            ->latest('joined_at')
            ->limit(8)
            ->get()
            ->map(fn (OrganizationMember $m) => [
                'id' => $m->user?->id,
                'name' => $m->user?->name,
                'email' => $m->user?->email,
                'role' => $m->role,
                'joined_at' => $m->joined_at?->toIso8601String(),
            ])
            ->filter(fn ($r) => $r['id'] !== null)
            ->values();

        $contractDays = $tenant->daysUntilContractEnd();

        return Inertia::render('admin/tenants/show', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'display_name' => $tenant->display_name,
                'slug' => $tenant->slug,
                'tagline' => $tenant->tagline,
                'logo_url' => $this->resolveLogoUrl($tenant->logo_path),
                'industry' => $tenant->industry,
                'size_range' => $tenant->size_range,
                'status' => $tenant->status,
                'contact_name' => $tenant->contact_name,
                'contact_email' => $tenant->contact_email,
                'contact_phone' => $tenant->contact_phone,
                'address' => $tenant->address,
                'seat_quota' => (int) $tenant->seat_quota,
                'seats_used' => (int) $tenant->seats_used,
                'seats_available' => $tenant->seatsAvailable(),
                'contract_ends_at' => $tenant->contract_ends_at?->toIso8601String(),
                'contract_days_remaining' => $contractDays,
                'contract_expiring_soon' => $tenant->isContractExpiringSoon(),
                'contract_expired' => $tenant->isContractExpired(),
                'created_at' => $tenant->created_at?->toIso8601String(),
                'plan' => $tenant->subscriptionPlan ? [
                    'id' => $tenant->subscriptionPlan->id,
                    'name' => $tenant->subscriptionPlan->name,
                    'code' => $tenant->subscriptionPlan->code,
                ] : null,
                'wallet' => $tenant->wallet ? [
                    'balance' => (int) $tenant->wallet->balance,
                ] : null,
                'members_count' => (int) $tenant->members_count,
                'invitations_count' => (int) $tenant->invitations_count,
            ],
            'admins' => $admins,
            'recent_members' => $recentMembers,
        ]);
    }

    public function suspend(Request $request, Organization $tenant): RedirectResponse
    {
        $this->authorizeSuperAdmin($request);

        $tenant->update(['status' => self::STATUS_SUSPENDED]);

        return back()->with('success', "Tenant {$tenant->name} disuspend.");
    }

    public function activate(Request $request, Organization $tenant): RedirectResponse
    {
        $this->authorizeSuperAdmin($request);

        $tenant->update(['status' => self::STATUS_ACTIVE]);

        return back()->with('success', "Tenant {$tenant->name} diaktifkan.");
    }

    /**
     * @return array<string, mixed>
     */
    private function transformList(Organization $org): array
    {
        return [
            'id' => $org->id,
            'name' => $org->name,
            'display_name' => $org->display_name,
            'slug' => $org->slug,
            'tagline' => $org->tagline,
            'logo_url' => $this->resolveLogoUrl($org->logo_path),
            'industry' => $org->industry,
            'status' => $org->status,
            'seat_quota' => (int) $org->seat_quota,
            'seats_used' => (int) $org->seats_used,
            'members_count' => (int) ($org->members_count ?? 0),
            'contract_ends_at' => $org->contract_ends_at?->toIso8601String(),
            'contract_days_remaining' => $org->daysUntilContractEnd(),
            'contract_expiring_soon' => $org->isContractExpiringSoon(),
            'contract_expired' => $org->isContractExpired(),
            'created_at' => $org->created_at?->toIso8601String(),
            'plan' => $org->subscriptionPlan ? [
                'id' => $org->subscriptionPlan->id,
                'name' => $org->subscriptionPlan->name,
                'code' => $org->subscriptionPlan->code,
            ] : null,
        ];
    }

    private function resolveLogoUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return str_starts_with($path, 'http') ? $path : '/storage/'.$path;
    }

    private function authorizeSuperAdmin(Request $request): void
    {
        abort_unless(
            $request->user()?->hasRole('superadmin'),
            403,
            'Hanya superadmin yang bisa mengakses Tenant Management.',
        );
    }
}
