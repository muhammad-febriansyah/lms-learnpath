/**
 * Resolve a storage path or external URL to a renderable image src.
 * - Returns null if value is null/empty (caller can show placeholder).
 * - Returns as-is if it's already an absolute http(s) URL.
 * - Otherwise prepends `/storage/` (public disk symlink).
 */
export function storageUrl(value: string | null | undefined): string | null {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    return `/storage/${value}`;
}
