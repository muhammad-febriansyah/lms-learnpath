<?php

namespace App\Services\Mail;

use App\Models\OrganizationInvitation;
use App\Support\MailBrand;
use Illuminate\Support\Facades\View;

final class InvitationMailComposer
{
    /**
     * @return array{subject: string, html: string}
     */
    public function compose(OrganizationInvitation $invitation): array
    {
        $brand = MailBrand::snapshot();
        $orgName = $invitation->organization?->name ?? '-';

        $subject = "Undangan bergabung di {$orgName} — {$brand['name']}";

        $html = View::make('emails.templates.invitation', [
            'invitation' => $invitation,
            'brand' => $brand,
        ])->render();

        return ['subject' => $subject, 'html' => $html];
    }

    /**
     * @return array{subject: string, html: string}
     */
    public function composeDirectCreate(string $name, string $email, string $tempPassword, string $orgName): array
    {
        $brand = MailBrand::snapshot();

        $subject = "Akun {$brand['name']} Anda sudah aktif";

        $html = View::make('emails.templates.account-created', [
            'name' => $name,
            'email' => $email,
            'tempPassword' => $tempPassword,
            'orgName' => $orgName,
            'brand' => $brand,
        ])->render();

        return ['subject' => $subject, 'html' => $html];
    }
}
