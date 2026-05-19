<x-mail::message>
# Lead Subscription Baru

Halo Sales Team,

Ada calon klien B2B baru yang request penawaran dari halaman pricing.

**Detail Lead:**

- **Perusahaan**: {{ $lead->company_name }}
- **Kontak**: {{ $lead->contact_name }}
- **Email**: {{ $lead->email }}
@if($lead->phone)
- **No. HP / WhatsApp**: {{ $lead->phone }}
@endif
@if($lead->employee_count)
- **Jumlah Karyawan**: {{ number_format($lead->employee_count, 0, ',', '.') }} orang
@endif
@if($lead->plan)
- **Paket Diminati**: {{ $lead->plan->name }} ({{ $lead->plan->userRange() }})
@endif
- **Tanggal Masuk**: {{ $lead->created_at?->format('d M Y H:i') }}

@if($lead->message)
**Pesan dari Klien:**

> {{ $lead->message }}
@endif

<x-mail::button :url="url('/admin/subscription-leads/' . $lead->id)">
Buka di Admin Panel
</x-mail::button>

Tolong follow-up dalam 1×24 jam. 🚀

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
