<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CouponRequest;
use App\Models\Coupon;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(Request $request): Response
    {
        $coupons = Coupon::query()
            ->withCount('courses')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Coupon $c) => [
                'id' => $c->id,
                'code' => $c->code,
                'name' => $c->name,
                'discount_type' => $c->discount_type,
                'discount_value' => $c->discount_value,
                'max_discount' => $c->max_discount,
                'applicable_to' => $c->applicable_to,
                'max_uses' => $c->max_uses,
                'uses_count' => $c->uses_count,
                'is_active' => $c->is_active,
                'courses_count' => $c->courses_count,
                'created_at' => $c->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/coupons/index', [
            'coupons' => $coupons,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/coupons/form', [
            'coupon' => null,
            'courses' => $this->courseOptions(),
        ]);
    }

    public function store(CouponRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $courseIds = $data['course_ids'] ?? [];
        unset($data['course_ids']);

        $coupon = Coupon::create($data);

        if ($coupon->applicable_to === Coupon::SCOPE_SPECIFIC) {
            $coupon->courses()->sync($courseIds);
        }

        return redirect()
            ->route('admin.coupons.index')
            ->with('success', 'Voucher berhasil dibuat.');
    }

    public function edit(Coupon $coupon): Response
    {
        $coupon->load('courses:id');

        return Inertia::render('admin/coupons/form', [
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'max_discount' => $coupon->max_discount,
                'applicable_to' => $coupon->applicable_to,
                'max_uses' => $coupon->max_uses,
                'uses_count' => $coupon->uses_count,
                'is_active' => $coupon->is_active,
                'course_ids' => $coupon->courses->pluck('id')->all(),
            ],
            'courses' => $this->courseOptions(),
        ]);
    }

    public function update(CouponRequest $request, Coupon $coupon): RedirectResponse
    {
        $data = $request->validated();
        $courseIds = $data['course_ids'] ?? [];
        unset($data['course_ids']);

        $coupon->update($data);

        if ($coupon->applicable_to === Coupon::SCOPE_SPECIFIC) {
            $coupon->courses()->sync($courseIds);
        } else {
            $coupon->courses()->detach();
        }

        return redirect()
            ->route('admin.coupons.index')
            ->with('success', 'Voucher berhasil diperbarui.');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        return back()->with('success', 'Voucher berhasil dihapus.');
    }

    /**
     * @return array<int, array{id: int, title: string}>
     */
    private function courseOptions(): array
    {
        return Course::query()
            ->orderBy('title')
            ->get(['id', 'title'])
            ->map(fn (Course $c) => ['id' => $c->id, 'title' => $c->title])
            ->all();
    }
}
