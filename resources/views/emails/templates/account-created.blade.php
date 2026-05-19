@php
    /** @var string $name */
    /** @var string $email */
    /** @var string $tempPassword */
    /** @var string $orgName */
    $loginUrl = route('login');
@endphp

@extends('emails.layout', [
    'brand' => $brand,
    'preheader' => 'Akun ' . $brand['name'] . ' Anda sudah aktif. Login dengan kredensial di dalam email ini.',
])

@section('content')
    <x-mail.heading eyebrow="Akun Aktif" eyebrow-dot="#10b981">
        Selamat datang di {{ $orgName }}
    </x-mail.heading>

    <x-mail.paragraph>Halo <strong>{{ $name }}</strong>,</x-mail.paragraph>

    <x-mail.paragraph>
        Tim HR <strong>{{ $orgName }}</strong> telah membuatkan akun pelatihan Anda di platform
        <strong>{{ $brand['name'] }}</strong>. Gunakan kredensial berikut untuk masuk:
    </x-mail.paragraph>

    @php
        $passwordCell = '<span style="background:#fef3c7;color:#92400e;padding:3px 9px;border-radius:5px;border:1px solid #fde68a;">' . e($tempPassword) . '</span>';
        $rows = [
            ['label' => 'Email', 'value' => e($email), 'mono' => true],
            ['label' => 'Password Sementara', 'value' => $passwordCell, 'mono' => true],
        ];
    @endphp
    <x-mail.info-table :rows="$rows" />

    <x-mail.button :url="$loginUrl">
        Login Sekarang
    </x-mail.button>

    <x-mail.alert variant="warning">
        <strong>Penting:</strong> demi keamanan akun, segera ganti password sementara ini setelah login pertama.
    </x-mail.alert>
@endsection

@section('footnote')
    Jika Anda tidak meminta pembuatan akun ini, segera hubungi admin tenant Anda atau tim support
    untuk verifikasi.
@endsection
