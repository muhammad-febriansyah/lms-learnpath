<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        @page { size: A4; margin: 18mm; }
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 13px;
            color: #0f172a;
            background: #fff;
            margin: 0;
            padding: 24px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #12237d; padding-bottom: 18px; margin-bottom: 24px; }
        .brand { font-size: 22px; font-weight: 800; color: #12237d; }
        .brand-meta { font-size: 11px; color: #475569; margin-top: 2px; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 26px; font-weight: 800; margin: 0 0 4px 0; color: #0f172a; letter-spacing: 1px; }
        .invoice-num { font-family: ui-monospace, monospace; font-size: 13px; color: #475569; }
        .invoice-status { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 28px; }
        .meta-block { font-size: 12px; }
        .meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; }
        .meta-value { color: #0f172a; }
        .meta-value strong { font-size: 13px; }
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 12px; }
        table.items th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; }
        table.items th.right, table.items td.right { text-align: right; }
        table.items td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .totals { margin-left: auto; width: 50%; font-size: 12px; }
        .totals .row { display: flex; justify-content: space-between; padding: 6px 0; }
        .totals .row.grand { border-top: 2px solid #0f172a; margin-top: 6px; padding-top: 10px; font-size: 15px; font-weight: 800; color: #12237d; }
        .footer { margin-top: 36px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; }
        .footer .note { margin-top: 8px; font-style: italic; }
        .print-btn { position: fixed; top: 16px; right: 16px; padding: 8px 14px; background: #12237d; color: #fff; border: 0; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px; }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>

    <div class="header">
        <div>
            <div class="brand">{{ \App\Support\Setting::get('site_name') ?: 'LearnPath' }}</div>
            <div class="brand-meta">Platform Pembelajaran Online</div>
            @if($org = \App\Support\Setting::get('contact_email'))
                <div class="brand-meta">{{ $org }}</div>
            @endif
        </div>
        <div class="invoice-title">
            <h1>INVOICE</h1>
            <div class="invoice-num">{{ $order->order_number }}</div>
            <span class="invoice-status status-{{ $order->status }}">{{ $order->status }}</span>
        </div>
    </div>

    <div class="meta-grid">
        <div class="meta-block">
            <div class="meta-label">Ditagihkan kepada</div>
            <div class="meta-value"><strong>{{ $organization->name }}</strong></div>
            <div class="meta-value">{{ $order->customer_name }}</div>
            <div class="meta-value">{{ $order->customer_email }}</div>
            @if($order->customer_phone)
                <div class="meta-value">{{ $order->customer_phone }}</div>
            @endif
            @if($organization->billing_address)
                <div class="meta-value" style="margin-top: 6px;">{{ $organization->billing_address }}</div>
            @endif
            @if($organization->billing_tax_id)
                <div class="meta-value">NPWP: {{ $organization->billing_tax_id }}</div>
            @endif
        </div>
        <div class="meta-block" style="text-align: right;">
            <div class="meta-label">Tanggal Order</div>
            <div class="meta-value">{{ $order->created_at?->format('d M Y') }}</div>
            @if($order->paid_at)
                <div class="meta-label" style="margin-top: 10px;">Tanggal Bayar</div>
                <div class="meta-value">{{ $order->paid_at->format('d M Y H:i') }}</div>
            @endif
            <div class="meta-label" style="margin-top: 10px;">Tipe</div>
            <div class="meta-value">{{ str_replace('_', ' ', ucwords($order->type, '_')) }}</div>
        </div>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th style="width: 50%;">Deskripsi</th>
                <th class="right">Qty</th>
                <th class="right">Harga</th>
                <th class="right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->name }}</td>
                    <td class="right">{{ number_format($item->quantity, 0, ',', '.') }}</td>
                    <td class="right">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td class="right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="row">
            <span>Subtotal</span>
            <span>Rp {{ number_format($order->subtotal, 0, ',', '.') }}</span>
        </div>
        @if($order->discount > 0)
            <div class="row" style="color: #16a34a;">
                <span>Diskon</span>
                <span>-Rp {{ number_format($order->discount, 0, ',', '.') }}</span>
            </div>
        @endif
        @if($order->tax > 0)
            <div class="row">
                <span>Pajak</span>
                <span>Rp {{ number_format($order->tax, 0, ',', '.') }}</span>
            </div>
        @endif
        <div class="row grand">
            <span>TOTAL</span>
            <span>Rp {{ number_format($order->total, 0, ',', '.') }}</span>
        </div>
    </div>

    @if($order->payments->isNotEmpty())
        <div style="margin-top: 24px;">
            <div class="meta-label">Riwayat Pembayaran</div>
            <table class="items" style="margin-top: 6px;">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Metode</th>
                        <th>Status</th>
                        <th class="right">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->payments as $p)
                        <tr>
                            <td>{{ $p->paid_at?->format('d M Y H:i') ?? '-' }}</td>
                            <td>{{ ucwords(str_replace('_', ' ', $p->method)) }}</td>
                            <td>{{ $p->status }}</td>
                            <td class="right">Rp {{ number_format($p->amount, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    <div class="footer">
        <div>Terima kasih atas kepercayaan Anda.</div>
        <div class="note">Invoice ini dibuat secara otomatis oleh sistem dan sah tanpa tanda tangan basah.</div>
    </div>
</body>
</html>
