@php
    /** @var \App\Models\User $user */
    /** @var string|null $reason */
@endphp

@extends('emails.layout', [
    'brand' => $brand,
    'preheader' => 'Update mengenai pendaftaran mentor Anda di ' . $brand['name'],
])

@section('content')
    <x-mail.heading eyebrow="Update Pendaftaran" eyebrow-dot="#dc2626">
        Halo, {{ $user->name }}
    </x-mail.heading>

    <x-mail.paragraph>
        Terima kasih atas minat Anda untuk bergabung sebagai mentor di
        <strong>{{ $brand['name'] }}</strong>. Setelah meninjau pendaftaran Anda,
        kami belum dapat menyetujui akun Anda saat ini.
    </x-mail.paragraph>

    @if ($reason)
        <x-mail.alert variant="danger">
            <strong>Catatan dari tim:</strong><br>
            {{ $reason }}
        </x-mail.alert>
    @endif

    <x-mail.paragraph>
        Anda dipersilakan untuk mendaftar ulang setelah melengkapi persyaratan yang dibutuhkan.
        Jika ada pertanyaan, jangan ragu untuk menghubungi tim support kami.
    </x-mail.paragraph>
@endsection

@section('footnote')
    Email ini dikirim otomatis. Untuk pertanyaan lanjutan, hubungi
    <strong>{{ $brand['email'] ?? 'support' }}</strong>.
@endsection
