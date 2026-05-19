<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Set all existing instructors to pending_approval so admin must re-approve.
     * Instructors with instructor_profiles.is_verified=true are considered already
     * vetted, so keep them active.
     */
    public function up(): void
    {
        $instructorRoleId = DB::table('roles')
            ->where('name', 'instructor')
            ->where('guard_name', 'web')
            ->value('id');

        if (! $instructorRoleId) {
            return;
        }

        $instructorIds = DB::table('model_has_roles')
            ->where('role_id', $instructorRoleId)
            ->where('model_type', User::class)
            ->pluck('model_id')
            ->all();

        if (empty($instructorIds)) {
            return;
        }

        $verifiedIds = DB::table('instructor_profiles')
            ->whereIn('user_id', $instructorIds)
            ->where('is_verified', true)
            ->pluck('user_id')
            ->all();

        $pendingIds = array_diff($instructorIds, $verifiedIds);

        if (! empty($pendingIds)) {
            DB::table('users')
                ->whereIn('id', $pendingIds)
                ->update(['status' => 'pending_approval']);
        }
    }

    public function down(): void
    {
        // Not reversible — restore to 'active' for any pending_approval users.
        DB::table('users')
            ->where('status', 'pending_approval')
            ->update(['status' => 'active']);
    }
};
