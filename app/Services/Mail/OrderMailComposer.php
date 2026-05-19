<?php

namespace App\Services\Mail;

use App\Models\Order;
use App\Support\MailBrand;
use Illuminate\Support\Facades\View;

final class OrderMailComposer
{
    /**
     * @return array{subject: string, html: string}
     */
    public function composeOrderPaid(Order $order): array
    {
        $brand = MailBrand::snapshot();

        $subject = "Pembayaran berhasil — Order {$order->order_number}";

        $html = View::make('emails.templates.order-paid', [
            'order' => $order,
            'brand' => $brand,
        ])->render();

        return ['subject' => $subject, 'html' => $html];
    }
}
