<?php

use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\AssessmentController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\B2cPlanController;
use App\Http\Controllers\Admin\B2cSubscriptionController;
use App\Http\Controllers\Admin\BundleController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\CompetencyController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\CourseDocumentController;
use App\Http\Controllers\Admin\CourseMappingController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DivisionController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\InstructorController;
use App\Http\Controllers\Admin\LearningPathController as AdminLearningPathController;
use App\Http\Controllers\Admin\MyEarningController;
use App\Http\Controllers\Admin\MyProfileController;
use App\Http\Controllers\Admin\MyStudentController;
use App\Http\Controllers\Admin\OjtAssessmentController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\OrganizationWalletController as AdminOrganizationWalletController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\PayoutController;
use App\Http\Controllers\Admin\PointRedemptionController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\PositionTargetController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\ScormPackageController;
use App\Http\Controllers\Admin\SearchController as AdminSearchController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\SkillGapController;
use App\Http\Controllers\Admin\SkillMatrixController;
use App\Http\Controllers\Admin\SubscriptionLeadController;
use App\Http\Controllers\Admin\SubscriptionPlanController;
use App\Http\Controllers\Admin\SupervisorReviewController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\TenantBrandingController;
use App\Http\Controllers\Admin\TenantController as AdminTenantController;
use App\Http\Controllers\Admin\TrainingRecommendationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserPointController as AdminUserPointController;
use App\Http\Controllers\Admin\VoucherBatchController as AdminVoucherBatchController;
use App\Http\Controllers\Admin\VoucherController as AdminVoucherController;
use App\Http\Controllers\Api\PakasirWebhookController;
use App\Http\Controllers\Auth\GoogleLoginController;
use App\Http\Controllers\Auth\MentorOnboardingController;
use App\Http\Controllers\Business\BillingController as BusinessBillingController;
use App\Http\Controllers\Business\DashboardController as BusinessDashboardController;
use App\Http\Controllers\Business\InvitationController as BusinessInvitationController;
use App\Http\Controllers\Business\LeaderboardController as BusinessLeaderboardController;
use App\Http\Controllers\Business\MemberController as BusinessMemberController;
use App\Http\Controllers\Business\RegistrationController as BusinessRegistrationController;
use App\Http\Controllers\Business\ReportController as BusinessReportController;
use App\Http\Controllers\Business\WalletController as BusinessWalletController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\LearnerDashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Public\BundleCatalogController;
use App\Http\Controllers\Public\CorporateHubController;
use App\Http\Controllers\Public\CorporateSolutionController;
use App\Http\Controllers\Public\CourseCatalogController;
use App\Http\Controllers\Public\DemoRequestController;
use App\Http\Controllers\Public\LearningPathCatalogController;
use App\Http\Controllers\Public\LessonPreviewController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\PricingController;
use App\Http\Controllers\Public\SearchController;
use App\Http\Controllers\Public\SubscribeController;
use App\Http\Controllers\Public\WebinarController;
use App\Http\Controllers\Student\AchievementController;
use App\Http\Controllers\Student\AssessmentController as StudentAssessmentController;
use App\Http\Controllers\Student\DiscussionController;
use App\Http\Controllers\Student\InsightsController as StudentInsightsController;
use App\Http\Controllers\Student\LearningController;
use App\Http\Controllers\Student\LessonNoteController;
use App\Http\Controllers\Student\MyCertificateController;
use App\Http\Controllers\Student\MyCourseController;
use App\Http\Controllers\Student\MyLearningPathController;
use App\Http\Controllers\Student\MyPointsController;
use App\Http\Controllers\Student\MySkillMatrixController;
use App\Http\Controllers\Student\MySubscriptionController;
use App\Http\Controllers\Student\OrderController as StudentOrderController;
use App\Http\Controllers\Student\RedeemVoucherController;
use App\Http\Controllers\Student\RedemptionController as StudentRedemptionController;
use App\Http\Controllers\Student\ReviewController as StudentReviewController;
use App\Http\Controllers\Student\TutorController as StudentTutorController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController;

Route::get('/', [PageController::class, 'home'])->name('home');

// ===== reCAPTCHA-guarded override for Fortify's password reset link =====
// Registered AFTER Fortify so this overrides the package's POST /forgot-password.
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware(['web', 'guest:web', 'recaptcha:forgot_password'])
    ->name('password.email');

// ===== Public catalog (boleh diakses guest) =====
Route::get('/courses', [CourseCatalogController::class, 'index'])->name('courses.index');
Route::get('/courses/{course:slug}', [CourseCatalogController::class, 'show'])->name('courses.show');
Route::get('/courses/{course:slug}/preview/{lesson}', [LessonPreviewController::class, 'show'])->name('courses.preview');

Route::get('/bundles', [BundleCatalogController::class, 'index'])->name('bundles.index');
Route::get('/bundles/{bundle:slug}', [BundleCatalogController::class, 'show'])->name('bundles.show');

