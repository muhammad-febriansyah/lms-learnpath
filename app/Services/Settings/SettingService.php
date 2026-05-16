<?php

namespace App\Services\Settings;

use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * Akses key-value site settings (nama, logo, sosmed, SEO, dll).
 *
 *   app(SettingService::class)->get('site_name');
 *   app(SettingService::class)->set('site_name', 'My LMS');
 *   app(SettingService::class)->group('social')->all();
 *   app(SettingService::class)->publicForFrontend();
 */
final class SettingService
{
    private const CACHE_KEY = 'settings:all';

    private const CACHE_TTL = 86400;

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->loaded()->get($key, $default);
    }

    public function getImageUrl(string $key): ?string
    {
        $path = $this->get($key);

        if (! $path) {
            return null;
        }

        return str_starts_with((string) $path, 'http')
            ? $path
            : Storage::url($path);
    }

    public function set(string $key, mixed $value): Setting
    {
        $setting = Setting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $this->serialize($value)],
        );

        $this->flush();

        return $setting;
    }

    /**
     * @return Collection<string, mixed>
     */
    public function all(): Collection
    {
        return $this->loaded();
    }

    /**
     * @return Collection<string, mixed>
     */
    public function group(string $group): Collection
    {
        return $this->loaded()
            ->filter(fn ($_, $key) => Setting::query()->where('key', $key)->value('group') === $group);
    }

    /**
     * Hanya setting yang `is_public=true` — aman dikirim ke frontend.
     *
     * @return Collection<string, mixed>
     */
    public function publicForFrontend(): Collection
    {
        $items = Cache::remember('settings:public', self::CACHE_TTL, function (): array {
            return Setting::query()
                ->where('is_public', true)
                ->get()
                ->mapWithKeys(fn (Setting $s) => [$s->key => $this->deserialize($s)])
                ->all();
        });

        return collect($items);
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget('settings:public');
    }

    /**
     * @return Collection<string, mixed>
     */
    private function loaded(): Collection
    {
        $items = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function (): array {
            return Setting::query()
                ->get()
                ->mapWithKeys(fn (Setting $s) => [$s->key => $this->deserialize($s)])
                ->all();
        });

        return collect($items);
    }

    private function deserialize(Setting $setting): mixed
    {
        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'number', 'integer' => $setting->value === null ? null : (int) $setting->value,
            'json' => $setting->value ? json_decode((string) $setting->value, true) : null,
            default => $setting->value,
        };
    }

    private function serialize(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        return (string) $value;
    }
}
