import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Search,
    Send,
    UserPlus,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
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

type Course = { id: number; title: string; slug: string };
type Member = {
    id: number;
    name: string;
    email: string;
    position: string | null;
    division: string | null;
};

type PreviewRow = {
    user_id: number;
    name: string;
    email: string;
    position: string | null;
    status: 'will_enroll' | 'already_enrolled';
};

type PreviewPayload = {
    token: string;
    course: { id: number; title: string };
    due_date: string | null;
    rows: PreviewRow[];
    summary: { total: number; will_enroll: number; already_enrolled: number };
};

type Props = {
    courses: Course[];
    members: Member[];
    divisions: string[];
};

export default function AssignTrainingPage({ courses, members, divisions }: Props) {
    const page = usePage<{ flash?: { assign_preview?: PreviewPayload } }>();
    const [preview, setPreview] = useState<PreviewPayload | null>(null);

    useEffect(() => {
        const incoming = page.props.flash?.assign_preview;
        if (incoming) setPreview(incoming);
    }, [page.props.flash?.assign_preview]);

    return (
        <>
            <Head title="Tugaskan Training" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/enrollments"
                            className="hover:text-slate-700"
                        >
                            Enrollment
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Tugaskan Training
                        </span>
                    </nav>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <UserPlus className="size-6 text-brand-600" />
                        Tugaskan Training
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Pilih course, pilih karyawan yang ditugaskan, lalu konfirmasi.
                    </p>
                </div>

                {preview ? (
                    <PreviewStep
                        preview={preview}
                        onBack={() => setPreview(null)}
                    />
                ) : (
                    <ComposeStep
                        courses={courses}
                        members={members}
                        divisions={divisions}
                    />
                )}
            </div>
        </>
    );
}

