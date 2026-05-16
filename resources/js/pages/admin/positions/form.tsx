import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Position = {
    id: number;
    name: string;
    division: string | null;
    branch: string | null;
    description: string | null;
    is_active: boolean;
};

type Props = {
    position: Position | null;
};

export default function PositionForm({ position }: Props) {
    const isEdit = !!position;
    const form = useForm({
        name: position?.name ?? '',
        division: position?.division ?? '',
        branch: position?.branch ?? '',
        description: position?.description ?? '',
        is_active: position?.is_active ?? true,
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (isEdit) {
            form.put(`/admin/positions/${position!.id}`);
        } else {
            form.post('/admin/positions');
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Jabatan' : 'Tambah Jabatan'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/positions" className="hover:text-slate-700">
                            Jabatan
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Jabatan' : 'Tambah Jabatan'}
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6"
                >
                    <div className="space-y-2">
                        <RequiredLabel htmlFor="name" required>
                            Nama Jabatan
                        </RequiredLabel>
                        <Input
                            id="name"
                            placeholder="Contoh: Senior Sales Associate"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                        />
                        <FieldError message={form.errors.name} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="division">Divisi</RequiredLabel>
                            <Input
                                id="division"
                                placeholder="Contoh: Sales"
                                value={form.data.division}
                                onChange={(e) => form.setData('division', e.target.value)}
                            />
                            <FieldError message={form.errors.division} />
                        </div>
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="branch">Cabang</RequiredLabel>
                            <Input
                                id="branch"
                                placeholder="Contoh: Jakarta Pusat"
                                value={form.data.branch}
                                onChange={(e) => form.setData('branch', e.target.value)}
                            />
                            <FieldError message={form.errors.branch} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="description">Deskripsi</RequiredLabel>
                        <Textarea
                            id="description"
                            rows={4}
                            placeholder="Jelaskan tanggung jawab utama jabatan ini..."
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
                                Jabatan nonaktif tidak muncul di pilihan saat input data karyawan.
                            </div>
                        </div>
                        <Switch
                            checked={form.data.is_active}
                            onCheckedChange={(checked) => form.setData('is_active', checked)}
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/positions">
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
