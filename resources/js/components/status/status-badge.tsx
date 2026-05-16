import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusKey =
    | 'draft'
    | 'published'
    | 'active'
    | 'in_progress'
    | 'completed'
    | 'failed'
    | 'expired'
    | 'locked'
    | 'passed'
    | 'not_started'
    | 'not_issued'
    | 'issued'
    | 'met'
    | 'gap'
    | 'exceeded'
    | 'no_data'
    | 'pending_review'
    | 'approved'
    | 'rejected';

type StatusBadgeProps = {
    status: StatusKey | string;
    className?: string;
};

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    published: 'Terbit',
    active: 'Aktif',
    in_progress: 'Sedang Berjalan',
    completed: 'Selesai',
    failed: 'Gagal',
    expired: 'Kedaluwarsa',
    locked: 'Terkunci',
    passed: 'Lulus',
    not_started: 'Belum Mulai',
    not_issued: 'Belum Terbit',
    issued: 'Terbit',
    met: 'Sesuai Target',
    gap: 'Ada Gap',
    exceeded: 'Melebihi Target',
    no_data: 'Belum Ada Data',
    pending_review: 'Menunggu Review',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

const STATUS_TONES: Record<string, string> = {
    draft: 'border-transparent bg-muted text-muted-foreground',
    published: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    active: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    in_progress: 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    completed: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    failed: 'border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
    expired: 'border-transparent bg-muted text-muted-foreground',
    locked: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    passed: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    not_started: 'border-transparent bg-muted text-muted-foreground',
    not_issued: 'border-transparent bg-muted text-muted-foreground',
    issued: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    met: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    gap: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    exceeded: 'border-transparent bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
    no_data: 'border-transparent bg-muted text-muted-foreground',
    pending_review: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    approved: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    rejected: 'border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const label = STATUS_LABELS[status] ?? status;
    const tone = STATUS_TONES[status] ?? 'border-transparent bg-muted text-muted-foreground';

    return <Badge className={cn(tone, className)}>{label}</Badge>;
}

export { STATUS_LABELS, STATUS_TONES };
