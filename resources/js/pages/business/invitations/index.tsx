import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Copy,
    FileSpreadsheet,
    Mail,
    RefreshCw,
    Send,
    Trash2,
    Upload,
    UserPlus,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Position = { id: number; name: string; division: string | null };

type Invitation = {
    id: number;
    email: string;
    name: string | null;
    role: string;
    employee_number: string | null;
    division: string | null;
    branch: string | null;
    position: { id: number; name: string } | null;
    token: string;
    invite_url: string;
    expires_at: string | null;
    last_sent_at: string | null;
    accepted_at: string | null;
    is_pending: boolean;
    is_expired: boolean;
    created_at: string | null;
};

type Props = {
    invitations: Paginator<Invitation>;
    organization: {
        name: string;
        seat_quota: number;
        seats_used: number;
        seats_available: number;
    };
    positions: Position[];
};

type Tab = 'paste' | 'csv' | 'direct';

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function InvitationsIndex({ invitations, organization, positions }: Props) {
    const [tab, setTab] = useState<Tab>('paste');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    return (
        <>
            <Head title="Undangan Karyawan" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/business/dashboard" className="hover:text-slate-700">
                            Dashboard Korporat
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Undangan</span>
                    </nav>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Mail className="size-6 text-brand-600" />
                        Undangan Karyawan
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Tersisa <b>{organization.seats_available}</b> seat dari{' '}
                        {organization.seat_quota} total.
                    </p>
                </div>

                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2">
                        <TabButton
                            active={tab === 'paste'}
                            onClick={() => setTab('paste')}
                            icon={<Mail className="size-4" />}
                            label="Paste Email"
                        />
                        <TabButton
                            active={tab === 'csv'}
                            onClick={() => setTab('csv')}
                            icon={<FileSpreadsheet className="size-4" />}
                            label="Upload CSV"
                        />
                        <TabButton
                            active={tab === 'direct'}
                            onClick={() => setTab('direct')}
                            icon={<UserPlus className="size-4" />}
                            label="Buat Akun Langsung"
                        />
                    </div>

                    <div className="p-5">
                        {tab === 'paste' && <PasteForm positions={positions} />}
                        {tab === 'csv' && <CsvForm />}
                        {tab === 'direct' && <DirectCreateForm positions={positions} />}
                    </div>
                </div>

                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="border-b border-slate-100 p-4">
                        <h2 className="text-[14px] font-bold text-slate-900">Daftar Undangan</h2>
                        <p className="mt-0.5 text-[12px] text-slate-500">
                            {invitations.total} undangan total
                        </p>
                    </div>

                    {invitations.data.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <Mail className="mx-auto mb-3 size-6 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Belum ada undangan
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Mulai undang karyawan menggunakan form di atas.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {invitations.data.map((i) => (
                                <InvitationRow
                                    key={i.id}
                                    invitation={i}
                                    onDelete={() => setDeleteId(i.id)}
                                />
                            ))}
                        </ul>
                    )}

                    {invitations.data.length > 0 && (
                        <div className="border-t border-slate-100 p-3">
                            <DataTablePagination paginator={invitations} />
                        </div>
                    )}
                </div>

                {deleteId !== null && (
                    <Confirm
                        title="Batalkan undangan?"
                        description="Link undangan akan tidak berlaku lagi. Anda bisa mengirim undangan baru kapan saja."
                        onConfirm={() => {
                            router.delete(`/business/invitations/${deleteId}`, {
                                preserveScroll: true,
                                onFinish: () => setDeleteId(null),
                            });
                        }}
                        onCancel={() => setDeleteId(null)}
                    />
                )}
            </div>
        </>
    );
}

