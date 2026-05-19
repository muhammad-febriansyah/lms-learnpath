<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use App\Models\Course;
use App\Models\LearningPath;
use App\Models\PointRedemption;
use App\Models\PointRedemptionOffer;
use App\Services\Gamification\RedemptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PointRedemptionController extends Controller
{
    public function __construct(private readonly RedemptionService $redemption) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('point_redemption.manage'), 403);

        $offers = PointRedemptionOffer::query()
            ->with(['redeemable', 'creator:id,name'])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where('note', 'like', "%{$search}%");
            })
            ->when($request->string('status')->toString(), function ($q, $status) {
                $q->where('is_active', $status === 'active');
            })
            ->when($request->string('type')->toString(), function ($q, $type) {
                $map = PointRedemptionOffer::REDEEMABLE_TYPES;
                if (isset($map[$type])) {
                    $q->where('redeemable_type', $map[$type]);
                }
            })
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (PointRedemptionOffer $o) => $this->presentOffer($o));

        $redemptions = PointRedemption::query()
            ->with(['user:id,name,email', 'redeemable', 'offer'])
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (PointRedemption $r) => $this->presentRedemption($r));

        return Inertia::render('admin/point-redemptions/index', [
            'offers' => $offers,
            'recent_redemptions' => $redemptions,
            'filters' => $request->only('search', 'status', 'type'),
            'stats' => [
                'total_offers' => PointRedemptionOffer::query()->count(),
                'active_offers' => PointRedemptionOffer::query()->where('is_active', true)->count(),
                'total_redemptions' => PointRedemption::query()->where('status', 'completed')->count(),
                'total_points_redeemed' => (int) PointRedemption::query()
                    ->where('status', 'completed')
                    ->sum('points_spent'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('point_redemption.manage'), 403);

        return Inertia::render('admin/point-redemptions/form', [
            'offer' => null,
            'options' => $this->redeemableOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('point_redemption.manage'), 403);

        $data = $this->validated($request);

        $modelClass = PointRedemptionOffer::REDEEMABLE_TYPES[$data['redeemable_type']];
        $redeemable = $modelClass::query()->findOrFail($data['redeemable_id']);

        $duplicate = PointRedemptionOffer::query()
            ->where('redeemable_type', $redeemable->getMorphClass())
            ->where('redeemable_id', $redeemable->id)
            ->exists();

        if ($duplicate) {
            throw ValidationException::withMessages([
                'redeemable_id' => 'Item ini sudah memiliki penawaran tukar poin.',
            ]);
        }

        PointRedemptionOffer::create([
            'redeemable_type' => $redeemable->getMorphClass(),
            'redeemable_id' => $redeemable->id,
            'point_price' => $data['point_price'],
            'is_active' => $data['is_active'],
            'redeemable_from' => $data['redeemable_from'] ?? null,
            'redeemable_until' => $data['redeemable_until'] ?? null,
            'max_per_user' => $data['max_per_user'] ?? null,
            'max_total' => $data['max_total'] ?? null,
            'note' => $data['note'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        return redirect()
            ->route('admin.point-redemptions.index')
            ->with('success', 'Penawaran tukar poin dibuat.');
    }

    public function edit(Request $request, PointRedemptionOffer $offer): Response
    {
        abort_unless($request->user()?->can('point_redemption.manage'), 403);

        $offer->load('redeemable');

        return Inertia::render('admin/point-redemptions/form', [
            'offer' => $this->presentOffer($offer, includeRelations: true),
            'options' => $this->redeemableOptions(),
        ]);
    }

    public function update(Request $request, PointRedemptionOffer $offer): RedirectResponse
    {
        abort_unless($request->user()?->can('point_redemption.manage'), 403);

        $data = $this->validated($request, isUpdate: true);

        $offer->update([
            'point_price' => $data['point_price'],
            'is_active' => $data['is_active'],
            'redeemable_from' => $data['redeemable_from'] ?? null,
            'redeemable_until' => $data['redeemable_until'] ?? null,
            'max_per_user' => $data['max_per_user'] ?? null,
            'max_total' => $data['max_total'] ?? null,
            'note' => $data['note'] ?? null,
        ]);

        return redirect()
            ->route('admin.point-redemptions.index')
            ->with('success', 'Penawaran diperbarui.');
    }

    public function destroy(Request $request, PointRedemptionOffer $offer): RedirectResponse
    {
        abort_unless($request->user()?->can('point_redemption.manage'), 403);

        if ($offer->redemptions()->exists()) {
            return back()->with(
                'error',
                'Penawaran sudah pernah ditukar dan tidak bisa dihapus. Nonaktifkan saja.',
            );
        }

        $offer->delete();

        return back()->with('success', 'Penawaran dihapus.');
    }

    public function refund(Request $request, PointRedemption $redemption): RedirectResponse
    {
        abort_unless($request->user()?->can('point_redemption.manage'), 403);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
            'cancel_enrollment' => ['nullable', 'boolean'],
        ]);

        try {
            $this->redemption->refund(
                $redemption,
                $data['reason'] ?? null,
                (bool) ($data['cancel_enrollment'] ?? false),
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Redemption di-refund.');
    }

    private function validated(Request $request, bool $isUpdate = false): array
    {
        $rules = [
            'point_price' => ['required', 'integer', 'min:1', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
            'redeemable_from' => ['nullable', 'date'],
            'redeemable_until' => ['nullable', 'date', 'after_or_equal:redeemable_from'],
            'max_per_user' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'max_total' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'note' => ['nullable', 'string', 'max:255'],
        ];

        if (! $isUpdate) {
            $rules['redeemable_type'] = ['required', Rule::in(array_keys(PointRedemptionOffer::REDEEMABLE_TYPES))];
            $rules['redeemable_id'] = ['required', 'integer'];
        }

        return $request->validate($rules);
    }

    private function redeemableOptions(): array
    {
        return [
            'course' => Course::query()
                ->orderBy('title')
                ->limit(500)
                ->get(['id', 'title', 'price'])
                ->map(fn (Course $c) => [
                    'id' => $c->id,
                    'label' => $c->title,
                    'meta' => $c->price ? 'Rp '.number_format($c->price, 0, ',', '.') : 'Gratis',
                ]),
            'bundle' => Bundle::query()
                ->orderBy('title')
                ->limit(500)
                ->get(['id', 'title', 'price'])
                ->map(fn (Bundle $b) => [
                    'id' => $b->id,
                    'label' => $b->title,
                    'meta' => $b->price ? 'Rp '.number_format($b->price, 0, ',', '.') : 'Gratis',
                ]),
            'learning_path' => LearningPath::query()
                ->orderBy('title')
                ->limit(500)
                ->get(['id', 'title'])
                ->map(fn (LearningPath $p) => [
                    'id' => $p->id,
                    'label' => $p->title,
                    'meta' => null,
                ]),
        ];
    }

    private function presentOffer(PointRedemptionOffer $offer, bool $includeRelations = false): array
    {
        $typeKey = array_search($offer->redeemable_type, PointRedemptionOffer::REDEEMABLE_TYPES, true) ?: 'unknown';
        $redeemable = $offer->redeemable;

        return [
            'id' => $offer->id,
            'redeemable_type' => $typeKey,
            'redeemable_id' => $offer->redeemable_id,
            'redeemable_title' => $redeemable?->title ?? $redeemable?->name ?? '-',
            'point_price' => $offer->point_price,
            'is_active' => $offer->is_active,
            'redeemable_from' => $offer->redeemable_from?->toIso8601String(),
            'redeemable_until' => $offer->redeemable_until?->toIso8601String(),
            'max_per_user' => $offer->max_per_user,
            'max_total' => $offer->max_total,
            'redemptions_count' => $offer->redemptions_count,
            'note' => $offer->note,
            'creator' => $offer->creator ? ['id' => $offer->creator->id, 'name' => $offer->creator->name] : null,
            'created_at' => $offer->created_at?->toIso8601String(),
        ];
    }

    private function presentRedemption(PointRedemption $r): array
    {
        $typeKey = array_search($r->redeemable_type, PointRedemptionOffer::REDEEMABLE_TYPES, true) ?: 'unknown';
        $redeemable = $r->redeemable;

        return [
            'id' => $r->id,
            'user' => $r->user ? [
                'id' => $r->user->id,
                'name' => $r->user->name,
                'email' => $r->user->email,
            ] : null,
            'redeemable_type' => $typeKey,
            'redeemable_title' => $redeemable?->title ?? $redeemable?->name ?? '-',
            'points_spent' => $r->points_spent,
            'status' => $r->status,
            'refunded_at' => $r->refunded_at?->toIso8601String(),
            'refund_reason' => $r->refund_reason,
            'created_at' => $r->created_at?->toIso8601String(),
        ];
    }
}
