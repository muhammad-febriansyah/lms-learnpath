import { Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

type Props = {
    file: File | null;
    existingUrl: string | null;
    onFileChange: (file: File | null) => void;
    onRemove: () => void;
    accept?: string;
    aspect?: 'video' | 'square';
    hint?: string;
};

/**
 * Reusable image upload with live preview. Pass `file` (new upload) and
 * `existingUrl` (already-stored path or absolute URL). Parent owns state.
 */
export function ThumbnailUpload({
    file,
    existingUrl,
    onFileChange,
    onRemove,
    accept = 'image/png,image/jpeg,image/webp',
    aspect = 'video',
    hint = 'PNG / JPG / WEBP, maks 2 MB.',
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const displayUrl =
        preview ??
        (existingUrl
            ? existingUrl.startsWith('http')
                ? existingUrl
                : `/storage/${existingUrl}`
            : null);

    const aspectClass =
        aspect === 'square' ? 'aspect-square' : 'aspect-video';

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            {displayUrl ? (
                <div className="space-y-2">
                    <div className="overflow-hidden rounded-xl ring-1 ring-slate-200 ">
                        <img
                            src={displayUrl}
                            alt="Thumbnail"
                            className={`${aspectClass} w-full object-cover`}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                        >
                            <Upload className="mr-1.5 size-3.5" />
                            Ganti file
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onRemove();
                                if (inputRef.current) {
                                    inputRef.current.value = '';
                                }
                            }}
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                            <X className="mr-1.5 size-3.5" />
                            Hapus
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className={`${aspectClass} flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-brand-300 hover:bg-brand-50/40 `}
                >
                    <Upload className="mb-2 size-6 text-slate-400" />
                    <span className="text-[13px] font-semibold text-slate-700 ">
                        Klik untuk upload gambar
                    </span>
                    <span className="mt-0.5 text-[11.5px] text-slate-500 ">
                        {hint}
                    </span>
                </button>
            )}
        </div>
    );
}
