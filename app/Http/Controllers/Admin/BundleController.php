<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BundleRequest;
use App\Models\Bundle;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BundleController extends Controller
{
    public function index(Request $request): Response
    {
        $bundles = Bundle::query()
            ->withCount('courses')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Bundle $b) => [
                'id' => $b->id,
                'title' => $b->title,
                'slug' => $b->slug,
                'price' => $b->price,
                'compare_at_price' => $b->compare_at_price,
                'is_published' => $b->is_published,
                'courses_count' => $b->courses_count,
                'created_at' => $b->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/bundles/index', [
            'bundles' => $bundles,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/bundles/form', [
            'bundle' => null,
            'courses' => $this->courseOptions(),
        ]);
    }

    public function store(BundleRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $courseIds = $data['course_ids'];
        unset($data['course_ids']);

        if ($data['is_published'] && empty($data['published_at'] ?? null)) {
            $data['published_at'] = now();
        }

        $bundle = Bundle::create($data);
        $this->syncCourses($bundle, $courseIds);

        return redirect()
            ->route('admin.bundles.index')
            ->with('success', 'Paket berhasil dibuat.');
    }

    public function edit(Bundle $bundle): Response
    {
        $bundle->load('courses:id');

        return Inertia::render('admin/bundles/form', [
            'bundle' => [
                'id' => $bundle->id,
                'title' => $bundle->title,
                'slug' => $bundle->slug,
                'description' => $bundle->description,
                'thumbnail' => $bundle->thumbnail,
                'price' => $bundle->price,
                'compare_at_price' => $bundle->compare_at_price,
                'is_published' => $bundle->is_published,
                'course_ids' => $bundle->courses->pluck('id')->all(),
            ],
            'courses' => $this->courseOptions(),
        ]);
    }

    public function update(BundleRequest $request, Bundle $bundle): RedirectResponse
    {
        $data = $request->validated();
        $courseIds = $data['course_ids'];
        unset($data['course_ids']);

        if ($data['is_published'] && ! $bundle->published_at) {
            $data['published_at'] = now();
        }

        $bundle->update($data);
        $this->syncCourses($bundle, $courseIds);

        return redirect()
            ->route('admin.bundles.index')
            ->with('success', 'Paket berhasil diperbarui.');
    }

    public function destroy(Bundle $bundle): RedirectResponse
    {
        $bundle->delete();

        return back()->with('success', 'Paket berhasil dihapus.');
    }

    /**
     * @param  array<int, int>  $courseIds
     */
    private function syncCourses(Bundle $bundle, array $courseIds): void
    {
        $sync = [];
        foreach (array_values($courseIds) as $i => $id) {
            $sync[$id] = ['sort_order' => $i];
        }
        $bundle->courses()->sync($sync);
    }

    /**
     * @return array<int, array{id: int, title: string, price: int}>
     */
    private function courseOptions(): array
    {
        return Course::query()
            ->orderBy('title')
            ->get(['id', 'title', 'price'])
            ->map(fn (Course $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'price' => (int) $c->price,
            ])
            ->all();
    }
}
