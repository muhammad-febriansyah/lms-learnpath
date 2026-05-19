<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScormPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ScormPackageController extends Controller
{
    public function index(Request $request): Response
    {
        $packages = ScormPackage::query()
            ->withCount('lessons')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/scorm-packages/index', [
            'packages' => $packages,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'zip' => ['required', 'file', 'mimes:zip', 'max:51200'],
            'version' => ['nullable', 'string', Rule::in(['1.2', '2004'])],
        ], [
            'required' => ':attribute wajib diisi.',
            'file' => ':attribute harus berupa file.',
            'mimes' => ':attribute harus berformat: :values.',
            'max' => 'Ukuran :attribute maksimal :max KB.',
        ], [
            'title' => 'Judul package',
            'zip' => 'File ZIP',
            'version' => 'Versi SCORM',
        ]);

        $path = $request->file('zip')->store('scorm', 'local');

        $package = ScormPackage::create([
            'title' => $data['title'],
            'zip_path' => $path,
            'version' => $data['version'] ?? '1.2',
            'status' => 'uploaded',
        ]);

        return back()
            ->with('success', 'SCORM package berhasil diunggah.')
            ->with('new_scorm_package_id', $package->id);
    }

    public function destroy(ScormPackage $scorm_package): RedirectResponse
    {
        if ($scorm_package->zip_path && Storage::disk('local')->exists($scorm_package->zip_path)) {
            Storage::disk('local')->delete($scorm_package->zip_path);
        }

        $scorm_package->delete();

        return back()->with('success', 'SCORM package berhasil dihapus.');
    }
}
