<?php

namespace App\Services\Payment\Enums;

enum PaymentGateway: string
{
    case PAKASIR = 'pakasir';
    case MANUAL_B2B = 'manual_b2b';

    public function label(): string
    {
        return match ($this) {
            self::PAKASIR => 'Pakasir',
            self::MANUAL_B2B => 'Manual (B2B Invoice)',
        };
    }
}
