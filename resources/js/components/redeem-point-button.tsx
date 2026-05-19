import { Link, router } from '@inertiajs/react';
import { AlertCircle, Coins, Flame, LogIn } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type PointOffer = {
    id: number;
    redeemable_type: 'course' | 'bundle' | 'learning_path' | string;
    redeemable_id: number;
    point_price: number;
    redeemable_from: string | null;
    redeemable_until: string | null;
    max_per_user: number | null;
    remaining_quota: number | null;
    user_points: number;
    eligible: boolean;
    ineligible_reason:
        | 'login_required'
        | 'not_started'
        | 'expired'
        | 'sold_out'
        | 'limit_reached'
        | 'insufficient'
        | null;
};

const REASON_COPY: Record<NonNullable<PointOffer['ineligible_reason']>, string> = {
    login_required: 'Login dulu untuk menukar poin.',
    not_started: 'Penawaran belum dimulai.',
    expired: 'Penawaran sudah berakhir.',
    sold_out: 'Kuota tukar poin habis.',
    limit_reached: 'Kamu sudah pernah menukar penawaran ini.',
    insufficient: 'Poinmu belum cukup untuk menukar.',
};

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n);
}

function formatDate(iso: string | null): string | null {
    if (!iso) {
        return null;
    }
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

type Props = {
    offer: PointOffer | null;
    label: string;
    fullWidth?: boolean;
    disabled?: boolean;
};

export function RedeemPointButton({
    offer,
    label,
    fullWidth = false,
    disabled = false,
}: Props) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    if (!offer) {
        return null;
    }

    const reason = offer.ineligible_reason;
    const deficit = Math.max(0, offer.point_price - offer.user_points);
    const formattedPrice = formatNumber(offer.point_price);
    const startDate = formatDate(offer.redeemable_from);
    const endDate = formatDate(offer.redeemable_until);

    if (reason === 'login_required') {
        return (
            <Link
                href="/login"
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-[13px] font-semibold text-amber-800 transition hover:bg-amber-100',
                    fullWidth && 'w-full',
                )}
            >
                <LogIn className="size-4" />
                Login untuk Tukar {formattedPrice} Poin
            </Link>
        );
    }

    const performRedeem = () => {
        setProcessing(true);
        router.post(
            '/redemptions',
            {
                redeemable_type: offer.redeemable_type,
                redeemable_id: offer.redeemable_id,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setOpen(false);
                },
            },
        );
    };

    return (
        <>
            <Button
                type="button"
                onClick={() => setOpen(true)}
                disabled={!offer.eligible || disabled}
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-gradient-to-br from-amber-400 to-amber-500 px-4 py-2.5 text-[13px] font-bold text-amber-950 shadow-sm transition hover:from-amber-500 hover:to-amber-600 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-500',
                    fullWidth && 'w-full',
                )}
            >
                <Coins className="size-4" />
                {offer.eligible
                    ? `${label} ${formattedPrice} Poin`
                    : reason
                      ? REASON_COPY[reason]
                      : 'Tidak tersedia'}
            </Button>

            {reason === 'insufficient' && deficit > 0 && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] text-rose-600">
                    <AlertCircle className="size-3" />
                    Kurang <strong>{formatNumber(deficit)}</strong> poin lagi
                </p>
            )}

            {offer.remaining_quota !== null && offer.remaining_quota <= 10 && offer.eligible && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-rose-600">
                    <Flame className="size-3" />
                    Tersisa {offer.remaining_quota} kuota!
                </p>
            )}

            <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Coins className="size-5 text-amber-500" />
                            Konfirmasi Tukar Poin
                        </DialogTitle>
                        <DialogDescription>
                            Tukar <strong>{formattedPrice} poin</strong> untuk akses item ini?
                            Aksi ini tidak bisa dibatalkan sendiri — hubungi admin untuk
                            refund jika perlu.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-[12.5px] text-slate-700">
                        <div className="flex justify-between">
                            <span>Saldo poin saat ini</span>
                            <strong className="tabular-nums">
                                {formatNumber(offer.user_points)}
                            </strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Dipotong</span>
                            <strong className="tabular-nums text-rose-600">
                                -{formattedPrice}
                            </strong>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2">
                            <span>Sisa setelah tukar</span>
                            <strong className="tabular-nums">
                                {formatNumber(
                                    Math.max(0, offer.user_points - offer.point_price),
                                )}
                            </strong>
                        </div>
                        {(startDate || endDate) && (
                            <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                                Periode: {startDate ?? '∞'} → {endDate ?? '∞'}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={performRedeem}
                            disabled={processing}
                            className="bg-amber-500 text-amber-950 hover:bg-amber-600"
                        >
                            {processing ? 'Memproses...' : 'Tukar Sekarang'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
