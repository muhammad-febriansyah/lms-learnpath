import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

/**
 * Shape persis seperti output Laravel `paginate()->withQueryString()`.
 * Field-field pagination berada di root, bukan di dalam `meta`.
 */
export type Paginator<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    path?: string;
    first_page_url?: string | null;
    last_page_url?: string | null;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};

type DataTablePaginationProps<T = unknown> = {
    paginator: Paginator<T>;
};

function navigateTo(url: string | null) {
    if (!url) {
return;
}

    router.visit(url, {
        preserveScroll: true,
        preserveState: true,
    });
}

export function DataTablePagination<T = unknown>({
    paginator,
}: DataTablePaginationProps<T>) {
    const links = paginator.links ?? [];
    const previousLink = links[0];
    const nextLink = links[links.length - 1];
    const numberedLinks = links.slice(1, -1);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Menampilkan {paginator.from ?? 0} - {paginator.to ?? 0} dari{' '}
                {paginator.total} data
            </p>

            <div className="flex flex-wrap items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!previousLink?.url}
                    onClick={() => navigateTo(previousLink?.url ?? null)}
                >
                    <ChevronLeft className="mr-1 size-4" />
                    Sebelumnya
                </Button>

                {numberedLinks.map((link, index) => {
                    const isEllipsis = link.label.includes('...');

                    if (isEllipsis) {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 text-sm text-muted-foreground"
                            >
                                …
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={`${link.label}-${index}`}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled={!link.url}
                            onClick={() => navigateTo(link.url)}
                        >
                            {link.label}
                        </Button>
                    );
                })}

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!nextLink?.url}
                    onClick={() => navigateTo(nextLink?.url ?? null)}
                >
                    Selanjutnya
                    <ChevronRight className="ml-1 size-4" />
                </Button>
            </div>
        </div>
    );
}
