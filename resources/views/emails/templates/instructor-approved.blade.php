@php
    /** @var \App\Models\User $user */
    $loginUrl = route('login');
@endphp

@extends('emails.layout', [
    'brand' => $brand,
    'preheader' => 'Akun mentor Anda telah disetujui. Login sekarang untuk mulai mengajar.',
])

@section('content')
    <x-mail.heading eyebrow="Akun Disetujui" eyebrow-dot="#10b981">
        Selamat, {{ $user->name }}!
    </x-mail.heading>

    <x-mail.paragraph>
        Akun mentor Anda di <strong>{{ $brand['name'] }}</strong> sudah disetujui oleh tim admin.
        Anda sekarang bisa login dan mulai membangun kursus pertama Anda.
    </x-mail.paragraph>

    <x-mail.button :url="$loginUrl">
        Login Sekarang
    </x-mail.button>

    <x-mail.alert variant="info">
        Pastikan email Anda sudah diverifikasi sebelum login pertama. Cek folder inbox/spam
        untuk email verifikasi yang dikirim saat registrasi.
    </x-mail.alert>
@endsection

@section('footnote')
    Butuh bantuan saat onboarding? Tim support siap membantu kapan saja —
    email kami di <strong>{{ $brand['email'] ?? 'support' }}</strong>.
@endsection