function ComposeStep({
    courses,
    members,
    divisions,
}: {
    courses: Course[];
    members: Member[];
    divisions: string[];
}) {
    const form = useForm<{
        course_id: string;
        user_ids: number[];
        due_date: string;
    }>({
        course_id: '',
        user_ids: [],
        due_date: '',
    });

    const [search, setSearch] = useState('');
    const [divisionFilter, setDivisionFilter] = useState<string>('__all__');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return members.filter((m) => {
            if (
                divisionFilter !== '__all__' &&
                (m.division ?? '') !== divisionFilter
            ) {
                return false;
            }
            if (!q) return true;
            return (
                m.name.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                (m.position ?? '').toLowerCase().includes(q)
            );
        });
    }, [members, search, divisionFilter]);

    const allFilteredSelected =
        filtered.length > 0 &&
        filtered.every((m) => form.data.user_ids.includes(m.id));

    function toggleUser(id: number) {
        const set = new Set(form.data.user_ids);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        form.setData('user_ids', Array.from(set));
    }

    function toggleAllFiltered() {
        const filteredIds = filtered.map((m) => m.id);
        if (allFilteredSelected) {
            form.setData(
                'user_ids',
                form.data.user_ids.filter((id) => !filteredIds.includes(id)),
            );
        } else {
            const merged = new Set([...form.data.user_ids, ...filteredIds]);
            form.setData('user_ids', Array.from(merged));
        }
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.transform((data) => ({
            course_id: Number(data.course_id),
            user_ids: data.user_ids,
            due_date: data.due_date || null,
        }));
        form.post('/admin/enrollments/assign/preview', {
            preserveScroll: true,
        });
    }

    return (
        <form
            onSubmit={submit}
            className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,360px)]"
        >
            <div className="space-y-4 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                <div className="space-y-1.5">
                    <RequiredLabel required>Course</RequiredLabel>
                    <Select
                        value={form.data.course_id}
                        onValueChange={(v) => form.setData('course_id', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih course" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError message={form.errors.course_id} />
                </div>

                <div className="space-y-1.5">
                    <RequiredLabel>Deadline (opsional)</RequiredLabel>
                    <Input
                        type="date"
                        value={form.data.due_date}
                        onChange={(e) => form.setData('due_date', e.target.value)}
                    />
                    <FieldError message={form.errors.due_date} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <RequiredLabel required>Pilih Karyawan</RequiredLabel>
                        <span className="text-[11px] text-slate-500">
                            {form.data.user_ids.length} dipilih dari{' '}
                            {members.length} karyawan
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                            <Input
                                className="pl-8"
                                placeholder="Cari nama / email / jabatan…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select
                            value={divisionFilter}
                            onValueChange={setDivisionFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Semua divisi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Semua divisi</SelectItem>
                                {divisions.map((d) => (
                                    <SelectItem key={d} value={d}>
                                        {d}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={toggleAllFiltered}
                            disabled={filtered.length === 0}
                        >
                            {allFilteredSelected
                                ? 'Hapus semua di filter'
                                : 'Pilih semua di filter'}
                        </Button>
                    </div>

                    <FieldError message={form.errors.user_ids} />

                    <div className="max-h-[420px] overflow-y-auto rounded-xl ring-1 ring-slate-200">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-8 text-center text-[12px] text-slate-500">
                                Tidak ada karyawan yang cocok.
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {filtered.map((m) => {
                                    const checked = form.data.user_ids.includes(m.id);
                                    return (
                                        <li
                                            key={m.id}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50',
                                                checked && 'bg-brand-50/40',
                                            )}
                                            onClick={() => toggleUser(m.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleUser(m.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="size-4 rounded border-slate-300"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[12.5px] font-semibold text-slate-900">
                                                    {m.name}
                                                </div>
                                                <div className="truncate text-[11px] text-slate-500">
                                                    {m.email}
                                                    {m.position && (
                                                        <>
                                                            {' '}
                                                            ·{' '}
                                                            <span className="text-slate-600">
                                                                {m.position}
                                                            </span>
                                                        </>
                                                    )}
                                                    {m.division && (
                                                        <>
                                                            {' · '}
                                                            <span className="text-slate-500">
                                                                {m.division}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <aside className="space-y-3 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                <div>
                    <h2 className="text-[14px] font-bold text-slate-900">Ringkasan</h2>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                        Tinjau sebelum lihat preview.
                    </p>
                </div>
                <dl className="space-y-2 text-[12.5px]">
                    <div className="flex justify-between">
                        <dt className="text-slate-500">Course</dt>
                        <dd className="font-semibold text-slate-900">
                            {courses.find((c) => String(c.id) === form.data.course_id)
                                ?.title ?? '—'}
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-slate-500">Karyawan dipilih</dt>
                        <dd className="font-semibold text-slate-900">
                            {form.data.user_ids.length}
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-slate-500">Deadline</dt>
                        <dd className="font-semibold text-slate-900">
                            {form.data.due_date || 'Tanpa deadline'}
                        </dd>
                    </div>
                </dl>
                <Button
                    type="submit"
                    disabled={
                        form.processing ||
                        !form.data.course_id ||
                        form.data.user_ids.length === 0
                    }
                    className="w-full rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <Send className="mr-1.5 size-4" />
                    Lihat Preview
                </Button>
            </aside>
        </form>
    );
}

function PreviewStep({
    preview,
    onBack,
}: {
    preview: PreviewPayload;
    onBack: () => void;
}) {
    const commitForm = useForm<{ token: string }>({ token: preview.token });

    function commit() {
        commitForm.transform(() => ({ token: preview.token }));
        commitForm.post('/admin/enrollments/assign/commit', {
            preserveScroll: false,
        });
    }

    return (
        <div className="space-y-4 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="size-3.5" />
                Ubah pilihan
            </button>

            <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard label="Total" value={preview.summary.total} tone="slate" />
                <SummaryCard
                    label="Akan ditugaskan"
                    value={preview.summary.will_enroll}
                    tone="emerald"
                />
                <SummaryCard
                    label="Sudah enroll (skip)"
                    value={preview.summary.already_enrolled}
                    tone="amber"
                />
            </div>

            <dl className="rounded-xl bg-slate-50 p-3 text-[12.5px]">
                <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-slate-500">Course</dt>
                    <dd className="font-semibold text-slate-900">
                        {preview.course.title}
                    </dd>
                </div>
                <div className="mt-1.5 flex flex-wrap justify-between gap-2">
                    <dt className="text-slate-500">Deadline</dt>
                    <dd className="font-semibold text-slate-900">
                        {preview.due_date || 'Tanpa deadline'}
                    </dd>
                </div>
            </dl>

            {preview.summary.will_enroll === 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>
                        Semua karyawan terpilih sudah enroll di course ini. Pilih
                        karyawan lain atau course lain.
                    </span>
                </div>
            )}

            <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
                <table className="w-full text-left text-[12px]">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-3 py-2">Karyawan</th>
                            <th className="px-3 py-2">Jabatan</th>
                            <th className="px-3 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {preview.rows.map((r) => (
                            <tr key={r.user_id} className="bg-white">
                                <td className="px-3 py-2">
                                    <div className="font-semibold text-slate-900">
                                        {r.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        {r.email}
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-slate-700">
                                    {r.position ?? '—'}
                                </td>
                                <td className="px-3 py-2">
                                    {r.status === 'will_enroll' ? (
                                        <Badge className="border-transparent bg-emerald-50 text-emerald-700 text-[10px] hover:bg-emerald-50">
                                            <CheckCircle2 className="mr-1 size-3" />
                                            Akan ditugaskan
                                        </Badge>
                                    ) : (
                                        <Badge className="border-transparent bg-amber-50 text-amber-700 text-[10px] hover:bg-amber-50">
                                            <X className="mr-1 size-3" />
                                            Sudah enroll
                                        </Badge>
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
                    onClick={onBack}
                    disabled={commitForm.processing}
                >
                    Batal
                </Button>
                <Button
                    type="button"
                    onClick={commit}
                    disabled={
                        commitForm.processing || preview.summary.will_enroll === 0
                    }
                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <Send className="mr-1.5 size-4" />
                    {commitForm.processing
                        ? 'Memproses…'
                        : `Konfirmasi & Tugaskan (${preview.summary.will_enroll})`}
                </Button>
            </div>
        </div>
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
