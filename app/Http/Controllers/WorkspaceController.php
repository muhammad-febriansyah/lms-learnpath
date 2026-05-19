<?php

namespace App\Http\Controllers;

use App\Services\WorkspaceManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function switch(Request $request, WorkspaceManager $manager): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user, 403);

        $data = $request->validate([
            'role' => ['required', 'string'],
        ]);

        if (! $manager->switchRole($user, $data['role'])) {
            return back()->with('error', 'Role workspace tidak tersedia untuk akun ini.');
        }

        return back()->with('success', 'Workspace berhasil diganti.');
    }
}
