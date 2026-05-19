import type { PropsWithChildren } from 'react';

/**
 * Deprecated wrapper: the dedicated /settings/profile + /settings/security tabbed
 * layout has been replaced by the standalone Edit Profile page at /settings/profile
 * (rendered via 'account/profile-edit'). Kept as a passthrough so legacy imports
 * keep compiling.
 */
export default function SettingsLayout({ children }: PropsWithChildren) {
    return <>{children}</>;
}
