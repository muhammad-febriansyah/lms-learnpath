import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Clock, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/front/page-header';
import { cn } from '@/lib/utils';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    read_time: string;
    published_at: string;
    cover: string;
};

export default function BlogPage({ posts }: { posts: Post[] }) {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('Semua');

    const categories = useMemo(
        () => ['Semua', ...Array.from(new Set(posts.map((p) => p.category)))],
        [posts],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        return posts.filter((p) => {
            const matchCat =
                activeCategory === 'Semua' || p.category === activeCategory;
            const matchQ =
                q === '' ||
                p.title.toLowerCase().includes(q) ||
                p.excerpt.toLowerCase().includes(q);

            return matchCat && matchQ;
        });
    }, [posts, query, activeCategory]);

    const [featured, ...rest] = filtered;

    return (
        <>
            <Head title="Blog · Learnpath" />

            <PageHeader
                eyebrow="Blog"
                title="Insight & cerita seputar pembelajaran modern"
                description="Artikel praktis, studi kasus, dan opini dari tim Learnpath serta praktisi industri."
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Blog' },
                ]}
            >
                <div className="relative max-w-xl">
                    <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/60" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari artikel..."
                        className="block w-full rounded-full border border-white/15 bg-white/10 px-12 py-3.5 text-[14px] text-white placeholder:text-white/60 backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                </div>
            </PageHeader>

            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                'rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition',
                                activeCategory === cat
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="mt-12 rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                        <div className="text-[15px] font-semibold text-slate-900">
                            Tidak ada artikel yang cocok
                        </div>
                        <p className="mt-1 text-[13px] text-slate-500">
                            Coba kata kunci lain atau ganti kategori.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Featured */}
                        {featured && (
                            <Link
                                href={`/blog/${featured.slug}`}
                                className="group mt-10 grid overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 transition hover:ring-brand-200 lg:grid-cols-2"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 lg:aspect-auto lg:h-full">
                                    <img
                                        src={featured.cover}
                                        alt={featured.title}
                                        className="size-full object-cover transition duration-700 group-hover:scale-[1.03]"
                                    />
                                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-brand-700 uppercase backdrop-blur">
                                        Unggulan
                                    </span>
                                </div>
                                <div className="flex flex-col justify-center p-8 lg:p-10">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                                            {featured.category}
                                        </span>
                                        <span className="text-[11.5px] text-slate-400">
                                            · {featured.read_time}
                                        </span>
                                    </div>
                                    <h2 className="mt-3 text-[26px] leading-tight font-extrabold tracking-tight text-slate-900 sm:text-[30px]">
                                        {featured.title}
                                    </h2>
                                    <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">
                                        {featured.excerpt}
                                    </p>
                                    <div className="mt-5 flex items-center justify-between text-[12.5px] text-slate-500">
                                        <span>
                                            Oleh{' '}
                                            <strong className="text-slate-700">
                                                {featured.author}
                                            </strong>
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <CalendarDays className="size-3.5" />
                                            {featured.published_at}
                                        </span>
                                    </div>
                                    <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-700 group-hover:underline">
                                        Baca artikel{' '}
                                        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                                    </span>
                                </div>
                            </Link>
                        )}

                        {/* Grid */}
                        {rest.length > 0 && (
                            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {rest.map((post) => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-brand-200"
                                    >
                                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                            <img
                                                src={post.cover}
                                                alt={post.title}
                                                className="size-full object-cover transition duration-700 group-hover:scale-[1.05]"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <span className="rounded-full bg-brand-50 px-2 py-0.5 font-bold text-brand-700">
                                                    {post.category}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-slate-400">
                                                    <Clock className="size-3" />
                                                    {post.read_time}
                                                </span>
                                            </div>
                                            <h3 className="mt-2.5 text-[16px] leading-snug font-bold tracking-tight text-slate-900 group-hover:text-brand-700">
                                                {post.title}
                                            </h3>
                                            <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-slate-600">
                                                {post.excerpt}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between pt-4 text-[11.5px] text-slate-500">
                                                <span>{post.author}</span>
                                                <span>{post.published_at}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Newsletter */}
                <div className="mt-20 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white ring-1 ring-brand-800 sm:p-12">
                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                        <div>
                            <h2 className="text-[24px] font-extrabold tracking-tight sm:text-[28px]">
                                Berlangganan newsletter Learnpath
                            </h2>
                            <p className="mt-2 max-w-md text-[14px] text-white/85">
                                Insight pembelajaran & cerita dari industri,
                                dikirim ke inbox setiap Jumat.
                            </p>
                        </div>
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <input
                                type="email"
                                placeholder="email@kamu.com"
                                className="flex-1 rounded-full bg-white/95 px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/40"
                            />
                            <button
                                type="submit"
                                className="rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-brand-700 transition hover:bg-brand-50"
                            >
                                Berlangganan
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
