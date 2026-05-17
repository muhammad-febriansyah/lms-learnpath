<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->with(['roles:id,name'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->when($request->string('role')->toString(), function ($query, $role) {
                $query->whereHas('roles', fn ($q) => $q->where('name', $role));
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only('search', 'role', 'status'),
            'roleOptions' => Role::query()->orderBy('name')->get(['id', 'name']),
            'stats' => [
                'total' => User::count(),
                'active' => User::where('status', 'active')->count(),
                'suspended' => User::where('status', 'suspended')->count(),
                'banned' => User::where('status', 'banned')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        abort_unless(request()->user()?->can('user.create'), 403);

        return Inertia::render('admin/users/form', [
            'user' => null,
            'roleOptions' => Role::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'username' => $data['username'] ?? null,
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'status' => $data['status'],
            'email_verified_at' => now(),
        ]);

        $user->syncRoles([$data['role']]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User berhasil ditambahkan.');
    }

    public function edit(User $user): Response
    {
        abort_unless(request()->user()?->can('user.update'), 403);

        $user->load('roles:id,name');

        return Inertia::render('admin/users/form', [
            'user' => [
                ...$user->toArray(),
                'role' => $user->roles->first()?->name,
            ],
            'roleOptions' => Role::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'username' => $data['username'] ?? null,
            'phone' => $data['phone'] ?? null,
            'status' => $data['status'],
        ];

        if (! empty($data['password'])) {
            $payload['password'] = $data['password'];
        }

        $user->update($payload);
        $user->syncRoles([$data['role']]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->can('user.delete'), 403);

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        if ($user->hasRole('superadmin')) {
            return back()->with('error', 'Super Admin tidak dapat dihapus.');
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
