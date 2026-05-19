<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\LearningPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SearchController extends Controller
{
    /**
     * Quick search for the public command palette (Cmd+K).
     * Aggregates published courses, learning paths, and categories.
     */
    public function quick(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));
        $term = mb_substr($term, 0, 80);
        $key = 'search:public:quick:'.md5(mb_strtolower($term));

        $payload = Cache::remember($key, now()->addMinutes(2), function () use ($term) {
            return [
                'courses' => $this->courses($term),
                'paths' => $this->paths($term),
                'topics' => $this->topics($term),
            ];
        });

        return response()
            ->json([
                'query' => $term,
                ...$payload,
            ])
            ->setMaxAge(60)
            ->setPublic();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function courses(string $term): array
    {
        return Course::query()
            ->select(['id', 'title', 'slug', 'level', 'thumbnail'])
            ->withCount(['lessons', 'enrollments'])
            ->where('is_published', true)
            ->when($term !== '', function ($q) use ($term) {
                $q->where(function ($w) use ($term) {
                    $w->where('title', 'like', "%{$term}%")
                        ->orWhere('subtitle', 'like', "%{$term}%");
                });
            })
            ->when($term === '', fn ($q) => $q->orderByDesc('enrollments_count'))
            ->orderByDesc('id')
            ->limit(6)
            ->get()
            ->map(fn (Course $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'slug' => $c->slug,
                'level' => $c->level,
                'lessons_count' => $c->lessons_count,
                'enrollments_count' => $c->enrollments_count,
                'url' => "/courses/{$c->slug}",
            ])
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function paths(string $term): array
    {
        return LearningPath::query()
            ->select(['id', 'title', 'slug', 'subtitle'])
            ->withCount(['courses'])
            ->where('is_published', true)
            ->when($term !== '', function ($q) use ($term) {
                $q->where(function ($w) use ($term) {
                    $w->where('title', 'like', "%{$term}%")
                        ->orWhere('subtitle', 'like', "%{$term}%");
                });
            })
            ->orderByDesc('id')
            ->limit(4)
            ->get()
            ->map(fn (LearningPath $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'subtitle' => $p->subtitle,
                'courses_count' => $p->courses_count,
                'url' => "/paths/{$p->slug}",
            ])
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function topics(string $term): array
    {
        return Category::query()
            ->select(['id', 'name', 'slug'])
            ->whereHas('courses')
            ->withCount(['courses'])
            ->when($term !== '', fn ($q) => $q->where('name', 'like', "%{$term}%"))
            ->orderByDesc('courses_count')
            ->limit(4)
            ->get()
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'title' => $c->name,
                'slug' => $c->slug,
                'courses_count' => $c->courses_count,
                'url' => "/courses?category={$c->slug}",
            ])
            ->toArray();
    }
}
