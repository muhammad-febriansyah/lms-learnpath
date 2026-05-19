<?php

namespace App\Console\Commands;

use App\Models\Organization;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * Fetch real organization logos using Google's high-res favicon endpoint, with
 * a UI-Avatars text logo as a graceful fallback.
 *
 * Maps each seeded company name → public domain → downloads the favicon
 * into storage/public/organizations/{id}/.
 */
#[Signature('demo:fetch-org-logos {--force : Re-download even when logo already set}')]
#[Description('Download organization logos for seeded organizations')]
class DemoFetchOrgLogos extends Command
{
    /**
     * Best-effort name → public domain mapping for the seeder data.
     *
     * @var array<string, string>
     */
    private array $domainMap = [
        'PT Bank Mandiri (Persero) Tbk' => 'bankmandiri.co.id',
        'PT Bank Central Asia Tbk' => 'bca.co.id',
        'PT Telkom Indonesia (Persero) Tbk' => 'telkom.co.id',
        'PT Astra International Tbk' => 'astra.co.id',
        'PT Pertamina (Persero)' => 'pertamina.com',
        'PT Unilever Indonesia Tbk' => 'unilever.co.id',
        'PT Indofood Sukses Makmur Tbk' => 'indofood.com',
        'PT Bukalapak.com Tbk' => 'bukalapak.com',
        'PT GoTo Gojek Tokopedia Tbk' => 'gotocompany.com',
        'PT XL Axiata Tbk' => 'xlaxiata.co.id',
    ];

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $orgs = Organization::query()->orderBy('id')->get();

        $this->line("→ Processing <comment>{$orgs->count()}</comment> organizations");

        foreach ($orgs as $org) {
            if (! $force && ! empty($org->logo_path)) {
                $this->line("  · {$org->name}: sudah punya logo, lewati (pakai --force untuk refresh)");

                continue;
            }

            $domain = $this->domainMap[$org->name] ?? null;
            $bytes = null;
            $source = '';

            if ($domain) {
                // Google's favicon endpoint serves up to 256px PNG with brand color.
                $remoteUrl = "https://www.google.com/s2/favicons?domain={$domain}&sz=256";

                try {
                    $response = Http::timeout(15)->get($remoteUrl);
                    if ($response->successful() && strlen($response->body()) > 1000) {
                        $bytes = $response->body();
                        $source = $domain;
                    }
                } catch (\Throwable) {
                    // ignore, fall through to fallback
                }
            }

            if ($bytes === null) {
                // Fallback: generate a clean text logo with the company initials.
                $initials = $this->getInitials($org->name);
                $color = ltrim($org->brand_primary_color ?: '#0061A8', '#');
                $remoteUrl = sprintf(
                    'https://ui-avatars.com/api/?name=%s&background=%s&color=fff&size=256&font-size=0.42&bold=true',
                    urlencode($initials),
                    $color,
                );

                try {
                    $response = Http::timeout(15)->get($remoteUrl);
                    if (! $response->successful()) {
                        $this->warn("  ✗ {$org->name}: fallback HTTP {$response->status()}");

                        continue;
                    }
                    $bytes = $response->body();
                    $source = "ui-avatars ({$initials})";
                } catch (\Throwable $e) {
                    $this->warn("  ✗ {$org->name}: {$e->getMessage()}");

                    continue;
                }
            }

            $filename = "organizations/{$org->id}/logo.png";

            if ($force && $org->logo_path && $org->logo_path !== $filename) {
                Storage::disk('public')->delete($org->logo_path);
            }

            Storage::disk('public')->put($filename, $bytes);
            $org->forceFill(['logo_path' => $filename])->save();

            $this->line("  ✓ {$org->name} ← {$source}");
        }

        $this->info('Done. Logos di storage/app/public/organizations/.');

        return self::SUCCESS;
    }

    private function getInitials(string $name): string
    {
        // Drop legal entity markers + punctuation so initials come from the brand name only.
        $clean = preg_replace('/\b(PT|Tbk|Persero|com|co|id)\b/i', '', $name) ?? $name;
        $clean = preg_replace('/[^\p{L}\s]+/u', ' ', $clean) ?? $clean;
        $parts = array_values(array_filter(preg_split('/\s+/', trim($clean)) ?: []));

        // Single-word brand (e.g. "Pertamina") → take first two letters.
        if (count($parts) === 1) {
            return mb_strtoupper(mb_substr($parts[0], 0, 2));
        }

        $initials = '';
        foreach (array_slice($parts, 0, 2) as $p) {
            $initials .= mb_strtoupper(mb_substr($p, 0, 1));
        }

        return $initials !== '' ? $initials : 'CO';
    }
}
