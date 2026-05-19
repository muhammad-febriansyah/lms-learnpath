import { Download } from 'lucide-react';

type Props = {
    href: string;
    params?: Record<string, string | null | undefined>;
    label?: string;
};

export function ExportCsvButton({ href, params, label = 'Export CSV' }: Props) {
    const query = params
        ? Object.entries(params)
              .filter(([, v]) => v !== null && v !== undefined && v !== '')
              .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
              .join('&')
        : '';

    const url = query ? `${href}?${query}` : href;

    return (
        <a
            href={url}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
            <Download className="size-3.5" />
            {label}
        </a>
    );
}
