<?php

namespace App\Providers;

use App\Services\Payment\PaymentManager;
use Illuminate\Support\ServiceProvider;

final class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PaymentManager::class);
    }
}
