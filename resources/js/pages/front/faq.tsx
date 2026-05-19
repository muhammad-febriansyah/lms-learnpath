import { Head, Link } from '@inertiajs/react';
import { ChevronDown, MessageCircle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/front/page-header';
import { cn } from '@/lib/utils';

type FaqItem = { id: number; question: string; answer: string };
type FaqGroup = { category: string; items: FaqItem[] };

export default function FaqPage({ faqs }: { faqs: FaqGroup[] }) {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('Semua');
    const [openId, setOpenId] = useState<number | null>(null);

    const allItems = useMemo(
        () =>
            faqs.flatMap((g) =>
                g.items.map((i) => ({ ...i, category: g.category })),
            ),
        [faqs],
    );

    const filtered = useMemo(() => {
        const lowerQ = query.trim().toLowerCase();

        return allItems.filter((item) => {
            const matchCat =
                activeCategory === 'Semua' || item.category === activeCategory;
            const matchQ =
                lowerQ === '' ||
                item.question.toLowerCase().includes(lowerQ) ||
                item.answer.toLowerCase().includes(lowerQ);

            return matchCat && matchQ;
        });
    }, [allItems, query, activeCategory]);

    const categories = ['Semua', ...faqs.map((g) => g.category)];

    return (
        <>
            <Head title="FAQ · Learnpath" />

            <PageHeader
                eyebrow="Pertanyaan Umum"
                title="Hal yang sering ditanyakan"
                description="Cari jawaban cepat untuk pertanyaan paling umum tentang akun, kursus, pembayaran, korporat, dan teknis."
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'FAQ' },
                ]}
            >
                <div className="relative max-w-xl">
                    <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/60" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari pertanyaan... (mis. sertifikat, refund, login)"
                        className="block w-full rounded-full border border-white/15 bg-white/10 px-12 py-3.5 text-[14px] text-white placeholder:text-white/60 backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                </div>
            </PageHeader>

            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
                    {/* Category filter */}
                    <aside>
                        <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                            Kategori
                        </div>
                        <ul className="mt-3 space-y-1">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveCategory(cat)}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13.5px] font-medium transition',
                                            activeCategory === cat
                                                ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                                                : 'text-slate-700 hover:bg-slate-50',
                                        )}
                                    >
                                        {cat}
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-[10.5px] font-bold',
                                                activeCategory === cat
                                                    ? 'bg-brand-100 text-brand-700'
                                                    : 'bg-slate-100 text-slate-500',
                                            )}
                                        >
                                            {cat === 'Semua'
                                                ? allItems.length
                                                : faqs.find(
                                                      (g) => g.category === cat,
                                                  )?.items.length ?? 0}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white">
                            <div className="grid size-9 place-items-center rounded-xl bg-white/15">
                                <MessageCircle className="size-4" />
                            </div>
                            <h3 className="mt-3 text-[15px] font-bold">
                                Masih butuh bantuan?
                            </h3>
                            <p className="mt-1 text-[12.5px] text-white/80">
                                Tim support kami siap membantu di hari kerja
                                09.00 – 18.00 WIB.
                            </p>
                            <Link
                                href="/contact"
                                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-brand-700 transition hover:bg-brand-50"
                            >
                                Hubungi Support
                            </Link>
                        </div>
                    </aside>

                    {/* FAQ list */}
                    <div>
                        <div className="text-[12.5px] text-slate-500">
                            Menampilkan{' '}
                            <strong className="text-slate-900">
                                {filtered.length}
                            </strong>{' '}
                            dari {allItems.length} pertanyaan
                            {query && (
                                <>
                                    {' '}
                                    untuk "
                                    <span className="font-semibold text-brand-700">
                                        {query}
                                    </span>
                                    "
                                </>
                            )}
                        </div>

                        {filtered.length === 0 ? (
                            <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                                <div className="text-[14px] font-semibold text-slate-900">
                                    Tidak ada pertanyaan yang cocok
                                </div>
                                <p className="mt-1 text-[13px] text-slate-500">
                                    Coba kata kunci lain atau{' '}
                                    <Link
                                        href="/contact"
                                        className="text-brand-700 hover:underline"
                                    >
                                        kirim pertanyaan baru
                                    </Link>
                                    .
                                </p>
                            </div>
                        ) : (
                            <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                                {filtered.map((item) => {
                                    const open = openId === item.id;

                                    return (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenId(open ? null : item.id)
                                                }
                                                className="flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-slate-50"
                                            >
                                                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-[10.5px] font-bold tracking-[0.1em] text-brand-700 uppercase">
                                                    {item.category.slice(0, 2)}
                                                </span>
                                                <span className="flex-1">
                                                    <div className="text-[14.5px] font-semibold text-slate-900">
                                                        {item.question}
                                                    </div>
                                                    {open && (
                                                        <div className="mt-3 text-[13.5px] leading-relaxed text-slate-600">
                                                            {item.answer}
                                                        </div>
                                                    )}
                                                </span>
                                                <ChevronDown
                                                    className={cn(
                                                        'mt-0.5 size-4 shrink-0 text-slate-400 transition',
                                                        open && 'rotate-180 text-brand-700',
                                                    )}
                                                />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
