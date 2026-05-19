@php
    /** @var \App\Models\Certificate $certificate */
    $userName = $certificate->user?->name ?? 'Pelanggan';
    $isPath = $certificate->isPathCertificate();
    $subjectKind = $isPath ? 'Learning Path' : 'Course';
    $subjectTitle = $certificate->subjectTitle() ?: $subjectKind;
    $printUrl = url('/my-certificates/' . $certificate->verification_code . '/print');
    $verifyUrl = url('/verify-certificate/' . $certificate->verification_code);
    $issuedAt = $certificate->issued_at?->translatedFormat('d F Y');
@endphp

@extends('emails.layout', [
    'brand' => $brand,
    'preheader' => 'Selamat! Sertifikat ' . $subjectKind . ' "' . $subjectTitle . '" sudah terbit.',
])

@section('content')
    <x-mail.heading eyebrow="Sertifikat Terbit" eyebrow-dot="#d97706">
        Selamat, {{ $userName }}.
    </x-mail.heading>

    <x-mail.paragraph>
        Anda telah menyelesaikan {{ $subjectKind }} <strong>{{ $subjectTitle }}</strong>.
        Sertifikat resmi Anda sudah terbit pada {{ $issuedAt }} dan siap diunduh.
    </x-mail.paragraph>

    <x-mail.info-table :rows="[
        ['label' => 'Nomor Sertifikat', 'value' => e($certificate->certificate_number), 'mono' => true],
        ['label' => 'Kode Verifikasi', 'value' => e($certificate->verification_code), 'mono' => true],
        ['label' => 'Tanggal Terbit', 'value' => e($issuedAt)],
        ['label' => 'Jenis', 'value' => e($subjectKind)],
    ]" />

    <x-mail.button :url="$printUrl">
        Lihat & Cetak Sertifikat
    </x-mail.button>

    <x-mail.alert variant="info">
        Bagikan <strong>kode verifikasi</strong> ke siapa pun yang ingin mengecek keaslian sertifikat Anda.
        Mereka bisa verifikasi langsung di: <br>
        <a href="{{ $verifyUrl }}" style="color:#12237D;text-decoration:underline;word-break:break-all;">{{ $verifyUrl }}</a>
    </x-mail.alert>
@endsection

@section('footnote')
    Sertifikat tersimpan permanen di akun Anda. Anda bisa mengaksesnya kapan saja di menu
    <strong>Sertifikat Saya</strong>.
@endsection
