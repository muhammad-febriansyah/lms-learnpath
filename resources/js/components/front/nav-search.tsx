import {
    ArrowRight,
    FileText,
    GraduationCap,
    Loader2,
    Route,
    Search,
    SearchX,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type SearchSection = 'courses' | 'paths' | 'topics';

type CourseHit = {
    id: number;
    title: string;
    slug: string;
    level: string | null;
    lessons_count: number;
    enrollments_count: number;
    url: string;
};

type PathHit = {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    courses_count: number;
    url: string;
};

type TopicHit = {
    id: number;
    title: string;
    slug: string;
    courses_count: number;
    url: string;
};

type SearchResponse = {
    query: string;
    courses: CourseHit[];
    paths: PathHit[];
    topics: TopicHit[];
};

type FlatItem = {
    section: SearchSection;
    label: string;
    sub: string;
    url: string;
    key: string;
};

const SECTION_META: Record<
    SearchSection,
    { label: string; icon: typeof FileText; tint: string }
> = {
    courses: {
        label: 'Kursus',
        icon: GraduationCap,
        tint: 'bg-brand-50 text-brand-600',
    },
    paths: {
        label: 'Learning Path',
        icon: Route,
        tint: 'bg-brand-50 text-brand-600',
    },
    topics: {
        label: 'Topik',
        icon: FileText,
        tint: 'bg-emerald-50 text-emerald-600',
    },
};

const LEVEL_LABEL: Record<string, string> = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Lanjutan',
};

export const OPEN_SEARCH_EVENT = 'learnpath:open-search';

export function openSearchPalette(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
    }
}

const FETCH_CACHE = new Map<string, SearchResponse>();

function flattenResponse(data: SearchResponse): FlatItem[] {
    const out: FlatItem[] = [];

    data.courses.forEach((c) => {
        const parts = [
            c.level ? LEVEL_LABEL[c.level] ?? c.level : null,
            c.lessons_count > 0 ? `${c.lessons_count} lesson` : null,
            c.enrollments_count > 0 ? `${c.enrollments_count} siswa` : null,
        ].filter(Boolean);
        out.push({
            section: 'courses',
            label: c.title,
            sub: parts.join(' · ') || 'Kursus',
            url: c.url,
            key: `course-${c.id}`,
        });
    });
    data.paths.forEach((p) => {
        out.push({
            section: 'paths',
            label: p.title,
            sub: p.subtitle ?? `${p.courses_count} kursus`,
            url: p.url,
            key: `path-${p.id}`,
        });
    });
    data.topics.forEach((t) => {
        out.push({
            section: 'topics',
            label: t.title,
            sub: `${t.courses_count} kursus tersedia`,
            url: t.url,
            key: `topic-${t.id}`,
        });
    });

    return out;
}

