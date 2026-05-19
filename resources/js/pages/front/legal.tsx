import { Head, Link } from '@inertiajs/react';
import { CalendarDays, FileText, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/front/page-header';

type LegalPage = {
    kind: 'terms' | 'privacy';
    title: string;
    subtitle: string;
    content: string;
    company: string;
    last_updated: string;
};

export default function LegalPage({ page }: { page: LegalPage }) {
    const Icon = page.kind === 'terms' ? FileText : ShieldCheck;
    const otherKind = page.kind === 'terms' ? 'privacy' : 'terms';
    const otherLabel =
        otherKind === 'privacy' ? 'Kebijakan Privasi' : 'Syarat & Ketentuan';
    const otherHref = `/${otherKind}`;

    return (
        <>
            <Head title={`${page.title} · Learnpath`} />

            <PageHeader
                eyebrow={page.kind === 'terms' ? 'Legal' : 'Privasi'}
                title={page.title}
                description={page.subtitle}
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Legal', href: '/terms' },
                    {
                        label:
                            page.kind === 'terms'
                                ? 'Syarat & Ketentuan'
                                : 'Kebijakan Privasi',
                    },
                ]}
            />

            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
                    {/* Sidebar */}
                    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                            <div className="flex items-start gap-3">
                                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                                    <Icon className="size-4" />
                                </span>
                                <div>
                                    <div className="text-[12px] font-semibold text-slate-900">
                                        {page.company}
                                    </div>
                                    <div className="text-[11.5px] text-slate-500">
                                        Dokumen resmi
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-[12px] text-slate-500">
                                <CalendarDays className="size-3.5" />
                                Diperbarui {page.last_updated}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                            <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                                Lihat juga
                            </div>
                            <Link
                                href={otherHref}
                                className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-brand-50 hover:text-brand-700"
                            >
                                {otherLabel}
                                <span className="text-brand-600">→</span>
                            </Link>
                            <Link
                                href="/contact"
                                className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-brand-50 hover:text-brand-700"
                            >
                                Hubungi Tim Legal
                                <span className="text-brand-600">→</span>
                            </Link>
                        </div>
                    </aside>

                    {/* Content */}
                    <article className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-10">
                        <div
                            className="prose prose-slate prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:text-[20px] prose-h2:mt-8 prose-h2:mb-3 prose-p:leading-relaxed prose-li:my-1 prose-strong:text-slate-900 prose-blockquote:border-brand-500 prose-blockquote:bg-brand-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />

                        <div className="mt-10 rounded-2xl bg-slate-50 p-5 text-[12.5px] text-slate-600 ring-1 ring-slate-200">
                            <strong className="text-slate-900">Catatan:</strong>{' '}
                            Dokumen ini dapat diperbarui dari waktu ke waktu.
                            Versi terbaru selalu tersedia di halaman ini dengan
                            tanggal pembaruan tercatat.
                        </div>
                    </article>
                </div>
            </div>
        </>
    );
}
