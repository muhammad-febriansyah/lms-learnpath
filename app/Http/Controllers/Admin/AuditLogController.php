<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Support\CsvDownload;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless(
            $user?->hasAnyRole(['superadmin', 'admin_tenant']),
            403,
            'Hanya superadmin / admin tenant yang boleh melihat audit log.',
        );

        $query = AuditLog::query()
            ->with('user:id,name,email');

        // Tenant scoping: admin_tenant only sees their own tenant; superadmin sees all.
        if (! $user->hasRole('superadmin')) {
            $tenantId = $user->organizations()->value('organizations.id');
            $query->where('tenant_id', $tenantId);
        }

        if ($action = $request->string('action')->toString()) {
            $query->where('action', 'like', "{$action}%");
        }
        if ($search = $request->string('search')->toString()) {
            $query->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }
        if ($from = $request->string('from')->toString()) {
            $query->where('created_at', '>=', $from);
        }
        if ($to = $request->string('to')->toString()) {
            $query->where('created_at', '<=', $to.' 23:59:59');
        }

        $logs = $query->latest('id')
            ->paginate(30)
            ->withQueryString();

        $logs->getCollection()->transform(fn (AuditLog $log) => [
            'id' => $log->id,
            'action' => $log->action,
            'subject_type' => $log->subject_type,
            'subject_id' => $log->subject_id,
            'changes' => $log->changes,
            'ip' => $log->ip,
            'user' => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name, 'email' => $log->user->email] : null,
            'created_at' => $log->created_at?->toIso8601String(),
        ]);

        $actionCounts = AuditLog::query()
            ->when(! $user->hasRole('superadmin'), function ($q) use ($user) {
                $q->where('tenant_id', $user->organizations()->value('organizations.id'));
            })
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(fn ($r) => ['action' => $r->action, 'count' => (int) $r->count]);

        return Inertia::render('admin/audit-log/index', [
            'logs' => $logs,
            'filters' => [
                'action' => $request->string('action')->toString() ?: null,
                'search' => $request->string('search')->toString() ?: null,
                'from' => $request->string('from')->toString() ?: null,
                'to' => $request->string('to')->toString() ?: null,
            ],
            'topActions' => $actionCounts,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless(
            $user?->hasAnyRole(['superadmin', 'admin_tenant']),
            403,
            'Hanya superadmin / admin tenant yang boleh export audit log.',
        );

        $query = AuditLog::query()->with('user:id,name,email');

        if (! $user->hasRole('superadmin')) {
            $tenantId = $user->organizations()->value('organizations.id');
            $query->where('tenant_id', $tenantId);
        }

        if ($action = $request->string('action')->toString()) {
            $query->where('action', 'like', "{$action}%");
        }
        if ($search = $request->string('search')->toString()) {
            $query->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }
        if ($from = $request->string('from')->toString()) {
            $query->where('created_at', '>=', $from);
        }
        if ($to = $request->string('to')->toString()) {
            $query->where('created_at', '<=', $to.' 23:59:59');
        }

        $rows = $query->latest('id')->cursor()->map(fn (AuditLog $log) => [
            $log->id,
            (string) ($log->created_at?->toIso8601String() ?? ''),
            $log->action,
            (string) ($log->user?->name ?? ''),
            (string) ($log->user?->email ?? ''),
            $log->subject_type ? $log->subject_type.'#'.$log->subject_id : '',
            (string) ($log->ip ?? ''),
            (string) ($log->user_agent ?? ''),
            $log->changes ? json_encode($log->changes, JSON_UNESCAPED_UNICODE) : '',
        ]);

        $stamp = now()->format('Y-m-d');

        return CsvDownload::stream(
            "audit-log-{$stamp}.csv",
            ['ID', 'Waktu', 'Action', 'User', 'Email', 'Subject', 'IP', 'User Agent', 'Changes (JSON)'],
            $rows,
        );
    }
}
