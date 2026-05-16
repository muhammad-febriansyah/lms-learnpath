import { Head, Link, useForm } from '@inertiajs/react';
import { Briefcase, Save, Target } from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type Position = {
    id: number;
    name: string;
    division: string | null;
    branch: string | null;
};

type Target = {
    competency_id: number;
    competency_name: string;
    competency_category: string | null;
    target_level: number;
    is_required: boolean;
};

type Props = {
    positions: Position[];
    position: Position | null;
    targets: Target[];
};

const LEVEL_LABELS = ['—', 'Awareness', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

export default function PositionTargetsIndex({ positions, position, targets }: Props) {
    const form = useForm({
        targets: targets,
    });

    function handleSelectPosition(positionId: string) {
        window.location.href = `/admin/position-competency-targets?position_id=${positionId}`;
    }

    function updateTarget(competencyId: number, field: 'target_level' | 'is_required', value: number | boolean) {
        form.setData(
            'targets',
            form.data.targets.map((t) =>
                t.competency_id === competencyId ? { ...t, [field]: value } : t,
            ),
        );
    }

    function submit() {
        if (!position) return;
        form.put(`/admin/position-competency-targets/${position.id}`, {
            preserveScroll: true,
        });
    }

    const grouped = form.data.targets.reduce<Record<string, Target[]>>((acc, t) => {
        const key = t.competency_category ?? 'Lainnya';
        acc[key] = acc[key] ?? [];
        acc[key].push(t);
        return acc;
    }, {});

    const totalAssigned = form.data.targets.filter((t) => t.target_level > 0).length;

    return (
        <>
            <Head title="Target Kompetensi Jabatan" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Target Kompetensi Jabatan</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Target Kompetensi Jabatan
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Tentukan level kompetensi yang harus dimiliki setiap jabatan. Skor 0 berarti tidak relevan.
                    </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                    <aside className="space-y-3">
                        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h2 className="mb-2 inline-flex items-center gap-2 text-[13px] font-bold text-slate-900">
                                <Briefcase className="size-3.5" />
                                Pilih Jabatan
                            </h2>
                            <Select
                                value={position?.id.toString() ?? ''}
                                onValueChange={handleSelectPosition}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih jabatan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{p.name}</span>
                                                {p.division && (
                                                    <span className="text-[11px] text-slate-500">
                                                        {p.division}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {position && (
                            <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                                    Sedang diedit
                                </div>
                                <div className="mt-1 text-[15px] font-bold text-slate-900">
                                    {position.name}
                                </div>
                                {position.division && (
                                    <div className="mt-0.5 text-[12px] text-slate-500">
                                        {position.division}
                                        {position.branch && ` · ${position.branch}`}
                                    </div>
                                )}
                                <div className="mt-3 rounded-lg bg-brand-50 p-2.5">
                                    <div className="text-[11px] text-brand-700">Target diisi</div>
                                    <div className="text-[18px] font-extrabold text-brand-700 tabular-nums">
                                        {totalAssigned} / {form.data.targets.length}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="mb-2 text-[12px] font-bold text-slate-900">Skala Level</h3>
                            <ul className="space-y-1 text-[11.5px] text-slate-600">
                                <li><b>0</b> — Tidak relevan</li>
                                <li><b>1</b> — Awareness</li>
                                <li><b>2</b> — Basic</li>
                                <li><b>3</b> — Intermediate</li>
                                <li><b>4</b> — Advanced</li>
                                <li><b>5</b> — Expert</li>
                            </ul>
                        </div>
                    </aside>

                    <div className="space-y-4">
                        {!position ? (
                            <div className="rounded-2xl bg-card p-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <Target className="mx-auto mb-3 size-8 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Pilih jabatan dulu untuk mulai mengatur target.
                                </p>
                            </div>
                        ) : form.data.targets.length === 0 ? (
                            <div className="rounded-2xl bg-card p-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <Target className="mx-auto mb-3 size-8 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada kompetensi aktif.
                                </p>
                                <p className="mt-1 text-[12.5px] text-slate-500">
                                    Tambah kompetensi dulu di menu{' '}
                                    <Link href="/admin/competencies" className="text-brand-600 hover:underline">
                                        Master Kompetensi
                                    </Link>
                                    .
                                </p>
                            </div>
                        ) : (
                            <>
                                {Object.entries(grouped).map(([category, items]) => (
                                    <div
                                        key={category}
                                        className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                                    >
                                        <h3 className="mb-4 inline-flex items-center gap-2 text-[13px] font-bold text-slate-900">
                                            <Badge className="border-transparent bg-violet-50 text-violet-700">
                                                {category}
                                            </Badge>
                                            <span className="text-[11.5px] font-normal text-slate-500">
                                                {items.length} kompetensi
                                            </span>
                                        </h3>
                                        <ul className="divide-y divide-slate-100">
                                            {items.map((target) => (
                                                <li
                                                    key={target.competency_id}
                                                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-[13.5px] font-semibold text-slate-900">
                                                            {target.competency_name}
                                                        </div>
                                                        <div className="mt-0.5 text-[11.5px] text-slate-500">
                                                            Target saat ini:{' '}
                                                            <span className="font-semibold text-slate-700">
                                                                {LEVEL_LABELS[target.target_level]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            {[0, 1, 2, 3, 4, 5].map((lv) => (
                                                                <button
                                                                    key={lv}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateTarget(target.competency_id, 'target_level', lv)
                                                                    }
                                                                    className={cn(
                                                                        'size-8 rounded-lg text-[12.5px] font-bold tabular-nums transition-colors',
                                                                        target.target_level === lv
                                                                            ? lv === 0
                                                                                ? 'bg-slate-200 text-slate-700'
                                                                                : 'bg-brand-600 text-white shadow-sm'
                                                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100',
                                                                    )}
                                                                >
                                                                    {lv}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <label className="inline-flex items-center gap-1.5">
                                                            <Switch
                                                                checked={target.is_required}
                                                                disabled={target.target_level === 0}
                                                                onCheckedChange={(v) =>
                                                                    updateTarget(target.competency_id, 'is_required', v)
                                                                }
                                                            />
                                                            <span className="text-[11px] text-slate-600">Wajib</span>
                                                        </label>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}

                                <div className="sticky bottom-4 flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white shadow-xl">
                                    <div className="text-[12.5px]">
                                        <div className="font-semibold">
                                            {totalAssigned} kompetensi diset untuk {position.name}
                                        </div>
                                        <div className="text-[11px] text-slate-300">
                                            Skor 0 akan otomatis dihapus saat disimpan.
                                        </div>
                                    </div>
                                    <Button
                                        onClick={submit}
                                        disabled={form.processing}
                                        className="rounded-xl bg-brand-500 hover:bg-brand-600"
                                    >
                                        <Save className="mr-1.5 size-4" />
                                        {form.processing ? 'Menyimpan...' : 'Simpan Target'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
