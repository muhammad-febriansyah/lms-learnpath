<?php

namespace App\Notifications;

use App\Support\MailBrand;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\View;

class InstructorRejected extends Notification
{
    use Queueable;

    public function __construct(public readonly ?string $reason = null) {}

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

        $html = View::make('emails.templates.instructor-rejected', [
            'user' => $notifiable,
            'reason' => $this->reason,
            'brand' => $brand,
        ])->render();

        return (new MailMessage)
            ->subject("Update pendaftaran mentor di {$brand['name']}")
            ->html($html);
    }
}
