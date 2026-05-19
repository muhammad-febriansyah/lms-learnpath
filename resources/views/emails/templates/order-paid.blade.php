@php
    /** @var \App\Models\Order $order */
    $customerName = $order->customer_name ?: ($order->user?->name ?? 'Pelanggan');
    $total = 'Rp ' . number_format((int) $order->total, 0, ',', '.');
    $dashboardUrl = url('/dashboard');
    $orderUrl = url('/orders/' . $order->order_number);
    $paidAt = $order->paid_at?->translatedFormat('d F Y, H:i') . ' WIB';

    $items = $order->items()->with('purchasable')->get();
@endphp

@extends('emails.layout', [
    'brand' => $brand,
    'preheader' => 'Pembayaran order ' . $order->order_number . ' berhasil — ' . $total,
])

@section('content')
    <x-mail.heading eyebrow="Pembayaran Berhasil" eyebrow-dot="#10b981">
        Terima kasih, {{ $customerName }}
    </x-mail.heading>

    <x-mail.paragraph>
        Pembayaran untuk order <strong>{{ $order->order_number }}</strong> sudah kami terima.
        Course sudah otomatis didaftarkan ke akun Anda dan bisa langsung diakses dari dashboard.
    </x-mail.paragraph>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;overflow:hidden;">
        <tr>
            <td colspan="2" style="padding:14px 18px;background:#ffffff;border-bottom:1px solid #e7e5e4;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td align="left" style="font-size:11px;color:#78716c;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">
                            Rincian Order
                        </td>
                        <td align="right" style="font-size:12px;color:#0a0a0a;font-weight:600;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">
                            {{ $order->order_number }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        @foreach ($items as $i => $item)
            @php
                $title = $item->purchasable?->title ?? $item->name ?? 'Item';
                $price = 'Rp ' . number_format((int) $item->subtotal, 0, ',', '.');
            @endphp
            <tr>
                <td style="padding:13px 18px;font-size:13.5px;color:#292524;background:#ffffff;{{ $i > 0 ? 'border-top:1px solid #f5f5f4;' : '' }}">
                    {{ $title }}
                </td>
                <td style="padding:13px 18px;font-size:13.5px;color:#0a0a0a;text-align:right;font-weight:600;background:#ffffff;{{ $i > 0 ? 'border-top:1px solid #f5f5f4;' : '' }}">
                    {{ $price }}
                </td>
            </tr>
        @endforeach
        <tr>
            <td style="padding:16px 18px;font-size:12px;color:#78716c;letter-spacing:0.04em;font-weight:600;border-top:1px solid #e7e5e4;background:#fafaf9;text-transform:uppercase;">
                Total Dibayar
            </td>
            <td style="padding:16px 18px;font-size:18px;color:#0a0a0a;text-align:right;font-weight:700;letter-spacing:-0.015em;border-top:1px solid #e7e5e4;background:#fafaf9;">
                {{ $total }}
            </td>
        </tr>
    </table>

    @if ($paidAt)
        <x-mail.paragraph muted>
            Dibayar pada <strong style="color:#0a0a0a;">{{ $paidAt }}</strong>
        </x-mail.paragraph>
    @endif

    <x-mail.button :url="$dashboardUrl">
        Mulai Belajar Sekarang
    </x-mail.button>
@endsection

@section('footnote')
    Butuh invoice atau detail pembayaran? Cek di
    <a href="{{ $orderUrl }}" style="color:#12237D;text-decoration:underline;font-weight:600;">halaman order</a>.
@endsection
