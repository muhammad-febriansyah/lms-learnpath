<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Rename roles to the 6-role tenant structure agreed with client.
     *
     * super_admin -> superadmin
     * admin       -> admin_tenant
     * student     -> employee  (with no org membership -> user_public)
     * + user_public (new)
     * hr, instructor, supervisor: kept as-is for now
     */
    public function up(): void
    {
        // 1) Rename existing role records in-place so user role pivots stay valid.
        DB::table('roles')->where('name', 'super_admin')->update(['name' => 'superadmin']);
        DB::table('roles')->where('name', 'admin')->update(['name' => 'admin_tenant']);
        DB::table('roles')->where('name', 'student')->update(['name' => 'employee']);

        // 2) Ensure the new public role exists.
        Role::findOrCreate('user_public', 'web');

        // 3) Auto-migrate: users in 'employee' WITHOUT organization_members move to 'user_public'.
        $employeeRoleId = DB::table('roles')->where('name', 'employee')->value('id');
        $userPublicRoleId = DB::table('roles')->where('name', 'user_public')->value('id');

        if ($employeeRoleId && $userPublicRoleId) {
            $usersWithoutOrg = DB::table('model_has_roles as mhr')
                ->leftJoin('organization_members as om', 'om.user_id', '=', 'mhr.model_id')
                ->where('mhr.role_id', $employeeRoleId)
                ->where('mhr.model_type', User::class)
                ->whereNull('om.id')
                ->pluck('mhr.model_id')
                ->unique()
                ->all();

            if (! empty($usersWithoutOrg)) {
                DB::table('model_has_roles')
                    ->whereIn('model_id', $usersWithoutOrg)
                    ->where('model_type', User::class)
                    ->where('role_id', $employeeRoleId)
                    ->update(['role_id' => $userPublicRoleId]);
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Reverse: merge user_public back into student, then rename roles back.
        $studentRoleId = DB::table('roles')->where('name', 'employee')->value('id');
        $userPublicRoleId = DB::table('roles')->where('name', 'user_public')->value('id');

        if ($studentRoleId && $userPublicRoleId) {
            DB::table('model_has_roles')
                ->where('role_id', $userPublicRoleId)
                ->update(['role_id' => $studentRoleId]);
            DB::table('roles')->where('id', $userPublicRoleId)->delete();
        }

        DB::table('roles')->where('name', 'employee')->update(['name' => 'student']);
        DB::table('roles')->where('name', 'admin_tenant')->update(['name' => 'admin']);
        DB::table('roles')->where('name', 'superadmin')->update(['name' => 'super_admin']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
