<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderPaidNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    /**
     * @return array<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'order_paid',
            'title' => 'Pembayaran berhasil',
            'description' => "Order {$this->order->order_number} senilai Rp ".number_format((int) $this->order->total, 0, ',', '.').' telah dibayar.',
            'href' => "/orders/{$this->order->order_number}",
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
        ];
    }
}
