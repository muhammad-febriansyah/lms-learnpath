import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock, Mail } from 'lucide-react';

export default function PendingApproval() {
    return (
        <>
            <Head title="Menunggu Persetujuan" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 ">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl bg-white p-7 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70 sm:p-9">
                        <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-700 ">
                            <Clock className="size-7" />
                        </div>

                        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900 ">
                            Pendaftaran berhasil — sedang ditinjau
                        </h1>
                        <p className="mt-2 text-[14px] leading-relaxed text-slate-600 ">
                            Terima kasih sudah mendaftar sebagai mentor di Learnpath.
                            Admin kami akan memverifikasi akun Anda dalam <strong>1×24 jam</strong>.
                        </p>

                        <ol className="mt-6 space-y-3.5">
                            <li className="flex gap-3">
                                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 ">
                                    <CheckCircle2 className="size-4" />
                                </span>
                                <div>
                                    <div className="text-[13.5px] font-semibold text-slate-900 ">
                                        Akun dibuat
                                    </div>
                                    <div className="text-[12.5px] text-slate-500 ">
                                        Data registrasi tersimpan, kami akan menghubungi Anda via email.
                                    </div>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 ">
                                    <Clock className="size-4" />
                                </span>
                                <div>
                                    <div className="text-[13.5px] font-semibold text-slate-900 ">
                                        Sedang ditinjau admin
                                    </div>
                                    <div className="text-[12.5px] text-slate-500 ">
                                        Tim Learnpath memverifikasi profil & portofolio mentor.
                                    </div>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 ">
                                    <Mail className="size-4" />
                                </span>
                                <div>
                                    <div className="text-[13.5px] font-semibold text-slate-900 ">
                                        Notifikasi via email
                                    </div>
                                    <div className="text-[12.5px] text-slate-500 ">
                                        Begitu disetujui, link login akan dikirim ke email Anda.
                                    </div>
                                </div>
                            </li>
                        </ol>

                        <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50/60 p-4 ">
                            <p className="text-[12.5px] leading-relaxed text-slate-600 ">
                                Sambil menunggu, Anda bisa <strong>verifikasi alamat email</strong> dari
                                inbox Anda — ini akan mempercepat proses approval.
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-2">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 hover:text-slate-900 "
                            >
                                Kembali ke beranda
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-800 "
                            >
                                Sudah disetujui? Login
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>

                    <p className="mt-5 text-center text-[12px] text-slate-500 ">
                        Butuh bantuan? Hubungi{' '}
                        <a href="mailto:support@karivia.id" className="font-semibold text-slate-700 hover:underline ">
                            support@karivia.id
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
