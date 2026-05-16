import { useState } from 'react';

function smoothPath(points: number[][]): string {
    if (points.length < 2) {
return '';
}

    let d = `M ${points[0][0]},${points[0][1]}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const t = 0.18;
        const c1x = p1[0] + (p2[0] - p0[0]) * t;
        const c1y = p1[1] + (p2[1] - p0[1]) * t;
        const c2x = p2[0] - (p3[0] - p1[0]) * t;
        const c2y = p2[1] - (p3[1] - p1[1]) * t;
        d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }

    return d;
}

type ActivityChartProps = {
    seriesA: number[];
    seriesB: number[];
    labels: string[];
};

export function ActivityChart({ seriesA, seriesB, labels }: ActivityChartProps) {
    const W = 720,
        H = 260;
    const padL = 36,
        padR = 16,
        padT = 18,
        padB = 28;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const max = Math.max(...seriesA, ...seriesB) * 1.18;
    const xAt = (i: number, n: number) => padL + (innerW * i) / (n - 1);
    const yAt = (v: number) => padT + innerH - (v / max) * innerH;

    const ptsA = seriesA.map((v, i) => [xAt(i, seriesA.length), yAt(v)]);
    const ptsB = seriesB.map((v, i) => [xAt(i, seriesB.length), yAt(v)]);
    const lineA = smoothPath(ptsA);
    const lineB = smoothPath(ptsB);
    const areaA = `${lineA} L ${ptsA[ptsA.length - 1][0]},${padT + innerH} L ${ptsA[0][0]},${padT + innerH} Z`;
    const gridYs = [0, 0.25, 0.5, 0.75, 1].map((p) => padT + innerH * p);

    const [hover, setHover] = useState<number | null>(null);

    function onMove(e: React.MouseEvent<SVGSVGElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * W;
        const i = Math.round(((x - padL) / innerW) * (seriesA.length - 1));

        if (i >= 0 && i < seriesA.length) {
setHover(i);
}
    }

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[260px] w-full"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
        >
            <defs>
                <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#12237D" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#12237D" stopOpacity="0" />
                </linearGradient>
            </defs>
            {gridYs.map((y, i) => (
                <line
                    key={i}
                    x1={padL}
                    x2={W - padR}
                    y1={y}
                    y2={y}
                    stroke="#E5E7F4"
                    strokeDasharray={i === gridYs.length - 1 ? '0' : '3 4'}
                />
            ))}
            {[1, 0.75, 0.5, 0.25, 0].map((p, i) => (
                <text
                    key={i}
                    x={padL - 8}
                    y={padT + innerH * (1 - p) + 4}
                    fontSize="10"
                    textAnchor="end"
                    fill="#94a3b8"
                >
                    {Math.round(max * p)}
                </text>
            ))}
            {labels.map(
                (l, i) =>
                    i % Math.ceil(labels.length / 7) === 0 && (
                        <text
                            key={i}
                            x={xAt(i, labels.length)}
                            y={H - 8}
                            fontSize="10"
                            textAnchor="middle"
                            fill="#94a3b8"
                        >
                            {l}
                        </text>
                    ),
            )}
            <path d={lineB} fill="none" stroke="#94A3B8" strokeWidth="1.6" strokeDasharray="4 4" />
            <path d={areaA} fill="url(#areaGrad)" />
            <path
                d={lineA}
                fill="none"
                stroke="#12237D"
                strokeWidth="2.4"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            {hover != null && (
                <g>
                    <line
                        x1={ptsA[hover][0]}
                        x2={ptsA[hover][0]}
                        y1={padT}
                        y2={padT + innerH}
                        stroke="#12237D"
                        strokeOpacity=".18"
                    />
                    <circle
                        cx={ptsA[hover][0]}
                        cy={ptsA[hover][1]}
                        r="6"
                        fill="#fff"
                        stroke="#12237D"
                        strokeWidth="2.4"
                    />
                    <g
                        transform={`translate(${Math.min(ptsA[hover][0] + 10, W - 140)}, ${Math.max(ptsA[hover][1] - 46, 6)})`}
                    >
                        <rect width="130" height="44" rx="8" fill="#0E1B62" />
                        <text x="10" y="17" fontSize="10" fill="#B8BEEC">
                            {labels[hover]}
                        </text>
                        <text x="10" y="33" fontSize="13" fontWeight="700" fill="#fff">
                            {seriesA[hover].toLocaleString('id-ID')} sesi
                        </text>
                    </g>
                </g>
            )}
        </svg>
    );
}

type DonutSegment = { label: string; value: number; color: string };

export function Donut({
    segments,
    total,
    size = 220,
}: {
    segments: DonutSegment[];
    total: number;
    size?: number;
}) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 14;
    const C = 2 * Math.PI * r;
    let offset = 0;

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="block" width={size} height={size}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF0FB" strokeWidth="18" />
            {segments.map((s, i) => {
                const len = (s.value / total) * C;
                const el = (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="18"
                        strokeLinecap="butt"
                        strokeDasharray={`${len} ${C - len}`}
                        strokeDashoffset={-offset}
                        transform={`rotate(-90 ${cx} ${cy})`}
                    />
                );
                offset += len;

                return el;
            })}
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fill="#64748b">
                Total
            </text>
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize="22" fontWeight="800" fill="#0f172a">
                {total.toLocaleString('id-ID')}
            </text>
        </svg>
    );
}

export function Spark({
    data,
    color = '#12237D',
    width = 110,
    height = 36,
}: {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
}) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => [
        (i / (data.length - 1)) * (width - 4) + 2,
        height - 4 - ((v - min) / range) * (height - 8),
    ]);
    const d = smoothPath(pts);
    const area = `${d} L ${pts[pts.length - 1][0]},${height} L ${pts[0][0]},${height} Z`;
    const gid = 'g' + Math.random().toString(36).slice(2, 7);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block">
            <defs>
                <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gid})`} />
            <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function ProgressBar({ value, color = '#12237D' }: { value: number; color?: string }) {
    return (
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
        </div>
    );
}
