<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

        return Inertia::render('admin/certificates/index', [
            'certificates' => $certificates,
            'filters' => $request->only('search', 'status'),
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
            'primary_color' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'accent_color' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'font_family' => ['required', 'in:sans,serif,display,mono'],
            'issuer_name' => ['nullable', 'string', 'max:160'],
            'issuer_logo' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
            'signatory_name' => ['nullable', 'string', 'max:160'],
            'signatory_title' => ['nullable', 'string', 'max:160'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
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
            'regex' => ':attribute harus berupa kode HEX (#RRGGBB).',
        ], [
            'name' => 'Nama template',
            'scope' => 'Cakupan template',
            'orientation' => 'Orientasi',
            'status' => 'Status',
            'background_type' => 'Tipe background',
            'background_preset' => 'Preset background',
            'primary_color' => 'Warna primer',
            'accent_color' => 'Warna aksen',
            'font_family' => 'Jenis font',
            'issuer_name' => 'Nama penerbit',
            'issuer_logo' => 'Logo penerbit',
            'signatory_name' => 'Nama penandatangan',
            'signatory_title' => 'Jabatan penandatangan',
            'signature_image' => 'Gambar tanda tangan',
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

        $backgroundPath = $request->file('background')?->store('certificate-templates/backgrounds', 'public');
        $issuerLogoPath = $request->file('issuer_logo')?->store('certificate-templates/logos', 'public');
        $signaturePath = $request->file('signature_image')?->store('certificate-templates/signatures', 'public');

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
            'primary_color' => $payload['primary_color'],
            'accent_color' => $payload['accent_color'],
            'font_family' => $payload['font_family'],
            'issuer_name' => $payload['issuer_name'] ?? null,
            'issuer_logo_path' => $issuerLogoPath,
            'signatory_name' => $payload['signatory_name'] ?? null,
            'signatory_title' => $payload['signatory_title'] ?? null,
            'signature_path' => $signaturePath,
            'title' => $payload['title'],
            'subtitle' => $payload['subtitle'] ?? null,
            'body_text' => $payload['body_text'] ?? null,
            'show_qr' => (bool) $payload['show_qr'],
            'show_signature' => (bool) $payload['show_signature'],
            'sort_order' => $payload['sort_order'] ?? 0,
        ]);

        return redirect()
            ->route('admin.certificates.index')
            ->with('success', 'Template sertifikat berhasil dibuat.');
    }

    public function revoke(Request $request, Certificate $certificate): RedirectResponse
    {
        abort_unless($request->user()?->can('certificate.revoke'), 403);

        $certificate->update([
            'status' => 'revoked',
        ]);

        return back()->with('success', 'Sertifikat berhasil dicabut.');
    }

    public function bulkRevoke(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('certificate.revoke'), 403);

        $ids = $this->validateBulkIds($request);

        $affected = Certificate::query()
            ->whereIn('id', $ids)
            ->where('status', 'issued')
            ->update(['status' => 'revoked']);

        $skipped = count($ids) - $affected;

        return back()->with(
            'success',
            "Sertifikat dicabut: {$affected}".($skipped > 0 ? ", dilewati: {$skipped}" : '').'.',
        );
    }

    public function bulkReissue(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('certificate.issue'), 403);

        $ids = $this->validateBulkIds($request);

        $affected = Certificate::query()
            ->whereIn('id', $ids)
            ->whereIn('status', ['revoked', 'expired'])
            ->update([
                'status' => 'issued',
                'issued_at' => now(),
            ]);

        $skipped = count($ids) - $affected;

        return back()->with(
            'success',
            "Sertifikat diaktifkan kembali: {$affected}".($skipped > 0 ? ", dilewati: {$skipped}" : '').'.',
        );
    }

    public function bulkExport(Request $request): StreamedResponse
    {
        abort_unless($request->user()?->can('certificate.view'), 403);

        $ids = $this->validateBulkIds($request);

        $filename = 'certificates-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($ids) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Nomor Sertifikat',
                'Kode Verifikasi',
                'Peserta',
                'Email',
                'Course / Learning Path',
                'Status',
                'Tanggal Terbit',
                'Tanggal Kedaluwarsa',
            ]);

            Certificate::query()
                ->with(['user:id,name,email', 'course:id,title', 'learningPath:id,title'])
                ->whereIn('id', $ids)
                ->orderBy('id')
                ->chunk(200, function ($chunk) use ($handle) {
                    foreach ($chunk as $certificate) {
                        fputcsv($handle, [
                            $certificate->certificate_number,
                            $certificate->verification_code,
                            $certificate->user?->name ?? '-',
                            $certificate->user?->email ?? '-',
                            $certificate->subjectTitle() ?: '-',
                            $certificate->status,
                            $certificate->issued_at?->toDateString() ?? '-',
                            $certificate->expired_at?->toDateString() ?? '-',
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array<int,int>
     */
    private function validateBulkIds(Request $request): array
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:500'],
            'ids.*' => ['integer', 'distinct'],
        ], [
            'ids.required' => 'Pilih minimal 1 sertifikat.',
            'ids.max' => 'Maksimal :max sertifikat per aksi.',
        ]);

        return $data['ids'];
    }
}
