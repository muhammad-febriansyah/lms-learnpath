<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LessonPreviewController extends Controller
{
    public function show(Course $course, Lesson $lesson): Response
    {
        abort_unless($course->is_published, 404);
        abort_unless($lesson->course_id === $course->id, 404);
        abort_unless($lesson->is_preview, 403, 'Lesson ini bukan preview gratis.');

        $course->load([
            'instructor:id,name',
            'instructor.instructorProfile:id,user_id,headline,photo_path',
            'category:id,name,slug',
        ]);

        $otherPreviews = Lesson::query()
            ->where('course_id', $course->id)
            ->where('is_preview', true)
            ->where('id', '!=', $lesson->id)
            ->orderBy('sort_order')
            ->get(['id', 'title', 'duration_minutes']);

        return Inertia::render('public/courses/preview', [
            'course' => [
                'id' => $course->id,
                'slug' => $course->slug,
                'title' => $course->title,
                'short_description' => $course->short_description,
                'thumbnail' => $course->thumbnail
                    ? (str_starts_with($course->thumbnail, 'http')
                        ? $course->thumbnail
                        : Storage::url($course->thumbnail))
                    : null,
                'price' => $course->price,
                'instructor' => $course->instructor ? [
                    'id' => $course->instructor->id,
                    'name' => $course->instructor->name,
                    'headline' => $course->instructor->instructorProfile?->headline,
                ] : null,
            ],
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'type' => $lesson->type,
                'content' => $lesson->content,
                'video_path' => $lesson->video_path ? Storage::url($lesson->video_path) : null,
                'embed_url' => $lesson->embed_url,
                'youtube_video_id' => $lesson->youtube_video_id,
                'duration_minutes' => $lesson->duration_minutes,
            ],
            'otherPreviews' => $otherPreviews,
        ]);
    }
}
