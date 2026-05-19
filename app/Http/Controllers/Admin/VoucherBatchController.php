<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use App\Models\Course;
use App\Models\LearningPath;
use App\Models\Voucher;
use App\Models\VoucherBatch;
use App\Services\Voucher\VoucherGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VoucherBatchController extends Controller
{
    public function __construct(private readonly VoucherGenerator $generator) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        $batches = VoucherBatch::query()
            ->with(['grantable', 'creator:id,name'])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('prefix', 'like', "%{$search}%");
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (VoucherBatch $b) => $this->present($b));

        return Inertia::render('admin/vouchers/batches/index', [
            'batches' => $batches,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        return Inertia::render('admin/vouchers/batches/form', [
            'options' => $this->grantOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'prefix' => ['nullable', 'string', 'max:16', 'regex:/^[A-Z0-9]+$/'],
            'grant_kind' => ['required', Rule::in([
                Voucher::KIND_COURSE,
                Voucher::KIND_BUNDLE,
                Voucher::KIND_LEARNING_PATH,
                Voucher::KIND_POINTS,
            ])],
            'grantable_id' => ['nullable', 'integer'],
            'points_amount' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'count' => ['required', 'integer', 'min:1', 'max:10000'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'single_use_per_user' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'note' => ['nullable', 'string', 'max:255'],
        ], [
            'prefix.regex' => 'Prefix hanya boleh huruf besar dan angka.',
        ]);

        $grantableType = null;
        $grantableId = null;

        if ($data['grant_kind'] === Voucher::KIND_POINTS) {
            if (! ($data['points_amount'] ?? null)) {
                return back()->withErrors(['points_amount' => 'Jumlah poin wajib diisi.'])->withInput();
            }
        } else {
            $modelClass = Voucher::KINDS_MORPH_MAP[$data['grant_kind']] ?? null;
            if (! $modelClass || ! ($data['grantable_id'] ?? null)) {
                return back()->withErrors(['grantable_id' => 'Item voucher wajib dipilih.'])->withInput();
            }
            $entity = $modelClass::query()->findOrFail($data['grantable_id']);
            $grantableType = $entity->getMorphClass();
            $grantableId = $entity->id;
        }

        $batch = VoucherBatch::create([
            'name' => $data['name'],
            'prefix' => $data['prefix'] ? strtoupper($data['prefix']) : null,
            'grant_kind' => $data['grant_kind'],
            'grantable_type' => $grantableType,
            'grantable_id' => $grantableId,
            'points_amount' => $data['grant_kind'] === Voucher::KIND_POINTS
                ? $data['points_amount']
                : null,
            'valid_from' => $data['valid_from'] ?? null,
            'valid_until' => $data['valid_until'] ?? null,
            'single_use_per_user' => $data['single_use_per_user'] ?? true,
            'is_active' => $data['is_active'] ?? true,
            'created_by' => $request->user()->id,
            'note' => $data['note'] ?? null,
        ]);

        $this->generator->generateForBatch($batch, (int) $data['count']);

        return redirect()
            ->route('admin.voucher-batches.show', $batch)
            ->with('success', "Batch dibuat dengan {$batch->fresh()->total_codes} kode.");
    }

    public function show(Request $request, VoucherBatch $batch): Response
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        $batch->load(['grantable', 'creator:id,name']);

        $vouchers = $batch->vouchers()
            ->orderBy('id')
            ->limit(200)
            ->get(['id', 'code', 'uses_count', 'max_uses', 'is_active'])
            ->map(fn (Voucher $v) => [
                'id' => $v->id,
                'code' => $v->code,
                'used' => $v->uses_count >= $v->max_uses,
                'is_active' => $v->is_active,
            ]);

        return Inertia::render('admin/vouchers/batches/show', [
            'batch' => $this->present($batch),
            'vouchers' => $vouchers,
        ]);
    }

    public function destroy(Request $request, VoucherBatch $batch): RedirectResponse
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        $usedAny = $batch->vouchers()->where('uses_count', '>', 0)->exists();
        if ($usedAny) {
            return back()->with('error', 'Batch sudah mengandung voucher yang dipakai. Nonaktifkan saja.');
        }

        $batch->delete();

        return redirect()
            ->route('admin.voucher-batches.index')
            ->with('success', 'Batch dihapus.');
    }

    public function export(Request $request, VoucherBatch $batch): StreamedResponse
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        $filename = sprintf(
            'vouchers-%s-%s.csv',
            preg_replace('/[^a-z0-9]+/i', '-', $batch->name) ?: $batch->id,
            now()->format('Ymd-His'),
        );

        return response()->streamDownload(function () use ($batch) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Code', 'Status', 'Uses', 'Max Uses', 'Created At']);

            $batch->vouchers()
                ->orderBy('id')
                ->chunk(500, function ($chunk) use ($handle) {
                    foreach ($chunk as $v) {
                        fputcsv($handle, [
                            $v->code,
                            $v->is_active ? 'active' : 'inactive',
                            $v->uses_count,
                            $v->max_uses,
                            $v->created_at?->toDateTimeString() ?? '',
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function grantOptions(): array
    {
        return [
            Voucher::KIND_COURSE => Course::query()
                ->orderBy('title')
                ->limit(500)
                ->get(['id', 'title'])
                ->map(fn (Course $c) => ['id' => $c->id, 'label' => $c->title])
                ->all(),
            Voucher::KIND_BUNDLE => Bundle::query()
                ->orderBy('title')
                ->limit(500)
                ->get(['id', 'title'])
                ->map(fn (Bundle $b) => ['id' => $b->id, 'label' => $b->title])
                ->all(),
            Voucher::KIND_LEARNING_PATH => LearningPath::query()
                ->orderBy('title')
                ->limit(500)
                ->get(['id', 'title'])
                ->map(fn (LearningPath $p) => ['id' => $p->id, 'label' => $p->title])
                ->all(),
        ];
    }

    private function present(VoucherBatch $b): array
    {
        $grantable = $b->grantable;

        return [
            'id' => $b->id,
            'name' => $b->name,
            'prefix' => $b->prefix,
            'grant_kind' => $b->grant_kind,
            'grantable_title' => $grantable?->title ?? $grantable?->name ?? null,
            'points_amount' => $b->points_amount,
            'valid_from' => $b->valid_from?->toIso8601String(),
            'valid_until' => $b->valid_until?->toIso8601String(),
            'total_codes' => $b->total_codes,
            'redeemed_count' => $b->redeemed_count,
            'single_use_per_user' => $b->single_use_per_user,
            'is_active' => $b->is_active,
            'note' => $b->note,
            'creator' => $b->creator ? ['id' => $b->creator->id, 'name' => $b->creator->name] : null,
            'created_at' => $b->created_at?->toIso8601String(),
        ];
    }
}
