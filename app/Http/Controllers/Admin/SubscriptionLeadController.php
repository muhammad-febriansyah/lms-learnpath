<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionLeadController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $leads = SubscriptionLead::query()
            ->with(['plan:id,name,code', 'assignee:id,name'])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('company_name', 'like', "%{$search}%")
                        ->orWhere('contact_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->toString(), function ($q, $status) {
                $q->where('status', $status);
            })
            ->latest('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (SubscriptionLead $l) => $this->present($l));

        $stats = [
            'new' => SubscriptionLead::where('status', 'new')->count(),
            'contacted' => SubscriptionLead::where('status', 'contacted')->count(),
            'qualified' => SubscriptionLead::where('status', 'qualified')->count(),
            'converted' => SubscriptionLead::where('status', 'converted')->count(),
            'lost' => SubscriptionLead::where('status', 'lost')->count(),
        ];

        return Inertia::render('admin/subscription-leads/index', [
            'leads' => $leads,
            'filters' => $request->only('search', 'status'),
            'stats' => $stats,
            'statuses' => SubscriptionLead::STATUSES,
        ]);
    }

    public function show(Request $request, SubscriptionLead $lead): Response
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $lead->load(['plan', 'assignee:id,name,email']);

        return Inertia::render('admin/subscription-leads/show', [
            'lead' => $this->present($lead, withMessage: true),
            'statuses' => SubscriptionLead::STATUSES,
        ]);
    }

    public function update(Request $request, SubscriptionLead $lead): RedirectResponse
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $data = $request->validate([
            'status' => ['required', Rule::in(SubscriptionLead::STATUSES)],
            'notes' => ['nullable', 'string', 'max:5000'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $update = [
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
            'assigned_to' => $data['assigned_to'] ?? null,
        ];

        if ($data['status'] !== SubscriptionLead::STATUS_NEW && $lead->contacted_at === null) {
            $update['contacted_at'] = now();
        }

        $lead->update($update);

        return back()->with('success', 'Status lead diperbarui.');
    }

    private function present(SubscriptionLead $l, bool $withMessage = false): array
    {
        return [
            'id' => $l->id,
            'company_name' => $l->company_name,
            'contact_name' => $l->contact_name,
            'email' => $l->email,
            'phone' => $l->phone,
            'employee_count' => $l->employee_count,
            'message' => $withMessage ? $l->message : null,
            'status' => $l->status,
            'source' => $l->source,
            'plan' => $l->plan ? [
                'id' => $l->plan->id,
                'name' => $l->plan->name,
                'code' => $l->plan->code,
            ] : null,
            'assignee' => $l->assignee ? [
                'id' => $l->assignee->id,
                'name' => $l->assignee->name,
            ] : null,
            'contacted_at' => $l->contacted_at?->toIso8601String(),
            'notes' => $withMessage ? $l->notes : null,
            'created_at' => $l->created_at?->toIso8601String(),
        ];
    }
}
