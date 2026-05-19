import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Division = {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    is_active: boolean;
};

type Props = {
    division: Division | null;
};

export default function DivisionForm({ division }: Props) {
    const isEdit = !!division;
    const form = useForm({
        name: division?.name ?? '',
        code: division?.code ?? '',
        description: division?.description ?? '',
        is_active: division?.is_active ?? true,
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (isEdit) {
            form.put(`/admin/divisions/${division!.id}`);
        } else {
            form.post('/admin/divisions');
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Divisi' : 'Tambah Divisi'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/divisions" className="hover:text-slate-700">
                            Divisi
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Divisi' : 'Tambah Divisi'}
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-7 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-7"
                >
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2.5 sm:col-span-2">
                            <RequiredLabel htmlFor="name" required>
                                Nama Divisi
                            </RequiredLabel>
                            <Input
                                id="name"
                                placeholder="Contoh: Sales & Marketing"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FieldError message={form.errors.name} />
                        </div>
                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="code">Kode</RequiredLabel>
                            <Input
                                id="code"
                                placeholder="Contoh: SLS"
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                            />
                            <FieldError message={form.errors.code} />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <RequiredLabel htmlFor="description">Deskripsi</RequiredLabel>
                        <Textarea
                            id="description"
                            rows={4}
                            placeholder="Jelaskan ruang lingkup tanggung jawab divisi ini..."
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                        />
                        <FieldError message={form.errors.description} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                        <div>
                            <div className="text-[13.5px] font-semibold text-slate-900">
                                Status Aktif
                            </div>
                            <div className="text-[12px] text-slate-500">
                                Divisi nonaktif tidak muncul di pilihan saat input data karyawan/jabatan.
                            </div>
                        </div>
                        <Switch
                            checked={form.data.is_active}
                            onCheckedChange={(checked) => form.setData('is_active', checked)}
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/divisions">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Batal
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Save className="mr-1.5 size-4" />
                            {form.processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
