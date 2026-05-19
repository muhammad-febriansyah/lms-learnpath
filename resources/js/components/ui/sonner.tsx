import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    return (
        <Sonner
            theme={appearance}
            richColors
            closeButton
            className="toaster group"
            position="bottom-right"
            toastOptions={{
                classNames: {
                    toast: 'group rounded-xl shadow-lg ring-1 ring-black/5',
                    title: 'font-semibold text-[13.5px]',
                    description: 'text-[12.5px] opacity-90',
                    actionButton: 'rounded-lg',
                    cancelButton: 'rounded-lg',
                    closeButton:
                        'absolute right-2 top-2 size-5 rounded-md border-0 bg-transparent hover:bg-black/10 dark:hover:bg-white/10',
                },
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--success-bg': '#ecfdf5',
                    '--success-text': '#065f46',
                    '--success-border': '#a7f3d0',
                    '--error-bg': '#fff1f2',
                    '--error-text': '#9f1239',
                    '--error-border': '#fecdd3',
                    '--warning-bg': '#fffbeb',
                    '--warning-text': '#92400e',
                    '--warning-border': '#fde68a',
                    '--info-bg': '#eff6ff',
                    '--info-text': '#1e40af',
                    '--info-border': '#bfdbfe',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