export function NavSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SearchResponse | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const abortRef = useRef<AbortController | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    // Debounce typed query for fetching.
    useEffect(() => {
        const t = setTimeout(() => setDebounced(query.trim()), 180);

        return () => clearTimeout(t);
    }, [query]);

    // Open / close shortcuts.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        const onOpenEvent = () => setOpen(true);

        window.addEventListener('keydown', onKey);
        window.addEventListener(OPEN_SEARCH_EVENT, onOpenEvent);

        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener(OPEN_SEARCH_EVENT, onOpenEvent);
        };
    }, []);

    // Fetch results.
    const fetchResults = useCallback(async (term: string, controller: AbortController) => {
        const cacheKey = term.toLowerCase();
        const cached = FETCH_CACHE.get(cacheKey);

        if (cached) {
            setData(cached);
            setLoading(false);

            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `/api/search/quick?q=${encodeURIComponent(term)}`,
                {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                },
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as SearchResponse;
            FETCH_CACHE.set(cacheKey, json);
            setData(json);
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            setData({ query: term, courses: [], paths: [], topics: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    // Trigger fetch when palette opens or debounced query changes.
    useEffect(() => {
        if (!open) return;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        fetchResults(debounced, controller);

        return () => controller.abort();
    }, [open, debounced, fetchResults]);

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            setQuery('');
            setActiveIndex(0);
        }
    };

    const flat: FlatItem[] = useMemo(() => (data ? flattenResponse(data) : []), [data]);

    // Reset focus on results change.
    useEffect(() => {
        setActiveIndex(0);
    }, [debounced, data]);

    // Keyboard navigation.
    const onKeyDownPalette = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!flat.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % flat.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => (i - 1 + flat.length) % flat.length);
        } else if (e.key === 'Enter') {
            const it = flat[activeIndex];
            if (it) {
                window.location.href = it.url;
            }
        }
    };

    // Auto-scroll active item into view.
    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLElement>(
            `[data-search-index="${activeIndex}"]`,
        );
        el?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    const grouped: Record<SearchSection, FlatItem[]> = useMemo(() => {
        const map: Record<SearchSection, FlatItem[]> = {
            courses: [],
            paths: [],
            topics: [],
        };
        flat.forEach((i) => map[i.section].push(i));

        return map;
    }, [flat]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    aria-label="Cari kursus, path, atau topik"
                    title="Cari (⌘K)"
                    className="grid size-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-300"
                >
                    <Search className="size-[18px]" />
                </button>
            </DialogTrigger>
            <DialogContent
                onKeyDown={onKeyDownPalette}
                className="overflow-hidden border-slate-200/60 p-0 shadow-2xl ring-1 ring-slate-200/40 sm:max-w-2xl dark:border-neutral-800 dark:ring-neutral-800/40 [&>button.absolute]:hidden"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>Cari kursus, learning path, atau topik</DialogTitle>
                </DialogHeader>

                {/* ===== Search input header ===== */}
                <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-neutral-800">
                    <Search className="size-5 shrink-0 text-slate-400" />
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari kursus, learning path, atau topik..."
                        className="flex-1 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-neutral-100"
                    />
                    {loading && (
                        <Loader2 className="size-4 shrink-0 animate-spin text-slate-400" />
                    )}
                    <button
                        type="button"
                        onClick={() => handleOpenChange(false)}
                        className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                        aria-label="Tutup pencarian"
                    >
                        ESC
                    </button>
                </div>

                {/* ===== Results ===== */}
                <div
                    ref={listRef}
                    className="max-h-[60vh] overflow-y-auto px-2 py-3"
                >
                    {/* Initial skeleton */}
                    {!data && loading && (
                        <div className="space-y-2 px-2 py-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2.5"
                                >
                                    <div className="size-9 shrink-0 rounded-lg bg-slate-200/70 dark:bg-neutral-800" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 w-2/3 rounded bg-slate-200/80 dark:bg-neutral-800" />
                                        <div className="h-2.5 w-1/3 rounded bg-slate-200/60 dark:bg-neutral-800/70" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {data && flat.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-slate-100 dark:bg-neutral-800">
                                <SearchX className="size-5 text-slate-400" />
                            </div>
                            <div className="text-[14px] font-semibold text-slate-700 dark:text-neutral-200">
                                {debounced
                                    ? `Tidak ada hasil untuk "${debounced}"`
                                    : 'Belum ada data tersedia'}
                            </div>
                            <div className="mt-1 text-[12.5px] text-slate-500">
                                Coba kata kunci lain atau jelajahi katalog.
                            </div>
                            <a
                                href="/courses"
                                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-brand-700"
                            >
                                Jelajahi semua kursus
                                <ArrowRight className="size-3.5" />
                            </a>
                        </div>
                    )}

                    {/* Grouped results */}
                    {data && flat.length > 0 && (
                        <>
                            {(Object.keys(grouped) as SearchSection[])
                                .filter((s) => grouped[s].length > 0)
                                .map((section) => {
                                    const meta = SECTION_META[section];
                                    const Icn = meta.icon;

                                    return (
                                        <div key={section} className="mb-3 last:mb-0">
                                            <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
                                                <span className="text-[10.5px] font-bold tracking-[0.14em] text-slate-400 uppercase">
                                                    {meta.label}
                                                </span>
                                                <span className="text-[10.5px] text-slate-400 tabular-nums">
                                                    {grouped[section].length}
                                                </span>
                                            </div>
                                            <ul>
                                                {grouped[section].map((item) => {
                                                    const index = flat.findIndex(
                                                        (f) => f.key === item.key,
                                                    );
                                                    const isActive = index === activeIndex;

                                                    return (
                                                        <li key={item.key}>
                                                            <a
                                                                href={item.url}
                                                                data-search-index={index}
                                                                onMouseEnter={() => setActiveIndex(index)}
                                                                className={
                                                                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ' +
                                                                    (isActive
                                                                        ? 'bg-brand-50 dark:bg-brand-950/40'
                                                                        : 'hover:bg-slate-50 dark:hover:bg-neutral-900/60')
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        'grid size-9 shrink-0 place-items-center rounded-lg ' +
                                                                        meta.tint
                                                                    }
                                                                >
                                                                    <Icn className="size-4" />
                                                                </span>
                                                                <span className="min-w-0 flex-1">
                                                                    <span className="block truncate text-[13.5px] font-semibold text-slate-900 dark:text-neutral-100">
                                                                        {item.label}
                                                                    </span>
                                                                    <span className="block truncate text-[11.5px] text-slate-500 dark:text-neutral-400">
                                                                        {item.sub}
                                                                    </span>
                                                                </span>
                                                                <ArrowRight
                                                                    className={
                                                                        'size-4 transition ' +
                                                                        (isActive
                                                                            ? 'translate-x-0.5 text-brand-600'
                                                                            : 'text-slate-300 opacity-0 group-hover:opacity-100')
                                                                    }
                                                                />
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    );
                                })}
                        </>
                    )}
                </div>

                {/* ===== Footer hints ===== */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-[11px] text-slate-500 dark:border-neutral-800 dark:bg-neutral-900/40">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                            <Kbd>↑</Kbd>
                            <Kbd>↓</Kbd>
                            Navigasi
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Kbd>↵</Kbd>
                            Pilih
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Kbd>⌘</Kbd>
                        <Kbd>K</Kbd>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Kbd({ children }: { children: React.ReactNode }) {
    return (
        <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-semibold dark:border-neutral-700 dark:bg-neutral-800">
            {children}
        </kbd>
    );
}
