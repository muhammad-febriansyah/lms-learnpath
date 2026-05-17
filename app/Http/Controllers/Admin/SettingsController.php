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

    public function editLegalDocument(Request $request, string $document): Response
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        $config = $this->legalDocumentConfig($document);

        return Inertia::render('admin/settings/legal-document-form', [
            'document' => [
                'type' => $document,
                'label' => $config['label'],
                'title' => (string) ($this->settings->get($config['title_key']) ?? ''),
                'content' => (string) ($this->settings->get($config['content_key']) ?? ''),
            ],
        ]);
    }

    public function updateLegalDocument(Request $request, string $document): RedirectResponse
    {
        abort_unless($request->user()?->can('settings.update'), 403);

        $config = $this->legalDocumentConfig($document);

        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:100000'],
        ], [
            'required' => ':attribute wajib diisi.',
            'max' => ':attribute terlalu panjang.',
        ], [
            'title' => 'Title',
            'content' => 'Isi dokumen',
        ]);

        $this->settings->set($config['title_key'], $payload['title']);
        $this->settings->set($config['content_key'], $payload['content']);

        return back()->with('success', $config['label'].' berhasil diperbarui.');
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

    /**
     * @return array{label: string, title_key: string, content_key: string}
     */
    private function legalDocumentConfig(string $document): array
    {
        return match ($document) {
            'terms' => [
                'label' => 'Syarat & Ketentuan',
                'title_key' => 'legal_terms_title',
                'content_key' => 'legal_terms_content',
            ],
            'privacy' => [
                'label' => 'Kebijakan Privasi',
                'title_key' => 'legal_privacy_title',
                'content_key' => 'legal_privacy_content',
            ],
            default => abort(404),
        };
    }
}
