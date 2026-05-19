<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DivisionRequest;
use App\Models\Division;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DivisionController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('division.manage'), 403);

        $divisions = Division::query()
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('is_active', $status === 'active');
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/divisions/index', [
            'divisions' => $divisions,
            'filters' => $request->only('search', 'status'),
            'stats' => [
                'total' => Division::count(),
                'active' => Division::where('is_active', true)->count(),
                'inactive' => Division::where('is_active', false)->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('division.manage'), 403);

        return Inertia::render('admin/divisions/form', [
            'division' => null,
        ]);
    }

    public function store(DivisionRequest $request): RedirectResponse
    {
        Division::create($request->validated());

        return redirect()
            ->route('admin.divisions.index')
            ->with('success', 'Divisi berhasil ditambahkan.');
    }

    public function edit(Request $request, Division $division): Response
    {
        abort_unless($request->user()?->can('division.manage'), 403);

        return Inertia::render('admin/divisions/form', [
            'division' => $division,
        ]);
    }

    public function update(DivisionRequest $request, Division $division): RedirectResponse
    {
        $division->update($request->validated());

        return redirect()
            ->route('admin.divisions.index')
            ->with('success', 'Divisi berhasil diperbarui.');
    }

    public function destroy(Request $request, Division $division): RedirectResponse
    {
        abort_unless($request->user()?->can('division.manage'), 403);

        $usedByPosition = Position::query()
            ->where('division', $division->name)
            ->exists();

        if ($usedByPosition) {
            return back()->with('error', 'Divisi masih dipakai pada data jabatan, tidak bisa dihapus.');
        }

        $division->delete();

        return back()->with('success', 'Divisi berhasil dihapus.');
    }
}
