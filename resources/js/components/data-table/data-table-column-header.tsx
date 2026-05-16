import type { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type DataTableColumnHeaderProps<TData, TValue> = {
    column: Column<TData, TValue>;
    title: string;
    className?: string;
};

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <span className={cn('font-medium', className)}>{title}</span>;
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                        <span>{title}</span>
                        {column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="ml-2 size-3.5" />
                        ) : column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="ml-2 size-3.5" />
                        ) : (
                            <ChevronsUpDown className="ml-2 size-3.5" />
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                        <ArrowUp className="mr-2 size-3.5 text-muted-foreground" />
                        Urutkan Naik
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                        <ArrowDown className="mr-2 size-3.5 text-muted-foreground" />
                        Urutkan Turun
                    </DropdownMenuItem>

                    {column.getCanHide() && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                                <EyeOff className="mr-2 size-3.5 text-muted-foreground" />
                                Sembunyikan
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
