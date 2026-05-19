<?php

namespace App\Http\Controllers\Business;

use App\Models\Organization;
use Illuminate\Http\Request;

trait ResolvesOrganization
{
    public function resolveOrganization(Request $request): Organization
    {
        $org = $request->user()
            ?->organizations()
            ->wherePivot('role', 'admin')
            ->first();

        abort_unless($org, 403, 'Anda bukan admin organisasi.');

        return $org;
    }
}
