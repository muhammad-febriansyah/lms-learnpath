import { Head, Link, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock,
    Lock,
    Mail,
    MessageCircle,
    Phone,
    Quote,
    Send,
    ShieldCheck,
    Sparkles,
    Star,
    User as UserIcon,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

type Props = {
    industries: string[];
};

const INDUSTRY_LABELS: Record<string, string> = {
    banking: 'Perbankan & Finance',
    manufacturing: 'Manufaktur',
    technology: 'Teknologi & Startup',
    retail: 'Retail & FMCG',
    government: 'BUMN & Pemerintahan',
    fmcg: 'FMCG',
    education: 'Pendidikan',
    healthcare: 'Kesehatan',
    other: 'Lainnya',
};

const TRUSTED_COMPANIES = [
    { name: 'Bank Mandiri', initial: 'BM', color: 'from-blue-600 to-brand-700' },
    { name: 'BCA', initial: 'BCA', color: 'from-sky-600 to-blue-800' },
    { name: 'Astra International', initial: 'AI', color: 'from-brand-600 to-brand-800' },
    { name: 'Telkom Indonesia', initial: 'TLK', color: 'from-rose-600 to-red-800' },
    { name: 'Unilever', initial: 'UL', color: 'from-emerald-600 to-teal-800' },
    { name: 'GoTo', initial: 'GTO', color: 'from-green-600 to-emerald-800' },
];

const STEPS = [
    {
        icon: Send,
        title: 'Isi form (1 menit)',
        desc: 'Kasih kami konteks tim & kebutuhan singkat.',
    },
    {
        icon: MessageCircle,
        title: 'Kami hubungi 1×24 jam',
        desc: 'Tim sales kami konfirmasi jadwal yang cocok.',
    },
    {
        icon: CalendarDays,
        title: 'Demo personal 30 menit',
        desc: 'Walkthrough sesuai industri & ukuran tim Anda.',
    },
];

export default function DemoRequest({ industries }: Props) {
    const page = usePage<{ flash?: { success?: string } }>();
    const flashSuccess = page.props.flash?.success;
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (flashSuccess) {
            setSubmitted(true);
        }
    }, [flashSuccess]);

    const form = useForm({
        contact_name: '',
        email: '',
        phone: '',
        company_name: '',
        industry: '',
        employee_count: '' as number | '',
        preferred_date: '',
        message: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/corporate/demo', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
            },
        });
    };

    if (submitted) {
        return (
            <>
                <Head title="Terima kasih — Request Demo" />
                <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-5 py-16 lg:px-8">
                    <div className="w-full overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center ring-1 ring-emerald-200 sm:p-12">
                        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                            <CheckCircle2 className="size-8" />
                        </div>
                        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Terima kasih!
                        </h1>
                        <p className="mt-2 text-[14px] text-slate-600">
                            {flashSuccess ??
                                'Permintaan demo Anda sudah kami terima. Tim kami akan menghubungi Anda dalam 1×24 jam kerja.'}
                        </p>

                        <div className="mt-6 rounded-2xl bg-white p-5 text-left ring-1 ring-emerald-100">
                            <div className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                                Yang akan terjadi selanjutnya
                            </div>
                            <ol className="mt-3 space-y-2 text-[12.5px] text-slate-700">
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                        1
                                    </span>
                                    Sales kami review request &amp; siapkan demo sesuai industri Anda
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                        2
                                    </span>
                                    Anda terima email konfirmasi jadwal demo
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                        3
                                    </span>
                                    Sesi demo 30 menit via Google Meet
                                </li>
                            </ol>
                        </div>

                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            <Button
                                asChild
                                className="rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                <Link href="/">Kembali ke Beranda</Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-xl"
                            >
                                <Link href="/corporate">
                                    Pelajari Untuk Bisnis
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Request Demo — LearnPath" />

            <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
                <Link
                    href="/corporate"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600 transition hover:text-slate-900"
                >
                    <ArrowLeft className="size-3.5" />
                    Kembali ke Untuk Bisnis
                </Link>

                <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-10">
                    {/* Pitch column */}
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold tracking-wider text-brand-700 uppercase ring-1 ring-brand-100">
                            <Sparkles className="size-3" />
                            Request Demo
                        </div>
                        <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Lihat Learnpath bekerja di skenario{' '}
                            <span className="bg-gradient-to-br from-brand-600 to-brand-700 bg-clip-text text-transparent">
                                tim Anda.
                            </span>
                        </h1>
                        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate-600">
                            Sesi 30 menit dengan spesialis kami. Kami akan
                            walkthrough platform sesuai industri & ukuran tim
                            Anda — bukan demo template.
                        </p>

                        {/* Trust strip — companies */}
                        <div className="mt-7 rounded-2xl bg-slate-50/60 p-4 ring-1 ring-slate-200/70">
                            <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                                Dipercaya oleh
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {TRUSTED_COMPANIES.map((c) => (
                                    <div
                                        key={c.name}
                                        title={c.name}
                                        className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br ${c.color} px-3 py-1.5 text-[11px] font-bold text-white shadow-sm`}
                                    >
                                        <span className="text-[10px] tracking-wider opacity-80">
                                            {c.initial}
                                        </span>
                                        <span className="hidden sm:inline">
                                            {c.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What you'll get */}
                        <div className="mt-8">
                            <div className="text-[10.5px] font-bold tracking-wider text-brand-700 uppercase">
                                Yang Anda Dapat
                            </div>
                            <h2 className="mt-1.5 text-[18px] font-extrabold tracking-tight text-slate-900">
                                Bukan demo template — ini personal
                            </h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <BulletItem
                                    icon={Building2}
                                    title="Walkthrough sesuai industri"
                                    desc="Kami siapkan skenario: banking, manufaktur, tech, retail, dll."
                                />
                                <BulletItem
                                    icon={Sparkles}
                                    title="Estimasi harga real-time"
                                    desc="Angka estimasi langsung berdasar jumlah karyawan & fitur."
                                />
                                <BulletItem
                                    icon={Users}
                                    title="Free pilot 30 hari"
                                    desc="50 user, tanpa kontrak panjang, tanpa kewajiban lanjut."
                                />
                                <BulletItem
                                    icon={CalendarDays}
                                    title="Roadmap implementasi"
                                    desc="Plus timeline rollout konkret untuk perusahaan Anda."
                                />
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="mt-8">
                            <div className="text-[10.5px] font-bold tracking-wider text-brand-700 uppercase">
                                Prosesnya Cepat
                            </div>
                            <h2 className="mt-1.5 text-[18px] font-extrabold tracking-tight text-slate-900">
                                Dari klik sampai demo &lt; 24 jam
                            </h2>
                            <ol className="relative mt-5 grid gap-4 sm:grid-cols-3">
                                {STEPS.map((s, idx) => {
                                    const Icn = s.icon;
                                    return (
                                        <li
                                            key={s.title}
                                            className="relative rounded-2xl bg-white p-4 ring-1 ring-slate-200/70"
                                        >
                                            <span className="absolute -top-3 left-4 inline-flex size-6 items-center justify-center rounded-full bg-brand-600 text-[10.5px] font-bold text-white shadow-sm">
                                                {idx + 1}
                                            </span>
                                            <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                                                <Icn className="size-4" />
                                            </span>
                                            <div className="mt-3 text-[13px] font-bold text-slate-900">
                                                {s.title}
                                            </div>
                                            <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">
                                                {s.desc}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>

                        {/* Testimonial */}
                        <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-brand-950 p-6 text-white shadow-lg sm:p-7">
                            <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-brand-500/20 blur-3xl" />
                            <Quote className="relative size-6 text-brand-400" />
                            <p className="relative mt-3 text-[14.5px] leading-relaxed font-medium text-white/90">
                                "Sesi demo-nya benar-benar disesuaikan dengan
                                konteks bank kami. Dalam 30 menit kami sudah
                                tahu fit-nya ke proses onboarding AO."
                            </p>
                            <div className="relative mt-4 flex items-center gap-3">
                                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[12px] font-bold text-white shadow-md">
                                    RP
                                </span>
                                <div className="min-w-0">
                                    <div className="text-[13px] font-bold">
                                        Rizky Pramudita
                                    </div>
                                    <div className="text-[11px] text-white/70">
                                        Head of L&D, Bank Mandiri
                                    </div>
                                </div>
                                <div className="ml-auto flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="size-3.5 fill-amber-400 text-amber-400"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Security badges */}
                        <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                                <Lock className="size-3 text-slate-400" />
                                Data Anda aman
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                                <ShieldCheck className="size-3 text-emerald-500" />
                                Tanpa spam call
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                                <Clock className="size-3 text-slate-400" />
                                Respon &lt; 24 jam
                            </span>
                        </div>

                        {/* Direct contact */}
                        <div className="mt-8 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/70">
                            <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                                Atau kontak langsung
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-slate-700">
                                <a
                                    href="mailto:sales@learnpath.id"
                                    className="inline-flex items-center gap-1.5 font-semibold transition hover:text-brand-700"
                                >
                                    <Mail className="size-4" />
                                    sales@learnpath.id
                                </a>
                                <a
                                    href="tel:+622150001234"
                                    className="inline-flex items-center gap-1.5 font-semibold transition hover:text-brand-700"
                                >
                                    <Phone className="size-4" />
                                    +62 21 5000 1234
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Form column */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <form
                            onSubmit={submit}
                            className="rounded-3xl bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.15)] ring-1 ring-slate-200/70 sm:p-7"
                        >
                            <div className="flex items-start gap-3">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md">
                                    <Sparkles className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-[15.5px] font-extrabold text-slate-900">
                                        Jadwalkan Demo Anda
                                    </h2>
                                    <p className="text-[11.5px] text-slate-500">
                                        Gratis · 30 menit · tanpa komitmen
                                    </p>
                                </div>
                            </div>

                            <Badge className="mt-4 border-transparent bg-emerald-50 px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-emerald-700 uppercase">
                                <Clock className="size-3" />
                                Respon &lt; 24 jam
                            </Badge>

                            <div className="mt-5 space-y-3.5">
                                <div>
                                    <RequiredLabel
                                        htmlFor="contact_name"
                                        required
                                    >
                                        <UserIcon className="mr-1 inline size-3.5" />
                                        Nama lengkap
                                    </RequiredLabel>
                                    <Input
                                        id="contact_name"
                                        value={form.data.contact_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'contact_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Mis. Andi Pratama"
                                        className="mt-1"
                                    />
                                    <FieldError
                                        message={form.errors.contact_name}
                                    />
                                </div>

                                <div>
                                    <RequiredLabel htmlFor="email" required>
                                        <Mail className="mr-1 inline size-3.5" />
                                        Email kerja
                                    </RequiredLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="andi@perusahaan.com"
                                        className="mt-1"
                                    />
                                    <FieldError message={form.errors.email} />
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="text-[12.5px] font-semibold text-slate-700"
                                    >
                                        <Phone className="mr-1 inline size-3.5" />
                                        Nomor WhatsApp (opsional)
                                    </label>
                                    <Input
                                        id="phone"
                                        value={form.data.phone}
                                        onChange={(e) =>
                                            form.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="+62 812..."
                                        className="mt-1"
                                    />
                                    <FieldError message={form.errors.phone} />
                                </div>

                                <div>
                                    <RequiredLabel
                                        htmlFor="company_name"
                                        required
                                    >
                                        <Building2 className="mr-1 inline size-3.5" />
                                        Perusahaan
                                    </RequiredLabel>
                                    <Input
                                        id="company_name"
                                        value={form.data.company_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'company_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="PT Contoh Indonesia"
                                        className="mt-1"
                                    />
                                    <FieldError
                                        message={form.errors.company_name}
                                    />
                                </div>

                                <div className="grid gap-3.5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="industry"
                                            className="text-[12.5px] font-semibold text-slate-700"
                                        >
                                            Industri
                                        </label>
                                        <Select
                                            value={form.data.industry || 'unset'}
                                            onValueChange={(v) =>
                                                form.setData(
                                                    'industry',
                                                    v === 'unset' ? '' : v,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="industry"
                                                className="mt-1"
                                            >
                                                <SelectValue placeholder="Pilih..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unset">
                                                    — Pilih industri —
                                                </SelectItem>
                                                {industries.map((i) => (
                                                    <SelectItem
                                                        key={i}
                                                        value={i}
                                                    >
                                                        {INDUSTRY_LABELS[i] ??
                                                            i}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError
                                            message={form.errors.industry}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="employee_count"
                                            className="text-[12.5px] font-semibold text-slate-700"
                                        >
                                            <Users className="mr-1 inline size-3.5" />
                                            Karyawan
                                        </label>
                                        <Input
                                            id="employee_count"
                                            type="number"
                                            min={1}
                                            value={form.data.employee_count}
                                            onChange={(e) =>
                                                form.setData(
                                                    'employee_count',
                                                    e.target.value === ''
                                                        ? ''
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            placeholder="100"
                                            className="mt-1"
                                        />
                                        <FieldError
                                            message={
                                                form.errors.employee_count
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="preferred_date"
                                        className="text-[12.5px] font-semibold text-slate-700"
                                    >
                                        <CalendarDays className="mr-1 inline size-3.5" />
                                        Tanggal preferensi (opsional)
                                    </label>
                                    <Input
                                        id="preferred_date"
                                        type="date"
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        value={form.data.preferred_date}
                                        onChange={(e) =>
                                            form.setData(
                                                'preferred_date',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                    <FieldError
                                        message={form.errors.preferred_date}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="text-[12.5px] font-semibold text-slate-700"
                                    >
                                        Kebutuhan spesifik (opsional)
                                    </label>
                                    <Textarea
                                        id="message"
                                        rows={3}
                                        value={form.data.message}
                                        onChange={(e) =>
                                            form.setData(
                                                'message',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: butuh modul AML untuk 200 frontliner..."
                                        className="mt-1 resize-none"
                                        maxLength={1500}
                                    />
                                    <FieldError message={form.errors.message} />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={form.processing}
                                size="lg"
                                className="mt-6 h-12 w-full rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                <Send className="mr-1.5 size-4" />
                                {form.processing
                                    ? 'Mengirim...'
                                    : 'Kirim Permintaan Demo'}
                            </Button>

                            <p className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] text-slate-400">
                                <Lock className="size-3" />
                                Data Anda aman & tidak akan dibagikan ke pihak
                                ketiga.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

function BulletItem({
    icon: Icn,
    title,
    desc,
}: {
    icon: typeof Sparkles;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-brand-200">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Icn className="size-4" />
            </span>
            <div className="min-w-0">
                <div className="text-[13px] font-bold text-slate-900">
                    {title}
                </div>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-600">
                    {desc}
                </p>
            </div>
        </div>
    );
}
