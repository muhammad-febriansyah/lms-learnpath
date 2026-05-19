import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    FileText,
    GraduationCap,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Pencil,
    Phone,
    ShieldCheck,
    ShieldOff,
    Sparkles,
    Twitter,
    User as UserIcon,
    Users,
    XCircle,
    Youtube,
} from 'lucide-react';
import { useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Cv = {
    original_name: string | null;
    uploaded_at: string | null;
    download_url: string;
};

type Profile = {
    headline: string | null;
    bio: string | null;
    expertise: string[];
    photo_path: string | null;
    social_links: Record<string, string>;
    website: string | null;
    is_verified: boolean;
    is_active: boolean;
    updated_at: string | null;
    cv: Cv | null;
} | null;

type Instructor = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: 'active' | 'pending_approval' | 'rejected' | 'suspended';
    avatar: string | null;
    created_at: string | null;
    email_verified_at: string | null;
    profile: Profile;
};

type Course = {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    thumbnail: string | null;
    level: string | null;
    is_published: boolean;
    review_status: string | null;
    enrollments_count: number;
    created_at: string | null;
};

type Stats = {
    total_courses: number;
    published_courses: number;
    draft_courses: number;
    total_enrollments: number;
};

type Props = {
    instructor: Instructor;
    courses: Course[];
    stats: Stats;
};

const STATUS_META: Record<
    Instructor['status'],
    { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
    active: {
        label: 'Aktif',
        tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
        icon: CheckCircle2,
    },
    pending_approval: {
        label: 'Menunggu Approval',
        tone: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
        icon: Clock,
    },
    rejected: {
        label: 'Ditolak',
        tone: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
        icon: XCircle,
    },
    suspended: {
        label: 'Disuspend',
        tone: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/30',
        icon: ShieldOff,
    },
};

const SOCIAL_META: Record<
    string,
    { label: string; icon: typeof Linkedin; prefix?: string }
