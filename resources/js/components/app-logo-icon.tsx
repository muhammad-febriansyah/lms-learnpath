import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
            <g fill="currentColor">
                <rect x="10" y="10" width="9" height="44" rx="1.5" />
                <path d="M30 10h10a12 12 0 0 1 0 24H30v-9h9a3 3 0 1 0 0-6h-9v-9Z" />
                <rect x="19" y="46" width="6" height="8" />
                <rect x="25" y="40" width="6" height="14" />
                <rect x="31" y="34" width="6" height="20" />
            </g>
            <path
                d="M14 50 C 22 36, 30 28, 42 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
            />
            <path
                d="M37 19l6 1 1 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
