import { Head, Link } from '@inertiajs/react';
import { Award, Compass, Copy, ExternalLink, FileText, Trophy } from 'lucide-react';
import { toast } from 'sonner';

import {
    DataTablePagination
    
} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Certificate = {
    id: number;
    subject_type: string;
    certificate_number: string;
    verification_code: string;
    pdf_path: string | null;
    issued_at: string | null;
    expired_at: string | null;
    status: string;
    course: {
        id: number;
        title: string;
        slug: string;
        thumbnail: string | null;
    } | null;
    learning_path: {
        id: number;
        title: string;
        slug: string;
        thumbnail: string | null;
    } | null;
};

type Props = {
    certificates: Paginator<Certificate>;
};

function formatDate(value: string | null): string {
    if (!value) {
return '-';
}

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export default function MyCertificatesIndex({ certificates }: Props) {
    const copyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success('Kode verifikasi disalin');
        } catch {
            toast.error('Gagal menyalin kode');
        }
    };

    return (
        <>
            <Head title="Sertifikat Saya" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Sertifikat Saya</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Sertifikat Saya
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Sertifikat yang sudah Anda raih. Bagikan kode verifikasi untuk validasi.
                    </p>
                </div>

                {certificates.data.length === 0 ? (
                    <div className="rounded-2xl bg-card p-12 text-center ring-1 ring-slate-200/70">
                        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                            <Trophy className="size-5" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                            Belum ada sertifikat
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Selesaikan course untuk mendapatkan sertifikat.
                        </p>
                        <Button
                            asChild
                            className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Link href="/my-courses">Lihat Kelas Saya</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {certificates.data.map((cert) => (
                            <CertificateCard
                                key={cert.id}
                                certificate={cert}
                                onCopy={copyCode}
                            />
                        ))}
                    </div>
                )}

                <DataTablePagination paginator={certificates} />
            </div>
        </>
    );
}

function CertificateCard({
    certificate,
    onCopy,
}: {
    certificate: Certificate;
    onCopy: (code: string) => void;
}) {
    const isRevoked = certificate.status === 'revoked';
    const isExpired = certificate.status === 'expired';
    const isPath = certificate.subject_type === 'path';
    const subject = isPath ? certificate.learning_path : certificate.course;
    const KindIcon = isPath ? Compass : Award;
    const gradient = isPath
        ? 'from-brand-500 via-brand-600 to-brand-700'
        : 'from-amber-400 via-amber-500 to-amber-700';

    return (
        <div className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-slate-300">
            <div className={`relative bg-gradient-to-br ${gradient} p-5 text-white`}>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-[10.5px] font-bold tracking-[0.18em] text-white/80 uppercase">
                            {isPath ? 'Path Completion' : 'Course Completion'}
                        </div>
                        <KindIcon className="mt-2 size-10 text-white" strokeWidth={1.5} />
                    </div>
                    {(isRevoked || isExpired) && (
                        <Badge className="border-transparent bg-white/20 text-white">
                            {isRevoked ? 'Dicabut' : 'Kedaluwarsa'}
                        </Badge>
                    )}
                </div>
                <div className="mt-4">
                    <div className="text-[11px] tracking-wider text-white/70 uppercase">
                        Nomor Sertifikat
                    </div>
                    <div className="font-mono text-[14px] font-bold">
                        {certificate.certificate_number}
                    </div>
                </div>
            </div>

            <div className="space-y-3 p-5">
                <div>
                    <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                        {isPath ? 'Learning Path' : 'Course'}
                    </div>
                    <div className="line-clamp-2 text-[14px] font-bold text-slate-900">
                        {subject?.title ?? '-'}
                    </div>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                    <div>
                        <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                            Diterbitkan
                        </div>
                        <div className="font-medium text-slate-900">
                            {formatDate(certificate.issued_at)}
                        </div>
                    </div>
                    {certificate.expired_at && (
                        <div className="text-right">
                            <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                                Berlaku Sampai
                            </div>
                            <div className="font-medium text-slate-900">
                                {formatDate(certificate.expired_at)}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onCopy(certificate.verification_code)}
                    className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-left transition hover:bg-slate-100"
                >
                    <div>
                        <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                            Kode Verifikasi
                        </div>
                        <div className="font-mono text-[13px] font-bold text-slate-900">
                            {certificate.verification_code}
                        </div>
                    </div>
                    <Copy className="size-4 text-slate-400" />
                </button>

                <div className="flex gap-2">
                    {!isRevoked && (
                        <Button
                            asChild
                            size="sm"
                            className="flex-1 rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <a
                                href={`/my-certificates/${certificate.verification_code}/print`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FileText className="mr-1.5 size-3.5" />
                                Cetak / PDF
                            </a>
                        </Button>
                    )}
                    <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl"
                    >
                        <a
                            href={`/verify-certificate/${certificate.verification_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="mr-1.5 size-3.5" />
                            Verifikasi
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
