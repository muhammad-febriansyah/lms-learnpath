<?php

namespace App\Services\Mail;

use App\Models\OrganizationInvitation;

final class InvitationMailComposer
{
    /**
     * @return array{subject: string, html: string}
     */
    public function compose(OrganizationInvitation $invitation): array
    {
        $orgName = $invitation->organization?->name ?? '-';
        $appName = (string) config('app.name', 'LearnPath');
        $acceptUrl = route('business.invitations.accept', ['token' => $invitation->token]);
        $expires = $invitation->expires_at?->translatedFormat('l, d F Y');
        $greeting = $invitation->name ? "Halo {$invitation->name}," : 'Halo,';

        $subject = "Undangan bergabung di {$orgName} — {$appName}";

        $html = <<<HTML
<!doctype html>
<html lang="id">
<body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;background:#f4f4f7;color:#111827;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;padding:32px;border:1px solid #e5e7eb;">
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">Anda diundang ke {$orgName}</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">{$greeting}</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">
            Anda diundang untuk bergabung sebagai karyawan di organisasi <strong>{$orgName}</strong>
            pada platform pelatihan {$appName}. Klik tombol di bawah untuk menerima undangan dan
            mengaktifkan akun Anda.
        </p>
        <p style="margin:24px 0;text-align:center;">
            <a href="{$acceptUrl}"
               style="display:inline-block;padding:12px 22px;background:#4338ca;color:#ffffff;font-weight:700;text-decoration:none;border-radius:10px;font-size:14px;">
                Terima Undangan
            </a>
        </p>
        <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#64748b;">
            Atau salin tautan ini ke browser:
        </p>
        <p style="margin:0 0 16px;font-size:12px;line-height:1.6;color:#4338ca;word-break:break-all;">
            {$acceptUrl}
        </p>
        <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
            Undangan ini berlaku hingga {$expires}. Jika Anda tidak mengenal pengirim undangan ini,
            Anda dapat mengabaikan email ini.
        </p>
    </div>
</body>
</html>
HTML;

        return ['subject' => $subject, 'html' => $html];
    }

    /**
     * @return array{subject: string, html: string}
     */
    public function composeDirectCreate(string $name, string $email, string $tempPassword, string $orgName): array
    {
        $appName = (string) config('app.name', 'LearnPath');
        $loginUrl = route('login');

        $subject = "Akun {$appName} Anda sudah aktif";

        $html = <<<HTML
<!doctype html>
<html lang="id">
<body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;background:#f4f4f7;color:#111827;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;padding:32px;border:1px solid #e5e7eb;">
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">Selamat datang di {$orgName}</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">Halo {$name},</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">
            Tim HR <strong>{$orgName}</strong> telah membuatkan akun pelatihan Anda di platform {$appName}.
            Gunakan kredensial berikut untuk masuk:
        </p>
        <table style="margin:0 0 20px;font-size:13px;color:#334155;">
            <tr>
                <td style="padding:4px 12px 4px 0;color:#64748b;">Email:</td>
                <td style="padding:4px 0;font-weight:700;">{$email}</td>
            </tr>
            <tr>
                <td style="padding:4px 12px 4px 0;color:#64748b;">Password sementara:</td>
                <td style="padding:4px 0;font-family:monospace;font-weight:700;background:#f1f5f9;padding:6px 10px;border-radius:6px;">
                    {$tempPassword}
                </td>
            </tr>
        </table>
        <p style="margin:24px 0;text-align:center;">
            <a href="{$loginUrl}"
               style="display:inline-block;padding:12px 22px;background:#4338ca;color:#ffffff;font-weight:700;text-decoration:none;border-radius:10px;font-size:14px;">
                Login Sekarang
            </a>
        </p>
        <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
            Demi keamanan, segera ganti password Anda setelah login pertama.
        </p>
    </div>
</body>
</html>
HTML;

        return ['subject' => $subject, 'html' => $html];
    }
}
