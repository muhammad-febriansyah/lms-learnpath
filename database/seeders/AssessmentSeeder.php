<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Database\Seeder;

class AssessmentSeeder extends Seeder
{
    /**
     * Sample question banks. Each entry: question + 4 options where the
     * first option is the correct one.
     *
     * @var array<int, array{q: string, options: array<int, string>}>
     */
    private array $preTestBank = [
        [
            'q' => 'Apa langkah pertama yang sebaiknya dilakukan sebelum memulai analisa kredit?',
            'options' => [
                'Mengumpulkan dokumen pendukung calon debitur',
                'Mencairkan dana terlebih dahulu',
                'Menghubungi atasan tanpa konteks',
                'Mengabaikan riwayat kredit',
            ],
        ],
        [
            'q' => 'Komunikasi efektif dengan nasabah paling tepat dilakukan dengan?',
            'options' => [
                'Mendengarkan kebutuhan dan menjelaskan dengan bahasa sederhana',
                'Memakai banyak istilah teknis perbankan',
                'Buru-buru menutup pembicaraan',
                'Berdebat ketika ada keberatan',
            ],
        ],
        [
            'q' => 'Tujuan utama survey debitur adalah?',
            'options' => [
                'Memverifikasi data dan kapasitas bayar debitur',
                'Mempromosikan produk lain ke debitur',
                'Mengisi waktu jam kerja',
                'Memberikan hadiah promosi',
            ],
        ],
        [
            'q' => 'Yang termasuk komponen risiko kredit dasar adalah?',
            'options' => [
                'Character, Capacity, Capital, Collateral, Condition',
                'Color, Cost, Concept, Currency, Channel',
                'Cash, Card, Credit, Crypto, Coin',
                'Bank, Branch, Bond, Bill, Balance',
            ],
        ],
        [
            'q' => 'Pernyataan terbaik tentang collection adalah?',
            'options' => [
                'Pencegahan lebih efektif daripada penagihan akhir',
                'Tagih saja terus tanpa pendekatan',
                'Tidak perlu mencatat komunikasi',
                'Eskalasi ke supervisor di hari pertama lewat tempo',
            ],
        ],
    ];

    /**
     * @var array<int, array{q: string, options: array<int, string>}>
     */
    private array $postTestBank = [
        [
            'q' => 'Saat menemukan dokumen identitas tidak konsisten dengan data form, langkah yang tepat?',
            'options' => [
                'Klarifikasi langsung ke calon debitur dan minta dokumen pendukung',
                'Tetap memproses tanpa verifikasi tambahan',
                'Mengabaikan inkonsistensi karena dokumen sudah dilampirkan',
                'Memberi nilai kredit rendah tanpa konfirmasi',
            ],
        ],
        [
            'q' => 'Indikator kapasitas bayar yang paling kuat adalah?',
            'options' => [
                'Cash flow rutin dari usaha atau gaji yang terdokumentasi',
                'Pengakuan lisan debitur tanpa bukti',
                'Jumlah followers media sosial',
                'Status pertemanan dengan staf bank',
            ],
        ],
        [
            'q' => 'Saat survey lapangan, observasi yang berguna untuk verifikasi usaha?',
            'options' => [
                'Aktivitas operasional, stok, dan kondisi tempat usaha',
                'Warna dinding ruangan',
                'Merk kendaraan pribadi',
                'Hobi pemilik',
            ],
        ],
        [
            'q' => 'Ketika nasabah keberatan pada bunga, pendekatan terbaik adalah?',
            'options' => [
                'Menjelaskan value & manfaat produk dibanding biaya',
                'Langsung memberi diskon tanpa otorisasi',
                'Mengakhiri pembicaraan',
                'Menyalahkan kebijakan kantor',
            ],
        ],
        [
            'q' => 'Skema collection yang dianjurkan untuk nasabah yang baru telat 1-7 hari adalah?',
            'options' => [
                'Reminder kontak personal yang sopan dan informatif',
                'Eskalasi langsung ke pengacara',
                'Mendiamkan sampai 60 hari',
                'Mengumumkan ke tetangga',
            ],
        ],
    ];

    public function run(): void
    {
        $courses = Course::query()
            ->where('is_published', true)
            ->orderBy('id')
            ->take(2)
            ->get();

        if ($courses->isEmpty()) {
            $this->command?->warn('AssessmentSeeder: no published courses to attach. Skipping.');

            return;
        }

        foreach ($courses as $course) {
            $course->update([
                'is_certified' => true,
                'post_test_required' => true,
                'pre_test_required' => true,
                'passing_score' => 70,
                'max_attempts' => 3,
            ]);

            $this->buildAssessment($course, 'pre_test', 'Pre-Test '.$course->title, $this->preTestBank);
            $this->buildAssessment($course, 'post_test', 'Post-Test '.$course->title, $this->postTestBank);
        }
    }

    /**
     * @param  array<int, array{q: string, options: array<int, string>}>  $bank
     */
    private function buildAssessment(Course $course, string $type, string $title, array $bank): void
    {
        $existing = Assessment::where('course_id', $course->id)->where('type', $type)->first();
        if ($existing) {
            return;
        }

        $assessment = Assessment::create([
            'course_id' => $course->id,
            'title' => $title,
            'type' => $type,
            'description' => $type === 'pre_test'
                ? 'Cek pemahaman awal Anda sebelum mulai kursus.'
                : 'Lulus post-test untuk menyelesaikan course dan mendapat sertifikat.',
            'passing_score' => 70,
            'max_attempts' => 3,
            'duration_minutes' => 20,
            'is_required' => $type === 'post_test',
            'sort_order' => $type === 'pre_test' ? 1 : 99,
        ]);

        foreach ($bank as $idx => $row) {
            $question = Question::create([
                'assessment_id' => $assessment->id,
                'question_text' => $row['q'],
                'type' => 'multiple_choice',
                'points' => 1,
                'sort_order' => $idx + 1,
            ]);

            foreach ($row['options'] as $optIdx => $optText) {
                QuestionOption::create([
                    'question_id' => $question->id,
                    'option_text' => $optText,
                    'is_correct' => $optIdx === 0,
                    'sort_order' => $optIdx + 1,
                ]);
            }
        }
    }
}
