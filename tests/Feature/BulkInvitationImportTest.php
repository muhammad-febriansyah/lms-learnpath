<?php

use App\Models\Organization;
use App\Models\OrganizationInvitation;
use App\Models\OrganizationMember;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Http::fake([
        'app.mailketing.co.id/*' => Http::response(['status' => 'success'], 200),
    ]);
    config()->set('services.mailketing.api_key', 'test-key');

    Role::findOrCreate('employee', 'web');
    Role::findOrCreate('hr', 'web');

    $this->org = Organization::create([
        'name' => 'Acme Bulk',
        'slug' => 'acme-bulk',
        'contact_name' => 'HR',
        'contact_email' => 'hr@acme-bulk.test',
        'seat_quota' => 5,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    tenancy()->runWithTenant($this->org, function () {
        Position::create(['name' => 'Sales Rep', 'is_active' => true]);
        Position::create(['name' => 'HR Officer', 'is_active' => true]);
    });

    $this->hr = User::factory()->create(['email_verified_at' => now()]);
    $this->hr->assignRole('hr');
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $this->hr->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);
});

it('exposes a CSV template download for HR', function () {
    $response = $this->actingAs($this->hr)
        ->get(route('business.invitations.bulk-template'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    expect($response->headers->get('Content-Disposition'))->toContain('template-undangan-karyawan.csv');
    expect($response->getContent())->toContain('name,email,employee_number,position,division,branch');
});

it('parses CSV and returns row-level preview with summary', function () {
    $csv = "name,email,employee_number,position,division,branch\n"
        ."Andi,andi@acme-bulk.test,A001,Sales Rep,Sales,Jakarta\n"
        ."Budi,budi@acme-bulk.test,B002,HR Officer,HR,Bandung\n"
        ."Citra,not-an-email,C003,Sales Rep,,\n"
        ."Dewi,dewi@acme-bulk.test,D004,Unknown Position,,\n";

    $file = UploadedFile::fake()->createWithContent('karyawan.csv', $csv);

    $response = $this->actingAs($this->hr)
        ->post(route('business.invitations.bulk-preview'), ['file' => $file])
        ->assertSessionHas('bulk_preview');

    $preview = session('bulk_preview');
    expect($preview['summary']['total'])->toBe(4);
    expect($preview['summary']['ready'])->toBe(2);
    expect($preview['summary']['skipped'])->toBe(2);
    expect($preview['token'])->toBeString();

    $statuses = collect($preview['rows'])->pluck('status', 'email');
    expect($statuses['andi@acme-bulk.test'])->toBe('ready');
    expect($statuses['budi@acme-bulk.test'])->toBe('ready');
    expect($statuses['not-an-email'])->toBe('skipped');
    expect($statuses['dewi@acme-bulk.test'])->toBe('skipped');

    expect(OrganizationInvitation::count())->toBe(0);
});

it('flags duplicates against existing members and pending invites', function () {
    $existingUser = User::factory()->create(['email' => 'existing@acme-bulk.test']);
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $existingUser->id,
        'role' => 'learner',
        'joined_at' => now(),
    ]);
    OrganizationInvitation::create([
        'organization_id' => $this->org->id,
        'invited_by_user_id' => $this->hr->id,
        'email' => 'pending@acme-bulk.test',
        'role' => 'learner',
    ]);

    $csv = "email\nexisting@acme-bulk.test\npending@acme-bulk.test\nfresh@acme-bulk.test\n";
    $file = UploadedFile::fake()->createWithContent('k.csv', $csv);

    $this->actingAs($this->hr)
        ->post(route('business.invitations.bulk-preview'), ['file' => $file])
        ->assertSessionHas('bulk_preview');

    $rows = collect(session('bulk_preview')['rows']);
    expect($rows->firstWhere('email', 'existing@acme-bulk.test')['reason'])
        ->toContain('Sudah jadi member');
    expect($rows->firstWhere('email', 'pending@acme-bulk.test')['reason'])
        ->toContain('undangan pending');
    expect($rows->firstWhere('email', 'fresh@acme-bulk.test')['status'])->toBe('ready');
});

it('enforces seat quota on preview', function () {
    $this->org->update(['seats_used' => 4]); // 1 seat tersisa dari 5

    $csv = "email\na@x.test\nb@x.test\nc@x.test\n";
    $file = UploadedFile::fake()->createWithContent('k.csv', $csv);

    $this->actingAs($this->hr)
        ->post(route('business.invitations.bulk-preview'), ['file' => $file])
        ->assertSessionHas('bulk_preview');

    $summary = session('bulk_preview')['summary'];
    expect($summary['ready'])->toBe(1);
    expect($summary['skipped'])->toBe(2);
});

it('commits invitations from cached preview token', function () {
    $csv = "name,email,position\n"
        ."Andi,andi@acme-bulk.test,Sales Rep\n"
        ."Budi,budi@acme-bulk.test,HR Officer\n";
    $file = UploadedFile::fake()->createWithContent('k.csv', $csv);

    $this->actingAs($this->hr)
        ->post(route('business.invitations.bulk-preview'), ['file' => $file]);

    $token = session('bulk_preview')['token'];

    $this->actingAs($this->hr)
        ->post(route('business.invitations.bulk-commit'), ['token' => $token])
        ->assertSessionHas('success');

    expect(OrganizationInvitation::count())->toBe(2);
    $andi = OrganizationInvitation::where('email', 'andi@acme-bulk.test')->first();
    expect($andi->position->name)->toBe('Sales Rep');
});

it('rejects commit with invalid or expired token', function () {
    $this->actingAs($this->hr)
        ->post(route('business.invitations.bulk-commit'), ['token' => 'does-not-exist'])
        ->assertSessionHasErrors('token');

    expect(OrganizationInvitation::count())->toBe(0);
});

it('returns validation error when CSV is empty', function () {
    $file = UploadedFile::fake()->createWithContent('empty.csv', "email\n");

    $this->actingAs($this->hr)
        ->post(route('business.invitations.bulk-preview'), ['file' => $file])
        ->assertSessionHasErrors('file');
});
