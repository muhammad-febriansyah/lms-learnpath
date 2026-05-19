<?php

use App\Models\Course;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PayoutRequest;
use App\Models\Setting;
use App\Models\User;
use App\Services\Payout\EarningsCalculator;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Role::findOrCreate('admin_tenant', 'web');
    Role::findOrCreate('hr', 'web');
    Role::findOrCreate('instructor', 'web');
    Role::findOrCreate('employee', 'web');
    Role::findOrCreate('user_public', 'web');
    $this->seed(RolePermissionSeeder::class);

    // Settings defaults for payout
    Setting::query()->updateOrCreate(['key' => 'payout_revenue_share_percent'], ['value' => '100', 'type' => 'number', 'group' => 'payout', 'label' => 'Share %']);
    Setting::query()->updateOrCreate(['key' => 'payout_fee_percent'], ['value' => '0', 'type' => 'number', 'group' => 'payout', 'label' => 'Fee %']);
    Setting::query()->updateOrCreate(['key' => 'payout_min_amount'], ['value' => '50000', 'type' => 'number', 'group' => 'payout', 'label' => 'Min']);

    $this->instructor = User::factory()->create(['email_verified_at' => now()]);
    $this->instructor->assignRole('instructor');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');
});

function bookOrder(int $instructorId, int $subtotal = 500_000): void
{
    $course = Course::factory()->create(['instructor_id' => $instructorId]);
    $order = Order::factory()->create([
        'status' => 'paid',
        'paid_at' => now(),
        'total' => $subtotal,
    ]);
    OrderItem::create([
        'order_id' => $order->id,
        'purchasable_type' => Course::class,
        'purchasable_id' => $course->id,
        'name' => $course->title,
        'quantity' => 1,
        'unit_price' => $subtotal,
        'subtotal' => $subtotal,
    ]);
}

it('calculates gross earnings from instructor-owned course sales', function () {
    bookOrder($this->instructor->id, 500_000);
    bookOrder($this->instructor->id, 300_000);

    $calc = app(EarningsCalculator::class);
    expect($calc->grossEarnings($this->instructor))->toBe(800_000);
});

it('applies revenue share when computing share earnings', function () {
    bookOrder($this->instructor->id, 1_000_000);
    Setting::query()->where('key', 'payout_revenue_share_percent')->update(['value' => '70']);

    $calc = app(EarningsCalculator::class);
    expect($calc->shareEarnings($this->instructor))->toBe(700_000);
});

it('subtracts paid and locked from available balance', function () {
    bookOrder($this->instructor->id, 1_000_000);

    PayoutRequest::factory()->create([
        'user_id' => $this->instructor->id,
        'gross_amount' => 200_000,
        'net_amount' => 200_000,
        'fee_amount' => 0,
        'status' => 'paid',
    ]);
    PayoutRequest::factory()->create([
        'user_id' => $this->instructor->id,
        'gross_amount' => 100_000,
        'net_amount' => 100_000,
        'fee_amount' => 0,
        'status' => 'pending',
    ]);

    $calc = app(EarningsCalculator::class);
    expect($calc->availableBalance($this->instructor))->toBe(700_000);
});

it('quotes fee from settings (percent)', function () {
    Setting::query()->where('key', 'payout_fee_percent')->update(['value' => '5']);
    App\Support\Setting::flush();

    $calc = app(EarningsCalculator::class);
    $quote = $calc->quoteFee(200_000);

    // 5% of 200000 = 10000
    expect($quote['fee'])->toBe(10_000);
    expect($quote['net'])->toBe(190_000);
});

it('lets an instructor request a withdrawal within available balance', function () {
    bookOrder($this->instructor->id, 500_000);

    $this->actingAs($this->instructor)
        ->post('/admin/my-earnings/withdraw', [
            'gross_amount' => 200_000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'John Mentor',
        ])
        ->assertSessionHas('success');

    $payout = PayoutRequest::first();
    expect($payout)->not->toBeNull()
        ->and($payout->status)->toBe('pending')
        ->and($payout->gross_amount)->toBe(200_000);
});

it('rejects a withdrawal below the minimum amount', function () {
    bookOrder($this->instructor->id, 500_000);

    $this->actingAs($this->instructor)
        ->from('/admin/my-earnings')
        ->post('/admin/my-earnings/withdraw', [
            'gross_amount' => 10_000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'John',
        ])
        ->assertSessionHasErrors('gross_amount');
});

it('rejects a withdrawal that exceeds the available balance', function () {
    bookOrder($this->instructor->id, 100_000);

    $this->actingAs($this->instructor)
        ->from('/admin/my-earnings')
        ->post('/admin/my-earnings/withdraw', [
            'gross_amount' => 500_000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'John',
        ])
        ->assertSessionHasErrors('gross_amount');
});

it('lets admin approve a pending payout', function () {
    $payout = PayoutRequest::factory()->create([
        'user_id' => $this->instructor->id,
        'status' => 'pending',
    ]);

    $this->actingAs($this->admin)
        ->post("/admin/payouts/{$payout->id}/approve", [
            'admin_note' => 'OK proses.',
        ])
        ->assertSessionHas('success');

    expect($payout->fresh()->status)->toBe('approved');
});

it('requires a reject reason and updates status to rejected', function () {
    $payout = PayoutRequest::factory()->create([
        'user_id' => $this->instructor->id,
        'status' => 'pending',
    ]);

    $this->actingAs($this->admin)
        ->from("/admin/payouts/{$payout->id}")
        ->post("/admin/payouts/{$payout->id}/reject", ['reject_reason' => 'No'])
        ->assertSessionHasErrors('reject_reason'); // min:5

    $this->actingAs($this->admin)
        ->post("/admin/payouts/{$payout->id}/reject", [
            'reject_reason' => 'Nomor rekening salah, mohon koreksi.',
        ])
        ->assertSessionHas('success');

    $fresh = $payout->fresh();
    expect($fresh->status)->toBe('rejected');
    expect($fresh->reject_reason)->toContain('Nomor rekening');
});

it('marks payout paid after admin uploads proof image', function () {
    Storage::fake('public');

    $payout = PayoutRequest::factory()->create([
        'user_id' => $this->instructor->id,
        'status' => 'approved',
    ]);

    $proof = UploadedFile::fake()->image('bukti.png', 800, 600);

    $this->actingAs($this->admin)
        ->post("/admin/payouts/{$payout->id}/mark-paid", [
            'proof' => $proof,
        ])
        ->assertSessionHas('success');

    $fresh = $payout->fresh();
    expect($fresh->status)->toBe('paid');
    expect($fresh->proof_path)->not->toBeNull();
    Storage::disk('public')->assertExists($fresh->proof_path);
});

it('rejects mark-paid without a proof image', function () {
    $payout = PayoutRequest::factory()->create([
        'user_id' => $this->instructor->id,
        'status' => 'approved',
    ]);

    $this->actingAs($this->admin)
        ->from("/admin/payouts/{$payout->id}")
        ->post("/admin/payouts/{$payout->id}/mark-paid", [])
        ->assertSessionHasErrors('proof');
});

it('blocks non-admin from accessing admin payout list', function () {
    $this->actingAs($this->instructor)
        ->get('/admin/payouts')
        ->assertForbidden();
});

it('blocks instructors from requesting payout for an amount greater than balance and creates no row', function () {
    $this->actingAs($this->instructor)
        ->from('/admin/my-earnings')
        ->post('/admin/my-earnings/withdraw', [
            'gross_amount' => 100_000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'John',
        ]);

    expect(PayoutRequest::count())->toBe(0);
});
