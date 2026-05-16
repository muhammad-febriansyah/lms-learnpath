import { router } from '@inertiajs/react';
import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
    from: string;
    to: string;
    basePath: string;
};

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
}

export function DateRangeFilter({ from, to, basePath }: Props) {
    const apply = (next: { from: string; to: string }) => {
        router.get(basePath, next, { preserveState: true, preserveScroll: true, replace: true });
    };

    const preset = (days: number) => {
        apply({ from: daysAgo(days), to: todayISO() });
    };

    const presetThisMonth = () => {
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        apply({ from: first, to: todayISO() });
    };

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600">
                <Calendar className="size-3.5" />
                Periode:
            </div>
            <Input
                type="date"
                value={from}
                onChange={(e) => apply({ from: e.target.value, to })}
                className="h-9 w-[150px]"
            />
            <span className="text-slate-400">—</span>
            <Input
                type="date"
                value={to}
                onChange={(e) => apply({ from, to: e.target.value })}
                className="h-9 w-[150px]"
            />
            <div className="ml-auto flex flex-wrap gap-1.5">
                <Button variant="outline" size="sm" onClick={() => preset(7)} className="h-9 rounded-lg text-[11.5px]">
                    7 Hari
                </Button>
                <Button variant="outline" size="sm" onClick={() => preset(30)} className="h-9 rounded-lg text-[11.5px]">
                    30 Hari
                </Button>
                <Button variant="outline" size="sm" onClick={presetThisMonth} className="h-9 rounded-lg text-[11.5px]">
                    Bulan Ini
                </Button>
                <Button variant="outline" size="sm" onClick={() => preset(365)} className="h-9 rounded-lg text-[11.5px]">
                    1 Tahun
                </Button>
            </div>
        </div>
    );
}
