<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('certificate.view'), 403);

        $certificates = Certificate::query()
            ->with([
                'user:id,name,email',
                'course:id,title',
            ])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where('certificate_number', 'like', "%{$search}%")
                    ->orWhere('verification_code', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('issued_at')
            ->paginate(15)
            ->withQueryString();

        $builderTemplates = CertificateTemplate::query()
            ->orderBy('sort_order')
            ->latest('id')
            ->get()
            ->map(fn (CertificateTemplate $template) => [
                'id' => $template->id,
                'name' => $template->name,
                'scope' => str($template->scope)->replace('_', ' ')->title()->toString(),
                'orientation' => $template->orientation,
                'status' => $template->status,
                'background_type' => $template->background_type,
                'background_preset' => $template->background_preset,
                'title' => $template->title,
                'subtitle' => $template->subtitle,
                'body_text' => $template->body_text,
                'show_qr' => $template->show_qr,
                'show_signature' => $template->show_signature,
                'sort_order' => $template->sort_order,
                'background_url' => $template->background_path
                    ? Storage::url($template->background_path)
                    : null,
            ]);

        return Inertia::render('admin/certificates/index', [
            'certificates' => $certificates,
            'filters' => $request->only('search', 'status'),
            'builderTemplates' => $builderTemplates,
        ]);
    }

    public function createTemplate(Request $request): Response
    {
        abort_unless($request->user()?->can('certificate.view'), 403);

        return Inertia::render('admin/certificates/template-form', [
            'template' => null,
            'backgroundPresets' => array_values(CertificateTemplate::backgroundPresets()),
        ]);
    }

    public function storeTemplate(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('certificate.view'), 403);

        $payload = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'scope' => ['required', 'in:course,learning_path,corporate'],
            'orientation' => ['required', 'in:landscape,portrait'],
            'status' => ['required', 'in:draft,active,archived'],
            'background_type' => ['required', 'in:preset,upload'],
            'background_preset' => ['nullable', 'string', 'max:64'],
            'title' => ['required', 'string', 'max:160'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'body_text' => ['nullable', 'string', 'max:2000'],
            'show_qr' => ['required', 'boolean'],
            'show_signature' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'background' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ], [
            'required' => ':attribute wajib diisi.',
            'in' => ':attribute tidak valid.',
            'max' => ':attribute terlalu panjang.',
            'image' => ':attribute harus berupa gambar.',
            'mimes' => ':attribute harus berformat jpg, jpeg, png, atau webp.',
        ], [
            'name' => 'Nama template',
            'scope' => 'Cakupan template',
            'orientation' => 'Orientasi',
            'status' => 'Status',
            'background_type' => 'Tipe background',
            'background_preset' => 'Preset background',
            'title' => 'Judul sertifikat',
            'subtitle' => 'Subjudul',
            'body_text' => 'Deskripsi',
            'show_qr' => 'QR verifikasi',
            'show_signature' => 'Tanda tangan',
            'sort_order' => 'Urutan',
            'background' => 'Background',
        ]);

        if (
            $payload['background_type'] === CertificateTemplate::BACKGROUND_PRESET
            && blank($payload['background_preset'] ?? null)
        ) {
            return back()
                ->withErrors(['background_preset' => 'Preset background wajib dipilih.'])
                ->withInput();
        }

        if (
            $payload['background_type'] === CertificateTemplate::BACKGROUND_UPLOAD
            && ! $request->hasFile('background')
        ) {
            return back()
                ->withErrors(['background' => 'Background image wajib diupload.'])
                ->withInput();
        }

        $backgroundPath = $request->file('background')?->store('certificate-templates', 'public');

        CertificateTemplate::query()->create([
            'name' => $payload['name'],
            'scope' => $payload['scope'],
            'orientation' => $payload['orientation'],
            'status' => $payload['status'],
            'background_type' => $payload['background_type'],
            'background_preset' => $payload['background_type'] === CertificateTemplate::BACKGROUND_PRESET
                ? $payload['background_preset']
                : null,
            'background_path' => $backgroundPath,
            'title' => $payload['title'],
            'subtitle' => $payload['subtitle'] ?? null,
            'body_text' => $payload['body_text'] ?? null,
            'show_qr' => (bool) $payload['show_qr'],
            'show_signature' => (bool) $payload['show_signature'],
            'sort_order' => $payload['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Template sertifikat berhasil dibuat.');
    }

    public function revoke(Request $request, Certificate $certificate): RedirectResponse
    {
        abort_unless($request->user()?->can('certificate.revoke'), 403);

        $certificate->update([
            'status' => 'revoked',
        ]);

        return back()->with('success', 'Sertifikat berhasil dicabut.');
    }
}
