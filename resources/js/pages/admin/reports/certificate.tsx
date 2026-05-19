import { Head, Link } from '@inertiajs/react';
import { Award, Ban, Calendar, ShieldCheck } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { DateRangeFilter } from '@/components/reports/date-range-filter';
import { ExportCsvButton } from '@/components/reports/export-csv-button';
import { cn } from '@/lib/utils';

type Range = { from: string; to: string; from_iso: string; to_iso: string };

type Totals = {
    issued: number;
    active: number;
    revoked: number;
    expiring_soon: number;
};

type CourseRow = {
    course_id: number;
    title: string | null;
    thumbnail: string | null;
    cert_count: number;
    active_count: number;
};

type MonthRow = { month: string; c: number };

type Props = {
    range: Range;
    totals: Totals;
    perCourse: CourseRow[];
    byMonth: MonthRow[];
};

function thumbUrl(path: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

function formatMonth(month: string): string {
    const [y, m] = month.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

export default function CertificateReport({ range, totals, perCourse, byMonth }: Props) {
    const maxMonthCount = Math.max(1, ...byMonth.map((m) => m.c));

    return (
        <>
            <Head title="Certificate Report" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="text-slate-500">Reports</span>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Certificate</span>
                    </nav>
                    <div className="mt-1.5 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Certificate Report
                            </h1>
                            <p className="mt-1 text-[13.5px] text-slate-500">
                                Statistik penerbitan sertifikat lulus course.
                            </p>
                        </div>
                        <ExportCsvButton
                            href="/admin/reports/certificate/export.csv"
                            params={{ from: range.from, to: range.to }}
                        />
                    </div>
                </div>

                <DateRangeFilter from={range.from} to={range.to} basePath="/admin/reports/certificate" />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Diterbitkan" value={totals.issued.toLocaleString('id-ID')} icon={Award} tint="bg-brand-50" text="text-brand-600" hint="Periode terpilih" />
                    <StatCard label="Aktif" value={totals.active.toLocaleString('id-ID')} icon={ShieldCheck} tint="bg-emerald-50" text="text-emerald-600" hint="Total semua periode" />
                    <StatCard label="Dicabut" value={totals.revoked.toLocaleString('id-ID')} icon={Ban} tint="bg-rose-50" text="text-rose-600" hint="Total semua periode" />
                    <StatCard label="Akan Expired" value={totals.expiring_soon.toLocaleString('id-ID')} icon={Calendar} tint="bg-amber-50" text="text-amber-600" hint="30 hari ke depan" />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[14px] font-bold text-slate-900">Tren Penerbitan per Bulan</h2>
                        {byMonth.length === 0 ? (
                            <p className="py-8 text-center text-[12.5px] text-slate-500">
                                Belum ada sertifikat diterbitkan pada periode ini.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {byMonth.map((row) => (
                                    <div key={row.month} className="flex items-center gap-3">
                                        <div className="w-20 shrink-0 text-[11.5px] font-semibold text-slate-600">
                                            {formatMonth(row.month)}
                                        </div>
                                        <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-slate-50">
                                            <div
                                                className="h-full rounded-lg bg-gradient-to-r from-brand-500 to-brand-500"
                                                style={{ width: `${(row.c / maxMonthCount) * 100}%` }}
                                            />
                                            <span className="absolute inset-y-0 right-2 inline-flex items-center text-[11.5px] font-bold tabular-nums text-slate-900">
                                                {row.c.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[14px] font-bold text-slate-900">Per Course</h2>
                        {perCourse.length === 0 ? (
                            <div className="py-8 text-center">
                                <Award className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">Belum ada data</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {perCourse.map((row) => (
                                    <li key={row.course_id} className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'h-10 w-14 shrink-0 overflow-hidden rounded-lg',
                                                !row.thumbnail && 'bg-gradient-to-br from-brand-400 to-brand-500',
                                            )}
                                            style={
                                                row.thumbnail
                                                    ? {
                                                          backgroundImage: `url(${thumbUrl(row.thumbnail)})`,
                                                          backgroundSize: 'cover',
                                                          backgroundPosition: 'center',
                                                      }
                                                    : undefined
                                            }
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[12.5px] font-semibold text-slate-900">
                                                {row.title ?? '-'}
                                            </div>
                                            <div className="text-[10.5px] text-slate-500">
                                                {row.active_count} aktif · {row.cert_count - row.active_count} dicabut
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[15px] font-extrabold text-slate-900 tabular-nums leading-none">
                                                {row.cert_count}
                                            </div>
                                            <div className="mt-0.5 text-[10px] text-slate-500">sertifikat</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    tint,
    text,
    hint,
}: {
    label: string;
    value: string;
    icon: typeof Award;
    tint: string;
    text: string;
    hint?: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">{label}</div>
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">{value}</div>
                    {hint && <div className="text-[10px] text-slate-400">{hint}</div>}
                </div>
            </div>
        </div>
    );
}
