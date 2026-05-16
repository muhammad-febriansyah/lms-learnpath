<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingService $settings,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        $rows = Setting::query()
            ->orderBy('group')
            ->orderBy('sort_order')
            ->get();

        $grouped = $rows->groupBy('group')->map(function ($items, $group) {
            return [
                'group' => $group,
                'items' => $items->map(fn (Setting $s) => [
                    'key' => $s->key,
                    'value' => $this->formatValueForFrontend($s),
                    'type' => $s->type,
                    'label' => $s->label ?? $s->key,
                    'description' => $s->description,
                    'is_public' => $s->is_public,
                ])->values()->all(),
            ];
        })->values()->all();

        return Inertia::render('admin/settings/index', [
            'groups' => $grouped,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('settings.update'), 403);

        $payload = $request->validate([
            'group' => ['required', 'string', 'max:64'],
            'values' => ['required', 'array'],
            'files' => ['array'],
            'files.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp,svg,ico', 'max:2048'],
        ], [
            'required' => ':attribute wajib diisi.',
            'array' => ':attribute harus berupa daftar.',
            'image' => ':attribute harus berupa gambar.',
            'mimes' => ':attribute harus berformat: :values.',
            'max' => 'Ukuran :attribute maksimal :max KB.',
        ], [
            'group' => 'Grup',
            'values' => 'Data',
            'files' => 'File',
        ]);

        $values = $payload['values'];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $key => $file) {
                $path = $file->store('settings', 'public');
                $values[$key] = $path;
            }
        }

        foreach ($values as $key => $value) {
            $this->settings->set($key, $value);
        }

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    private function formatValueForFrontend(Setting $s): mixed
    {
        if ($s->type === 'boolean') {
            return filter_var($s->value, FILTER_VALIDATE_BOOLEAN);
        }

        if ($s->type === 'image' && $s->value && ! str_starts_with($s->value, 'http')) {
            return Storage::url($s->value);
        }

        return $s->value;
    }
}
