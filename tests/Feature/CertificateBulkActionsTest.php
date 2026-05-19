<?php

use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    foreach (['certificate.view', 'certificate.issue', 'certificate.revoke'] as $perm) {
        Permission::findOrCreate($perm, 'web');
    }

    Role::findOrCreate('superadmin', 'web')
        ->syncPermissions(['certificate.view', 'certificate.issue', 'certificate.revoke']);

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');

    $this->course = Course::factory()->create();
});

it('bulk revokes only issued certificates and skips others', function () {
    $issued = Certificate::factory()->count(2)->create([
        'course_id' => $this->course->id,
        'status' => 'issued',
    ]);
    $alreadyRevoked = Certificate::factory()->create([
        'course_id' => $this->course->id,
        'status' => 'revoked',
    ]);

    $ids = $issued->pluck('id')->push($alreadyRevoked->id)->all();

    $this->actingAs($this->admin)
        ->post('/admin/certificates/bulk/revoke', ['ids' => $ids])
        ->assertRedirect();

    foreach ($issued as $cert) {
        expect($cert->fresh()->status)->toBe('revoked');
    }
    expect($alreadyRevoked->fresh()->status)->toBe('revoked');
});

it('bulk reissues revoked or expired certificates and refreshes issued_at', function () {
    $revoked = Certificate::factory()->create([
        'course_id' => $this->course->id,
        'status' => 'revoked',
        'issued_at' => now()->subYear(),
    ]);
    $expired = Certificate::factory()->create([
        'course_id' => $this->course->id,
        'status' => 'expired',
        'issued_at' => now()->subYear(),
    ]);
    $issued = Certificate::factory()->create([
        'course_id' => $this->course->id,
        'status' => 'issued',
    ]);

    $this->actingAs($this->admin)
        ->post('/admin/certificates/bulk/reissue', [
            'ids' => [$revoked->id, $expired->id, $issued->id],
        ])
        ->assertRedirect();

    expect($revoked->fresh()->status)->toBe('issued');
    expect($expired->fresh()->status)->toBe('issued');
    expect($revoked->fresh()->issued_at?->isToday())->toBeTrue();
    expect($issued->fresh()->status)->toBe('issued');
});

it('streams a csv export with selected certificates', function () {
    $cert = Certificate::factory()->create([
        'course_id' => $this->course->id,
        'certificate_number' => 'CERT-9999-XXXX',
        'verification_code' => 'VERIFYME1234',
        'status' => 'issued',
    ]);

    $response = $this->actingAs($this->admin)
        ->post('/admin/certificates/bulk/export', ['ids' => [$cert->id]]);

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $body = $response->streamedContent();
    expect($body)->toContain('Nomor Sertifikat');
    expect($body)->toContain('CERT-9999-XXXX');
    expect($body)->toContain('VERIFYME1234');
});

it('rejects bulk requests without permission', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->post('/admin/certificates/bulk/revoke', ['ids' => [1]])
        ->assertForbidden();
});

it('validates ids are required', function () {
    $this->actingAs($this->admin)
        ->post('/admin/certificates/bulk/revoke', [])
        ->assertSessionHasErrors('ids');
});
