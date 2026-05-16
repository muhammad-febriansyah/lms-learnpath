<?php

namespace App\Support;

use App\Services\Settings\SettingService;

/**
 * Facade-style helper buat akses singkat:
 *
 *   Setting::get('site_name');
 *   Setting::set('site_name', 'My LMS');
 *   Setting::group('social');
 *   Setting::publicForFrontend();
 */
final class Setting
{
    public static function get(string $key, mixed $default = null): mixed
    {
        return app(SettingService::class)->get($key, $default);
    }

    public static function imageUrl(string $key): ?string
    {
        return app(SettingService::class)->getImageUrl($key);
    }

    public static function set(string $key, mixed $value): void
    {
        app(SettingService::class)->set($key, $value);
    }

    public static function all(): \Illuminate\Support\Collection
    {
        return app(SettingService::class)->all();
    }

    public static function group(string $group): \Illuminate\Support\Collection
    {
        return app(SettingService::class)->group($group);
    }

    public static function publicForFrontend(): \Illuminate\Support\Collection
    {
        return app(SettingService::class)->publicForFrontend();
    }

    public static function flush(): void
    {
        app(SettingService::class)->flush();
    }
}
