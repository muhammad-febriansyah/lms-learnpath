<?php

namespace App\Events\Learning;

use App\Models\Certificate;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class CertificateIssued
{
    use Dispatchable, SerializesModels;

    public function __construct(public Certificate $certificate) {}
}
