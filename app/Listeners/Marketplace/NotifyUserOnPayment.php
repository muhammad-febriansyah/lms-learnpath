<?php

namespace App\Listeners\Marketplace;

use App\Events\Marketplace\OrderPaid;
use App\Notifications\OrderPaidNotification;
use App\Services\Mail\MailketingService;
use App\Services\Mail\OrderMailComposer;

final class NotifyUserOnPayment
{
    public function __construct(
        private readonly MailketingService $mail,
        private readonly OrderMailComposer $composer,
    ) {}

    public function handle(OrderPaid $event): void
    {
        $user = $event->order->user;
        if (! $user) {
            return;
        }

        $user->notify(new OrderPaidNotification($event->order));

        $recipient = $event->order->customer_email ?: $user->email;
        if (! $recipient) {
            return;
        }

        $payload = $this->composer->composeOrderPaid($event->order);

        $this->mail->send(
            to: $recipient,
            subject: $payload['subject'],
            html: $payload['html'],
        );
    }
}
