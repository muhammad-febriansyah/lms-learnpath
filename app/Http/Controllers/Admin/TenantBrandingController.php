<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\Audit\Auditor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TenantBrandingController extends Controller
{
    public function show(Request $request): Response
    {
        $org = $this->resolveTenant($request);

        return Inertia::render('admin/tenant-branding/index', [
            'tenant' => [
                'id' => $org->id,
                'name' => $org->name,
                'display_name' => $org->display_name,
                'tagline' => $org->tagline,
                'brand_primary_color' => $org->brand_primary_color,
                'logo_url' => $org->logo_path ? asset('storage/'.$org->logo_path) : null,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $org = $this->resolveTenant($request);

        $data = $request->validate([
            'display_name' => ['nullable', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:200'],
            'brand_primary_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg,webp', 'max:1024'],
            'remove_logo' => ['nullable', 'boolean'],
        ], [
            'brand_primary_color.regex' => 'Warna harus format hex 6 digit (mis. #12237D).',
            'logo.image' => 'File harus berupa gambar.',
            'logo.max' => 'Logo maksimal 1MB.',
            'logo.mimes' => 'Format logo: PNG, JPG, SVG, atau WEBP.',
        ]);

        if ($request->boolean('remove_logo') && $org->logo_path) {
            Storage::disk('public')->delete($org->logo_path);
            $org->logo_path = null;
        }

        if ($request->hasFile('logo')) {
            if ($org->logo_path) {
                Storage::disk('public')->delete($org->logo_path);
            }
            $org->logo_path = $request->file('logo')->store("organizations/{$org->id}", 'public');
        }

        $before = $org->only(['display_name', 'tagline', 'brand_primary_color', 'logo_path']);
        $org->display_name = $data['display_name'] ?? null;
        $org->tagline = $data['tagline'] ?? null;
        $org->brand_primary_color = $data['brand_primary_color'] ?? null;
        $org->save();

        app(Auditor::class)->record('branding.updated', $org, [
            'before' => $before,
            'after' => $org->only(['display_name', 'tagline', 'brand_primary_color', 'logo_path']),
        ]);

        return back()->with('success', 'Branding tenant diperbarui.');
    }

    private function resolveTenant(Request $request): Organization
    {
        abort_unless(
            $request->user()?->hasAnyRole(['superadmin', 'admin_tenant', 'hr']),
            403,
            'Hanya admin tenant yang boleh mengubah branding.',
        );

        $org = $request->user()->organizations()->first();
        abort_unless($org, 404, 'Tenant tidak ditemukan.');

        return $org;
    }
}
