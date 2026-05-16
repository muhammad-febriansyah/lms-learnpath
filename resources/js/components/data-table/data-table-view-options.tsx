import type { Table } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DataTableViewOptionsProps<TData> = {
    table: Table<TData>;
};

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
    const columns = table
        .getAllColumns()
        .filter((column) => column.getCanHide());

    if (columns.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                    <Settings2 className="mr-2 size-4" />
                    Kolom
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Tampilkan kolom</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                        {column.columnDef.meta?.label?.toString() ?? column.id}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
