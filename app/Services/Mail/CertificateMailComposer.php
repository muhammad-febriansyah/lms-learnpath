<?php

namespace App\Services\Mail;

use App\Models\Certificate;

final class CertificateMailComposer
{
    /**
     * @return array{subject: string, html: string}
     */
    public function composeIssued(Certificate $certificate): array
    {
        $certificate->loadMissing([
            'user:id,name,email',
            'course:id,title,slug',
            'learningPath:id,title,slug',
        ]);

        $appName = (string) config('app.name', 'LearnPath');
        $userName = $certificate->user?->name ?? 'Pelanggan';
        $isPath = $certificate->isPathCertificate();
        $subjectKind = $isPath ? 'Learning Path' : 'Course';
        $subjectTitle = $certificate->subjectTitle() ?: $subjectKind;
        $printUrl = url("/my-certificates/{$certificate->verification_code}/print");
        $verifyUrl = url("/verify-certificate/{$certificate->verification_code}");
        $issuedAt = $certificate->issued_at?->translatedFormat('d F Y');

        $subject = "Sertifikat {$subjectKind}: {$subjectTitle}";

        $html = <<<HTML
<!doctype html>
<html lang="id">
<body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;background:#f4f4f7;color:#111827;">
    <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:14px;padding:36px;border:1px solid #e5e7eb;">
        <div style="display:inline-block;padding:6px 12px;background:#fef3c7;color:#92400e;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:14px;">
            Sertifikat Terbit
        </div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">Selamat, {$userName}!</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155;">
            Anda telah menyelesaikan {$subjectKind} <strong>{$subjectTitle}</strong> dan sertifikat resmi Anda
            sudah terbit pada {$issuedAt}.
        </p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
            <tr>
                <td style="padding:12px 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Nomor Sertifikat</td>
                <td style="padding:12px 0;font-family:monospace;font-size:13px;color:#0f172a;text-align:right;font-weight:700;">{$certificate->certificate_number}</td>
            </tr>
            <tr>
                <td style="padding:12px 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-top:1px solid #f1f5f9;">Kode Verifikasi</td>
                <td style="padding:12px 0;font-family:monospace;font-size:13px;color:#0f172a;text-align:right;font-weight:700;border-top:1px solid #f1f5f9;">{$certificate->verification_code}</td>
            </tr>
        </table>

        <p style="margin:24px 0;text-align:center;">
            <a href="{$printUrl}"
               style="display:inline-block;padding:12px 22px;background:#4338ca;color:#ffffff;font-weight:700;text-decoration:none;border-radius:10px;font-size:14px;">
                Lihat & Cetak Sertifikat
            </a>
        </p>

        <p style="margin:0 0 6px;font-size:12px;color:#64748b;">
            Bagikan kode verifikasi ini ke siapa pun yang ingin mengecek keaslian sertifikat.
            Mereka bisa verifikasi di:
        </p>
        <p style="margin:0 0 16px;font-size:12px;color:#4338ca;word-break:break-all;">
            {$verifyUrl}
        </p>

        <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
            Email ini dikirim otomatis oleh {$appName}.
        </p>
    </div>
</body>
</html>
HTML;

        return ['subject' => $subject, 'html' => $html];
    }
}
