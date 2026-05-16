<?php

namespace App\Actions\Marketplace;

use Illuminate\Support\Str;

/**
 * Generator nomor order: ORD-YYMMDD-XXXXXX (unique by timestamp+random).
 */
final class GenerateOrderNumber
{
    public function __invoke(): string
    {
        return sprintf(
            'ORD-%s-%s',
            now()->format('ymd'),
            Str::upper(Str::random(6)),
        );
    }
}
