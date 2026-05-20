import {
    BookOpenText,
    CircleHelp,
    LifeBuoy,
    MessageCircle,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const HELP_ITEMS = [
    {
        icon: CircleHelp,
        label: 'Pertanyaan Umum (FAQ)',
        desc: 'Jawaban cepat untuk yang sering ditanyakan',
        href: '/faq',
    },
    {
        icon: BookOpenText,
        label: 'Pusat Bantuan',
        desc: 'Panduan & tutorial pemakaian Learnpath',
        href: '/help',
    },
    {
        icon: MessageCircle,
        label: 'Hubungi Dukungan',
        desc: 'Tim kami siap bantu hari kerja 09.00 – 18.00',
        href: '/contact',
    },
];

export function NavHelpDropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Bantuan"
                    className="grid size-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-600 "
                >
                    <LifeBuoy className="size-[18px]" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-[11.5px] font-bold tracking-[0.12em] text-slate-500 uppercase">
                    Pusat Bantuan
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {HELP_ITEMS.map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                        <a
                            href={item.href}
                            className="flex w-full cursor-pointer items-start gap-3 px-2 py-2"
                        >
                            <span className=" mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 ">
                                <item.icon className="size-4" />
                            </span>
                            <span className="flex-1">
                                <span className="block text-[13.5px] font-semibold text-slate-900 ">
                                    {item.label}
                                </span>
                                <span className="mt-0.5 block text-[11.5px] leading-snug text-slate-500 ">
                                    {item.desc}
                                </span>
                            </span>
                        </a>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
