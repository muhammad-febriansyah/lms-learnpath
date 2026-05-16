import type { SVGAttributes } from 'react';

type IconProps = SVGAttributes<SVGElement> & { size?: number };

function Icon({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...rest}
        >
            {children}
        </svg>
    );
}

export const IconDashboard = (p: IconProps) => (
    <Icon {...p}>
        <rect x="3" y="3" width="8" height="10" rx="2" />
        <rect x="13" y="3" width="8" height="6" rx="2" />
        <rect x="13" y="11" width="8" height="10" rx="2" />
        <rect x="3" y="15" width="8" height="6" rx="2" />
    </Icon>
);
export const IconBook = (p: IconProps) => (
    <Icon {...p}>
        <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5Z" />
        <path d="M18 17H6" />
        <path d="M9 7h6" />
    </Icon>
);
export const IconUsers = (p: IconProps) => (
    <Icon {...p}>
        <circle cx="9" cy="9" r="3.2" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <circle cx="17" cy="8" r="2.6" />
        <path d="M16 14a5 5 0 0 1 5 5" />
    </Icon>
);
export const IconCap = (p: IconProps) => (
    <Icon {...p}>
        <path d="M2 9 12 4l10 5-10 5L2 9Z" />
        <path d="M6 11v5a6 6 0 0 0 12 0v-5" />
        <path d="M20 9v6" />
    </Icon>
);
export const IconList = (p: IconProps) => (
    <Icon {...p}>
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <circle cx="4" cy="6" r="1" />
        <circle cx="4" cy="12" r="1" />
        <circle cx="4" cy="18" r="1" />
    </Icon>
);
export const IconWallet = (p: IconProps) => (
    <Icon {...p}>
        <rect x="3" y="6" width="18" height="13" rx="3" />
        <path d="M3 10h18" />
        <circle cx="17" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
);
export const IconBadge = (p: IconProps) => (
    <Icon {...p}>
        <circle cx="12" cy="9" r="5" />
        <path d="M8.5 13 7 21l5-3 5 3-1.5-8" />
    </Icon>
);
export const IconChart = (p: IconProps) => (
    <Icon {...p}>
        <path d="M4 20V8" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20H2" />
    </Icon>
);
export const IconCog = (p: IconProps) => (
    <Icon {...p}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </Icon>
);
export const IconSearch = (p: IconProps) => (
    <Icon {...p}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </Icon>
);
export const IconBell = (p: IconProps) => (
    <Icon {...p}>
        <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
    </Icon>
);
export const IconChevron = (p: IconProps) => (
    <Icon {...p}>
        <path d="m6 9 6 6 6-6" />
    </Icon>
);
export const IconChevR = (p: IconProps) => (
    <Icon {...p}>
        <path d="m9 6 6 6-6 6" />
    </Icon>
);
export const IconChevL = (p: IconProps) => (
    <Icon {...p}>
        <path d="m15 6-6 6 6 6" />
    </Icon>
);
export const IconSparkle = (p: IconProps) => (
    <Icon {...p}>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </Icon>
);
export const IconBolt = (p: IconProps) => (
    <Icon {...p}>
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </Icon>
);
export const IconPanel = (p: IconProps) => (
    <Icon {...p}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
    </Icon>
);
export const IconPlus = (p: IconProps) => (
    <Icon {...p}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </Icon>
);
export const IconArrowUp = (p: IconProps) => (
    <Icon {...p}>
        <path d="m5 12 7-7 7 7" />
        <path d="M12 5v14" />
    </Icon>
);
export const IconArrowDn = (p: IconProps) => (
    <Icon {...p}>
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
    </Icon>
);
export const IconUpRight = (p: IconProps) => (
    <Icon {...p}>
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
    </Icon>
);
export const IconHelp = (p: IconProps) => (
    <Icon {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" />
        <circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none" />
    </Icon>
);
export const IconDot = (p: IconProps) => (
    <Icon {...p}>
        <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </Icon>
);
export const IconFilter = (p: IconProps) => (
    <Icon {...p}>
        <path d="M3 5h18" />
        <path d="M6 12h12" />
        <path d="M10 19h4" />
    </Icon>
);
export const IconDownload = (p: IconProps) => (
    <Icon {...p}>
        <path d="M12 4v12" />
        <path d="m7 11 5 5 5-5" />
        <path d="M5 20h14" />
    </Icon>
);
export const IconPlay = (p: IconProps) => (
    <Icon {...p}>
        <path d="M7 5v14l12-7L7 5Z" />
    </Icon>
);
export const IconClock = (p: IconProps) => (
    <Icon {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </Icon>
);
export const IconLogout = (p: IconProps) => (
    <Icon {...p}>
        <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
        <path d="m16 8 4 4-4 4" />
        <path d="M20 12H9" />
    </Icon>
);
export const IconSun = (p: IconProps) => (
    <Icon {...p}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
);
export const IconMessage = (p: IconProps) => (
    <Icon {...p}>
        <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5l-4 4v-4H6a2 2 0 0 1-2-2V5Z" />
    </Icon>
);
export const IconCheck = (p: IconProps) => (
    <Icon {...p}>
        <path d="m5 12 5 5 9-11" />
    </Icon>
);
export const IconArrowR = (p: IconProps) => (
    <Icon {...p}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
    </Icon>
);
export const IconStar = ({ size = 20, ...rest }: IconProps) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...rest}>
        <path d="M12 2 15 9l7 .8-5.2 4.9L18.2 22 12 18 5.8 22l1.4-7.3L2 9.8 9 9z" />
    </svg>
);
export const IconPlayFill = ({ size = 20, ...rest }: IconProps) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...rest}>
        <path d="M7 5v14l12-7L7 5Z" />
    </svg>
);
