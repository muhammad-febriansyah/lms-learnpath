<?php

namespace App\Services\Business;

use App\Models\Organization;
use App\Models\Position;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Parses a CSV (kolom: name,email,employee_number,position,division,branch)
 * dan menjalankan validasi per-baris terhadap satu organisasi (tenant aktif).
 *
 * Output bukan persist — preview saja. Commit dilakukan oleh InvitationController.
 */
final class BulkInvitationImporter
{
    /**
     * @return array{
     *     rows: list<array<string,mixed>>,
     *     summary: array{total:int, ready:int, skipped:int, seat_remaining:int}
     * }
     */
    public function parseAndValidate(string $csvPath, Organization $org): array
    {
        $rawRows = $this->parseCsv($csvPath);
        $positionsByName = $this->positionsByName();

        $existingMemberEmails = $org->members()
            ->join('users', 'organization_members.user_id', '=', 'users.id')
            ->pluck('users.email')
            ->map(fn ($e) => strtolower((string) $e))
            ->all();

        $pendingInviteEmails = $org->invitations()
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->pluck('email')
            ->map(fn ($e) => strtolower((string) $e))
            ->all();

        $seenInFile = [];
        $seatRemaining = max(0, $org->seatsAvailable() - count($pendingInviteEmails));

        $rows = [];
        $readyCount = 0;
        $rowNumber = 1;

        foreach ($rawRows as $raw) {
            $rowNumber++;

            $email = strtolower(trim((string) ($raw['email'] ?? '')));
            $name = trim((string) ($raw['name'] ?? '')) ?: null;
            $employeeNumber = trim((string) ($raw['employee_number'] ?? '')) ?: null;
            $positionName = trim((string) ($raw['position'] ?? ''));
            $division = trim((string) ($raw['division'] ?? '')) ?: null;
            $branch = trim((string) ($raw['branch'] ?? '')) ?: null;

            $positionId = $positionName !== ''
                ? ($positionsByName[strtolower($positionName)] ?? null)
                : null;

            $status = 'ready';
            $reason = null;

            if ($email === '') {
                $status = 'skipped';
                $reason = 'Email kosong.';
            } elseif (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $status = 'skipped';
                $reason = 'Format email tidak valid.';
            } elseif (in_array($email, $seenInFile, true)) {
                $status = 'skipped';
                $reason = 'Email duplikat di file ini.';
            } elseif (in_array($email, $existingMemberEmails, true)) {
                $status = 'skipped';
                $reason = 'Sudah jadi member organisasi.';
            } elseif (in_array($email, $pendingInviteEmails, true)) {
                $status = 'skipped';
                $reason = 'Sudah punya undangan pending.';
            } elseif ($positionName !== '' && $positionId === null) {
                $status = 'skipped';
                $reason = "Jabatan '{$positionName}' tidak ditemukan.";
            } elseif ($readyCount >= $seatRemaining) {
                $status = 'skipped';
                $reason = 'Seat habis (kuota tercapai).';
            } else {
                $seenInFile[] = $email;
                $readyCount++;
            }

            $rows[] = [
                'row_number' => $rowNumber,
                'email' => $email,
                'name' => $name,
                'employee_number' => $employeeNumber,
                'position_id' => $positionId,
                'position_name' => $positionName !== '' ? $positionName : null,
                'division' => $division,
                'branch' => $branch,
                'status' => $status,
                'reason' => $reason,
            ];
        }

        return [
            'rows' => $rows,
            'summary' => [
                'total' => count($rows),
                'ready' => $readyCount,
                'skipped' => count($rows) - $readyCount,
                'seat_remaining' => $seatRemaining,
            ],
        ];
    }

    /**
     * CSV template untuk download (3 baris contoh).
     */
    public function templateCsv(): string
    {
        $rows = [
            ['name', 'email', 'employee_number', 'position', 'division', 'branch'],
            ['Andi Pratama', 'andi@perusahaan.com', 'A001', 'Sales Rep', 'Sales', 'Jakarta'],
            ['Budi Santoso', 'budi@perusahaan.com', 'B002', 'HR Officer', 'HR', 'Bandung'],
        ];

        $handle = fopen('php://temp', 'r+');
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        $contents = stream_get_contents($handle);
        fclose($handle);

        return (string) $contents;
    }

    public function previewToken(): string
    {
        return Str::random(40);
    }

    /**
     * @return Collection<string, int>
     */
    private function positionsByName(): Collection
    {
        return Position::query()
            ->pluck('id', 'name')
            ->mapWithKeys(fn ($id, $name) => [strtolower(trim((string) $name)) => $id]);
    }

    /**
     * @return list<array<string,string>>
     */
    private function parseCsv(string $path): array
    {
        $handle = fopen($path, 'r');
        if (! $handle) {
            return [];
        }

        $headers = fgetcsv($handle);
        if (! $headers) {
            fclose($handle);

            return [];
        }

        $headers = array_map(fn ($h) => strtolower(trim((string) $h)), $headers);

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) === 1 && trim((string) $row[0]) === '') {
                continue;
            }
            $padded = array_pad($row, count($headers), '');
            $rows[] = array_combine($headers, array_slice($padded, 0, count($headers)));
        }

        fclose($handle);

        return $rows;
    }
}
