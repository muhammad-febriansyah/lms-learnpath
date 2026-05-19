<?php

use App\Models\Voucher;
use App\Models\VoucherBatch;
use App\Services\Voucher\VoucherGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->generator = app(VoucherGenerator::class);
});

it('generates the requested number of unique codes', function () {
    $batch = VoucherBatch::factory()->create(['total_codes' => 0]);

    $created = $this->generator->generateForBatch($batch, 50);

    expect($created)->toHaveCount(50);
    expect(Voucher::query()->where('voucher_batch_id', $batch->id)->count())->toBe(50);
    expect($batch->fresh()->total_codes)->toBe(50);
});

it('prefixes codes with the batch prefix when present', function () {
    $batch = VoucherBatch::factory()->create([
        'prefix' => 'HARBOLNAS',
    ]);

    $this->generator->generateForBatch($batch, 5);

    $codes = Voucher::query()
        ->where('voucher_batch_id', $batch->id)
        ->pluck('code')
        ->all();

    foreach ($codes as $code) {
        expect($code)->toStartWith('HARBOLNAS-');
    }
});

it('codes use the restricted alphabet (no 0, O, 1, I)', function () {
    $batch = VoucherBatch::factory()->create(['prefix' => null]);
    $this->generator->generateForBatch($batch, 20);

    $codes = Voucher::query()
        ->where('voucher_batch_id', $batch->id)
        ->pluck('code')
        ->all();

    foreach ($codes as $code) {
        expect($code)->not->toMatch('/[0OI1]/');
    }
});

it('rejects out-of-range counts', function () {
    $batch = VoucherBatch::factory()->create();

    expect(fn () => $this->generator->generateForBatch($batch, 0))
        ->toThrow(RuntimeException::class);
    expect(fn () => $this->generator->generateForBatch($batch, 10001))
        ->toThrow(RuntimeException::class);
});
