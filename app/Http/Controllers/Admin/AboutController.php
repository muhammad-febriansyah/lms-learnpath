<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AboutSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function edit(Request $request): Response
    {
        abort_unless($request->user()?->can('about.manage'), 403);

        $about = AboutSetting::current();

        return Inertia::render('admin/about/edit', [
            'about' => [
                ...$about->toArray(),
                'hero_image_url' => $about->hero_image
                    ? Storage::disk('public')->url($about->hero_image)
                    : null,
                'founder_photo_url' => $about->founder_photo
                    ? Storage::disk('public')->url($about->founder_photo)
                    : null,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('about.manage'), 403);

        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:200'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'founded_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'vision' => ['nullable', 'string'],
            'mission' => ['nullable', 'string'],

            'values' => ['nullable', 'array'],
            'values.*.title' => ['nullable', 'string', 'max:120'],
            'values.*.description' => ['nullable', 'string', 'max:500'],

            'stats' => ['nullable', 'array'],
            'stats.*.label' => ['nullable', 'string', 'max:120'],
            'stats.*.value' => ['nullable', 'string', 'max:50'],
            'stats.*.suffix' => ['nullable', 'string', 'max:20'],

            'founder_name' => ['nullable', 'string', 'max:120'],
            'founder_role' => ['nullable', 'string', 'max:120'],
            'founder_message' => ['nullable', 'string'],

            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_address' => ['nullable', 'string', 'max:500'],
            'contact_map_url' => ['nullable', 'url', 'max:500'],

            'social_facebook' => ['nullable', 'url', 'max:255'],
            'social_instagram' => ['nullable', 'url', 'max:255'],
            'social_twitter' => ['nullable', 'url', 'max:255'],
            'social_linkedin' => ['nullable', 'url', 'max:255'],
            'social_youtube' => ['nullable', 'url', 'max:255'],

            'hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'founder_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $about = AboutSetting::current();

        $data['values'] = array_values(array_filter(
            $data['values'] ?? [],
            fn ($item) => ! empty($item['title']) || ! empty($item['description']),
        ));

        $data['stats'] = array_values(array_filter(
            $data['stats'] ?? [],
            fn ($item) => ! empty($item['label']) || ! empty($item['value']),
        ));

        if ($request->hasFile('hero_image')) {
            if ($about->hero_image) {
                Storage::disk('public')->delete($about->hero_image);
            }
            $data['hero_image'] = $request->file('hero_image')->store('about', 'public');
        } else {
            unset($data['hero_image']);
        }

        if ($request->hasFile('founder_photo')) {
            if ($about->founder_photo) {
                Storage::disk('public')->delete($about->founder_photo);
            }
            $data['founder_photo'] = $request->file('founder_photo')->store('about', 'public');
        } else {
            unset($data['founder_photo']);
        }

        $about->update($data);

        return redirect()
            ->route('admin.about.edit')
            ->with('success', 'Halaman Tentang Kami berhasil diperbarui.');
    }
}