> = {
    linkedin: {
        label: 'LinkedIn',
        icon: Linkedin,
        prefix: 'https://linkedin.com/in/',
    },
    instagram: {
        label: 'Instagram',
        icon: Instagram,
        prefix: 'https://instagram.com/',
    },
    youtube: { label: 'YouTube', icon: Youtube, prefix: 'https://youtube.com/' },
    twitter: { label: 'Twitter', icon: Twitter, prefix: 'https://twitter.com/' },
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function photoUrl(path: string | null | undefined): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
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

function socialUrl(key: string, value: string): string {
    if (value.startsWith('http')) return value;
    const prefix = SOCIAL_META[key]?.prefix ?? '';
    return prefix + value.replace(/^@/, '');
}

export default function InstructorShow({
    instructor,
    courses,
    stats,
}: Props) {
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejecting, setRejecting] = useState(false);

    const profile = instructor.profile;
    const status = STATUS_META[instructor.status];
    const StatusIcon = status.icon;
    const isPending = instructor.status === 'pending_approval';
    const isVerified = !!profile?.is_verified;

    const approve = () => {
        if (
            !window.confirm(
                `Setujui pendaftaran mentor ${instructor.name}?`,
            )
        )
            return;
        router.post(
            `/admin/instructors/${instructor.id}/approve`,
            {},
            { preserveScroll: true },
        );
    };

    const submitReject = () => {
        setRejecting(true);
        router.post(
            `/admin/instructors/${instructor.id}/reject`,
            { reason: rejectReason },
            {
                preserveScroll: true,
                onFinish: () => {
                    setRejecting(false);
                    setRejectOpen(false);
                    setRejectReason('');
                },
            },
        );
    };

    const toggleVerified = () => {
        router.post(
            `/admin/instructors/${instructor.id}/toggle-verified`,
            {},
            { preserveScroll: true },
        );
    };

    const photo = photoUrl(profile?.photo_path ?? instructor.avatar);
    const socials = Object.entries(profile?.social_links ?? {}).filter(
        ([, v]) => v && v.trim() !== '',
    );

    return (
        <>
            <Head title={`Instruktur · ${instructor.name}`} />

            <div className="space-y-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-neutral-400">
                    <Link
                        href="/admin/dashboard"
                        className="transition hover:text-slate-700 dark:hover:text-neutral-200"
                    >
                        Dashboard
                    </Link>
                    <IconChevR size={12} className="text-slate-300" />
                    <Link
                        href="/admin/instructors"
                        className="transition hover:text-slate-700 dark:hover:text-neutral-200"
                    >
                        Instruktur
                    </Link>
                    <IconChevR size={12} className="text-slate-300" />
                    <span className="font-semibold text-slate-900 dark:text-neutral-100">
                        {instructor.name}
                    </span>
                </nav>

                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-6 text-white shadow-[0_10px_40px_-20px_rgba(15,23,42,0.5)] sm:p-8 dark:from-neutral-950 dark:via-neutral-950 dark:to-brand-950">
                    <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-brand-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-32 size-72 rounded-full bg-brand-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-5">
                            <Avatar className="size-20 shrink-0 ring-4 ring-white/10 sm:size-24">
                                {photo && (
                                    <AvatarImage
                                        src={photo}
                                        alt={instructor.name}
                                    />
                                )}
                                <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-[20px] font-bold text-white">
                                    {initials(instructor.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wider ring-1 ring-inset backdrop-blur',
                                            status.tone,
                                        )}
                                    >
                                        <StatusIcon className="size-3" />
                                        {status.label}
                                    </span>
                                    {isVerified && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-400/20 px-2.5 py-1 text-[11px] font-semibold text-sky-100 ring-1 ring-inset ring-sky-300/30 backdrop-blur">
                                            <BadgeCheck className="size-3.5" />
                                            Terverifikasi
                                        </span>
                                    )}
                                </div>

                                <h1 className="mt-3 flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                    {instructor.name}
                                </h1>
                                <p className="mt-1 text-[13.5px] text-white/70">
                                    {profile?.headline ?? (
                                        <span className="italic">
                                            Headline belum diisi
                                        </span>
                                    )}
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-white/60">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail className="size-3.5" />
                                        {instructor.email}
                                    </span>
                                    {instructor.phone && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone className="size-3.5" />
                                            {instructor.phone}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar className="size-3.5" />
                                        Bergabung{' '}
                                        {formatDate(instructor.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-start gap-2 lg:shrink-0">
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-xl border-white/15 bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 hover:text-white"
                            >
                                <Link href="/admin/instructors">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Kembali
                                </Link>
                            </Button>

                            {isPending ? (
                                <>
                                    <Button
                                        onClick={approve}
                                        className="rounded-xl bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600"
                                    >
                                        <CheckCircle2 className="mr-1.5 size-4" />
                                        Setujui
                                    </Button>
                                    <Button
                                        onClick={() => setRejectOpen(true)}
                                        variant="outline"
                                        className="rounded-xl border-rose-300/30 bg-rose-500/10 text-rose-100 ring-1 ring-rose-300/20 backdrop-blur transition hover:bg-rose-500/20 hover:text-white"
                                    >
                                        <XCircle className="mr-1.5 size-4" />
                                        Tolak
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={toggleVerified}
                                        variant="outline"
                                        className={cn(
                                            'rounded-xl backdrop-blur transition',
                                            isVerified
                                                ? 'border-amber-300/30 bg-amber-500/15 text-amber-100 ring-1 ring-amber-300/30 hover:bg-amber-500/25 hover:text-white'
                                                : 'border-sky-300/30 bg-sky-500/15 text-sky-100 ring-1 ring-sky-300/30 hover:bg-sky-500/25 hover:text-white',
                                        )}
                                    >
                                        {isVerified ? (
                                            <>
                                                <ShieldOff className="mr-1.5 size-4" />
                                                Cabut Verifikasi
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="mr-1.5 size-4" />
                                                Verifikasi
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        asChild
                                        className="rounded-xl bg-brand-500 text-white shadow-sm transition hover:bg-brand-600"
                                    >
                                        <Link
                                            href={`/admin/instructors/${instructor.id}/edit`}
                                        >
                                            <Pencil className="mr-1.5 size-4" />
                                            Edit Profil
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <QuickStat
                            icon={<BookOpen className="size-4" />}
                            label="Total Course"
                            value={stats.total_courses.toString()}
                            emphasis
                        />
                        <QuickStat
                            icon={<Sparkles className="size-4" />}
                            label="Terpublikasi"
                            value={stats.published_courses.toString()}
                        />
                        <QuickStat
                            icon={<FileText className="size-4" />}
                            label="Draft"
                            value={stats.draft_courses.toString()}
                        />
                        <QuickStat
                            icon={<Users className="size-4" />}
                            label="Enrollment"
                            value={stats.total_enrollments.toLocaleString(
                                'id-ID',
                            )}
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    {/* Main */}
                    <div className="min-w-0 space-y-5">
                        <Card
                            title="Tentang"
                            icon={<UserIcon className="size-4" />}
                        >
                            {profile?.bio ? (
                                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-neutral-300">
                                    {profile.bio}
                                </p>
                            ) : (
                                <EmptyHint text="Belum ada bio." />
                            )}
                        </Card>

                        <Card
                            title="Bidang Keahlian"
                            icon={<Sparkles className="size-4" />}
                            badge={
                                (profile?.expertise.length ?? 0) > 0
                                    ? `${profile?.expertise.length}`
                                    : undefined
                            }
                        >
                            {profile && profile.expertise.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.expertise.map((tag) => (
                                        <Badge
                                            key={tag}
                                            className="border-transparent bg-gradient-to-br from-brand-50 to-brand-50 px-3 py-1 text-[12px] font-semibold text-brand-700 ring-1 ring-brand-100 dark:from-brand-500/15 dark:to-brand-500/15 dark:text-brand-200 dark:ring-brand-500/20"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <EmptyHint text="Belum ada bidang keahlian." />
                            )}
                        </Card>

                        <Card
                            title="Course yang Dibuat"
                            icon={<GraduationCap className="size-4" />}
                            badge={
                                stats.total_courses > 0
                                    ? `${stats.total_courses} course`
                                    : undefined
                            }
                        >
                            {courses.length === 0 ? (
                                <EmptyHint text="Instruktur ini belum membuat course." />
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
                                    {courses.map((c) => (
                                        <li
                                            key={c.id}
                                            className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex min-w-0 items-start gap-3">
                                                {c.thumbnail ? (
                                                    <img
                                                        src={photoUrl(
                                                            c.thumbnail,
                                                        )}
                                                        alt={c.title}
                                                        className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-neutral-800"
                                                    />
                                                ) : (
                                                    <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-50 to-brand-50 text-brand-600 ring-1 ring-brand-100 dark:from-brand-500/15 dark:to-brand-500/15 dark:text-brand-300 dark:ring-brand-500/20">
                                                        <BookOpen className="size-5" />
                                                    </span>
                                                )}
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/admin/courses/${c.id}`}
                                                        className="text-[13.5px] font-bold break-words text-slate-900 transition hover:text-brand-700 dark:text-neutral-100 dark:hover:text-brand-300"
                                                    >
                                                        {c.title}
                                                    </Link>
                                                    {c.subtitle && (
                                                        <p className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-500 dark:text-neutral-400">
                                                            {c.subtitle}
                                                        </p>
                                                    )}
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                        <Badge
                                                            className={cn(
                                                                'px-1.5 py-0 text-[10.5px] font-semibold',
                                                                c.is_published
                                                                    ? 'border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                                    : 'border-transparent bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300',
                                                            )}
                                                        >
                                                            {c.is_published
                                                                ? 'Terbit'
                                                                : 'Draft'}
                                                        </Badge>
                                                        {c.level && (
                                                            <Badge className="border-transparent bg-sky-50 px-1.5 py-0 text-[10.5px] font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                                                                {c.level}
                                                            </Badge>
                                                        )}
                                                        <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-500 dark:text-neutral-400">
                                                            <Users className="size-3" />
                                                            {c.enrollments_count.toLocaleString(
                                                                'id-ID',
                                                            )}{' '}
                                                            siswa
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right text-[11px] text-slate-400 dark:text-neutral-500">
                                                {formatDate(c.created_at)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-5">
                        <Card
                            title="Kontak & Web"
                            icon={<Mail className="size-4" />}
                        >
                            <dl className="space-y-3 text-[12.5px]">
                                <ContactRow
                                    icon={<Mail className="size-3.5" />}
                                    label="Email"
                                    value={instructor.email}
                                />
                                <ContactRow
                                    icon={<Phone className="size-3.5" />}
                                    label="Telepon"
                                    value={instructor.phone}
                                />
                                <ContactRow
                                    icon={<MapPin className="size-3.5" />}
                                    label="Website"
                                    value={profile?.website ?? null}
                                    href={profile?.website ?? undefined}
                                />
                            </dl>

                            {socials.length > 0 && (
                                <>
                                    <div className="my-4 border-t border-slate-100 dark:border-neutral-800" />
                                    <div className="flex flex-wrap gap-2">
                                        {socials.map(([key, value]) => {
                                            const meta =
                                                SOCIAL_META[key] ?? {
                                                    label: key,
                                                    icon: ExternalLink,
                                                };
                                            const Icn = meta.icon;
                                            return (
                                                <a
                                                    key={key}
                                                    href={socialUrl(key, value)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-brand-950/30"
                                                >
                                                    <Icn className="size-3.5" />
                                                    {meta.label}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </Card>

                        <Card
                            title="Curriculum Vitae"
                            icon={<FileText className="size-4" />}
                        >
                            {profile?.cv ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 rounded-xl bg-slate-50/70 p-3 ring-1 ring-slate-100 dark:bg-neutral-900/40 dark:ring-neutral-800">
                                        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-rose-50 to-orange-50 text-rose-600 ring-1 ring-rose-100 dark:from-rose-500/15 dark:to-orange-500/15 dark:text-rose-300 dark:ring-rose-500/20">
                                            <FileText className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[12.5px] font-bold text-slate-900 dark:text-neutral-100">
                                                {profile.cv.original_name ??
                                                    'CV.pdf'}
                                            </div>
                                            <div className="text-[10.5px] text-slate-500 dark:text-neutral-400">
                                                Diunggah{' '}
                                                {formatDate(
                                                    profile.cv.uploaded_at,
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full rounded-xl"
                                    >
                                        <a
                                            href={profile.cv.download_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Download className="mr-1.5 size-4" />
                                            Unduh CV
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <EmptyHint text="Belum ada CV diunggah." />
                            )}
                        </Card>

                        <Card
                            title="Aktivitas Akun"
                            icon={<Clock className="size-4" />}
                        >
                            <ol className="relative space-y-3.5 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-slate-200 dark:before:bg-neutral-800">
                                <Timeline
                                    label="Bergabung"
                                    value={formatDateTime(instructor.created_at)}
                                    tone="slate"
                                />
                                <Timeline
                                    label="Email diverifikasi"
                                    value={formatDateTime(
                                        instructor.email_verified_at,
                                    )}
                                    tone={
                                        instructor.email_verified_at
                                            ? 'emerald'
                                            : 'slate'
                                    }
                                />
                                <Timeline
                                    label="Profil diperbarui"
                                    value={formatDateTime(
                                        profile?.updated_at ?? null,
                                    )}
                                    tone="slate"
                                />
                            </ol>
                        </Card>
                    </aside>
                </div>
            </div>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak pendaftaran mentor?</DialogTitle>
                        <DialogDescription>
                            Beri alasan (opsional). Pendaftar akan mendapat
                            notifikasi penolakan.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Alasan penolakan (opsional, max 500 karakter)"
                        maxLength={500}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={submitReject}
                            disabled={rejecting}
                        >
                            {rejecting ? 'Memproses...' : 'Tolak Pendaftaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Card({
    title,
    icon,
    badge,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    badge?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:ring-neutral-800">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="inline-flex items-center gap-2 text-[14.5px] font-bold text-slate-900 dark:text-neutral-100">
                    {icon && (
                        <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                            {icon}
                        </span>
                    )}
                    {title}
                </h2>
                {badge && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-semibold tracking-wider text-slate-600 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                        {badge}
                    </span>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
}

function QuickStat({
    icon,
    label,
    value,
    emphasis,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div
            className={cn(
                'min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur',
                emphasis && 'bg-white/10',
            )}
        >
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wider text-white/60 uppercase">
                {icon}
                {label}
            </div>
            <div
                className={cn(
                    'mt-1 truncate text-[16px] font-bold text-white tabular-nums',
                    emphasis && 'text-[18px]',
                )}
            >
                {value}
            </div>
        </div>
    );
}

function ContactRow({
    icon,
    label,
    value,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | null;
    href?: string;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400">
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <dt className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase dark:text-neutral-500">
                    {label}
                </dt>
                <dd className="font-medium break-words text-slate-900 dark:text-neutral-100">
                    {value ? (
                        href ? (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 transition hover:text-brand-700 dark:hover:text-brand-300"
                            >
                                {value}
                                <ExternalLink className="size-3" />
                            </a>
                        ) : (
                            value
                        )
                    ) : (
                        <span className="text-slate-400 italic dark:text-neutral-500">
                            -
                        </span>
                    )}
                </dd>
            </div>
        </div>
    );
}

function Timeline({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: 'slate' | 'emerald' | 'amber';
}) {
    const toneClass =
        tone === 'emerald'
            ? 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-500/20'
            : tone === 'amber'
              ? 'bg-amber-500 ring-amber-100 dark:ring-amber-500/20'
              : 'bg-slate-300 ring-slate-100 dark:bg-neutral-700 dark:ring-neutral-800';
    return (
        <li className="relative pl-6">
            <span
                className={cn(
                    'absolute top-1.5 left-0 size-3.5 rounded-full ring-4',
                    toneClass,
                )}
            />
            <dt className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase dark:text-neutral-500">
                {label}
            </dt>
            <dd className="text-[12.5px] font-medium text-slate-900 dark:text-neutral-100">
                {value}
            </dd>
        </li>
    );
}

function EmptyHint({ text }: { text: string }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-[12.5px] text-slate-500 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400">
            {text}
        </div>
    );
}
