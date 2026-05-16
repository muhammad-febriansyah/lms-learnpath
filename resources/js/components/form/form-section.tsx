import { cn } from '@/lib/utils';

type FormSectionProps = {
    title: string;
    description?: string;
    className?: string;
    children: React.ReactNode;
};

export function FormSection({ title, description, className, children }: FormSectionProps) {
    return (
        <section className={cn('space-y-4', className)}>
            <header className="space-y-1">
                <h2 className="text-base font-semibold">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </header>

            <div className="space-y-4">{children}</div>
        </section>
    );
}
