import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, Lightbulb } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Course = {
    id: number | null;
    title: string | null;
    subtitle: string | null;
    slug: string | null;
    thumbnail: string | null;
    price: number;
};

type Recommendation = {
    gap_id: number;
    competency: { name: string | null; category: string | null };
    target_level: number;
    actual_level: number;
    gap: number;
    courses: Course[];
};

type Props = {
    recommendations: Recommendation[];
    position: { id: number; name: string; division: string | null } | null;
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

export default function MyRecommendations({ recommendations, position }: Props) {
    return (
        <>
            <Head title="Rekomendasi Training" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Rekomendasi Training</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Rekomendasi Training Untuk Saya
                    </h1>
                    {position && (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-slate-500">
                            <Briefcase className="size-3.5" />
                            Disesuaikan dengan jabatan: {position.name}
                        </p>
                    )}
                </div>

                {recommendations.length === 0 ? (
                    <div className="rounded-2xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-200">
                        <Lightbulb className="mx-auto mb-3 size-8 text-emerald-600" />
                        <p className="text-sm font-bold text-emerald-900">
                            Tidak ada gap kompetensi saat ini.
                        </p>
                        <p className="mt-1 text-[12.5px] text-emerald-700">
                            Semua target jabatan Anda sudah terpenuhi. Lanjutkan ke level berikutnya
                            dengan course advanced!
                        </p>
                        <Button asChild className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/courses">Lihat Katalog</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recommendations.map((rec) => (
                            <div
                                key={rec.gap_id}
                                className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-[14px] font-bold text-slate-900">
                                            {rec.competency.name}
                                        </div>
                                        {rec.competency.category && (
                                            <Badge className="mt-1 border-transparent bg-violet-50 px-1.5 py-0 text-[10.5px] font-semibold text-violet-700">
                                                {rec.competency.category}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] font-bold tabular-nums">
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                                            Target {rec.target_level}
                                        </span>
                                        <ArrowRight className="size-3 text-slate-400" />
                                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-rose-700">
                                            Anda {rec.actual_level}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    {rec.courses.length === 0 ? (
                                        <p className="rounded-xl bg-amber-50 px-4 py-3 text-[12.5px] text-amber-800">
                                            Belum ada course yang tersedia untuk kompetensi ini. Mintalah HR
                                            menambah course terkait.
                                        </p>
                                    ) : (
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {rec.courses.map((c) => (
                                                <Link
                                                    key={c.id}
                                                    href={`/courses/${c.slug}`}
                                                    className="group flex flex-col overflow-hidden rounded-xl bg-slate-50/60 transition-shadow hover:shadow-md"
                                                >
                                                    <div
                                                        className={cn(
                                                            'aspect-video w-full',
                                                            !c.thumbnail && 'bg-gradient-to-br from-brand-400 to-violet-500',
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
                                                    <div className="p-3">
                                                        <div className="line-clamp-2 text-[13px] font-bold text-slate-900 group-hover:text-brand-600">
                                                            {c.title}
                                                        </div>
                                                        {c.subtitle && (
                                                            <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                                                                {c.subtitle}
                                                            </p>
                                                        )}
                                                        <div className="mt-2 text-[13px] font-extrabold text-brand-600">
                                                            {c.price > 0 ? formatRupiah(c.price) : 'Gratis'}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
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
