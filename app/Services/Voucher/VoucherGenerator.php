<?php

namespace App\Services\Voucher;

use App\Models\Voucher;
use App\Models\VoucherBatch;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Generates voucher codes in bulk for marketing events.
 *
 * - Codes follow format: [PREFIX-]XXXXXXXX (8 random chars, A-Z + 2-9, no confusable chars).
 * - Insert in chunks of 500 with collision retry to handle UNIQUE(code) violations.
 */
final class VoucherGenerator
{
    private const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    private const CODE_LENGTH = 8;

    private const CHUNK_SIZE = 500;

    private const MAX_RETRIES = 3;

    /**
     * Generate $count voucher codes attached to the given batch.
     *
     * @return Collection<int, Voucher>
     */
    public function generateForBatch(VoucherBatch $batch, int $count): Collection
    {
        if ($count < 1 || $count > 10000) {
            throw new RuntimeException('Jumlah voucher harus antara 1 dan 10000.');
        }

        $created = collect();

        DB::transaction(function () use ($batch, $count, &$created) {
            $remaining = $count;
            $attempt = 0;

            while ($remaining > 0 && $attempt < self::MAX_RETRIES) {
                $attempt++;
                $codes = $this->fabricateUniqueCodes($remaining, $batch->prefix);

                foreach ($codes->chunk(self::CHUNK_SIZE) as $chunk) {
                    $rows = $chunk->map(fn (string $code) => [
                        'voucher_batch_id' => $batch->id,
                        'code' => $code,
                        'grant_kind' => $batch->grant_kind,
                        'grantable_type' => $batch->grantable_type,
                        'grantable_id' => $batch->grantable_id,
                        'points_amount' => $batch->points_amount,
                        'valid_from' => $batch->valid_from,
                        'valid_until' => $batch->valid_until,
                        'max_uses' => 1,
                        'uses_count' => 0,
                        'single_use_per_user' => $batch->single_use_per_user,
                        'is_active' => $batch->is_active,
                        'bound_email' => null,
                        'bound_user_id' => null,
                        'created_by' => $batch->created_by,
                        'note' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])->all();

                    Voucher::insertOrIgnore($rows);
                }

                $created = Voucher::query()
                    ->where('voucher_batch_id', $batch->id)
                    ->get();
                $remaining = $count - $created->count();
            }

            $batch->update(['total_codes' => $created->count()]);
        });

        return $created;
    }

    /**
     * @return Collection<int, string>
     */
    private function fabricateUniqueCodes(int $needed, ?string $prefix): Collection
    {
        $codes = collect();
        $tries = 0;
        $maxTries = $needed * 4;

        while ($codes->count() < $needed && $tries < $maxTries) {
            $tries++;
            $code = $this->randomCode($prefix);
            if (! $codes->contains($code)) {
                $codes->push($code);
            }
        }

        // Filter out codes already present in DB before insert attempt.
        $existing = Voucher::query()
            ->whereIn('code', $codes->all())
            ->pluck('code')
            ->all();

        return $codes->reject(fn (string $c) => in_array($c, $existing, true))->values();
    }

    private function randomCode(?string $prefix): string
    {
        $body = '';
        $alphabetLength = strlen(self::CODE_ALPHABET);
        for ($i = 0; $i < self::CODE_LENGTH; $i++) {
            $body .= self::CODE_ALPHABET[random_int(0, $alphabetLength - 1)];
        }

        if ($prefix) {
            $prefix = strtoupper(Str::ascii($prefix));
            $prefix = preg_replace('/[^A-Z0-9]/', '', $prefix) ?? '';
            if ($prefix !== '') {
                return $prefix.'-'.$body;
            }
        }

        return $body;
    }
}
