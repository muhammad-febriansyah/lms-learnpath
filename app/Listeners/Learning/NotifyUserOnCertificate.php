<?php

namespace App\Listeners\Learning;

use App\Events\Learning\CertificateIssued;
use App\Services\Mail\CertificateMailComposer;
use App\Services\Mail\MailketingService;

final class NotifyUserOnCertificate
{
    public function __construct(
        private readonly MailketingService $mail,
        private readonly CertificateMailComposer $composer,
    ) {}

    public function handle(CertificateIssued $event): void
    {
        $certificate = $event->certificate;
        $user = $certificate->user;

        if (! $user?->email) {
            return;
        }

        $payload = $this->composer->composeIssued($certificate);

        $this->mail->send(
            to: $user->email,
            subject: $payload['subject'],
            html: $payload['html'],
        );
    }
}
