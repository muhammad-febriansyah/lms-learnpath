<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use App\Models\Course;
use App\Models\LearningPath;
use App\Models\PointRedemptionOffer;
use App\Services\Gamification\InsufficientPointsException;
use App\Services\Gamification\RedemptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class RedemptionController extends Controller
{
    public function __construct(private readonly RedemptionService $service) {}

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'redeemable_type' => ['required', Rule::in(array_keys(PointRedemptionOffer::REDEEMABLE_TYPES))],
            'redeemable_id' => ['required', 'integer'],
        ]);

        $modelClass = PointRedemptionOffer::REDEEMABLE_TYPES[$data['redeemable_type']];
        $redeemable = $modelClass::query()->findOrFail($data['redeemable_id']);

        $offer = $this->service->offerFor($redeemable);
        if (! $offer) {
            throw ValidationException::withMessages([
                'redeemable_id' => 'Item ini tidak dapat ditukar dengan poin.',
            ]);
        }

        try {
            $this->service->redeem($request->user(), $offer);
        } catch (InsufficientPointsException $e) {
            return back()->with('error', $e->getMessage());
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return $this->redirectAfterRedeem($redeemable)
            ->with('success', 'Berhasil ditukar! Selamat belajar.');
    }

    private function redirectAfterRedeem(object $redeemable): RedirectResponse
    {
        if ($redeemable instanceof Course) {
            return redirect()->route('learn.show', ['course' => $redeemable->slug]);
        }

        if ($redeemable instanceof Bundle) {
            return redirect()->route('my-courses.index');
        }

        if ($redeemable instanceof LearningPath) {
            return redirect()->route('my-paths.index');
        }

        return redirect()->route('my-points.index');
    }
}
