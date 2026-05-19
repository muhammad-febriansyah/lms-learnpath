import { cn } from '@/lib/utils';

type BackgroundDotsProps = {
    className?: string;
    /** Dot color tone. `dark` = white dots on dark bg, `light` = slate dots on light bg. */
    tone?: 'dark' | 'light';
    /** Size of the dot pattern grid (in pixels). Default 20. */
    spacing?: number;
    /** Whether to apply a radial fade mask to the edges. */
    fade?: boolean;
};

/**
 * Aceternity-style dotted background pattern. Pure CSS, no JS.
 *
 * Pasang sebagai child absolute di container `relative isolate overflow-hidden`.
 */
export function BackgroundDots({
    className,
    tone = 'dark',
    spacing = 20,
    fade = true,
}: BackgroundDotsProps) {
    const dotColor =
        tone === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.18)';

    return (
        <div
            aria-hidden
            className={cn(
                'pointer-events-none absolute inset-0 -z-10',
                fade &&
                    '[mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]',
                className,
            )}
            style={{
                backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
                backgroundSize: `${spacing}px ${spacing}px`,
            }}
        />
    );
}
