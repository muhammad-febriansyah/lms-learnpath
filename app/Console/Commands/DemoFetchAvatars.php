<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * Download avatars from DiceBear (free, no auth) so the user table looks real.
 *
 * Uses the "lorelei" style: clean illustrated portraits that work for any name
 * without race/gender baggage. Deterministic per user (seed = email) so the
 * same person always gets the same face — even after a refetch.
 */
#[Signature('demo:fetch-avatars {--force : Re-download even when avatar already set}')]
#[Description('Download DiceBear avatars for all users in the database')]
class DemoFetchAvatars extends Command
{
    private const STYLE = 'lorelei';

    private const BG_COLORS = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'];

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $users = User::query()->orderBy('id')->get();

        $this->line("→ Processing <comment>{$users->count()}</comment> users");

        foreach ($users as $user) {
            if (! $force && ! empty($user->avatar_path)) {
                continue;
            }

            $seed = urlencode($user->email ?: $user->name ?: (string) $user->id);
            $bg = self::BG_COLORS[abs(crc32($seed)) % count(self::BG_COLORS)];
            $remoteUrl = sprintf(
                'https://api.dicebear.com/9.x/%s/png?seed=%s&size=256&backgroundColor=%s&radius=50',
                self::STYLE,
                $seed,
                $bg,
            );

            try {
                $bytes = Http::timeout(20)->get($remoteUrl)->throw()->body();
            } catch (\Throwable $e) {
                $this->warn("  ✗ {$user->name}: download gagal ({$e->getMessage()})");

                continue;
            }

            $filename = "avatars/user-{$user->id}.png";

            if ($force && $user->avatar_path && $user->avatar_path !== $filename) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            Storage::disk('public')->put($filename, $bytes);
            $user->forceFill(['avatar_path' => $filename])->save();

            $this->line("  ✓ {$user->name}");
        }

        $this->info('Done. Avatars tersimpan di storage/app/public/avatars/.');

        return self::SUCCESS;
    }
}
