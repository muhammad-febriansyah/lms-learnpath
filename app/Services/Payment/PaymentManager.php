<?php

namespace App\Services\Payment;

use App\Services\Payment\Contracts\PaymentGatewayInterface;
use App\Services\Payment\Enums\PaymentGateway;
use App\Services\Payment\Gateways\PakasirGateway;
use InvalidArgumentException;

/**
 * Resolver gateway pembayaran.
 *
 *   app(PaymentManager::class)->gateway('pakasir')->createPayment($data);
 *   app(PaymentManager::class)->default()->checkStatus($orderId, $amount);
 */
final class PaymentManager
{
    /** @var array<string, PaymentGatewayInterface> */
    private array $resolved = [];

    public function gateway(PaymentGateway|string $name): PaymentGatewayInterface
    {
        $key = $name instanceof PaymentGateway ? $name->value : $name;

        return $this->resolved[$key] ??= $this->resolve($key);
    }

    public function default(): PaymentGatewayInterface
    {
        return $this->gateway(PaymentGateway::PAKASIR);
    }

    private function resolve(string $key): PaymentGatewayInterface
    {
        return match ($key) {
            PaymentGateway::PAKASIR->value => new PakasirGateway(
                baseUrl: (string) config('services.pakasir.base_url'),
                project: (string) config('services.pakasir.project'),
                apiKey: (string) config('services.pakasir.api_key'),
            ),

            default => throw new InvalidArgumentException("Gateway {$key} belum di-support."),
        };
    }
}
