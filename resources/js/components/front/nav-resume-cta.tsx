import { Link } from '@inertiajs/react';
import { Play } from 'lucide-react';

type ResumeData = {
    label: string;
    href: string;
} | null;

export function NavResumeCta({ resume }: { resume?: ResumeData }) {
    const fallback = { label: 'Buka Dasbor', href: '/dashboard' };
    const target = resume ?? fallback;

    return (
        <Link
            href={target.href}
            className="group inline-flex max-w-[260px] items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(18,35,125,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_10px_24px_-10px_rgba(18,35,125,0.75)]"
        >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/20">
                <Play className="size-2.5 translate-x-[0.5px] fill-white text-white" />
            </span>
            <span className="truncate">
                {resume ? `Lanjutkan: ${target.label}` : target.label}
            </span>
        </Link>
    );
}
