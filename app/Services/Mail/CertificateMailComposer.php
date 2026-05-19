<?php

namespace App\Services\Mail;

use App\Models\Certificate;
use App\Support\MailBrand;
use Illuminate\Support\Facades\View;

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

        $brand = MailBrand::snapshot();
        $isPath = $certificate->isPathCertificate();
        $subjectKind = $isPath ? 'Learning Path' : 'Course';
        $subjectTitle = $certificate->subjectTitle() ?: $subjectKind;

        $subject = "Sertifikat {$subjectKind}: {$subjectTitle}";

        $html = View::make('emails.templates.certificate-issued', [
            'certificate' => $certificate,
            'brand' => $brand,
        ])->render();

        return ['subject' => $subject, 'html' => $html];
    }
}
