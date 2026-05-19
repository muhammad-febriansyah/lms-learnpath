<?php

namespace App\Notifications;

use App\Support\MailBrand;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;

class InstructorApproved extends Notification
{
    use Queueable;

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $brand = MailBrand::snapshot();

        $html = View::make('emails.templates.instructor-approved', [
            'user' => $notifiable,
            'brand' => $brand,
        ])->render();

        return (new MailMessage)
            ->subject("Akun mentor Anda di {$brand['name']} telah disetujui")
            ->html($html);
    }
}
