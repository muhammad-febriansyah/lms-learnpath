<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

#[Signature('lms:reset-demo {--no-seed : Hanya hapus seluruh data tanpa mengisi data dummy ulang} {--force : Skip konfirmasi}')]
#[Description('Hapus seluruh data aplikasi dan isi ulang dengan dataset demo Learnpath (10 record per entitas).')]
class LmsResetDemoCommand extends Command
{
    /**
     * Tabel sistem yang TIDAK ikut di-truncate (cache, queue, schema, dsb).
     *
     * @var array<int, string>
     */
    private array $preservedTables = [
        'migrations',
        'cache',
        'cache_locks',
        'jobs',
        'job_batches',
        'failed_jobs',
        'sessions',
        'password_reset_tokens',
    ];

    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm('Seluruh data aplikasi akan DIHAPUS. Lanjutkan?', false)) {
            $this->warn('Dibatalkan.');

            return self::FAILURE;
        }

        $this->info('Menghapus seluruh data aplikasi...');
        $this->truncateAllTables();
        $this->info('Selesai membersihkan data.');

        if ($this->option('no-seed')) {
            return self::SUCCESS;
        }

        $this->info('Mengisi ulang dataset demo Learnpath...');
        Artisan::call('db:seed', ['--force' => true], $this->output);

        $this->newLine();
        $this->info('Dataset demo Learnpath siap. Login default:');
        $this->line('  - admin@learnpath.id        (Super Admin)');
        $this->line('  - admin.tenant@learnpath.id (Admin Tenant Bank Mandiri)');
        $this->line('  - hr@learnpath.id           (HR Manager)');
        $this->line('  - supervisor@learnpath.id   (Supervisor / Branch Manager)');
        $this->line('  - budi@learnpath.id         (Instruktur)');
        $this->line('  - andi@learnpath.id         (Karyawan)');
        $this->line('  - citra@learnpath.id        (User Publik)');
        $this->line('  Password semua akun: password');

        return self::SUCCESS;
    }

    private function truncateAllTables(): void
    {
        $tables = collect(DB::select('SHOW TABLES'))
            ->map(fn ($row) => array_values((array) $row)[0])
            ->reject(fn (string $table) => in_array($table, $this->preservedTables, true))
            ->values();

        Schema::disableForeignKeyConstraints();

        foreach ($tables as $table) {
            DB::table($table)->truncate();
            $this->line("  - truncated: {$table}");
        }

        Schema::enableForeignKeyConstraints();
    }
}
