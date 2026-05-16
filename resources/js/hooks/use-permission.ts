import { usePage } from '@inertiajs/react';

import type { Auth, User } from '@/types/auth';

type AuthShape = {
    user: User | null;
    roles?: string[];
    permissions?: string[];
};

type PagePropsWithAuth = {
    auth: Auth;
};

export function usePermission() {
    const { props } = usePage<PagePropsWithAuth>();
    const auth: AuthShape = (props.auth as AuthShape | undefined) ?? {
        user: null,
        roles: [],
        permissions: [],
    };

    const roles = auth.roles ?? [];
    const permissions = auth.permissions ?? [];

    const hasRole = (role: string | string[]): boolean => {
        const list = Array.isArray(role) ? role : [role];

        return list.some((r) => roles.includes(r));
    };

    const hasPermission = (permission: string | string[]): boolean => {
        const list = Array.isArray(permission) ? permission : [permission];

        return list.some((p) => permissions.includes(p));
    };

    const hasAnyPermission = (permissionList: string[]): boolean =>
        permissionList.some((p) => permissions.includes(p));

    const hasAllPermissions = (permissionList: string[]): boolean =>
        permissionList.every((p) => permissions.includes(p));

    return {
        user: auth.user,
        roles,
        permissions,
        hasRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
