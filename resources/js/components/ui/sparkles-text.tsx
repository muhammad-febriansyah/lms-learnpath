import { motion } from 'motion/react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

type SparkleProps = {
    id: number;
    x: string;
    y: string;
    size: number;
    delay: number;
    color: string;
};

const COLORS = ['#FFD700', '#FFA500', '#FF69B4', '#A855F7', '#22D3EE'];

function generateSparkles(count: number, seed = 0): SparkleProps[] {
    const out: SparkleProps[] = [];
    for (let i = 0; i < count; i++) {
        const r = ((Math.sin(seed + i * 7919) + 1) / 2) * 100;
        out.push({
            id: i,
            x: `${5 + ((r * 1.3 + i * 13) % 90)}%`,
            y: `${5 + ((r * 0.9 + i * 7) % 90)}%`,
            size: 6 + ((i * 3) % 8),
            delay: (i * 0.35) % 3.5,
            color: COLORS[i % COLORS.length],
        });
    }

    return out;
}

function Sparkle({ size, color, delay }: { size: number; color: string; delay: number }) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill={color}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{
                scale: [0, 1, 0],
                rotate: [0, 90, 180],
                opacity: [0, 1, 0],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                delay,
                ease: 'easeInOut',
            }}
        >
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" />
        </motion.svg>
    );
}

export function SparklesText({
    children,
    className,
    count = 12,
}: {
    children: React.ReactNode;
    className?: string;
    count?: number;
}) {
    const sparkles = useMemo(() => generateSparkles(count), [count]);

    return (
        <span className={cn('relative inline-block', className)}>
            <span className="pointer-events-none absolute inset-0 -m-2">
                {sparkles.map((s) => (
                    <span
                        key={s.id}
                        className="absolute"
                        style={{ left: s.x, top: s.y }}
                    >
                        <Sparkle size={s.size} color={s.color} delay={s.delay} />
                    </span>
                ))}
            </span>
            <span className="relative">{children}</span>
        </span>
    );
}
