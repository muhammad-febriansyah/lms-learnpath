<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable([
    'name',
    'email',
    'username',
    'password',
    'phone',
    'phone_verified_at',
    'avatar_path',
    'bio',
    'gender',
    'date_of_birth',
    'address',
    'city',
    'province',
    'country',
    'language',
    'timezone',
    'status',
    'google_id',
    'referral_code',
    'referred_by',
    'marketing_consent',
    'notification_preferences',
    'last_login_at',
    'last_login_ip',
])]
#[Hidden([
    'password',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'remember_token',
])]
#[Appends(['avatar_url'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'date_of_birth' => 'date',
            'marketing_consent' => 'boolean',
            'notification_preferences' => 'array',
            'last_login_at' => 'datetime',
        ];
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar_path) {
            return null;
        }

        return Storage::url($this->avatar_path);
    }

    public function employeeProfile(): HasOne
    {
        return $this->hasOne(EmployeeProfile::class);
    }

    public function organizationMemberships(): HasMany
    {
        return $this->hasMany(OrganizationMember::class);
    }

    public function organizations()
    {
        return $this->belongsToMany(Organization::class, 'organization_members')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }

    public function adminOrganizations()
    {
        return $this->organizations()->wherePivot('role', 'admin');
    }

    public function isOrgMember(): bool
    {
        return $this->organizationMemberships()->exists();
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'recipient_id');
    }

    public function instructorProfile(): HasOne
    {
        return $this->hasOne(InstructorProfile::class);
    }

    public function instructedCourses(): HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function learningPathEnrollments(): HasMany
    {
        return $this->hasMany(LearningPathEnrollment::class);
    }

    public function learningStreak(): HasOne
    {
        return $this->hasOne(LearningStreak::class);
    }

    public function badges(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->withPivot('earned_at')
            ->withTimestamps();
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function competencies(): HasMany
    {
        return $this->hasMany(UserCompetency::class);
    }

    public function skillGaps(): HasMany
    {
        return $this->hasMany(SkillGap::class);
    }

    public function ojtAssessments(): HasMany
    {
        return $this->hasMany(OjtAssessment::class);
    }

    public function ojtAssessmentsGiven(): HasMany
    {
        return $this->hasMany(OjtAssessment::class, 'supervisor_id');
    }

    public function supervisorReviews(): HasMany
    {
        return $this->hasMany(SupervisorReview::class);
    }

    public function supervisorReviewsGiven(): HasMany
    {
        return $this->hasMany(SupervisorReview::class, 'reviewer_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlist(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(self::class, 'referred_by');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(self::class, 'referred_by');
    }
}
