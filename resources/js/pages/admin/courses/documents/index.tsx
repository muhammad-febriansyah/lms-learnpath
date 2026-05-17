import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    FileText,
    Loader2,
    Sparkles,
    Trash2,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Document = {
    id: number;
    title: string;
    source_type: 'upload' | 'paste';
    filename: string | null;
    status: 'pending' | 'ready' | 'failed';
    error_message: string | null;
    total_chunks: number;
    total_tokens: number;
    uploader: { id: number; name: string } | null;
    created_at: string | null;
};

type Props = {
    course: { id: number; title: string; slug: string };
    documents: Document[];
};

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function CourseDocumentsIndex({ course, documents }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    return (
        <>
            <Head title={`Materi AI Tutor — ${course.title}`} />
            <div className="space-y-5">
                <div>
                    <Link
                        href={`/admin/courses/${course.id}`}
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="size-3.5" />
                        Kembali ke detail course
                    </Link>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Sparkles className="size-6 text-brand-600" />
                        Materi AI Tutor
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Upload materi referensi (.txt/.md) atau paste teks. AI Tutor akan
                        memakai materi ini sebagai sumber otoritatif dan mengutipnya saat
                        menjawab siswa di course <b>{course.title}</b>.
                    </p>
                </div>

                <UploadForm courseId={course.id} />

                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="border-b border-slate-100 p-4">
                        <h2 className="text-[14px] font-bold text-slate-900">
                            Daftar Materi Referensi
                        </h2>
                        <p className="mt-0.5 text-[12px] text-slate-500">
                            {documents.length} materi tersimpan
                        </p>
                    </div>

                    {documents.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <FileText className="mx-auto mb-3 size-6 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Belum ada materi referensi
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                AI Tutor masih bisa menjawab dari pengetahuan umum, tapi
                                tidak punya sumber spesifik untuk dikutip.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {documents.map((d) => (
                                <DocRow
                                    key={d.id}
                                    doc={d}
                                    onDelete={() => setDeleteId(d.id)}
                                />
                            ))}
                        </ul>
                    )}
                </div>

                {deleteId !== null && (
                    <Confirm
                        title="Hapus materi referensi?"
                        description="Materi dan semua embedding-nya akan dihapus. AI Tutor tidak akan bisa mengutip dokumen ini lagi."
                        onConfirm={() => {
                            router.delete(
                                `/admin/courses/${course.id}/documents/${deleteId}`,
                                {
                                    preserveScroll: true,
                                    onFinish: () => setDeleteId(null),
                                },
                            );
                        }}
                        onCancel={() => setDeleteId(null)}
                    />
                )}
            </div>
        </>
    );
}

function UploadForm({ courseId }: { courseId: number }) {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const form = useForm<{
        title: string;
        source_type: 'upload' | 'paste';
        file: File | null;
        content: string;
    }>({
        title: '',
        source_type: 'upload',
        file: null,
        content: '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(`/admin/courses/${courseId}/documents`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    }

    return (
        <form
            onSubmit={submit}
            className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
        >
            <h2 className="text-[14px] font-bold text-slate-900">Tambah Materi Baru</h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
                Maksimal 5MB per file. Format yang didukung: .txt, .md, .pdf. PDF hasil
                scan/gambar tidak bisa diekstrak — paste teksnya manual.
            </p>

            <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                    <RequiredLabel htmlFor="title" required>
                        Judul Materi
                    </RequiredLabel>
                    <Input
                        id="title"
                        placeholder="Mis. Bab 1 — Pengenalan Analisa Kredit"
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                    />
                    <FieldError message={form.errors.title} />
                </div>

                <div className="space-y-1.5">
                    <RequiredLabel>Sumber Materi</RequiredLabel>
                    <Select
                        value={form.data.source_type}
                        onValueChange={(v) =>
                            form.setData('source_type', v as 'upload' | 'paste')
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="upload">Upload file (.txt/.md/.pdf)</SelectItem>
                            <SelectItem value="paste">Paste teks</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {form.data.source_type === 'upload' ? (
                    <div className="space-y-1.5">
                        <RequiredLabel required>File</RequiredLabel>
                        <Input
                            ref={fileRef}
                            type="file"
                            accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
                            onChange={(e) =>
                                form.setData('file', e.target.files?.[0] ?? null)
                            }
                        />
                        <FieldError message={form.errors.file} />
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <RequiredLabel htmlFor="content" required>
                            Konten Materi
                        </RequiredLabel>
                        <Textarea
                            id="content"
                            rows={10}
                            placeholder="Paste teks materi di sini. Maksimal 50.000 karakter."
                            value={form.data.content}
                            onChange={(e) => form.setData('content', e.target.value)}
                        />
                        <FieldError message={form.errors.content} />
                        <p className="text-[11px] text-slate-500">
                            {form.data.content.length.toLocaleString('id-ID')} karakter
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="submit"
                        disabled={
                            form.processing ||
                            !form.data.title.trim() ||
                            (form.data.source_type === 'upload' && !form.data.file) ||
                            (form.data.source_type === 'paste' &&
                                !form.data.content.trim())
                        }
                        className="rounded-xl bg-brand-600 hover:bg-brand-700"
                    >
                        {form.processing ? (
                            <>
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                                Memproses & embedding…
                            </>
                        ) : (
                            <>
                                <Upload className="mr-1.5 size-4" />
                                Simpan & Index
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}

function DocRow({ doc, onDelete }: { doc: Document; onDelete: () => void }) {
    return (
        <li className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full',
                        doc.status === 'ready'
                            ? 'bg-emerald-50 text-emerald-600'
                            : doc.status === 'failed'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-600',
                    )}
                >
                    {doc.status === 'ready' ? (
                        <CheckCircle2 className="size-4" />
                    ) : doc.status === 'failed' ? (
                        <AlertTriangle className="size-4" />
                    ) : (
                        <Loader2 className="size-4 animate-spin" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[13px] font-semibold text-slate-900">
                            {doc.title}
                        </span>
                        <Badge className="border-transparent bg-slate-100 text-slate-700 text-[10px] hover:bg-slate-100">
                            {doc.source_type === 'upload'
                                ? doc.filename || 'file'
                                : 'pasted'}
                        </Badge>
                        {doc.status === 'ready' && (
                            <Badge className="border-transparent bg-emerald-50 text-emerald-700 text-[10px] hover:bg-emerald-50">
                                {doc.total_chunks} potongan
                            </Badge>
                        )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                        {doc.uploader && <>Oleh {doc.uploader.name} · </>}
                        {formatDate(doc.created_at)}
                        {doc.status === 'failed' && doc.error_message && (
                            <span className="ml-1 text-rose-600">
                                · {doc.error_message}
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    size="sm"
                    className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                    onClick={onDelete}
                >
                    <Trash2 className="mr-1 size-3.5" />
                    Hapus
                </Button>
            </div>
        </li>
    );
}

function Confirm({
    title,
    description,
    onConfirm,
    onCancel,
}: {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-[16px] font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-[13px] text-slate-600">{description}</p>
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Ya, hapus
                    </Button>
                </div>
            </div>
        </div>
    );
}
