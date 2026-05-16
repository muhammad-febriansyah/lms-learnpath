import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DataTableRowActionsProps = {
    children: React.ReactNode;
    align?: 'start' | 'center' | 'end';
};

export function DataTableRowActions({
    children,
    align = 'end',
}: DataTableRowActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 data-[state=open]:bg-muted"
                >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Buka menu aksi</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align={align} className="w-48">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
