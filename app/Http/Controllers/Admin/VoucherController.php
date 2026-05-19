<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use App\Models\Course;
use App\Models\LearningPath;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        $vouchers = Voucher::query()
            ->with(['grantable', 'batch:id,name', 'boundUser:id,name,email'])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%")
                    ->orWhere('bound_email', 'like', "%{$search}%");
            })
            ->when($request->string('kind')->toString(), function ($q, $kind) {
                $q->where('grant_kind', $kind);
            })
            ->when($request->string('status')->toString(), function ($q, $status) {
                if ($status === 'active') {
                    $q->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $q->where('is_active', false);
                } elseif ($status === 'used') {
                    $q->whereColumn('uses_count', '>=', 'max_uses');
                } elseif ($status === 'available') {
                    $q->whereColumn('uses_count', '<', 'max_uses')->where('is_active', true);
                }
            })
            ->latest('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Voucher $v) => $this->present($v));

        return Inertia::render('admin/vouchers/index', [
            'vouchers' => $vouchers,
            'filters' => $request->only('search', 'kind', 'status'),
            'stats' => [
                'total' => Voucher::query()->count(),
                'active' => Voucher::query()->where('is_active', true)->count(),
                'redeemed' => (int) Voucher::query()->sum('uses_count'),
                'remaining' => (int) Voucher::query()
                    ->where('is_active', true)
                    ->whereColumn('uses_count', '<', 'max_uses')
                    ->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        return Inertia::render('admin/vouchers/form', [
            'voucher' => null,
            'options' => $this->grantOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        $data = $this->validated($request);

        $voucher = Voucher::create([
            'code' => $data['code'],
            'grant_kind' => $data['grant_kind'],
            'grantable_type' => $data['grantable_type'],
            'grantable_id' => $data['grantable_id'],
            'points_amount' => $data['points_amount'],
            'valid_from' => $data['valid_from'] ?? null,
            'valid_until' => $data['valid_until'] ?? null,
            'max_uses' => $data['max_uses'] ?? 1,
            'single_use_per_user' => $data['single_use_per_user'] ?? true,
            'is_active' => $data['is_active'] ?? true,
            'bound_email' => $data['bound_email'] ?? null,
            'bound_user_id' => $data['bound_user_id'] ?? null,
            'created_by' => $request->user()->id,
            'note' => $data['note'] ?? null,
        ]);

        return redirect()
            ->route('admin.vouchers.show', $voucher)
            ->with('success', 'Voucher dibuat.');
    }

    public function show(Request $request, Voucher $voucher): Response
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        $voucher->load(['grantable', 'batch:id,name', 'boundUser:id,name,email', 'creator:id,name']);
        $voucher->loadCount('redemptions');

        $redemptions = $voucher->redemptions()
            ->with('user:id,name,email')
            ->latest('redeemed_at')
            ->limit(50)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'user' => $r->user ? [
                    'id' => $r->user->id,
                    'name' => $r->user->name,
                    'email' => $r->user->email,
                ] : null,
                'redeemed_at' => $r->redeemed_at?->toIso8601String(),
                'points_credited' => $r->points_credited,
                'result_summary' => $r->result_summary,
            ]);

        return Inertia::render('admin/vouchers/show', [
            'voucher' => $this->present($voucher, true),
            'redemptions' => $redemptions,
        ]);
    }

    public function destroy(Request $request, Voucher $voucher): RedirectResponse
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        if ($voucher->redemptions()->exists()) {
            return back()->with('error', 'Voucher yang sudah dipakai tidak bisa dihapus. Nonaktifkan saja.');
        }

        $voucher->delete();

        return redirect()
            ->route('admin.vouchers.index')
            ->with('success', 'Voucher dihapus.');
    }

    public function toggle(Request $request, Voucher $voucher): RedirectResponse
    {
        abort_unless($request->user()?->can('voucher.manage'), 403);

        $voucher->update(['is_active' => ! $voucher->is_active]);

        return back()->with('success', $voucher->is_active ? 'Voucher diaktifkan.' : 'Voucher dinonaktifkan.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:64', 'regex:/^[A-Z0-9\-]+$/', Rule::unique('vouchers', 'code')],
            'grant_kind' => ['required', Rule::in([
                Voucher::KIND_COURSE,
                Voucher::KIND_BUNDLE,
                Voucher::KIND_LEARNING_PATH,
                Voucher::KIND_POINTS,
            ])],
            'grantable_type' => ['nullable', 'string'],
            'grantable_id' => ['nullable', 'integer'],
            'points_amount' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'max_uses' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'single_use_per_user' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'bound_email' => ['nullable', 'email', 'max:255'],
            'bound_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:255'],
        ], [
            'code.regex' => 'Kode hanya boleh huruf besar, angka, dan tanda hubung.',
        ]);

        // Resolve grantable based on kind.
        if ($data['grant_kind'] === Voucher::KIND_POINTS) {
            $data['grantable_type'] = null;
            $data['grantable_id'] = null;
            if (! $data['points_amount']) {
                abort(422, 'Jumlah poin wajib diisi untuk voucher tipe poin.');
            }
        } else {
            $modelClass = Voucher::KINDS_MORPH_MAP[$data['grant_kind']] ?? null;
            if (! $modelClass || ! $data['grantable_id']) {
                abort(422, 'Item voucher wajib dipilih.');
            }
            $modelClass::query()->findOrFail($data['grantable_id']);
            $data['grantable_type'] = (new $modelClass)->getMorphClass();
            $data['points_amount'] = null;
        }

        $data['code'] = strtoupper(trim((string) $data['code']));

        return $data;
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

    private function present(Voucher $v, bool $detail = false): array
    {
        $grantable = $v->grantable;

        return [
            'id' => $v->id,
            'code' => $v->code,
            'grant_kind' => $v->grant_kind,
            'grantable_title' => $grantable?->title ?? $grantable?->name ?? null,
            'points_amount' => $v->points_amount,
            'valid_from' => $v->valid_from?->toIso8601String(),
            'valid_until' => $v->valid_until?->toIso8601String(),
            'max_uses' => $v->max_uses,
            'uses_count' => $v->uses_count,
            'single_use_per_user' => $v->single_use_per_user,
            'is_active' => $v->is_active,
            'bound_email' => $v->bound_email,
            'bound_user' => $v->boundUser
                ? ['id' => $v->boundUser->id, 'name' => $v->boundUser->name, 'email' => $v->boundUser->email]
                : null,
            'batch' => $v->batch ? ['id' => $v->batch->id, 'name' => $v->batch->name] : null,
            'note' => $v->note,
            'created_at' => $v->created_at?->toIso8601String(),
            'creator' => $detail && $v->creator
                ? ['id' => $v->creator->id, 'name' => $v->creator->name]
                : null,
            'redemptions_count' => $detail ? ($v->redemptions_count ?? 0) : null,
        ];
    }
}
