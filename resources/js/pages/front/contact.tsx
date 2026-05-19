import { Head, useForm, usePage } from '@inertiajs/react';
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/front/page-header';
import { useRecaptchaV3 } from '@/hooks/use-recaptcha-v3';

type ContactData = {
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    map_url: string | null;
};

type PageProps = {
    contact: ContactData;
    flash?: { success?: string | null };
};

export default function ContactPage({ contact }: { contact: ContactData }) {
    const { flash } = usePage<PageProps>().props;
    const form = useForm<{
        name: string;
        email: string;
        subject: string;
        message: string;
        recaptcha_token: string;
    }>({
        name: '',
        email: '',
        subject: '',
        message: '',
        recaptcha_token: '',
    });
    const { data, setData, processing, errors, reset, wasSuccessful } = form;
    const { execute } = useRecaptchaV3();

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    useEffect(() => {
        if (wasSuccessful) {
            reset();
        }
    }, [wasSuccessful, reset]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let token = '';
        try {
            token = await execute('contact');
            form.clearErrors('recaptcha_token');
        } catch {
            form.setError('recaptcha_token', 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
            return;
        }

        form.transform((d) => ({ ...d, recaptcha_token: token }));
        form.post('/contact', {
            preserveScroll: true,
            onFinish: () => form.transform((d) => d),
        });
    };

    const channels: Array<{
        icon: typeof Mail;
        label: string;
        value: string | null;
        href?: string;
        accent: string;
    }> = [
        {
            icon: Mail,
            label: 'Email',
            value: contact.email,
            href: contact.email ? `mailto:${contact.email}` : undefined,
            accent: 'bg-brand-50 text-brand-700',
        },
        {
            icon: Phone,
            label: 'Telepon',
            value: contact.phone,
            href: contact.phone
                ? `tel:${contact.phone.replace(/\s+/g, '')}`
                : undefined,
            accent: 'bg-indigo-50 text-indigo-700',
        },
        {
            icon: MessageCircle,
            label: 'WhatsApp',
            value: contact.whatsapp,
            href: contact.whatsapp
                ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`
                : undefined,
            accent: 'bg-emerald-50 text-emerald-700',
        },
    ];

    return (
        <>
            <Head title="Kontak · Learnpath" />

            <PageHeader
                eyebrow="Kontak"
                title="Mari ngobrol — tim kami siap membantu"
                description="Pertanyaan tentang produk, demo enterprise, kerja sama instruktur, atau topik lain? Kirim pesan dan kami balas dalam 1x24 jam kerja."
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Kontak' },
                ]}
            />

            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
                    {/* Form */}
                    <div className="self-start rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8 lg:p-10">
                        <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
                            Kirim pesan ke kami
                        </h2>
                        <p className="mt-2 text-[14px] text-slate-600">
                            Isi formulir di bawah — semua field wajib diisi.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Nama lengkap"
                                    name="name"
                                    value={data.name}
                                    onChange={(v) => setData('name', v)}
                                    error={errors.name}
                                    placeholder="Nama Anda"
                                />
                                <Field
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(v) => setData('email', v)}
                                    error={errors.email}
                                    placeholder="email@perusahaan.com"
                                />
                            </div>
                            <Field
                                label="Subjek"
                                name="subject"
                                value={data.subject}
                                onChange={(v) => setData('subject', v)}
                                error={errors.subject}
                                placeholder="Misal: Demo enterprise untuk 200 karyawan"
                            />
                            <div>
                                <label
                                    htmlFor="message"
                                    className="mb-1.5 block text-[13px] font-semibold text-slate-700"
                                >
                                    Pesan
                                </label>
                                <textarea
                                    id="message"
                                    rows={6}
                                    value={data.message}
                                    onChange={(e) =>
                                        setData('message', e.target.value)
                                    }
                                    placeholder="Ceritakan kebutuhan Anda..."
                                    className="block w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                                />
                                {errors.message && (
                                    <p className="mt-1 text-[12px] text-rose-600">
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            {errors.recaptcha_token && (
                                <p className="text-[12px] font-medium text-rose-600">
                                    {errors.recaptcha_token}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(18,35,125,0.6)] transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {processing ? 'Mengirim...' : 'Kirim Pesan'}
                                <Send className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </form>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-5">
                        <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white ring-1 ring-brand-800 sm:p-8">
                            <h3 className="text-[18px] font-extrabold tracking-tight">
                                Channel komunikasi
                            </h3>
                            <p className="mt-1 text-[13px] text-white/80">
                                Pilih channel yang paling nyaman untuk Anda.
                            </p>
                            <div className="mt-5 space-y-3">
                                {channels
                                    .filter((c) => c.value)
                                    .map((c) => (
                                        <a
                                            key={c.label}
                                            href={c.href}
                                            target={
                                                c.label === 'WhatsApp'
                                                    ? '_blank'
                                                    : undefined
                                            }
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15"
                                        >
                                            <span className="grid size-10 place-items-center rounded-xl bg-white/15 text-white">
                                                <c.icon className="size-4" />
                                            </span>
                                            <div>
                                                <div className="text-[11px] tracking-[0.14em] text-white/70 uppercase">
                                                    {c.label}
                                                </div>
                                                <div className="text-[14px] font-semibold text-white">
                                                    {c.value}
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                            </div>
                        </div>

                        {contact.address && (
                            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
                                <div className="flex items-start gap-3">
                                    <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
                                        <MapPin className="size-4" />
                                    </span>
                                    <div>
                                        <div className="text-[11px] tracking-[0.14em] text-slate-500 uppercase">
                                            Kantor Pusat
                                        </div>
                                        <div className="mt-1 text-[14px] leading-relaxed font-semibold whitespace-pre-line text-slate-900">
                                            {contact.address}
                                        </div>
                                    </div>
                                </div>
                                {contact.map_url && (
                                    <a
                                        href={contact.map_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline"
                                    >
                                        Buka di Google Maps →
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200 sm:p-8">
                            <div className="flex items-start gap-3">
                                <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                                    <Clock className="size-4" />
                                </span>
                                <div>
                                    <div className="text-[11px] tracking-[0.14em] text-slate-500 uppercase">
                                        Jam Operasional
                                    </div>
                                    <div className="mt-1 text-[14px] font-semibold text-slate-900">
                                        Senin – Jumat
                                    </div>
                                    <div className="text-[13.5px] text-slate-600">
                                        09.00 – 18.00 WIB
                                    </div>
                                    <div className="mt-2 text-[12px] text-slate-500">
                                        Di luar jam kerja, balasan email akan
                                        kami kirim di hari kerja berikutnya.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Field({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
}: {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-1.5 block text-[13px] font-semibold text-slate-700"
            >
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {error && (
                <p className="mt-1 text-[12px] text-rose-600">{error}</p>
            )}
        </div>
    );
}
