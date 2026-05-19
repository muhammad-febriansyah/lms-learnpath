import { usePage } from '@inertiajs/react';

/**
 * Injects per-tenant brand colour CSS overrides into the page.
 *
 * When a tenant sets a `brand_primary_color`, we override `--color-brand-600`
 * (the main accent) and approximate the 500/700 variants via color-mix.
 * If no tenant or no colour is set, this renders nothing and the default
 * platform colours from app.css stay in effect.
 */
export function TenantBrandStyle() {
    const tenant = usePage<{
        tenant?: { brand_primary_color: string | null } | null;
    }>().props.tenant;

    const color = tenant?.brand_primary_color;
    if (!color) return null;

    const css = `:root {
  --color-brand-600: ${color};
  --color-brand-700: color-mix(in srgb, ${color} 85%, black);
  --color-brand-500: color-mix(in srgb, ${color} 80%, white);
  --color-brand-400: color-mix(in srgb, ${color} 60%, white);
  --color-brand-300: color-mix(in srgb, ${color} 40%, white);
  --color-brand-200: color-mix(in srgb, ${color} 25%, white);
  --color-brand-100: color-mix(in srgb, ${color} 12%, white);
  --color-brand-50: color-mix(in srgb, ${color} 6%, white);
}`;

    return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
