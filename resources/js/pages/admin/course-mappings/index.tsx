import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, Save } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Course = {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
};

type Mapping = {
    competency_id: number;
    competency_name: string;
    competency_category: string | null;
    weight: number;
    target_level_impact: number;
};

type Props = {
    courses: Course[];
    course: Course | null;
    mappings: Mapping[];
};

export default function CourseMappingsIndex({ courses, course, mappings }: Props) {
    const form = useForm({
        mappings: mappings,
    });

    function handleSelect(courseId: string) {
        window.location.href = `/admin/course-competency-mappings?course_id=${courseId}`;
    }

    function update(competencyId: number, field: 'weight' | 'target_level_impact', value: number) {
        form.setData(
            'mappings',
            form.data.mappings.map((m) =>
                m.competency_id === competencyId ? { ...m, [field]: value } : m,
            ),
        );
    }

    function submit() {
        if (!course) return;
        form.put(`/admin/course-competency-mappings/${course.id}`, {
            preserveScroll: true,
        });
    }

    const totalMapped = form.data.mappings.filter((m) => m.weight > 0).length;

    return (
        <>
            <Head title="Mapping Course Kompetensi" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Mapping Course Kompetensi</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Mapping Course → Kompetensi
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Tentukan kompetensi yang dikembangkan oleh tiap course. Bobot 0 berarti tidak relevan.
                    </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                    <aside className="space-y-3">
                        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h2 className="mb-2 inline-flex items-center gap-2 text-[13px] font-bold text-slate-900">
                                <BookOpen className="size-3.5" />
                                Pilih Course
                            </h2>
                            <Select value={course?.id.toString() ?? ''} onValueChange={handleSelect}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {course && (
                            <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                                    Sedang diedit
                                </div>
                                <div className="mt-1 text-[14px] font-bold text-slate-900">
                                    {course.title}
                                </div>
                                <div className="mt-3 rounded-lg bg-brand-50 p-2.5">
                                    <div className="text-[11px] text-brand-700">Mapping aktif</div>
                                    <div className="text-[18px] font-extrabold text-brand-700 tabular-nums">
                                        {totalMapped} / {form.data.mappings.length}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="mb-2 text-[12px] font-bold text-slate-900">Petunjuk</h3>
                            <ul className="space-y-1 text-[11.5px] text-slate-600">
                                <li>
                                    <b>Bobot</b> (0–10): seberapa besar course berkontribusi ke kompetensi.
                                </li>
                                <li>
                                    <b>Impact Level</b> (1–5): level kompetensi yang dicapai setelah course
                                    diselesaikan dengan baik.
                                </li>
                            </ul>
                        </div>
                    </aside>

                    <div className="space-y-4">
                        {!course ? (
                            <div className="rounded-2xl bg-card p-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <BookOpen className="mx-auto mb-3 size-8 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Pilih course dulu untuk mulai mapping.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                    <h3 className="mb-4 text-[14px] font-bold text-slate-900">
                                        Daftar Kompetensi
                                    </h3>
                                    {form.data.mappings.length === 0 ? (
                                        <p className="py-6 text-center text-[12.5px] text-slate-500">
                                            Belum ada kompetensi aktif. Tambah dulu di{' '}
                                            <Link
                                                href="/admin/competencies"
                                                className="text-brand-600 hover:underline"
                                            >
                                                Kompetensi
                                            </Link>
                                            .
                                        </p>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {form.data.mappings.map((m) => (
                                                <li
                                                    key={m.competency_id}
                                                    className={cn(
                                                        'flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0',
                                                        m.weight === 0 && 'opacity-60',
                                                    )}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-[13.5px] font-semibold text-slate-900">
                                                            {m.competency_name}
                                                        </div>
                                                        {m.competency_category && (
                                                            <Badge className="mt-1 border-transparent bg-violet-50 px-1.5 py-0 text-[10.5px] font-semibold text-violet-700">
                                                                {m.competency_category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <div className="mb-1 text-[10.5px] tracking-wider text-slate-500 uppercase">
                                                                Bobot
                                                            </div>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={10}
                                                                value={m.weight}
                                                                onChange={(e) =>
                                                                    update(
                                                                        m.competency_id,
                                                                        'weight',
                                                                        Math.max(0, Math.min(10, parseInt(e.target.value) || 0)),
                                                                    )
                                                                }
                                                                className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-center text-[13px] font-semibold tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="mb-1 text-[10.5px] tracking-wider text-slate-500 uppercase">
                                                                Impact
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map((lv) => (
                                                                    <button
                                                                        key={lv}
                                                                        type="button"
                                                                        disabled={m.weight === 0}
                                                                        onClick={() =>
                                                                            update(m.competency_id, 'target_level_impact', lv)
                                                                        }
                                                                        className={cn(
                                                                            'size-8 rounded-lg text-[12px] font-bold tabular-nums transition-colors',
                                                                            m.target_level_impact === lv
                                                                                ? 'bg-brand-600 text-white shadow-sm'
                                                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100',
                                                                            m.weight === 0 && 'cursor-not-allowed',
                                                                        )}
                                                                    >
                                                                        {lv}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {form.data.mappings.length > 0 && (
                                    <div className="sticky bottom-4 flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white shadow-xl">
                                        <div className="text-[12.5px]">
                                            <div className="font-semibold">
                                                {totalMapped} kompetensi di-map ke {course.title}
                                            </div>
                                            <div className="text-[11px] text-slate-300">
                                                Bobot 0 akan otomatis dihapus saat disimpan.
                                            </div>
                                        </div>
                                        <Button
                                            onClick={submit}
                                            disabled={form.processing}
                                            className="rounded-xl bg-brand-500 hover:bg-brand-600"
                                        >
                                            <Save className="mr-1.5 size-4" />
                                            {form.processing ? 'Menyimpan...' : 'Simpan Mapping'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
