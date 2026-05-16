<?php

namespace App\Services\Payment\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case COMPLETED = 'completed';
    case EXPIRED = 'expired';
    case CANCELLED = 'cancelled';
    case FAILED = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu Pembayaran',
            self::COMPLETED => 'Berhasil',
            self::EXPIRED => 'Kedaluwarsa',
            self::CANCELLED => 'Dibatalkan',
            self::FAILED => 'Gagal',
        };
    }

    public function isFinal(): bool
    {
        return $this !== self::PENDING;
    }
}
