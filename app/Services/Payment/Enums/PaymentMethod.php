<?php

namespace App\Services\Payment\Enums;

enum PaymentMethod: string
{
    case QRIS = 'qris';
    case BNI_VA = 'bni_va';
    case BRI_VA = 'bri_va';
    case CIMB_NIAGA_VA = 'cimb_niaga_va';
    case PERMATA_VA = 'permata_va';
    case MAYBANK_VA = 'maybank_va';
    case SAMPOERNA_VA = 'sampoerna_va';
    case BNC_VA = 'bnc_va';
    case ARTHA_GRAHA_VA = 'artha_graha_va';
    case ATM_BERSAMA_VA = 'atm_bersama_va';

    public function label(): string
    {
        return match ($this) {
            self::QRIS => 'QRIS',
            self::BNI_VA => 'BNI Virtual Account',
            self::BRI_VA => 'BRI Virtual Account',
            self::CIMB_NIAGA_VA => 'CIMB Niaga Virtual Account',
            self::PERMATA_VA => 'Permata Virtual Account',
            self::MAYBANK_VA => 'Maybank Virtual Account',
            self::SAMPOERNA_VA => 'Sampoerna Virtual Account',
            self::BNC_VA => 'BNC Virtual Account',
            self::ARTHA_GRAHA_VA => 'Artha Graha Virtual Account',
            self::ATM_BERSAMA_VA => 'ATM Bersama Virtual Account',
        };
    }

    public function isVirtualAccount(): bool
    {
        return $this !== self::QRIS;
    }
}
