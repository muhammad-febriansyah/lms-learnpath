import { Head } from '@inertiajs/react';
import {
    IconBadge,
    IconBook,
    IconCap,
    IconChart,
    IconList,
    IconMessage,
    IconUsers,
    IconWallet,
} from '@/components/learnpath-icons';
import { dashboard } from '@/routes';

const ICONS = {
    book: IconBook,
    users: IconUsers,
    cap: IconCap,
    list: IconList,
    wallet: IconWallet,
    badge: IconBadge,
    chart: IconChart,
    message: IconMessage,
} as const;

type IconKey = keyof typeof ICONS;

type Props = {
    title: string;
    icon?: IconKey;
};

export default function Placeholder({ title, icon = 'book' }: Props) {
    const Icn = ICONS[icon] ?? IconBook;

    return (
        <>
            <Head title={title} />
            <div className="rounded-2xl bg-card p-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icn size={22} />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Halaman {title}</h2>
                <p className="mt-1 text-[14px] text-slate-500">
                    Bagian ini bisa dibangun selanjutnya. Klik{' '}
                    <span className="font-semibold text-brand-600">Dasbor</span> di sidebar untuk kembali.
                </p>
            </div>
        </>
    );
}

Placeholder.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
