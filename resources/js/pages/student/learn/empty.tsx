import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
    course: { id: number; title: string; slug: string };
};

export default function LearnEmpty({ course }: Props) {
    return (
        <>
            <Head title={course.title} />
            <div className="mx-auto max-w-2xl py-16 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <BookOpen className="size-7" />
                </div>
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                    Belum ada materi
                </h1>
                <p className="mt-2 text-[14px] text-slate-500">
                    Course <span className="font-semibold">{course.title}</span> belum punya
                    section dan lesson. Hubungi instruktur Anda untuk konfirmasi.
                </p>
                <Button asChild className="mt-6 rounded-xl bg-brand-600 hover:bg-brand-700">
                    <Link href="/my-courses">
                        <ArrowLeft className="mr-1.5 size-4" />
                        Kembali ke Kelas Saya
                    </Link>
                </Button>
            </div>
        </>
    );
}
