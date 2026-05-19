import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Mail, Phone, Save, Users } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Lead = {
    id: number;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string | null;
    employee_count: number | null;
    message: string | null;
    status: string;
    plan: { id: number; name: string; code: string } | null;
    assignee: { id: number; name: string } | null;
    contacted_at: string | null;
    notes: string | null;
    created_at: string | null;
};

type Props = {
    lead: Lead;
    statuses: string[];
};

const STATUS_LABEL: Record<string, string> = {
    new: 'Baru',
    contacted: 'Dihubungi',
    qualified: 'Qualified',
    converted: 'Closed Won',
    lost: 'Closed Lost',
};

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '-';
    }
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function LeadShow({ lead, statuses }: Props) {
    const form = useForm({
        status: lead.status,
        notes: lead.notes ?? '',
        assigned_to: (lead.assignee?.id ?? '') as number | '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch(`/admin/subscription-leads/${lead.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Lead ${lead.company_name}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/subscription-leads"
                            className="hover:text-slate-700"
                        >
                            Lead Subscription
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {lead.company_name}
                        </span>
                    </nav>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-4">
                        {/* Company info */}
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <div className="flex items-start gap-3">
                                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                                    <Building2 className="size-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                                        {lead.company_name}
                                    </h2>
                                    <p className="mt-0.5 text-[12.5px] text-slate-500">
                                        Submitted {formatDateTime(lead.created_at)}
                                    </p>
                                </div>
                                {lead.plan && (
                                    <Badge variant="outline" className="font-mono text-[10.5px]">
                                        Plan: {lead.plan.name}
                                    </Badge>
                                )}
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <InfoRow
                                    icon={Mail}
                                    label="Email"
                                    value={
                                        <a
                                            href={`mailto:${lead.email}`}
                                            className="text-brand-600 hover:underline"
                                        >
                                            {lead.email}
                                        </a>
                                    }
                                />
                                {lead.phone && (
                                    <InfoRow
                                        icon={Phone}
                                        label="Telepon"
                                        value={
                                            <a
                                                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-brand-600 hover:underline"
                                            >
                                                {lead.phone}
                                            </a>
                                        }
                                    />
                                )}
                                <InfoRow
                                    icon={Building2}
                                    label="Nama Kontak"
                                    value={lead.contact_name}
                                />
                                {lead.employee_count && (
                                    <InfoRow
                                        icon={Users}
                                        label="Jumlah Karyawan"
                                        value={`${lead.employee_count.toLocaleString('id-ID')} orang`}
                                    />
                                )}
                            </div>

                            {lead.message && (
                                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-[13px]">
                                    <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Pesan dari Klien
                                    </div>
                                    <p className="whitespace-pre-wrap text-slate-700">
                                        {lead.message}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action sidebar */}
                    <aside className="space-y-3">
                        <form
                            onSubmit={submit}
                            className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                        >
                            <h3 className="text-[14px] font-bold text-slate-900">
                                Status & Catatan Sales
                            </h3>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={form.data.status}
                                        onValueChange={(v) => form.setData('status', v)}
                                    >
                                        <SelectTrigger id="status" className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {STATUS_LABEL[s] ?? s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Catatan Internal</Label>
                                    <Textarea
                                        id="notes"
                                        rows={5}
                                        value={form.data.notes}
                                        onChange={(e) =>
                                            form.setData('notes', e.target.value)
                                        }
                                        placeholder="Hasil call, kebutuhan klien, follow-up plan..."
                                        maxLength={5000}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Save className="mr-1.5 size-4" />
                                    {form.processing ? 'Menyimpan...' : 'Update Status'}
                                </Button>
                            </div>

                            {lead.contacted_at && (
                                <div className="mt-4 border-t border-slate-100 pt-3 text-[11.5px] text-slate-500">
                                    Dihubungi pertama: {formatDateTime(lead.contacted_at)}
                                </div>
                            )}
                        </form>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/admin/subscription-leads">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali ke Inbox
                            </Link>
                        </Button>
                    </aside>
                </div>
            </div>
        </>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Mail;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    {label}
                </div>
                <div className="text-[13px] font-semibold text-slate-900">{value}</div>
            </div>
        </div>
    );
}
