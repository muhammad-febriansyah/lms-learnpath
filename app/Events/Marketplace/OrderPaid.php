<?php

namespace App\Events\Marketplace;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class OrderPaid
{
    use Dispatchable, SerializesModels;

    public function __construct(public Order $order) {}
}
