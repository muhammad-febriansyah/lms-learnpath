<?php

namespace App\Services\Mail;

use App\Models\Order;

final class OrderMailComposer
{
    /**
     * @return array{subject: string, html: string}
     */
    public function composeOrderPaid(Order $order): array
    {
        $appName = (string) config('app.name', 'LearnPath');
        $customerName = $order->customer_name ?: ($order->user?->name ?? 'Pelanggan');
        $total = number_format((int) $order->total, 0, ',', '.');
        $orderUrl = url("/orders/{$order->order_number}");
        $dashboardUrl = url('/dashboard');
        $paidAt = $order->paid_at?->translatedFormat('d F Y, H:i').' WIB';

        $items = $order->items()
            ->with('purchasable')
            ->get()
            ->map(function ($item) {
                $title = $item->purchasable?->title ?? $item->name ?? 'Item';
                $price = number_format((int) $item->subtotal, 0, ',', '.');

                return "<tr><td style=\"padding:8px 0;font-size:13px;color:#334155;\">{$title}</td><td style=\"padding:8px 0;font-size:13px;color:#0f172a;text-align:right;font-weight:600;\">Rp {$price}</td></tr>";
            })
            ->implode('');

        $subject = "Pembayaran berhasil — Order {$order->order_number}";

        $html = <<<HTML
<!doctype html>
<html lang="id">
<body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;background:#f4f4f7;color:#111827;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;padding:32px;border:1px solid #e5e7eb;">
        <div style="display:inline-block;padding:6px 12px;background:#dcfce7;color:#15803d;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:12px;">
            Pembayaran Berhasil
        </div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">Terima kasih, {$customerName}</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">
            Pembayaran Anda untuk order <strong>{$order->order_number}</strong> sudah kami terima.
            Course sudah otomatis didaftarkan di akun Anda dan bisa langsung diakses dari dashboard.
        </p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
            {$items}
            <tr>
                <td style="padding:12px 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-top:1px solid #e5e7eb;">
                    Total Dibayar
                </td>
                <td style="padding:12px 0 4px;font-size:16px;color:#0f172a;text-align:right;font-weight:800;border-top:1px solid #e5e7eb;">
                    Rp {$total}
                </td>
            </tr>
        </table>

        <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Dibayar pada {$paidAt}</p>

        <p style="margin:24px 0;text-align:center;">
            <a href="{$dashboardUrl}"
               style="display:inline-block;padding:12px 22px;background:#4338ca;color:#ffffff;font-weight:700;text-decoration:none;border-radius:10px;font-size:14px;">
                Mulai Belajar
            </a>
        </p>

        <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
            Butuh invoice atau detail pembayaran? Lihat di
            <a href="{$orderUrl}" style="color:#4338ca;text-decoration:none;">halaman order</a>.
            Email ini dikirim otomatis oleh {$appName}.
        </p>
    </div>
</body>
</html>
HTML;

        return ['subject' => $subject, 'html' => $html];
    }
}
