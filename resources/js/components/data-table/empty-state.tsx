import { Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';

type EmptyStateProps = {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
};

export function EmptyState({
    title = 'Belum ada data',
    description = 'Data akan muncul setelah Anda menambahkan data baru.',
    icon,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
                className,
            )}
        >
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {icon ?? <Inbox className="size-5" />}
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {action}
        </div>
    );
}