function TabButton({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold transition',
                active
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100',
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function PasteForm({ positions }: { positions: Position[] }) {
    const form = useForm<{
        emails: string;
        position_id: string;
        division: string;
        branch: string;
    }>({
        emails: '',
        position_id: '',
        division: '',
        branch: '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            position_id: data.position_id === '' ? null : Number(data.position_id),
        }));
        form.post('/business/invitations', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <p className="text-[12px] text-slate-500">
                Paste daftar email karyawan (1 per baris, atau pisah dengan koma/titik koma). Email
                undangan otomatis terkirim via Mailketing.
            </p>

            <div className="space-y-1.5">
                <RequiredLabel htmlFor="emails" required>
                    Email Karyawan
                </RequiredLabel>
                <Textarea
                    id="emails"
                    rows={5}
                    placeholder={`andi@perusahaan.com\nbudi@perusahaan.com\ncici@perusahaan.com`}
                    value={form.data.emails}
                    onChange={(e) => form.setData('emails', e.target.value)}
                />
                <FieldError message={form.errors.emails} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                    <RequiredLabel>Jabatan (opsional)</RequiredLabel>
                    <Select
                        value={form.data.position_id}
                        onValueChange={(v) =>
                            form.setData('position_id', v === '__none__' ? '' : v)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">Tanpa jabatan</SelectItem>
                            {positions.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name}
                                    {p.division && (
                                        <span className="ml-1 text-slate-500">
                                            · {p.division}
                                        </span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError message={form.errors.position_id} />
                </div>

                <div className="space-y-1.5">
                    <RequiredLabel>Divisi (opsional)</RequiredLabel>
                    <Input
                        placeholder="Engineering"
                        value={form.data.division}
                        onChange={(e) => form.setData('division', e.target.value)}
                    />
                    <FieldError message={form.errors.division} />
                </div>

                <div className="space-y-1.5">
                    <RequiredLabel>Cabang (opsional)</RequiredLabel>
                    <Input
                        placeholder="Jakarta"
                        value={form.data.branch}
                        onChange={(e) => form.setData('branch', e.target.value)}
                    />
                    <FieldError message={form.errors.branch} />
                </div>
            </div>

            <div className="flex items-center justify-end">
                <Button
                    type="submit"
                    disabled={form.processing || !form.data.emails.trim()}
                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <Send className="mr-1.5 size-4" />
                    {form.processing ? 'Mengirim...' : 'Kirim Undangan'}
                </Button>
            </div>
        </form>
    );
}

function CsvForm() {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const form = useForm<{ file: File | null }>({ file: null });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!form.data.file) return;
        form.post('/business/invitations/bulk-upload', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <p className="text-[12px] text-slate-500">
                Upload file CSV dengan kolom:{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">
                    name, email, employee_number, position, division, branch
                </code>
                . Hanya kolom <code className="font-mono text-[11px]">email</code> yang wajib.
            </p>

            <div className="space-y-1.5">
                <RequiredLabel required>File CSV</RequiredLabel>
                <Input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                />
                <FieldError message={form.errors.file} />
                <p className="text-[11px] text-slate-500">
                    Maksimal 2MB. Position yang tidak cocok dengan master jabatan akan diabaikan.
                </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 font-mono text-[11px] text-slate-700">
                <div className="mb-1 font-bold text-slate-900">Contoh CSV:</div>
                name,email,employee_number,position,division,branch
                <br />
                Andi,andi@perusahaan.com,A001,Sales Rep,Sales,Jakarta
                <br />
                Budi,budi@perusahaan.com,B002,HR Officer,HR,Bandung
            </div>

            <div className="flex items-center justify-end">
                <Button
                    type="submit"
                    disabled={form.processing || !form.data.file}
                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <Upload className="mr-1.5 size-4" />
                    {form.processing ? 'Mengupload...' : 'Upload & Kirim'}
                </Button>
            </div>
        </form>
    );
}

function DirectCreateForm({ positions }: { positions: Position[] }) {
    const form = useForm<{
        name: string;
        email: string;
        phone: string;
        position_id: string;
        employee_number: string;
        division: string;
        branch: string;
    }>({
        name: '',
        email: '',
        phone: '',
        position_id: '',
        employee_number: '',
        division: '',
        branch: '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            position_id: data.position_id === '' ? null : Number(data.position_id),
        }));
        form.post('/business/members/direct-create', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                <b>Buat akun langsung</b> — sistem akan generate password sementara dan email akan
                langsung dikirim ke karyawan. Karyawan langsung bisa login tanpa accept link.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <RequiredLabel htmlFor="name" required>
                        Nama Lengkap
                    </RequiredLabel>
                    <Input
                        id="name"
                        placeholder="Andi Pratama"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                    <FieldError message={form.errors.name} />
                </div>

                <div className="space-y-1.5">
                    <RequiredLabel htmlFor="email" required>
                        Email
                    </RequiredLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="andi@perusahaan.com"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                    />
                    <FieldError message={form.errors.email} />
                </div>

                <div className="space-y-1.5">
                    <RequiredLabel htmlFor="phone">Nomor WhatsApp</RequiredLabel>
                    <Input
                        id="phone"
                        placeholder="081234567890"
                        value={form.data.phone}
                        onChange={(e) => form.setData('phone', e.target.value)}
                    />
                    <FieldError message={form.errors.phone} />
                </div>

                <div className="space-y-1.5">
                    <RequiredLabel htmlFor="employee_number">NIK / Nomor Karyawan</RequiredLabel>
                    <Input
                        id="employee_number"
                        placeholder="A001"
                        value={form.data.employee_number}
                        onChange={(e) => form.setData('employee_number', e.target.value)}
                    />
                    <FieldError message={form.errors.employee_number} />
                </div>

                <div className="space-y-1.5">
                    <RequiredLabel>Jabatan</RequiredLabel>
                    <Select
                        value={form.data.position_id}
                        onValueChange={(v) =>
                            form.setData('position_id', v === '__none__' ? '' : v)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">Tanpa jabatan</SelectItem>
                            {positions.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError message={form.errors.position_id} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <RequiredLabel htmlFor="division">Divisi</RequiredLabel>
                        <Input
                            id="division"
                            placeholder="Sales"
                            value={form.data.division}
                            onChange={(e) => form.setData('division', e.target.value)}
                        />
                        <FieldError message={form.errors.division} />
                    </div>
                    <div className="space-y-1.5">
                        <RequiredLabel htmlFor="branch">Cabang</RequiredLabel>
                        <Input
                            id="branch"
                            placeholder="Jakarta"
                            value={form.data.branch}
                            onChange={(e) => form.setData('branch', e.target.value)}
                        />
                        <FieldError message={form.errors.branch} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <Button
                    type="submit"
                    disabled={form.processing || !form.data.name.trim() || !form.data.email.trim()}
                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <UserPlus className="mr-1.5 size-4" />
                    {form.processing ? 'Membuat...' : 'Buat Akun & Kirim Password'}
                </Button>
            </div>
        </form>
    );
}

function InvitationRow({
    invitation,
    onDelete,
}: {
    invitation: Invitation;
    onDelete: () => void;
}) {
    const [resending, setResending] = useState(false);

    const copyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Link undangan disalin');
    };

    const resend = () => {
        setResending(true);
        router.post(
            `/business/invitations/${invitation.id}/resend`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setResending(false),
            },
        );
    };

    return (
        <li className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full',
                        invitation.accepted_at
                            ? 'bg-emerald-50 text-emerald-600'
                            : invitation.is_expired
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-50 text-amber-600',
                    )}
                >
                    {invitation.accepted_at ? (
                        <CheckCircle2 className="size-4" />
                    ) : invitation.is_expired ? (
                        <X className="size-4" />
                    ) : (
                        <Clock className="size-4" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-semibold text-slate-900">
                            {invitation.email}
                        </span>
                        {invitation.position && (
                            <Badge className="border-transparent bg-brand-50 text-brand-700 text-[10px] hover:bg-brand-50">
                                {invitation.position.name}
                            </Badge>
                        )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                        Dibuat {formatDate(invitation.created_at)}
                        {invitation.last_sent_at && (
                            <> · Dikirim {formatDate(invitation.last_sent_at)}</>
                        )}
                        {invitation.accepted_at
                            ? ` · Diterima ${formatDate(invitation.accepted_at)}`
                            : invitation.is_expired
                              ? ' · Kedaluwarsa'
                              : ` · Berlaku sampai ${formatDate(invitation.expires_at)}`}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        className={cn(
                            'border-transparent text-[10px]',
                            invitation.accepted_at
                                ? 'bg-emerald-50 text-emerald-700'
                                : invitation.is_expired
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-50 text-amber-700',
                        )}
                    >
                        {invitation.accepted_at
                            ? 'Diterima'
                            : invitation.is_expired
                              ? 'Expired'
                              : 'Pending'}
                    </Badge>
                    {!invitation.accepted_at && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                title="Kirim ulang email"
                                onClick={resend}
                                disabled={resending}
                            >
                                <RefreshCw
                                    className={cn(
                                        'size-4 text-slate-500',
                                        resending && 'animate-spin',
                                    )}
                                />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                title="Salin link undangan"
                                onClick={() => copyLink(invitation.invite_url)}
                            >
                                <Copy className="size-4 text-slate-500" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                title="Batalkan undangan"
                                onClick={onDelete}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </li>
    );
}

function Confirm({
    title,
    description,
    onConfirm,
    onCancel,
}: {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-[16px] font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-[13px] text-slate-600">{description}</p>
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Ya, batalkan
                    </Button>
                </div>
            </div>
        </div>
    );
}
