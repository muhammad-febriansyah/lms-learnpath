<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FaqRequest;
use App\Models\Faq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('faq.manage'), 403);

        $faqs = Faq::query()
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('question', 'like', "%{$search}%")
                        ->orWhere('answer', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($request->string('category')->toString(), function ($query, $category) {
                $query->where('category', $category);
            })
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $categoryOptions = Faq::query()
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('admin/faqs/index', [
            'faqs' => $faqs,
            'filters' => $request->only('search', 'category'),
            'categoryOptions' => $categoryOptions,
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('faq.manage'), 403);

        return Inertia::render('admin/faqs/form', [
            'faq' => null,
        ]);
    }

    public function store(FaqRequest $request): RedirectResponse
    {
        Faq::create($request->validated());

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'FAQ berhasil ditambahkan.');
    }

    public function edit(Faq $faq, Request $request): Response
    {
        abort_unless($request->user()?->can('faq.manage'), 403);

        return Inertia::render('admin/faqs/form', [
            'faq' => $faq,
        ]);
    }

    public function update(FaqRequest $request, Faq $faq): RedirectResponse
    {
        $faq->update($request->validated());

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'FAQ berhasil diperbarui.');
    }

    public function destroy(Faq $faq, Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('faq.manage'), 403);

        $faq->delete();

        return back()->with('success', 'FAQ berhasil dihapus.');
    }
}
