<?php

namespace App\Console\Commands;

use App\Models\Bundle;
use App\Models\Course;
use App\Models\LearningPath;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Download professional-looking landscape thumbnails from Unsplash for any
 * Course / LearningPath / Bundle that doesn't have one yet.
 *
 * Topic detection: scan title + subtitle/description against a keyword map.
 * Fallback: generic "business" image. Idempotent — pass --force to refresh.
 */
#[Signature('demo:fetch-thumbnails {--force : Re-download even when thumbnail already set}')]
#[Description('Download Unsplash thumbnails for courses, learning paths, and bundles')]
class DemoFetchThumbnails extends Command
{
    /**
     * Curated Unsplash photo IDs grouped by topic.
     * Each ID maps to https://images.unsplash.com/photo-{id} — stable & free.
     *
     * @var array<string, array<int, string>>
     */
    private array $topicPhotos = [
        'banking' => [
            '1554224155-8d04cb21cd6c',
            '1556761175-5973dc0f32e7',
            '1565514020179-026b92b84bb6',
        ],
        'marketing' => [
            '1551836022-d5d88e9218df',
            '1460925895917-afdab827c52f',
            '1533750349088-cd871a92f312',
        ],
        'hr' => [
            '1521737852567-6949f3f9f2b5',
            '1543269865-cbf427effbad',
            '1556761175-b413da4baf72',
        ],
        'english' => [
            '1503676260728-1c00da094a0b',
            '1455390582262-044cdead277a',
            '1546410531-bb4caa6b424d',
        ],
        'leadership' => [
            '1552664730-d307ca884978',
            '1573164713714-d95e436ab8d6',
            '1517245386807-bb43f82c33c4',
        ],
        'compliance' => [
            '1450101499163-c8848c66ca85',
            '1454165804606-c3d57bc86b40',
            '1589829545856-d10d557cf95f',
        ],
        'data' => [
            '1551288049-bebda4e38f71',
            '1551434678-e076c223a692',
            '1460925895917-afdab827c52f',
        ],
        'customer_service' => [
            '1552581234-26160f608093',
            '1560472354-b33ff0c44a43',
            '1556745757-8d76bdb6984b',
        ],
        'public_speaking' => [
            '1475721027785-f74eccf877e2',
            '1505373877841-8d25f7d46678',
            '1559223607-a43c990c692c',
        ],
        'business' => [
            '1497366216548-37526070297c',
            '1497366811353-6870744d04b2',
            '1542744173-8e7e53415bb0',
        ],
    ];

    /**
     * Title/description keywords → topic key.
     *
     * @var array<string, array<int, string>>
     */
    private array $keywordMap = [
        'banking' => ['kredit', 'perbankan', 'bank', 'finance', 'banking', 'account officer', 'branch'],
        'marketing' => ['marketing', 'digital marketing', 'penjualan', 'sales'],
        'hr' => ['hr', 'sumber daya', 'people', 'human resources', 'karyawan', 'rekrut'],
        'english' => ['inggris', 'english', 'bahasa', 'bilingual'],
        'leadership' => ['leadership', 'kepemimpinan', 'manajer', 'manager', 'leader', 'coaching', 'team'],
        'compliance' => ['compliance', 'audit', 'aml', 'anti money', 'risk', 'kepatuhan', 'regulasi'],
        'data' => ['data', 'excel', 'analytics', 'machine learning', 'analysis', 'analitik'],
        'customer_service' => ['customer service', 'frontliner', 'pelayanan', 'cs '],
        'public_speaking' => ['public speaking', 'presentasi', 'communication', 'komunikasi'],
    ];

    public function handle(): int
    {
        $force = (bool) $this->option('force');

        $this->fetchForModels(
            Course::query()->get(),
            'courses',
            'public',
            $force,
            fn (Course $c) => trim(($c->title ?? '').' '.($c->subtitle ?? '').' '.strip_tags($c->description ?? '')),
        );

        $this->fetchForModels(
            LearningPath::query()->get(),
            'learning-paths',
            'public',
            $force,
            fn (LearningPath $p) => trim(($p->title ?? '').' '.($p->subtitle ?? '').' '.strip_tags($p->description ?? '')),
        );

        $this->fetchForModels(
            Bundle::query()->get(),
            'bundles',
            'public',
            $force,
            fn (Bundle $b) => trim(($b->title ?? '').' '.strip_tags($b->description ?? '')),
        );

        $this->info('Done. Run `php artisan storage:link` if /storage symlink not yet created.');

        return self::SUCCESS;
    }

    /**
     * @template T of Model
     *
     * @param  Collection<int, T>  $models
     * @param  callable(T): string  $textOf
     */
    private function fetchForModels($models, string $folder, string $disk, bool $force, callable $textOf): void
    {
        $this->line("→ Processing <comment>{$folder}</comment> ({$models->count()} rows)");

        foreach ($models as $model) {
            if (! $force && ! empty($model->thumbnail)) {
                continue;
            }

            $topic = $this->detectTopic($textOf($model));
            $photoId = $this->pickPhoto($topic, $model->slug ?? (string) $model->id);
            $remoteUrl = "https://images.unsplash.com/photo-{$photoId}?w=1200&h=675&fit=crop&q=80&auto=format";

            try {
                $bytes = Http::timeout(30)->get($remoteUrl)->throw()->body();
            } catch (\Throwable $e) {
                $this->warn("  ✗ {$model->title}: download gagal ({$e->getMessage()})");

                continue;
            }

            $filename = "{$folder}/".Str::slug($model->title ?? (string) $model->id).'-'.$model->id.'.jpg';
            Storage::disk($disk)->put($filename, $bytes);

            // Drop old thumbnail if we're forcing a refresh.
            if ($force && $model->thumbnail && $model->thumbnail !== $filename) {
                Storage::disk($disk)->delete($model->thumbnail);
            }

            $model->forceFill(['thumbnail' => $filename])->save();
            $this->line("  ✓ {$model->title} → {$topic}");
        }
    }

    private function detectTopic(string $text): string
    {
        $needle = Str::lower($text);

        foreach ($this->keywordMap as $topic => $keywords) {
            foreach ($keywords as $kw) {
                if (str_contains($needle, $kw)) {
                    return $topic;
                }
            }
        }

        return 'business';
    }

    private function pickPhoto(string $topic, string $seed): string
    {
        $photos = $this->topicPhotos[$topic] ?? $this->topicPhotos['business'];
        $idx = abs(crc32($seed)) % count($photos);

        return $photos[$idx];
    }
}