Route::get('/corporate', [CorporateHubController::class, 'index'])->name('corporate.index');
Route::get('/corporate/case-studies', [CorporateHubController::class, 'caseStudies'])->name('corporate.case-studies');
Route::get('/corporate/pricing', [PricingController::class, 'index'])->name('corporate.pricing');
Route::post('/corporate/pricing/contact', [PricingController::class, 'contact'])
    ->middleware('throttle:5,1')
    ->name('corporate.pricing.contact');
Route::get('/corporate/webinars', [WebinarController::class, 'index'])->name('corporate.webinars');
Route::get('/corporate/demo', [DemoRequestController::class, 'create'])->name('corporate.demo.create');
Route::post('/corporate/demo', [DemoRequestController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('corporate.demo.store');
Route::get('/corporate/solutions/{industry}', [CorporateSolutionController::class, 'show'])
    ->whereIn('industry', ['banking', 'manufacturing', 'technology', 'retail', 'government'])
    ->name('corporate.solutions.show');

// B2C Subscription public pricing
Route::get('/subscribe', [SubscribeController::class, 'index'])->name('subscribe.index');

Route::get('/paths', [LearningPathCatalogController::class, 'index'])->name('paths.index');
Route::get('/paths/{path:slug}', [LearningPathCatalogController::class, 'show'])->name('paths.show');

// ===== Static front pages =====
Route::controller(PageController::class)->group(function () {
    Route::get('/about', 'about')->name('about');
    Route::get('/contact', 'contact')->name('contact');
    Route::post('/contact', 'contactSubmit')
        ->middleware('recaptcha:contact')
        ->name('contact.submit');
    Route::get('/faq', 'faq')->name('faq');
    Route::get('/terms', 'terms')->name('terms');
    Route::get('/privacy', 'privacy')->name('privacy');
    Route::get('/help', 'help')->name('help');
    Route::get('/careers', 'careers')->name('careers');
    Route::get('/blog', 'blog')->name('blog');
});

// ===== Public quick search (Cmd+K command palette) =====
Route::get('/api/search/quick', [SearchController::class, 'quick'])
    ->middleware('throttle:60,1')
    ->name('search.quick');

// ===== Mentor registration pending approval page =====
Route::inertia('/auth/pending-approval', 'auth/pending-approval')
    ->name('auth.pending-approval');

// ===== Mentor onboarding (Google flow) =====
Route::middleware(['auth'])->group(function () {
    Route::get('/onboarding/mentor', [MentorOnboardingController::class, 'show'])
        ->name('mentor.onboarding.show');
    Route::post('/onboarding/mentor', [MentorOnboardingController::class, 'store'])
        ->name('mentor.onboarding.store');
});

// ===== Public certificate verification =====
Route::get('/verify-certificate/{code}', [MyCertificateController::class, 'verify'])
    ->name('certificates.verify');

// ===== Google OAuth (guest) =====
Route::middleware('guest')->group(function () {
    Route::get('auth/google', [GoogleLoginController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('auth/google/callback', [GoogleLoginController::class, 'callback'])->name('auth.google.callback');
});

// ===== Business / Corporate (public) =====
Route::prefix('business')->name('business.')->group(function () {
    Route::get('/', [BusinessRegistrationController::class, 'landing'])->name('landing');
    Route::get('register', [BusinessRegistrationController::class, 'showRegister'])->name('register.show');
    Route::post('register', [BusinessRegistrationController::class, 'register'])
        ->middleware('recaptcha:business_register')
        ->name('register');

    // Invitation accept (public — anyone with token)
    Route::get('invitations/{token}/accept', [BusinessInvitationController::class, 'showAccept'])->name('invitations.accept');
    Route::post('invitations/{token}/accept', [BusinessInvitationController::class, 'accept']);
});

// ===== Pakasir webhook (no auth, no CSRF, IP/secret verified) =====
Route::post('/api/webhooks/pakasir', PakasirWebhookController::class)
    ->middleware('pakasir.webhook')
    ->name('webhooks.pakasir');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = request()->user();
        if ($user && $user->hasAnyRole(['superadmin', 'admin_tenant', 'hr', 'instructor', 'supervisor'])) {
            return redirect()->route('admin.dashboard');
        }

        return app(LearnerDashboardController::class)(request());
    })->name('dashboard');

    // ===== Student journey =====
    Route::get('my-courses', [MyCourseController::class, 'index'])->name('my-courses.index');

    Route::get('my-paths', [MyLearningPathController::class, 'index'])->name('my-paths.index');
    Route::post('paths/{path:slug}/enroll', [MyLearningPathController::class, 'enroll'])->name('paths.enroll');

    // Learning / course player
    Route::get('/learn/{course:slug}', [LearningController::class, 'show'])->name('learn.show');
    Route::get('/learn/{course:slug}/lessons/{lesson}', [LearningController::class, 'lesson'])
        ->name('learn.lesson');
    Route::post('/lessons/{lesson}/complete', [LearningController::class, 'complete'])
        ->name('lessons.complete');

    // Discussion forum per course
    Route::get('/learn/{course:slug}/discussions', [DiscussionController::class, 'index'])->name('learn.discussions.index');
    Route::post('/learn/{course:slug}/discussions', [DiscussionController::class, 'store'])->name('learn.discussions.store');
    Route::get('/learn/{course:slug}/discussions/{thread}', [DiscussionController::class, 'show'])->name('learn.discussions.show');
    Route::post('/learn/{course:slug}/discussions/{thread}/replies', [DiscussionController::class, 'reply'])->name('learn.discussions.reply');
    Route::delete('/learn/{course:slug}/discussions/{thread}', [DiscussionController::class, 'destroyThread'])->name('learn.discussions.destroy');
    Route::delete('/learn/{course:slug}/discussions/{thread}/replies/{reply}', [DiscussionController::class, 'destroyReply'])->name('learn.discussions.reply.destroy');
    Route::post('/discussions/threads/{thread}/upvote', [DiscussionController::class, 'toggleThreadUpvote'])->name('discussions.threads.upvote');
    Route::post('/discussions/replies/{reply}/upvote', [DiscussionController::class, 'toggleReplyUpvote'])->name('discussions.replies.upvote');

    // Assessment taking flow
    Route::prefix('learn/{course:slug}/assessments/{assessment}')->group(function () {
        Route::get('/', [StudentAssessmentController::class, 'show'])->name('assessments.show');
        Route::post('/start', [StudentAssessmentController::class, 'start'])->name('assessments.start');
        Route::get('/attempts/{attempt}', [StudentAssessmentController::class, 'take'])->name('assessments.take');
        Route::post('/attempts/{attempt}/submit', [StudentAssessmentController::class, 'submit'])->name('assessments.submit');
        Route::get('/attempts/{attempt}/result', [StudentAssessmentController::class, 'result'])->name('assessments.result');
    });

    Route::get('my-certificates', [MyCertificateController::class, 'index'])->name('my-certificates.index');
    Route::get('my-certificates/{code}/print', [MyCertificateController::class, 'print'])->name('my-certificates.print');

    Route::get('my-achievements', [AchievementController::class, 'index'])->name('my-achievements.index');
    Route::get('my-points', [MyPointsController::class, 'index'])->name('my-points.index');
    Route::get('my-insights', [StudentInsightsController::class, 'index'])->name('my-insights.index');
    Route::post('redemptions', [StudentRedemptionController::class, 'store'])->name('redemptions.store');

    Route::get('redeem', [RedeemVoucherController::class, 'index'])->name('redeem.voucher.index');
    Route::post('redeem', [RedeemVoucherController::class, 'store'])->name('redeem.voucher.store');

    // AI Tutor
    Route::get('my-tutor', [StudentTutorController::class, 'index'])->name('my-tutor.index');
    Route::get('my-tutor/{thread}', [StudentTutorController::class, 'show'])
        ->whereNumber('thread')
        ->name('my-tutor.show');
    Route::post('my-tutor/messages', [StudentTutorController::class, 'store'])->name('my-tutor.messages.store');
    Route::post('my-tutor/stream', [StudentTutorController::class, 'stream'])->name('my-tutor.stream');
    Route::delete('my-tutor/{thread}', [StudentTutorController::class, 'destroy'])
        ->whereNumber('thread')
        ->name('my-tutor.destroy');

    Route::post('courses/{course:slug}/reviews', [StudentReviewController::class, 'store'])->name('reviews.store');
    Route::delete('reviews/{review}', [StudentReviewController::class, 'destroy'])
        ->whereNumber('review')
        ->name('reviews.destroy');

    Route::get('my-notes', [LessonNoteController::class, 'index'])->name('my-notes.index');
    Route::post('lessons/{lesson}/notes', [LessonNoteController::class, 'store'])
        ->whereNumber('lesson')
        ->name('lessons.notes.store');
    Route::patch('notes/{note}', [LessonNoteController::class, 'update'])
        ->whereNumber('note')
        ->name('notes.update');
    Route::delete('notes/{note}', [LessonNoteController::class, 'destroy'])
        ->whereNumber('note')
        ->name('notes.destroy');

    Route::get('my-skill-matrix', [MySkillMatrixController::class, 'show'])->name('my-skill-matrix.show');
    Route::get('my-recommendations', [MySkillMatrixController::class, 'recommendations'])->name('my-recommendations.index');
    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('notifications/read', [NotificationController::class, 'destroyRead'])->name('notifications.destroy-read');
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Business / Corporate — checkout is available to the registrant (no role yet)
    Route::prefix('business')->name('business.')->group(function () {
        Route::get('checkout/{order}', [BusinessRegistrationController::class, 'showCheckout'])->name('checkout.show');
        Route::post('checkout/{order}/pay', [BusinessRegistrationController::class, 'pay'])->name('checkout.pay');
    });

    // Business / Corporate — admin/HR-only management
    Route::prefix('business')
        ->name('business.')
        ->middleware('role:superadmin|admin_tenant|hr')
        ->group(function () {
            Route::get('dashboard', [BusinessDashboardController::class, 'index'])->name('dashboard');
            Route::get('leaderboard', [BusinessLeaderboardController::class, 'index'])->name('leaderboard.index');

            // HR Billing & Invoice (F-047) + Seat Utilization (F-046)
            Route::get('billing', [BusinessBillingController::class, 'index'])->name('billing.index');
            Route::get('billing/{order}', [BusinessBillingController::class, 'show'])
                ->whereNumber('order')
                ->name('billing.show');
            Route::get('billing/{order}/invoice', [BusinessBillingController::class, 'invoice'])
                ->whereNumber('order')
                ->name('billing.invoice');
            Route::get('seats', [BusinessBillingController::class, 'seats'])->name('seats.index');

            // E-Wallet Korporat
            Route::get('wallet', [BusinessWalletController::class, 'index'])->name('wallet.index');
            Route::get('wallet/top-up', [BusinessWalletController::class, 'showTopUp'])->name('wallet.top-up.show');
            Route::post('wallet/top-up', [BusinessWalletController::class, 'storeTopUp'])->name('wallet.top-up.store');
            Route::patch('wallet/threshold', [BusinessWalletController::class, 'updateThreshold'])->name('wallet.threshold.update');
            Route::post('wallet/purchase-seats', [BusinessWalletController::class, 'purchaseSeatsFromWallet'])->name('wallet.purchase-seats');

            Route::get('reports', [BusinessReportController::class, 'index'])->name('reports.index');
            Route::get('reports/export.csv', [BusinessReportController::class, 'export'])->name('reports.export');

            Route::get('members', [BusinessMemberController::class, 'index'])->name('members.index');
            Route::post('members/direct-create', [BusinessMemberController::class, 'directCreate'])->name('members.direct-create');
            Route::patch('members/{member}/role', [BusinessMemberController::class, 'updateRole'])->name('members.role');
            Route::post('members/{member}/resync-enrollments', [BusinessMemberController::class, 'resyncEnrollments'])->name('members.resync-enrollments');
            Route::delete('members/{member}', [BusinessMemberController::class, 'destroy'])->name('members.destroy');

            Route::get('invitations', [BusinessInvitationController::class, 'index'])->name('invitations.index');
            Route::post('invitations', [BusinessInvitationController::class, 'store'])->name('invitations.store');
            Route::get('invitations/bulk-template', [BusinessInvitationController::class, 'bulkTemplate'])->name('invitations.bulk-template');
            Route::post('invitations/bulk-preview', [BusinessInvitationController::class, 'bulkPreview'])->name('invitations.bulk-preview');
            Route::post('invitations/bulk-commit', [BusinessInvitationController::class, 'bulkCommit'])->name('invitations.bulk-commit');
            Route::post('invitations/bulk-upload', [BusinessInvitationController::class, 'bulkUpload'])->name('invitations.bulk-upload');
            Route::post('invitations/{invitation}/resend', [BusinessInvitationController::class, 'resend'])->name('invitations.resend');
            Route::delete('invitations/{invitation}', [BusinessInvitationController::class, 'destroy'])->name('invitations.destroy');
        });

    Route::get('messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('messages/compose', [MessageController::class, 'create'])->name('messages.compose');
    Route::post('messages', [MessageController::class, 'store'])->name('messages.store');
    Route::get('messages/{message}', [MessageController::class, 'show'])->name('messages.show');
    Route::delete('messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');

    // Checkout flow (B2C marketplace) — diblok untuk Employee.
    Route::middleware('employee.no_checkout')->group(function () {
        Route::get('/checkout/bundle/{bundle:slug}', [CheckoutController::class, 'showBundle'])->name('checkout.bundle.show');
        Route::post('/checkout/bundle/{bundle:slug}', [CheckoutController::class, 'storeBundle'])->name('checkout.bundle.store');

        Route::get('/checkout/path/{path:slug}', [CheckoutController::class, 'showLearningPath'])->name('checkout.path.show');
        Route::post('/checkout/path/{path:slug}', [CheckoutController::class, 'storeLearningPath'])->name('checkout.path.store');

        Route::get('/checkout/subscription/{plan:code}', [CheckoutController::class, 'showSubscription'])->name('checkout.subscription.show');
        Route::post('/checkout/subscription/{plan:code}', [CheckoutController::class, 'storeSubscription'])->name('checkout.subscription.store');

        Route::get('/checkout/{course:slug}', [CheckoutController::class, 'show'])->name('checkout.show');
        Route::post('/checkout/{course:slug}', [CheckoutController::class, 'store'])->name('checkout.store');
    });

    // B2C subscription self-service
    Route::get('/my-subscription', [MySubscriptionController::class, 'index'])->name('my-subscription.index');
    Route::post('/my-subscription/cancel', [MySubscriptionController::class, 'cancel'])->name('my-subscription.cancel');

    // Student order pages
    Route::get('/orders', [StudentOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [StudentOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/pay', [StudentOrderController::class, 'retryPayment'])->name('orders.pay');
});

Route::middleware(['auth', 'verified', 'role:superadmin|admin_tenant|hr|instructor|supervisor'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::get('search/quick', [AdminSearchController::class, 'quick'])->name('search.quick');

        // ===== Master Data =====
        Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
        Route::get('courses/create', [CourseController::class, 'create'])->name('courses.create');
        Route::post('courses', [CourseController::class, 'store'])->name('courses.store');
        Route::post('courses/bulk/approve', [CourseController::class, 'bulkApprove'])->name('courses.bulk-approve');
        Route::post('courses/bulk/reject', [CourseController::class, 'bulkReject'])->name('courses.bulk-reject');
        Route::post('courses/bulk/submit-review', [CourseController::class, 'bulkSubmitReview'])->name('courses.bulk-submit-review');
        Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');
        Route::get('courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit');
        Route::match(['put', 'patch'], 'courses/{course}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');
        Route::post('courses/{course}/submit-review', [CourseController::class, 'submitReview'])->name('courses.submit-review');
        Route::post('courses/{course}/approve', [CourseController::class, 'approve'])->name('courses.approve');
        Route::post('courses/{course}/reject', [CourseController::class, 'reject'])->name('courses.reject');
        Route::post('lessons/{lesson}/toggle-preview', [CourseController::class, 'togglePreview'])->name('lessons.toggle-preview');
        Route::get('courses/{course}/documents', [CourseDocumentController::class, 'index'])->name('courses.documents.index');
        Route::post('courses/{course}/documents', [CourseDocumentController::class, 'store'])->name('courses.documents.store');
        Route::delete('courses/{course}/documents/{document}', [CourseDocumentController::class, 'destroy'])->name('courses.documents.destroy');
        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::resource('tags', TagController::class)->except(['show']);
        Route::resource('faqs', FaqController::class)->except(['show']);

        Route::get('about', [AboutController::class, 'edit'])->name('about.edit');
        Route::match(['put', 'patch', 'post'], 'about', [AboutController::class, 'update'])->name('about.update');
        Route::resource('coupons', CouponController::class)->except(['show']);
        Route::resource('bundles', BundleController::class)
            ->scoped(['bundle' => 'id']);

        Route::resource('learning-paths', AdminLearningPathController::class)
            ->parameters(['learning-paths' => 'learning_path'])
            ->scoped(['learning_path' => 'id']);
        Route::post('learning-paths/{learning_path:id}/courses', [AdminLearningPathController::class, 'attachCourse'])
            ->name('learning-paths.courses.attach');
        Route::delete('learning-paths/{learning_path:id}/courses/{course}', [AdminLearningPathController::class, 'detachCourse'])
            ->name('learning-paths.courses.detach');
        Route::patch('learning-paths/{learning_path:id}/courses/reorder', [AdminLearningPathController::class, 'reorderCourses'])
            ->name('learning-paths.courses.reorder');

        Route::get('enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index');
        Route::get('enrollments/assign', [EnrollmentController::class, 'assignForm'])->name('enrollments.assign');
        Route::post('enrollments/assign/preview', [EnrollmentController::class, 'assignPreview'])->name('enrollments.assign.preview');
        Route::post('enrollments/assign/commit', [EnrollmentController::class, 'assignCommit'])->name('enrollments.assign.commit');

        Route::resource('assessments', AssessmentController::class)->except(['show']);
        Route::get('assessments/{assessment}', [AssessmentController::class, 'show'])->name('assessments.show');
        Route::post('assessments/{assessment}/questions', [AssessmentController::class, 'storeQuestion'])->name('assessments.questions.store');
        Route::patch('assessments/{assessment}/questions/{question}', [AssessmentController::class, 'updateQuestion'])->name('assessments.questions.update');
        Route::delete('assessments/{assessment}/questions/{question}', [AssessmentController::class, 'destroyQuestion'])->name('assessments.questions.destroy');
        Route::post('assessments/{assessment}/generate-questions', [AssessmentController::class, 'generateQuestions'])->name('assessments.questions.generate');
        Route::post('assessments/{assessment}/questions/bulk', [AssessmentController::class, 'bulkStoreQuestions'])->name('assessments.questions.bulk');

        Route::get('certificates', [CertificateController::class, 'index'])->name('certificates.index');
        Route::get('certificates/templates/create', [CertificateController::class, 'createTemplate'])->name('certificates.templates.create');
        Route::post('certificates/templates', [CertificateController::class, 'storeTemplate'])->name('certificates.templates.store');
        Route::post('certificates/bulk/revoke', [CertificateController::class, 'bulkRevoke'])->name('certificates.bulk.revoke');
        Route::post('certificates/bulk/reissue', [CertificateController::class, 'bulkReissue'])->name('certificates.bulk.reissue');
        Route::post('certificates/bulk/export', [CertificateController::class, 'bulkExport'])->name('certificates.bulk.export');
        Route::post('certificates/{certificate}/revoke', [CertificateController::class, 'revoke'])
            ->whereNumber('certificate')
            ->name('certificates.revoke');

        // B2B Subscription plans (Qubisa-style tier) + leads inbox
        Route::prefix('subscription-plans')->name('subscription-plans.')->group(function () {
            Route::get('/', [SubscriptionPlanController::class, 'index'])->name('index');
            Route::get('/create', [SubscriptionPlanController::class, 'create'])->name('create');
            Route::post('/', [SubscriptionPlanController::class, 'store'])->name('store');
            Route::get('/{plan}/edit', [SubscriptionPlanController::class, 'edit'])
                ->whereNumber('plan')
                ->name('edit');
            Route::patch('/{plan}', [SubscriptionPlanController::class, 'update'])
                ->whereNumber('plan')
                ->name('update');
            Route::delete('/{plan}', [SubscriptionPlanController::class, 'destroy'])
                ->whereNumber('plan')
                ->name('destroy');
        });
        Route::prefix('subscription-leads')->name('subscription-leads.')->group(function () {
            Route::get('/', [SubscriptionLeadController::class, 'index'])->name('index');
            Route::get('/{lead}', [SubscriptionLeadController::class, 'show'])
                ->whereNumber('lead')
                ->name('show');
            Route::patch('/{lead}', [SubscriptionLeadController::class, 'update'])
                ->whereNumber('lead')
                ->name('update');
        });

        // B2C subscription plans + subscribers
        Route::prefix('b2c-plans')->name('b2c-plans.')->group(function () {
            Route::get('/', [B2cPlanController::class, 'index'])->name('index');
            Route::get('/create', [B2cPlanController::class, 'create'])->name('create');
            Route::post('/', [B2cPlanController::class, 'store'])->name('store');
            Route::get('/{plan}/edit', [B2cPlanController::class, 'edit'])
                ->whereNumber('plan')
                ->name('edit');
            Route::patch('/{plan}', [B2cPlanController::class, 'update'])
                ->whereNumber('plan')
                ->name('update');
            Route::delete('/{plan}', [B2cPlanController::class, 'destroy'])
                ->whereNumber('plan')
                ->name('destroy');
        });
        Route::get('b2c-subscriptions', [B2cSubscriptionController::class, 'index'])
            ->name('b2c-subscriptions.index');

        // Organization e-wallets oversight
        Route::prefix('organization-wallets')->name('organization-wallets.')->group(function () {
            Route::get('/', [AdminOrganizationWalletController::class, 'index'])->name('index');
            Route::get('/{wallet}', [AdminOrganizationWalletController::class, 'show'])
                ->whereNumber('wallet')
                ->name('show');
            Route::post('/{wallet}/adjust', [AdminOrganizationWalletController::class, 'adjust'])
                ->whereNumber('wallet')
                ->name('adjust');
        });

        // Voucher (Qubisa-style access codes — single + bulk batches)
        Route::prefix('vouchers')->name('vouchers.')->group(function () {
            Route::get('/', [AdminVoucherController::class, 'index'])->name('index');
            Route::get('/create', [AdminVoucherController::class, 'create'])->name('create');
            Route::post('/', [AdminVoucherController::class, 'store'])->name('store');
            Route::get('/{voucher}', [AdminVoucherController::class, 'show'])
                ->whereNumber('voucher')
                ->name('show');
            Route::post('/{voucher}/toggle', [AdminVoucherController::class, 'toggle'])
                ->whereNumber('voucher')
                ->name('toggle');
            Route::delete('/{voucher}', [AdminVoucherController::class, 'destroy'])
                ->whereNumber('voucher')
                ->name('destroy');
        });
        Route::prefix('voucher-batches')->name('voucher-batches.')->group(function () {
            Route::get('/', [AdminVoucherBatchController::class, 'index'])->name('index');
            Route::get('/create', [AdminVoucherBatchController::class, 'create'])->name('create');
            Route::post('/', [AdminVoucherBatchController::class, 'store'])->name('store');
            Route::get('/{batch}', [AdminVoucherBatchController::class, 'show'])
                ->whereNumber('batch')
                ->name('show');
            Route::get('/{batch}/export', [AdminVoucherBatchController::class, 'export'])
                ->whereNumber('batch')
                ->name('export');
            Route::delete('/{batch}', [AdminVoucherBatchController::class, 'destroy'])
                ->whereNumber('batch')
                ->name('destroy');
        });

        // Point redemption marketplace (super admin / admin tenant)
        Route::prefix('point-redemptions')->name('point-redemptions.')->group(function () {
            Route::get('/', [PointRedemptionController::class, 'index'])->name('index');
            Route::get('/create', [PointRedemptionController::class, 'create'])->name('create');
            Route::post('/', [PointRedemptionController::class, 'store'])->name('store');
            Route::get('/{offer}/edit', [PointRedemptionController::class, 'edit'])
                ->whereNumber('offer')
                ->name('edit');
            Route::patch('/{offer}', [PointRedemptionController::class, 'update'])
                ->whereNumber('offer')
                ->name('update');
            Route::delete('/{offer}', [PointRedemptionController::class, 'destroy'])
                ->whereNumber('offer')
                ->name('destroy');
            Route::post('/redemptions/{redemption}/refund', [PointRedemptionController::class, 'refund'])
                ->whereNumber('redemption')
                ->name('refund');
        });

        Route::get('scorm-packages', [ScormPackageController::class, 'index'])->name('scorm-packages.index');
        Route::post('scorm-packages', [ScormPackageController::class, 'store'])->name('scorm-packages.store');
        Route::delete('scorm-packages/{scorm_package}', [ScormPackageController::class, 'destroy'])->name('scorm-packages.destroy');

        // ===== Marketplace =====
        Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
        Route::post('orders/{order}/cancel', [AdminOrderController::class, 'cancel'])->name('orders.cancel');

        Route::get('payments', [AdminPaymentController::class, 'index'])->name('payments.index');

        Route::get('reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
        Route::post('reviews/{review}/toggle', [AdminReviewController::class, 'toggle'])->name('reviews.toggle');
        Route::delete('reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

        // ===== Mentor (instructor) workspace =====
        Route::get('my-students', [MyStudentController::class, 'index'])->name('my-students.index');
        Route::get('my-profile', [MyProfileController::class, 'edit'])->name('my-profile.edit');
        Route::match(['put', 'post'], 'my-profile', [MyProfileController::class, 'update'])->name('my-profile.update');
        Route::get('my-earnings', [MyEarningController::class, 'index'])->name('my-earnings.index');
        Route::post('my-earnings/withdraw', [MyEarningController::class, 'withdraw'])->name('my-earnings.withdraw');

        // ===== Payout / Penarikan (admin/superadmin) =====
        Route::get('payouts', [PayoutController::class, 'index'])->name('payouts.index');
        Route::get('payouts/{payout}', [PayoutController::class, 'show'])->name('payouts.show');
        Route::post('payouts/{payout}/approve', [PayoutController::class, 'approve'])->name('payouts.approve');
        Route::post('payouts/{payout}/reject', [PayoutController::class, 'reject'])->name('payouts.reject');
        Route::post('payouts/{payout}/mark-paid', [PayoutController::class, 'markPaid'])->name('payouts.mark-paid');

        // ===== User Points (superadmin only) =====
        Route::get('user-points', [AdminUserPointController::class, 'index'])->name('user-points.index');
        Route::get('user-points/{user}', [AdminUserPointController::class, 'show'])
            ->whereNumber('user')
            ->name('user-points.show');

        // ===== Tenant Management (superadmin only) =====
        Route::get('tenants', [AdminTenantController::class, 'index'])->name('tenants.index');
        Route::get('tenants/{tenant}', [AdminTenantController::class, 'show'])->whereNumber('tenant')->name('tenants.show');
        Route::post('tenants/{tenant}/suspend', [AdminTenantController::class, 'suspend'])->whereNumber('tenant')->name('tenants.suspend');
        Route::post('tenants/{tenant}/activate', [AdminTenantController::class, 'activate'])->whereNumber('tenant')->name('tenants.activate');

        Route::get('instructors', [InstructorController::class, 'index'])->name('instructors.index');
        Route::get('instructors/{instructor}/cv', [InstructorController::class, 'downloadCv'])->name('instructors.cv.download');
        Route::get('instructors/{instructor}/edit', [InstructorController::class, 'edit'])->name('instructors.edit');
        Route::get('instructors/{instructor}', [InstructorController::class, 'show'])->whereNumber('instructor')->name('instructors.show');
        Route::put('instructors/{instructor}', [InstructorController::class, 'update'])->name('instructors.update');
        Route::post('instructors/{instructor}/toggle-verified', [InstructorController::class, 'toggleVerified'])->name('instructors.toggle-verified');
        Route::post('instructors/{instructor}/approve', [InstructorController::class, 'approve'])->name('instructors.approve');
        Route::post('instructors/{instructor}/reject', [InstructorController::class, 'reject'])->name('instructors.reject');

        // ===== Skill Matrix =====
        Route::get('skill-matrix', [SkillMatrixController::class, 'index'])->name('skill-matrix.index');

        Route::resource('positions', PositionController::class)->except(['show']);
        Route::resource('divisions', DivisionController::class)->except(['show']);
        Route::resource('competencies', CompetencyController::class)->except(['show']);

        Route::get('position-competency-targets', [PositionTargetController::class, 'index'])->name('position-competency-targets.index');
        Route::put('position-competency-targets/{position}', [PositionTargetController::class, 'update'])->name('position-competency-targets.update');

        Route::get('course-competency-mappings', [CourseMappingController::class, 'index'])->name('course-competency-mappings.index');
        Route::put('course-competency-mappings/{course}', [CourseMappingController::class, 'update'])->name('course-competency-mappings.update');

        Route::get('ojt-assessments', [OjtAssessmentController::class, 'index'])->name('ojt-assessments.index');
        Route::get('ojt-assessments/create', [OjtAssessmentController::class, 'create'])->name('ojt-assessments.create');
        Route::post('ojt-assessments', [OjtAssessmentController::class, 'store'])->name('ojt-assessments.store');
        Route::match(['post', 'patch'], 'ojt-assessments/{ojt_assessment}/status', [OjtAssessmentController::class, 'updateStatus'])->name('ojt-assessments.status');

        Route::get('supervisor-reviews', [SupervisorReviewController::class, 'index'])->name('supervisor-reviews.index');
        Route::get('supervisor-reviews/create', [SupervisorReviewController::class, 'create'])->name('supervisor-reviews.create');
        Route::post('supervisor-reviews', [SupervisorReviewController::class, 'store'])->name('supervisor-reviews.store');
        Route::match(['post', 'patch'], 'supervisor-reviews/{supervisor_review}/status', [SupervisorReviewController::class, 'updateStatus'])->name('supervisor-reviews.status');

        Route::get('skill-gaps', [SkillGapController::class, 'index'])->name('skill-gaps.index');
        Route::post('skill-gaps/recalculate', [SkillGapController::class, 'recalculate'])->name('skill-gaps.recalculate');
        Route::post('skill-gaps/{skillGap}/recommend-ai', [SkillGapController::class, 'recommendAi'])->name('skill-gaps.recommend-ai');

        Route::get('training-recommendations', [TrainingRecommendationController::class, 'index'])->name('training-recommendations.index');

        // ===== User Management =====
        Route::resource('users', UserController::class)->except(['show']);

        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
        Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::put('roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->name('roles.permissions');

        // ===== Reports =====
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('course-progress', [ReportController::class, 'courseProgress'])->name('course-progress');
            Route::get('course-progress/export.csv', [ReportController::class, 'exportCourseProgress'])->name('course-progress.export');
            Route::get('assessment', [ReportController::class, 'assessment'])->name('assessment');
            Route::get('assessment/export.csv', [ReportController::class, 'exportAssessment'])->name('assessment.export');
            Route::get('certificate', [ReportController::class, 'certificate'])->name('certificate');
            Route::get('certificate/export.csv', [ReportController::class, 'exportCertificate'])->name('certificate.export');
            Route::get('skill-gap', [ReportController::class, 'skillGap'])->name('skill-gap');
            Route::get('skill-gap/export.csv', [ReportController::class, 'exportSkillGap'])->name('skill-gap.export');
            Route::get('sales', [ReportController::class, 'sales'])->name('sales');
            Route::get('sales/export.csv', [ReportController::class, 'exportSales'])->name('sales.export');
        });

        // ===== Tenant Branding =====
        Route::get('tenant-branding', [TenantBrandingController::class, 'show'])->name('tenant-branding.show');
        Route::post('tenant-branding', [TenantBrandingController::class, 'update'])->name('tenant-branding.update');

        // ===== Audit Log =====
        Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');
        Route::get('audit-log/export.csv', [AuditLogController::class, 'export'])->name('audit-log.export');

        // ===== Settings =====
        Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::get('settings/legal/terms', [SettingsController::class, 'editLegalDocument'])
            ->defaults('document', 'terms')
            ->name('settings.legal.terms.edit');
        Route::post('settings/legal/terms', [SettingsController::class, 'updateLegalDocument'])
            ->defaults('document', 'terms')
            ->name('settings.legal.terms.update');
        Route::get('settings/legal/privacy', [SettingsController::class, 'editLegalDocument'])
            ->defaults('document', 'privacy')
            ->name('settings.legal.privacy.edit');
        Route::post('settings/legal/privacy', [SettingsController::class, 'updateLegalDocument'])
            ->defaults('document', 'privacy')
            ->name('settings.legal.privacy.update');
    });

require __DIR__.'/settings.php';
