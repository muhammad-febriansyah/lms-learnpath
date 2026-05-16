import {
    
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable
    
    
    
} from '@tanstack/react-table';
import type {ColumnDef, RowData, SortingState, VisibilityState} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { EmptyState } from '@/components/data-table/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        label?: string;
        className?: string;
    }
}

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchValue?: string;
    searchPlaceholder?: string;
    onSearchChange?: (value: string) => void;
    searchDebounceMs?: number;
    showColumnToggle?: boolean;
    isLoading?: boolean;
    skeletonRows?: number;
    emptyState?: React.ReactNode;
    toolbarSlot?: React.ReactNode;
};

export function DataTable<TData, TValue>({
    columns,
    data,
    searchValue,
    searchPlaceholder = 'Cari data...',
    onSearchChange,
    searchDebounceMs = 400,
    showColumnToggle = true,
    isLoading = false,
    skeletonRows = 5,
    emptyState,
    toolbarSlot,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [searchInput, setSearchInput] = useState(searchValue ?? '');

    useEffect(() => {
        setSearchInput(searchValue ?? '');
    }, [searchValue]);

    useEffect(() => {
        if (!onSearchChange) {
return;
}

        if (searchInput === (searchValue ?? '')) {
return;
}

        const timer = setTimeout(() => {
            onSearchChange(searchInput);
        }, searchDebounceMs);

        return () => clearTimeout(timer);
    }, [searchInput, searchValue, onSearchChange, searchDebounceMs]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
    });

    const showToolbar = Boolean(onSearchChange) || showColumnToggle || toolbarSlot;

    return (
        <div className="space-y-4">
            {showToolbar && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {onSearchChange ? (
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                placeholder={searchPlaceholder}
                                className="pl-9"
                                onChange={(event) => setSearchInput(event.target.value)}
                            />
                        </div>
                    ) : (
                        <div />
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        {toolbarSlot}
                        {showColumnToggle && <DataTableViewOptions table={table} />}
                    </div>
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={header.column.columnDef.meta?.className}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                                <TableRow key={`skeleton-${rowIndex}`}>
                                    {table.getVisibleLeafColumns().map((column) => (
                                        <TableCell key={column.id}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cell.column.columnDef.meta?.className}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="p-0">
                                    {emptyState ?? <EmptyState />}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
