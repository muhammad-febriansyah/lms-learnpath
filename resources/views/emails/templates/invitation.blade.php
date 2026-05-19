@php
    /** @var \App\Models\OrganizationInvitation $invitation */
    $orgName = $invitation->organization?->name ?? '-';
    $appName = $brand['name'];
    $acceptUrl = route('business.invitations.accept', ['token' => $invitation->token]);
    $expires = $invitation->expires_at?->translatedFormat('l, d F Y');
    $greeting = $invitation->name ? 'Halo ' . $invitation->name . ',' : 'Halo,';
@endphp

@extends('emails.layout', [
    'brand' => $brand,
    'preheader' => 'Anda diundang bergabung di ' . $orgName . ' pada platform ' . $appName,
])

@section('content')
    <x-mail.heading eyebrow="Undangan Bergabung">
        Anda diundang ke {{ $orgName }}
    </x-mail.heading>

    <x-mail.paragraph>{{ $greeting }}</x-mail.paragraph>

    <x-mail.paragraph>
        Anda diundang untuk bergabung sebagai karyawan di organisasi
        <strong>{{ $orgName }}</strong> pada platform pelatihan
        <strong>{{ $appName }}</strong>. Klik tombol di bawah untuk menerima undangan dan
        mengaktifkan akun Anda.
    </x-mail.paragraph>

    <x-mail.button :url="$acceptUrl">
        Terima Undangan
    </x-mail.button>

    <x-mail.paragraph muted>
        Atau salin tautan berikut ke browser Anda:
    </x-mail.paragraph>
    <p style="margin:0 0 16px;padding:10px 12px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:6px;font-size:12px;color:#44403c;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">
        {{ $acceptUrl }}
    </p>

    @if ($expires)
        <x-mail.alert variant="warning">
            Undangan berlaku hingga <strong>{{ $expires }}</strong>. Setelah lewat tanggal tersebut,
            tautan tidak bisa digunakan lagi.
        </x-mail.alert>
    @endif
@endsection

@section('footnote')
    Jika Anda tidak mengenal pengirim undangan ini, abaikan saja email ini — akun tidak akan dibuat
    sampai Anda mengklik tautan di atas.
@endsection
