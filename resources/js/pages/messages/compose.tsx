import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';
import { useMemo, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

type Recipient = { id: number; name: string; email: string };

type ReplyTo = {
    id: number;
    sender: { id: number; name: string; email: string };
    subject: string;
    quote: string;
};

type Props = {
    recipients: Recipient[];
    replyTo: ReplyTo | null;
};

export default function MessagesCompose({ recipients, replyTo }: Props) {
    const [recipientSearch, setRecipientSearch] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);

    const form = useForm({
        recipient_id: replyTo?.sender.id ?? '',
        subject: replyTo?.subject ?? '',
        body: replyTo ? `\n\n---\n${replyTo.quote}` : '',
        parent_id: replyTo?.id ?? null,
    });

    const filteredRecipients = useMemo(() => {
        const q = recipientSearch.trim().toLowerCase();
        if (!q) return recipients.slice(0, 20);
        return recipients
            .filter(
                (r) =>
                    r.name.toLowerCase().includes(q) ||
                    r.email.toLowerCase().includes(q),
            )
            .slice(0, 20);
    }, [recipientSearch, recipients]);

    const selectedRecipient = recipients.find((r) => r.id.toString() === form.data.recipient_id.toString());

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/messages');
    }

    return (
        <>
            <Head title="Tulis Pesan" />
            <div className="mx-auto max-w-3xl space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/messages" className="hover:text-slate-700">
                            Pesan
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {replyTo ? 'Balas' : 'Tulis Baru'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {replyTo ? 'Balas Pesan' : 'Tulis Pesan'}
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6"
                >
                    <div className="space-y-2">
                        <RequiredLabel required>Kepada</RequiredLabel>
                        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-[13px] hover:bg-slate-50"
                                >
                                    {selectedRecipient ? (
                                        <span className="text-slate-900">
                                            <span className="font-semibold">{selectedRecipient.name}</span>
                                            <span className="ml-2 text-[11.5px] text-slate-500">
                                                {selectedRecipient.email}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Pilih penerima...</span>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <div className="border-b border-slate-100 p-2">
                                    <Input
                                        autoFocus
                                        value={recipientSearch}
                                        onChange={(e) => setRecipientSearch(e.target.value)}
                                        placeholder="Cari nama atau email..."
                                        className="h-9"
                                    />
                                </div>
                                <ul className="max-h-[280px] overflow-y-auto p-1">
                                    {filteredRecipients.length === 0 ? (
                                        <li className="px-3 py-4 text-center text-[12px] text-slate-500">
                                            Tidak ada hasil.
                                        </li>
                                    ) : (
                                        filteredRecipients.map((r) => (
                                            <li key={r.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        form.setData('recipient_id', r.id.toString());
                                                        setPickerOpen(false);
                                                        setRecipientSearch('');
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-slate-50"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="truncate text-[12.5px] font-semibold text-slate-900">
                                                            {r.name}
                                                        </div>
                                                        <div className="truncate text-[11px] text-slate-500">
                                                            {r.email}
                                                        </div>
                                                    </div>
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </PopoverContent>
                        </Popover>
                        <FieldError message={form.errors.recipient_id} />
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="subject" required>
                            Subjek
                        </RequiredLabel>
                        <Input
                            id="subject"
                            placeholder="Tulis subjek yang jelas..."
                            value={form.data.subject}
                            onChange={(e) => form.setData('subject', e.target.value)}
                            maxLength={200}
                            required
                        />
                        <FieldError message={form.errors.subject} />
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="body" required>
                            Isi Pesan
                        </RequiredLabel>
                        <Textarea
                            id="body"
                            rows={10}
                            placeholder="Tulis pesan Anda di sini..."
                            value={form.data.body}
                            onChange={(e) => form.setData('body', e.target.value)}
                            maxLength={5000}
                            required
                        />
                        <div className="flex justify-between">
                            <FieldError message={form.errors.body} />
                            <span className="text-[11px] text-slate-400">
                                {form.data.body.length}/5000
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/messages">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Batal
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Send className="mr-1.5 size-4" />
                            {form.processing ? 'Mengirim...' : 'Kirim'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
