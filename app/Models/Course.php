<?php

namespace App\Models;

use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable([
    'category_id',
    'instructor_id',
    'title',
    'subtitle',
    'slug',
    'description',
    'learning_objectives',
    'requirements',
    'target_audience',
    'thumbnail',
    'preview_video_url',
    'price',
    'compare_at_price',
    'level',
    'delivery_format',
    'is_certified',
    'language',
    'duration_minutes',
    'schedule_start',
    'schedule_end',
    'schedule_location',
    'pre_test_required',
    'post_test_required',
    'passing_score',
    'max_attempts',
    'average_rating',
    'reviews_count',
    'total_students',
    'is_published',
    'published_at',
    'review_status',
    'review_notes',
    'submitted_at',
    'reviewed_at',
    'reviewed_by',
    'max_participants',
    'lms_format',
    'scorm_package_id',
])]
class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasFactory;

    public const FORMAT_ON_DEMAND = 'on_demand';

    public const FORMAT_ONLINE_LIVE = 'online_live';

    public const FORMAT_OFFLINE = 'offline';

    public const FORMAT_HYBRID = 'hybrid';

    public const FORMAT_BOOTCAMP = 'bootcamp';

    public const FORMATS = [
        self::FORMAT_ON_DEMAND,
        self::FORMAT_ONLINE_LIVE,
        self::FORMAT_OFFLINE,
        self::FORMAT_HYBRID,
        self::FORMAT_BOOTCAMP,
    ];

    public const REVIEW_DRAFT = 'draft';

    public const REVIEW_PENDING = 'pending_review';

    public const REVIEW_PUBLISHED = 'published';

    public const REVIEW_REJECTED = 'rejected';

    public const REVIEW_STATUSES = [
        self::REVIEW_DRAFT,
        self::REVIEW_PENDING,
        self::REVIEW_PUBLISHED,
        self::REVIEW_REJECTED,
    ];

    public const LMS_VIDEO = 'video';

    public const LMS_EMBED_LINK = 'embed_link';

    public const LMS_EMBED_YOUTUBE = 'embed_youtube';

    public const LMS_SCORM = 'scorm';

    public const LMS_FORMATS = [
        self::LMS_VIDEO,
        self::LMS_EMBED_LINK,
        self::LMS_EMBED_YOUTUBE,
        self::LMS_SCORM,
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'compare_at_price' => 'integer',
            'duration_minutes' => 'integer',
            'schedule_start' => 'datetime',
            'schedule_end' => 'datetime',
            'is_certified' => 'boolean',
            'pre_test_required' => 'boolean',
            'post_test_required' => 'boolean',
            'passing_score' => 'integer',
            'max_attempts' => 'integer',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'learning_objectives' => 'array',
            'requirements' => 'array',
            'target_audience' => 'array',
            'average_rating' => 'decimal:2',
            'reviews_count' => 'integer',
            'total_students' => 'integer',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'max_participants' => 'integer',
        ];
    }

    public function scopeForInstructor(Builder $query, int $userId): Builder
    {
        return $query->where('instructor_id', $userId);
    }

    public function scopePendingReview(Builder $query): Builder
    {
        return $query->where('review_status', self::REVIEW_PENDING);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scormPackage(): BelongsTo
    {
        return $this->belongsTo(ScormPackage::class);
    }

    public function savings(): int
    {
        if (! $this->compare_at_price) {
            return 0;
        }

        return max(0, (int) $this->compare_at_price - (int) $this->price);
    }

    public function isFree(): bool
    {
        return (int) $this->price === 0;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(CourseSection::class)->orderBy('sort_order');
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('sort_order');
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    public function preTest(): HasOne
    {
        return $this->hasOne(Assessment::class)->where('type', 'pre_test');
    }

    public function postTest(): HasOne
    {
        return $this->hasOne(Assessment::class)->where('type', 'post_test');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function competencyMappings(): HasMany
    {
        return $this->hasMany(CourseCompetencyMapping::class);
    }

    public function competencies(): BelongsToMany
    {
        return $this->belongsToMany(Competency::class, 'course_competency_mappings')
            ->withPivot(['weight', 'target_level_impact'])
            ->withTimestamps();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'course_tag');
    }

    public function learningPaths(): BelongsToMany
    {
        return $this->belongsToMany(LearningPath::class, 'learning_path_courses')
            ->withPivot(['sort_order', 'is_required'])
            ->withTimestamps();
    }

    public function orderItems(): MorphMany
    {
        return $this->morphMany(OrderItem::class, 'purchasable');
    }
}
