import { Head, Link } from '@inertiajs/react';
import { AlertCircle, BookOpen, CheckCircle2, Lightbulb } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RecCourse = {
    id: number | null;
    title: string | null;
    slug: string | null;
    thumbnail: string | null;
    price: number;
    weight: number;
    target_level_impact: number;
};

type Recommendation = {
    gap_id: number;
    user: { id: number; name: string; email: string } | null;
    position: { id: number; name: string } | null;
    competency: { id: number; name: string; category: string | null } | null;
    target_level: number;
    actual_level: number;
    gap: number;
    courses: RecCourse[];
};

type Props = {
    recommendations: Recommendation[];
    stats: { gap_total: number; with_course: number; without_course: number };
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function thumbUrl(path: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

export default function TrainingRecommendationsIndex({ recommendations, stats }: Props) {
    return (
        <>
            <Head title="Rekomendasi Training" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Rekomendasi Training</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Rekomendasi Training
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Saran kursus untuk setiap skill gap yang teridentifikasi, diurutkan berdasarkan
                        gap terbesar.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard label="Total Gap" value={stats.gap_total} icon={AlertCircle} tint="bg-rose-50" text="text-rose-600" />
                    <StatCard label="Ada Course" value={stats.with_course} icon={CheckCircle2} tint="bg-emerald-50" text="text-emerald-600" />
                    <StatCard label="Belum Ada Course" value={stats.without_course} icon={BookOpen} tint="bg-amber-50" text="text-amber-600" />
                </div>

                {recommendations.length === 0 ? (
                    <div className="rounded-2xl bg-card p-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <Lightbulb className="mx-auto mb-3 size-8 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-900">
                            Belum ada gap teridentifikasi
                        </p>
                        <p className="mt-1 text-[12.5px] text-slate-500">
                            Hitung dulu skill gap di{' '}
                            <Link href="/admin/skill-gaps" className="text-brand-600 hover:underline">
                                halaman Skill Gap
                            </Link>
                            .
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recommendations.map((rec) => (
                            <div
                                key={rec.gap_id}
                                className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-[13px] font-bold text-slate-900">
                                            {rec.user?.name}
                                        </div>
                                        <div className="mt-0.5 text-[11.5px] text-slate-500">
                                            {rec.position?.name ?? '-'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                                                Kompetensi
                                            </div>
                                            <div className="text-[13px] font-semibold text-slate-900">
                                                {rec.competency?.name}
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-rose-50 px-3 py-1.5">
                                            <div className="text-[10px] tracking-wider text-rose-700">
                                                GAP
                                            </div>
                                            <div className="text-[16px] font-extrabold text-rose-700 tabular-nums leading-none">
                                                -{rec.gap}
                                            </div>
                                        </div>
                                        <div className="text-right text-[12px] text-slate-600">
                                            <div>Target: <b>{rec.target_level}</b></div>
                                            <div>Aktual: <b>{rec.actual_level}</b></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    {rec.courses.length === 0 ? (
                                        <div className="rounded-xl bg-amber-50 px-4 py-3 text-[12.5px] text-amber-800">
                                            Belum ada course yang di-map ke kompetensi ini.{' '}
                                            <Link
                                                href={`/admin/course-competency-mappings`}
                                                className="font-semibold underline"
                                            >
                                                Atur mapping
                                            </Link>
                                            .
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mb-2 text-[11px] tracking-wider text-slate-500 uppercase">
                                                Course direkomendasikan
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                {rec.courses.map((c) => (
                                                    <Link
                                                        key={c.id}
                                                        href={`/courses/${c.slug}`}
                                                        className="flex gap-3 rounded-xl bg-slate-50/60 p-3 transition-colors hover:bg-slate-100"
                                                    >
                                                        <div
                                                            className={cn(
                                                                'h-14 w-20 shrink-0 overflow-hidden rounded-lg',
                                                                !c.thumbnail && 'bg-gradient-to-br from-brand-400 to-brand-500',
                                                            )}
                                                            style={
                                                                c.thumbnail
                                                                    ? {
                                                                          backgroundImage: `url(${thumbUrl(c.thumbnail)})`,
                                                                          backgroundSize: 'cover',
                                                                          backgroundPosition: 'center',
                                                                      }
                                                                    : undefined
                                                            }
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="line-clamp-2 text-[12.5px] font-semibold text-slate-900">
                                                                {c.title}
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-2 text-[10.5px]">
                                                                <Badge className="border-transparent bg-brand-50 px-1.5 py-0 text-brand-700">
                                                                    Bobot {c.weight}
                                                                </Badge>
                                                                <span className="text-slate-500">
                                                                    Lv {c.target_level_impact}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 text-[11px] font-bold text-slate-900">
                                                                {c.price > 0 ? formatRupiah(c.price) : 'Gratis'}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
}: {
    label: string;
    value: number;
    icon: typeof AlertCircle;
    tint: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">{label}</div>
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">
                        {value.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
}
