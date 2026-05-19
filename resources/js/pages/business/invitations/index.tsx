import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    FileSpreadsheet,
    Mail,
    RefreshCw,
    Send,
    Trash2,
    Upload,
    UserPlus,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { cn } from '@/lib/utils';

type Position = { id: number; name: string; division: string | null };
type DivisionOption = { id: number; name: string };

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
    divisions: DivisionOption[];
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

export default function InvitationsIndex({ invitations, organization, positions, divisions }: Props) {
    const pageProps = usePage<{ flash?: { bulk_preview?: PreviewPayload } }>().props;
    const [tab, setTab] = useState<Tab>(() =>
        pageProps.flash?.bulk_preview ? 'csv' : 'paste',
    );
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        if (pageProps.flash?.bulk_preview) {
            setTab('csv');
        }
    }, [pageProps.flash?.bulk_preview]);

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
                        {tab === 'paste' && <PasteForm positions={positions} divisions={divisions} />}
                        {tab === 'csv' && <CsvForm />}
                        {tab === 'direct' && <DirectCreateForm positions={positions} divisions={divisions} />}
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PasteForm({ positions, divisions }: { positions: Position[]; divisions: DivisionOption[] }) {
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

    const [chips, setChips] = useState<string[]>([]);
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Keep form.emails in sync so backend (newline-joined string) is satisfied.
    useEffect(() => {
        form.setData('emails', chips.join('\n'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chips]);

    const addEmails = (raw: string) => {
        const parts = raw
            .split(/[\s,;]+/)
            .map((s) => s.trim())
            .filter(Boolean);
        if (parts.length === 0) return;

        setChips((prev) => {
            const next = [...prev];
            for (const p of parts) {
                const lower = p.toLowerCase();
                if (!next.some((e) => e.toLowerCase() === lower)) {
                    next.push(p);
                }
            }
            return next;
        });
        setDraft('');
    };

    const removeChip = (email: string) => {
        setChips((prev) => prev.filter((e) => e !== email));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Enter', ',', ';', 'Tab'].includes(e.key) && draft.trim()) {
            e.preventDefault();
            addEmails(draft);
        } else if (e.key === 'Backspace' && draft === '' && chips.length > 0) {
            // Quick remove last chip on backspace when input is empty.
            e.preventDefault();
            setChips((prev) => prev.slice(0, -1));
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text');
        if (/[\s,;]/.test(text)) {
            e.preventDefault();
            addEmails(text);
        }
    };

    const handleBlur = () => {
        if (draft.trim()) {
            addEmails(draft);
        }
    };

    function submit(event: React.FormEvent) {
        event.preventDefault();
        // Commit any unconverted draft into chips before submitting.
        if (draft.trim()) {
            const finalChips = (() => {
                const parts = draft.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
                const next = [...chips];
                for (const p of parts) {
                    if (!next.some((e) => e.toLowerCase() === p.toLowerCase())) next.push(p);
                }
                return next;
            })();
            setChips(finalChips);
            setDraft('');
            form.setData('emails', finalChips.join('\n'));
        }
        form.transform((data) => ({
            ...data,
            position_id: data.position_id === '' ? null : Number(data.position_id),
        }));
        form.post('/business/invitations', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setChips([]);
                setDraft('');
            },
        });
    }

    const invalidCount = chips.filter((e) => !EMAIL_RE.test(e)).length;

    return (
        <form onSubmit={submit} className="space-y-4">
            <p className="text-[12px] text-slate-500">
                Ketik email lalu tekan <kbd className="rounded border border-slate-300 bg-slate-100 px-1 py-0.5 text-[10px] font-semibold">Enter</kbd> /
                {' '}<kbd className="rounded border border-slate-300 bg-slate-100 px-1 py-0.5 text-[10px] font-semibold">,</kbd> untuk menambah. Anda juga bisa paste banyak email sekaligus.
            </p>

            <div className="space-y-1.5">
                <RequiredLabel htmlFor="emails-input" required>
                    Email Karyawan {chips.length > 0 && <span className="text-slate-500">({chips.length})</span>}
                </RequiredLabel>

                <div
                    onClick={() => inputRef.current?.focus()}
                    className={cn(
                        'flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100',
                        invalidCount > 0 && 'border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-100',
                    )}
                >
                    {chips.map((email) => {
                        const valid = EMAIL_RE.test(email);
                        return (
                            <span
                                key={email}
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium',
                                    valid
                                        ? 'bg-brand-50 text-brand-700'
                                        : 'bg-rose-50 text-rose-700',
                                )}
                                title={valid ? email : `${email} (format tidak valid)`}
                            >
                                {email}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeChip(email);
                                    }}
                                    className={cn(
                                        'rounded-full p-0.5 transition hover:bg-white/80',
                                        valid ? 'text-brand-600 hover:text-brand-800' : 'text-rose-600 hover:text-rose-800',
                                    )}
                                    aria-label={`Hapus ${email}`}
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        );
                    })}
                    <input
                        ref={inputRef}
                        id="emails-input"
                        type="text"
                        autoComplete="off"
                        placeholder={chips.length === 0 ? 'andi@perusahaan.com' : ''}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        onBlur={handleBlur}
                        className="min-w-[140px] flex-1 border-0 bg-transparent px-1.5 py-1 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                </div>

                {invalidCount > 0 && (
                    <p className="text-[11.5px] text-rose-600">
                        {invalidCount} email memiliki format tidak valid (chip warna merah).
                    </p>
                )}
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
                    <Select
                        value={form.data.division === '' ? '__none__' : form.data.division}
                        onValueChange={(v) => form.setData('division', v === '__none__' ? '' : v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih divisi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">Tanpa divisi</SelectItem>
                            {divisions.map((d) => (
                                <SelectItem key={d.id} value={d.name}>
                                    {d.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    disabled={form.processing || (chips.length === 0 && !draft.trim())}
                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <Send className="mr-1.5 size-4" />
                    {form.processing
                        ? 'Mengirim...'
                        : chips.length > 0
                            ? `Kirim ${chips.length} Undangan`
                            : 'Kirim Undangan'}
                </Button>
            </div>
        </form>
    );
}

type PreviewRow = {
    row_number: number;
    email: string;
    name: string | null;
    employee_number: string | null;
    position_id: number | null;
    position_name: string | null;
    division: string | null;
    branch: string | null;
    status: 'ready' | 'skipped';
    reason: string | null;
};

type PreviewPayload = {
    token: string;
    rows: PreviewRow[];
    summary: { total: number; ready: number; skipped: number; seat_remaining: number };
};

function CsvForm() {
    const page = usePage<{ flash?: { bulk_preview?: PreviewPayload } }>();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<PreviewPayload | null>(null);
    const [readyOnly, setReadyOnly] = useState(false);

    const form = useForm<{ file: File | null }>({ file: null });
    const commitForm = useForm<{ token: string }>({ token: '' });

    useEffect(() => {
        const incoming = page.props.flash?.bulk_preview;
        if (incoming) {
            setPreview(incoming);
        }
    }, [page.props.flash?.bulk_preview]);

    function submitPreview(event: React.FormEvent) {
        event.preventDefault();
        if (!form.data.file) return;
        form.post('/business/invitations/bulk-preview', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    }

    function submitCommit() {
        if (!preview) return;
        commitForm.setData('token', preview.token);
        commitForm.transform(() => ({ token: preview.token }));
        commitForm.post('/business/invitations/bulk-commit', {
            preserveScroll: true,
            onSuccess: () => {
                setPreview(null);
                commitForm.reset();
            },
        });
    }

    if (preview) {
        const filtered = readyOnly
            ? preview.rows.filter((r) => r.status === 'ready')
            : preview.rows;
        return (
            <div className="space-y-4">
                <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="size-3.5" />
                    Pilih file lain
                </button>

                <div className="grid gap-3 sm:grid-cols-4">
                    <SummaryCard
                        label="Total baris"
                        value={preview.summary.total}
                        tone="slate"
                    />
                    <SummaryCard
                        label="Siap diimpor"
                        value={preview.summary.ready}
                        tone="emerald"
                    />
                    <SummaryCard
                        label="Dilewati"
                        value={preview.summary.skipped}
                        tone="amber"
                    />
                    <SummaryCard
                        label="Seat tersisa"
                        value={preview.summary.seat_remaining}
                        tone="brand"
                    />
                </div>

                {preview.summary.ready === 0 && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <span>
                            Tidak ada baris siap diimpor. Periksa kolom email, jabatan, atau
                            seat tersisa.
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-[12px] text-slate-600">
                        <input
                            type="checkbox"
                            className="size-3.5 rounded border-slate-300"
                            checked={readyOnly}
                            onChange={(e) => setReadyOnly(e.target.checked)}
                        />
                        Hanya tampilkan baris siap
                    </label>
                    <p className="text-[11px] text-slate-500">
                        Menampilkan {filtered.length} dari {preview.rows.length} baris
                    </p>
                </div>

                <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
                    <table className="w-full text-left text-[12px]">
                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-3 py-2">Baris</th>
                                <th className="px-3 py-2">Email</th>
                                <th className="px-3 py-2">Nama</th>
                                <th className="px-3 py-2">Jabatan</th>
                                <th className="px-3 py-2">Divisi</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((r) => (
                                <tr key={r.row_number} className="bg-white">
                                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">
                                        {r.row_number}
                                    </td>
                                    <td className="px-3 py-2 text-slate-900">
                                        {r.email || (
                                            <span className="text-slate-400">(kosong)</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {r.name || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {r.position_name || '-'}
                                        {r.position_name && !r.position_id && (
                                            <span className="ml-1 text-[10px] text-rose-600">
                                                (tidak ditemukan)
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {r.division || '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        {r.status === 'ready' ? (
                                            <Badge className="border-transparent bg-emerald-50 text-emerald-700 text-[10px] hover:bg-emerald-50">
                                                <CheckCircle2 className="mr-1 size-3" />
                                                Siap
                                            </Badge>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5">
                                                <Badge className="border-transparent bg-rose-50 text-rose-700 text-[10px] hover:bg-rose-50">
                                                    <X className="mr-1 size-3" />
                                                    Skip
                                                </Badge>
                                                <span className="text-[11px] text-slate-500">
                                                    {r.reason}
                                                </span>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPreview(null)}
                        disabled={commitForm.processing}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={submitCommit}
                        disabled={
                            commitForm.processing || preview.summary.ready === 0
                        }
                        className="rounded-xl bg-brand-600 hover:bg-brand-700"
                    >
                        <Send className="mr-1.5 size-4" />
                        {commitForm.processing
                            ? 'Memproses...'
                            : `Konfirmasi & Kirim (${preview.summary.ready})`}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={submitPreview} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-[12px] text-slate-500">
                    Upload file CSV dengan kolom:{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">
                        name, email, employee_number, position, division, branch
                    </code>
                    . Hanya kolom{' '}
                    <code className="font-mono text-[11px]">email</code> yang wajib.
                </p>
                <a
                    href="/business/invitations/bulk-template"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 hover:bg-slate-200"
                >
                    <Download className="size-3.5" />
                    Unduh template
                </a>
            </div>

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
                    Maksimal 2MB. Anda akan melihat preview sebelum undangan dikirim.
                </p>
            </div>

            <div className="flex items-center justify-end">
                <Button
                    type="submit"
                    disabled={form.processing || !form.data.file}
                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <Upload className="mr-1.5 size-4" />
                    {form.processing ? 'Memproses...' : 'Upload & Preview'}
                </Button>
            </div>
        </form>
    );
}

function SummaryCard({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'slate' | 'emerald' | 'amber' | 'brand';
}) {
    const tones = {
        slate: 'bg-slate-50 text-slate-900 ring-slate-200',
        emerald: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
        amber: 'bg-amber-50 text-amber-900 ring-amber-200',
        brand: 'bg-brand-50 text-brand-900 ring-brand-200',
    };
    return (
        <div className={cn('rounded-xl p-3 ring-1', tones[tone])}>
            <div className="text-[10.5px] font-bold uppercase tracking-wide opacity-70">
                {label}
            </div>
            <div className="mt-0.5 text-xl font-extrabold">{value}</div>
        </div>
    );
}

function DirectCreateForm({ positions, divisions }: { positions: Position[]; divisions: DivisionOption[] }) {
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
                        <Select
                            value={form.data.division === '' ? '__none__' : form.data.division}
                            onValueChange={(v) => form.setData('division', v === '__none__' ? '' : v)}
                        >
                            <SelectTrigger id="division">
                                <SelectValue placeholder="Pilih divisi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">Tanpa divisi</SelectItem>
                                {divisions.map((d) => (
                                    <SelectItem key={d.id} value={d.name}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                size="sm"
                                className="h-8 rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700"
                                title="Kirim ulang email"
                                onClick={resend}
                                disabled={resending}
                            >
                                <RefreshCw
                                    className={cn(
                                        'mr-1 size-3.5',
                                        resending && 'animate-spin',
                                    )}
                                />
                                Kirim Ulang
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 rounded-xl bg-slate-700 text-white shadow-sm hover:bg-slate-800"
                                title="Salin link undangan"
                                onClick={() => copyLink(invitation.invite_url)}
                            >
                                <Copy className="mr-1 size-3.5" />
                                Salin
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                                title="Batalkan undangan"
                                onClick={onDelete}
                            >
                                <Trash2 className="mr-1 size-3.5" />
                                Batalkan
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
