<?php

namespace App\Providers;

use App\Events\Learning\CertificateIssued;
use App\Events\Marketplace\OrderPaid;
use App\Listeners\Learning\NotifyUserOnCertificate;
use App\Listeners\Marketplace\AddSeatsOnB2BPayment;
use App\Listeners\Marketplace\AutoEnrollAfterPayment;
use App\Listeners\Marketplace\NotifyUserOnPayment;
use App\Services\Security\RecaptchaVerifier;
use App\Support\TenantManager;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(RecaptchaVerifier::class);
        $this->app->singleton(TenantManager::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerEvents();
    }

    protected function registerEvents(): void
    {
        Event::listen(OrderPaid::class, AutoEnrollAfterPayment::class);
        Event::listen(OrderPaid::class, AddSeatsOnB2BPayment::class);
        Event::listen(OrderPaid::class, NotifyUserOnPayment::class);

        Event::listen(CertificateIssued::class, NotifyUserOnCertificate::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
