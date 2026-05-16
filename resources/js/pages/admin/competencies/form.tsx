import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Competency = {
    id: number;
    name: string;
    category: string | null;
    description: string | null;
    is_active: boolean;
};

type Props = {
    competency: Competency | null;
    categoryOptions: string[];
};

export default function CompetencyForm({ competency, categoryOptions }: Props) {
    const isEdit = !!competency;
    const form = useForm({
        name: competency?.name ?? '',
        category: competency?.category ?? '',
        description: competency?.description ?? '',
        is_active: competency?.is_active ?? true,
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (isEdit) {
            form.put(`/admin/competencies/${competency!.id}`);
        } else {
            form.post('/admin/competencies');
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Kompetensi' : 'Tambah Kompetensi'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/competencies" className="hover:text-slate-700">
                            Kompetensi
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Kompetensi' : 'Tambah Kompetensi'}
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6"
                >
                    <div className="space-y-2">
                        <RequiredLabel htmlFor="name" required>
                            Nama Kompetensi
                        </RequiredLabel>
                        <Input
                            id="name"
                            placeholder="Contoh: Negosiasi B2B"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                        />
                        <FieldError message={form.errors.name} />
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="category">Kategori</RequiredLabel>
                        <Input
                            id="category"
                            list="category-suggest"
                            placeholder="Contoh: Soft Skill, Hard Skill, Leadership"
                            value={form.data.category}
                            onChange={(e) => form.setData('category', e.target.value)}
                        />
                        <datalist id="category-suggest">
                            {categoryOptions.map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                        <p className="text-[11.5px] text-slate-500">
                            Boleh pakai kategori yang sudah ada atau buat baru.
                        </p>
                        <FieldError message={form.errors.category} />
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="description">Deskripsi</RequiredLabel>
                        <Textarea
                            id="description"
                            rows={4}
                            placeholder="Jelaskan apa yang termasuk dalam kompetensi ini, level rubrik, dan indikator perilaku..."
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                        />
                        <p className="text-[11.5px] text-slate-500">
                            Level rubrik standar: 1=Awareness, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert.
                        </p>
                        <FieldError message={form.errors.description} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                        <div>
                            <div className="text-[13.5px] font-semibold text-slate-900">
                                Status Aktif
                            </div>
                            <div className="text-[12px] text-slate-500">
                                Kompetensi nonaktif tidak muncul di pilihan saat input target/review.
                            </div>
                        </div>
                        <Switch
                            checked={form.data.is_active}
                            onCheckedChange={(checked) => form.setData('is_active', checked)}
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/competencies">
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
