<?php

namespace App\Actions\Marketplace;

use App\Models\Bundle;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Buat record Enrollment untuk setiap course di order yang sudah dibayar.
 * Item bertipe Bundle akan di-expand menjadi seluruh course dalam bundle.
 * Idempotent: enrollment dengan (user_id, course_id) yang sama tidak akan duplikat.
 */
final class EnrollUserFromOrder
{
    /**
     * @return array<int, Enrollment>
     */
    public function execute(Order $order): array
    {
        $order->loadMissing('items');
        $enrollments = [];

        DB::transaction(function () use ($order, &$enrollments) {
            $courseIds = $this->extractCourseIds($order);

            foreach ($courseIds as $courseId) {
                $enrollment = Enrollment::firstOrCreate(
                    [
                        'user_id' => $order->user_id,
                        'course_id' => $courseId,
                    ],
                    [
                        'status' => 'active',
                        'progress_percent' => 0,
                        'pre_test_status' => 'not_started',
                        'post_test_status' => 'not_started',
                        'certificate_status' => 'not_issued',
                        'enrolled_at' => $order->paid_at ?? now(),
                    ],
                );

                $enrollments[] = $enrollment;
            }
        });

        return $enrollments;
    }

    /**
     * @return Collection<int, int>
     */
    private function extractCourseIds(Order $order): Collection
    {
        $ids = collect();

        foreach ($order->items as $item) {
            if ($item->purchasable_type === Course::class) {
                $ids->push($item->purchasable_id);
            } elseif ($item->purchasable_type === Bundle::class) {
                $bundle = Bundle::with('courses:id')->find($item->purchasable_id);
                if ($bundle) {
                    foreach ($bundle->courses as $course) {
                        $ids->push($course->id);
                    }
                }
            }
        }

        return $ids->unique()->values();
    }
}
