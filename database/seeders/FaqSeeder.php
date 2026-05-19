<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'category' => 'Akun',
                'question' => 'Bagaimana cara mendaftar akun di Learnpath?',
                'answer' => 'Klik tombol "Daftar" di pojok kanan atas, lengkapi nama, email, dan password. Verifikasi email akan dikirim untuk mengaktifkan akun.',
            ],
            [
                'category' => 'Akun',
                'question' => 'Saya lupa password, bagaimana cara meresetnya?',
                'answer' => 'Buka halaman login lalu klik "Lupa Password". Masukkan email terdaftar dan ikuti tautan reset yang dikirim ke inbox Anda.',
            ],
            [
                'category' => 'Kursus',
                'question' => 'Apakah saya bisa mengakses kursus tanpa batas waktu?',
                'answer' => 'Setelah enroll, mayoritas kursus dapat diakses selamanya. Kursus dengan jadwal live atau bootcamp memiliki masa akses sesuai keterangan di halaman kursus.',
            ],
            [
                'category' => 'Kursus',
                'question' => 'Bagaimana cara mendapatkan sertifikat setelah menyelesaikan kursus?',
                'answer' => 'Sertifikat otomatis diterbitkan setelah Anda menyelesaikan semua materi dan lulus post-test sesuai passing score. Unduh dari menu "Sertifikat Saya".',
            ],
            [
                'category' => 'Pembayaran',
                'question' => 'Metode pembayaran apa saja yang tersedia?',
                'answer' => 'Kami mendukung transfer bank, e-wallet (OVO, DANA, GoPay, ShopeePay), QRIS, serta kartu kredit melalui gateway Pakasir.',
            ],
            [
                'category' => 'Pembayaran',
                'question' => 'Apakah saya bisa meminta refund?',
                'answer' => 'Refund dapat diajukan paling lambat 7 hari setelah pembelian dan kursus belum diakses lebih dari 20%. Ajukan via menu Bantuan.',
            ],
            [
                'category' => 'Korporat',
                'question' => 'Apa itu Learnpath for Business?',
                'answer' => 'Paket korporat memungkinkan perusahaan mendaftarkan karyawan, mengelola seat, melihat laporan progress, dan menyusun learning path internal.',
            ],
            [
                'category' => 'Korporat',
                'question' => 'Bagaimana cara mengundang karyawan ke tenant kami?',
                'answer' => 'Admin tenant dapat menambah karyawan dari menu Karyawan > Undangan. Sistem akan mengirim email berisi tautan aktivasi unik.',
            ],
            [
                'category' => 'Teknis',
                'question' => 'Video kursus tidak bisa diputar, apa yang harus saya lakukan?',
                'answer' => 'Pastikan koneksi stabil, refresh halaman, atau coba browser lain (disarankan Chrome/Firefox versi terbaru). Bila masih bermasalah, hubungi tim support.',
            ],
            [
                'category' => 'Teknis',
                'question' => 'Apakah Learnpath bisa diakses lewat aplikasi mobile?',
                'answer' => 'Saat ini Learnpath berjalan optimal di browser mobile. Aplikasi native Android & iOS sedang dalam pengembangan dan akan diumumkan menyusul.',
            ],
        ];

        foreach ($items as $index => $row) {
            Faq::updateOrCreate(
                ['question' => $row['question']],
                [
                    'category' => $row['category'],
                    'answer' => $row['answer'],
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ],
            );
        }
    }
}
