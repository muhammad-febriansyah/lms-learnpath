import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    CheckCircle2,
    Hourglass,
    Send,
    Upload,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'approved' | 'rejected' | 'paid';

type Payout = {
    id: number;
    user: { id: number; name: string; email: string } | null;
    gross_amount: number;
    fee_amount: number;
    net_amount: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
    status: Status;
    admin_note: string | null;
    reject_reason: string | null;
    proof_url: string | null;
    reviewer: { id: number; name: string } | null;
    reviewed_at: string | null;
    paid_at: string | null;
    created_at: string | null;
};

type Props = {
    payout: Payout;
};

const STATUS_META: Record<Status, { label: string; tint: string; icon: typeof Hourglass }> = {
    pending: { label: 'Menunggu', tint: 'bg-amber-50 text-amber-700', icon: Hourglass },
    approved: { label: 'Disetujui', tint: 'bg-sky-50 text-sky-700', icon: CheckCircle2 },
    rejected: { label: 'Ditolak', tint: 'bg-rose-50 text-rose-700', icon: XCircle },
    paid: { label: 'Lunas', tint: 'bg-emerald-50 text-emerald-700', icon: Banknote },
};

function rupiah(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID');
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PayoutShow({ payout }: Props) {
    const meta = STATUS_META[payout.status];
    const Icon = meta.icon;
    const canAct = payout.status === 'pending' || payout.status === 'approved';

    return (
        <>
            <Head title={`Penarikan #${payout.id}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/payouts" className="hover:text-slate-700">
                            Penarikan
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">#{payout.id}</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Penarikan #{payout.id}
                            </h1>
                            <p className="mt-1 text-[13.5px] text-slate-500">
                                Diajukan {formatDateTime(payout.created_at)}
                            </p>
                        </div>
                        <Link
                            href="/admin/payouts"
                            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 hover:text-brand-600"
                        >
                            <ArrowLeft className="size-3.5" />
                            Kembali ke daftar
                        </Link>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    {/* Main column */}
                    <div className="space-y-5">
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <Badge className={cn('border-transparent text-[11px]', meta.tint)}>
                                    <Icon className="mr-1 size-3" />
                                    {meta.label}
                                </Badge>
                                <div className="text-right">
                                    <div className="text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">
                                        Jumlah Penarikan
                                    </div>
                                    <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                                        {rupiah(payout.gross_amount)}
                                    </div>
                                </div>
                            </div>

                            {payout.fee_amount > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-[12.5px] ring-1 ring-slate-200">
                                    <div>
                                        <div className="text-slate-500">Fee tarik</div>
                                        <div className="font-bold text-rose-600">
                                            − {rupiah(payout.fee_amount)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Instruktur terima</div>
                                        <div className="font-bold text-emerald-700">
                                            {rupiah(payout.net_amount)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h2 className="text-[14px] font-bold text-slate-900">
                                Tujuan Transfer
                            </h2>
                            <div className="mt-3 space-y-2 text-[13px]">
                                <Row label="Bank" value={payout.bank_name} />
                                <Row label="Nomor Rekening" value={payout.account_number} mono />
                                <Row label="Atas Nama" value={payout.account_holder} />
                            </div>
                        </div>

                        {payout.reject_reason && (
                            <div className="rounded-2xl bg-rose-50 p-4 text-[13px] text-rose-800 ring-1 ring-rose-200">
                                <b>Alasan ditolak:</b> {payout.reject_reason}
                            </div>
                        )}

                        {payout.admin_note && !payout.reject_reason && (
                            <div className="rounded-2xl bg-slate-50 p-4 text-[13px] text-slate-700 ring-1 ring-slate-200">
                                <b>Catatan admin:</b> {payout.admin_note}
                            </div>
                        )}

                        {payout.proof_url && (
                            <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <h2 className="text-[14px] font-bold text-slate-900">Bukti Transfer</h2>
                                <a
                                    href={payout.proof_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 block overflow-hidden rounded-xl ring-1 ring-slate-200"
                                >
                                    <img
                                        src={payout.proof_url}
                                        alt="Bukti transfer"
                                        className="max-h-[400px] w-full object-contain bg-slate-50"
                                    />
                                </a>
                                <p className="mt-2 text-[11.5px] text-slate-500">
                                    Klik untuk buka ukuran asli.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right column: instructor info + actions */}
                    <div className="space-y-5">
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h2 className="text-[14px] font-bold text-slate-900">Instruktur</h2>
                            <div className="mt-3 space-y-1">
                                <div className="text-[14px] font-bold text-slate-900">
                                    {payout.user?.name ?? '—'}
                                </div>
                                <div className="text-[12.5px] text-slate-500">
                                    {payout.user?.email}
                                </div>
                            </div>
                        </div>

                        {payout.reviewer && (
                            <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <h2 className="text-[14px] font-bold text-slate-900">
                                    Riwayat Aksi
                                </h2>
                                <div className="mt-3 space-y-2 text-[12.5px]">
                                    <Row label="Direview oleh" value={payout.reviewer.name} />
                                    <Row label="Direview pada" value={formatDateTime(payout.reviewed_at)} />
                                    {payout.paid_at && (
                                        <Row label="Lunas pada" value={formatDateTime(payout.paid_at)} />
                                    )}
                                </div>
                            </div>
                        )}

                        {canAct && (
                            <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <h2 className="text-[14px] font-bold text-slate-900">Aksi Admin</h2>
                                <div className="mt-3 space-y-2">
                                    {payout.status === 'pending' && (
                                        <ApproveButton payoutId={payout.id} />
                                    )}
                                    <MarkPaidButton payoutId={payout.id} />
                                    <RejectButton payoutId={payout.id} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11.5px] text-slate-500">{label}</span>
            <span className={cn('text-right text-slate-900', mono ? 'font-mono' : 'font-semibold')}>
                {value}
            </span>
        </div>
    );
}

function ApproveButton({ payoutId }: { payoutId: number }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ admin_note: '' });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(`/admin/payouts/${payoutId}/approve`, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-sky-600 hover:bg-sky-700">
                    <CheckCircle2 className="mr-1.5 size-4" />
                    Setujui
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Setujui Penarikan</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                    <p className="text-[13px] text-slate-600">
                        Setelah disetujui, dana siap untuk ditransfer. Anda akan upload bukti
                        transfer setelahnya.
                    </p>
                    <div>
                        <Label htmlFor="admin_note">Catatan (opsional)</Label>
                        <Textarea
                            id="admin_note"
                            rows={3}
                            value={form.data.admin_note}
                            onChange={(e) => form.setData('admin_note', e.target.value)}
                        />
                        <FieldError message={form.errors.admin_note} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-sky-600 hover:bg-sky-700">
                            Setujui
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function MarkPaidButton({ payoutId }: { payoutId: number }) {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<{ proof: File | null; admin_note: string }>({
        proof: null,
        admin_note: '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(`/admin/payouts/${payoutId}/mark-paid`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                setPreview(null);
                form.reset();
            },
        });
    }

    const handleFile = (file: File | null) => {
        form.setData('proof', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Send className="mr-1.5 size-4" />
                    Tandai Lunas + Upload Bukti
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tandai Lunas</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <p className="text-[13px] text-slate-600">
                        Unggah bukti transfer untuk menandai penarikan ini sebagai sudah lunas.
                    </p>

                    <div>
                        <Label>Bukti transfer (gambar)</Label>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                        />
                        <div
                            onClick={() => inputRef.current?.click()}
                            className="mt-1 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-brand-300 hover:bg-brand-50/40"
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="mx-auto max-h-40 rounded-lg"
                                />
                            ) : (
                                <>
                                    <Upload className="mx-auto mb-2 size-6 text-slate-400" />
                                    <p className="text-[12.5px] font-semibold text-slate-700">
                                        Klik untuk pilih file
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        PNG / JPG / WEBP, maks 2 MB
                                    </p>
                                </>
                            )}
                        </div>
                        <FieldError message={form.errors.proof} />
                    </div>

                    <div>
                        <Label htmlFor="admin_note_paid">Catatan (opsional)</Label>
                        <Textarea
                            id="admin_note_paid"
                            rows={2}
                            value={form.data.admin_note}
                            onChange={(e) => form.setData('admin_note', e.target.value)}
                        />
                        <FieldError message={form.errors.admin_note} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || !form.data.proof}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {form.processing ? 'Mengupload...' : 'Tandai Lunas'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function RejectButton({ payoutId }: { payoutId: number }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ reject_reason: '' });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(`/admin/payouts/${payoutId}/reject`, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700">
                    <XCircle className="mr-1.5 size-4" />
                    Tolak
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tolak Penarikan</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <Label htmlFor="reject_reason">Alasan penolakan</Label>
                        <Textarea
                            id="reject_reason"
                            rows={4}
                            placeholder="Tuliskan alasan agar instruktur paham..."
                            value={form.data.reject_reason}
                            onChange={(e) => form.setData('reject_reason', e.target.value)}
                        />
                        <FieldError message={form.errors.reject_reason} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            Tolak Permintaan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
