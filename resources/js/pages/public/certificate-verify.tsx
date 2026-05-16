import { Head, Link } from '@inertiajs/react';
import { Award, CheckCircle2, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Certificate = {
    id: number;
    subject_type: string;
    certificate_number: string;
    verification_code: string;
    issued_at: string | null;
    expired_at: string | null;
    status: string;
    user: { id: number; name: string } | null;
    course: { id: number; title: string; slug: string } | null;
    learning_path: { id: number; title: string; slug: string } | null;
};

type Props = {
    certificate: Certificate | null;
    verificationCode: string;
    isValid: boolean;
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

export default function CertificateVerify({
    certificate,
    verificationCode,
    isValid,
}: Props) {
    return (
        <>
            <Head title="Verifikasi Sertifikat" />
            <div className="mx-auto max-w-2xl space-y-5">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Verifikasi Sertifikat
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Cek keaslian sertifikat dengan kode verifikasi.
                    </p>
                </div>

                {!certificate ? (
                    <InvalidCard code={verificationCode} />
                ) : isValid ? (
                    <ValidCard certificate={certificate} />
                ) : (
                    <RevokedCard certificate={certificate} />
                )}

                <div className="text-center">
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/courses">Lihat Katalog Kursus</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

function ValidCard({ certificate }: { certificate: Certificate }) {
    return (
        <div className="overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-slate-200/70">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="grid size-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                        <CheckCircle2 className="size-7" />
                    </div>
                    <div>
                        <div className="text-[10.5px] font-bold tracking-[0.18em] text-white/80 uppercase">
                            Status
                        </div>
                        <div className="text-xl font-bold">Sertifikat Valid</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-6">
                <Info label="Nomor Sertifikat" value={certificate.certificate_number} mono />
                <Info label="Diberikan kepada" value={certificate.user?.name ?? '-'} />
                {certificate.subject_type === 'path' ? (
                    <Info
                        label="Learning Path"
                        value={certificate.learning_path?.title ?? '-'}
                    />
                ) : (
                    <Info label="Course" value={certificate.course?.title ?? '-'} />
                )}
                <Info label="Diterbitkan" value={formatDate(certificate.issued_at)} />
                {certificate.expired_at && (
                    <Info
                        label="Berlaku Sampai"
                        value={formatDate(certificate.expired_at)}
                    />
                )}
                <Info
                    label="Kode Verifikasi"
                    value={certificate.verification_code}
                    mono
                />

                <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-[12px] text-emerald-700">
                    <Award className="size-4 shrink-0" />
                    Sertifikat ini sah dan terdaftar di sistem.
                </div>
            </div>
        </div>
    );
}

function RevokedCard({ certificate }: { certificate: Certificate }) {
    return (
        <div className="overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-slate-200/70">
            <div className="bg-gradient-to-br from-amber-500 to-rose-600 p-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="grid size-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                        <XCircle className="size-7" />
                    </div>
                    <div>
                        <div className="text-[10.5px] font-bold tracking-[0.18em] text-white/80 uppercase">
                            Status
                        </div>
                        <div className="text-xl font-bold">
                            {certificate.status === 'revoked'
                                ? 'Sertifikat Dicabut'
                                : 'Sertifikat Tidak Aktif'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-6">
                <Info label="Nomor" value={certificate.certificate_number} mono />
                <Info label="Status" value={certificate.status} />
                <Badge className="border-transparent bg-rose-50 text-rose-700">
                    Sertifikat ini tidak lagi sah untuk validasi.
                </Badge>
            </div>
        </div>
    );
}

function InvalidCard({ code }: { code: string }) {
    return (
        <div className="rounded-2xl bg-card p-10 text-center ring-1 ring-slate-200/70">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                <XCircle className="size-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
                Sertifikat Tidak Ditemukan
            </h2>
            <p className="mt-2 text-[13.5px] text-slate-500">
                Kode verifikasi <span className="font-mono font-semibold">{code}</span>{' '}
                tidak terdaftar di sistem.
            </p>
        </div>
    );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div>
            <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                {label}
            </div>
            <div
                className={
                    mono
                        ? 'font-mono text-[14px] font-bold text-slate-900'
                        : 'text-[14px] font-semibold text-slate-900'
                }
            >
                {value}
            </div>
        </div>
    );
}
