import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    RemoveFormatting,
    Underline,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RichTextEditorProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Tulis konten di sini...',
    className,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        if (editor.innerHTML !== value) {
            editor.innerHTML = value;
        }
    }, [value]);

    const syncContent = () => {
        onChange(editorRef.current?.innerHTML ?? '');
    };

    const focusEditor = () => {
        editorRef.current?.focus();
    };

    const runCommand = (command: string, argument?: string) => {
        focusEditor();
        document.execCommand(command, false, argument);
        syncContent();
    };

    const setBlock = (tag: 'H2' | 'H3' | 'P' | 'BLOCKQUOTE') => {
        runCommand('formatBlock', tag);
    };

    const insertLink = () => {
        const url = window.prompt('Masukkan URL tautan');

        if (!url) {
            return;
        }

        runCommand('createLink', url);
    };

    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border border-slate-200 bg-white',
                className,
            )}
        >
            <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3">
                <ToolbarButton
                    label="Bold"
                    icon={Bold}
                    onClick={() => runCommand('bold')}
                />
                <ToolbarButton
                    label="Italic"
                    icon={Italic}
                    onClick={() => runCommand('italic')}
                />
                <ToolbarButton
                    label="Underline"
                    icon={Underline}
                    onClick={() => runCommand('underline')}
                />
                <ToolbarButton
                    label="Heading 2"
                    icon={Heading2}
                    onClick={() => setBlock('H2')}
                />
                <ToolbarButton
                    label="Heading 3"
                    icon={Heading3}
                    onClick={() => setBlock('H3')}
                />
                <ToolbarButton
                    label="Bullet List"
                    icon={List}
                    onClick={() => runCommand('insertUnorderedList')}
                />
                <ToolbarButton
                    label="Numbered List"
                    icon={ListOrdered}
                    onClick={() => runCommand('insertOrderedList')}
                />
                <ToolbarButton
                    label="Quote"
                    icon={Quote}
                    onClick={() => setBlock('BLOCKQUOTE')}
                />
                <ToolbarButton
                    label="Link"
                    icon={LinkIcon}
                    onClick={insertLink}
                />
                <ToolbarButton
                    label="Clear"
                    icon={RemoveFormatting}
                    onClick={() => {
                        focusEditor();
                        document.execCommand('removeFormat');
                        setBlock('P');
                        syncContent();
                    }}
                />
            </div>

            <div className="relative">
                {!value && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 px-4 py-3 text-sm text-slate-400">
                        {placeholder}
                    </div>
                )}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncContent}
                    className={cn(
                        'min-h-[320px] px-4 py-3 text-sm leading-7 text-slate-700 outline-none',
                        '[&_*]:max-w-full',
                        '[&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600',
                        '[&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900',
                        '[&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900',
                        '[&_ol]:list-decimal [&_ol]:pl-6',
                        '[&_p]:my-3',
                        '[&_ul]:list-disc [&_ul]:pl-6',
                        '[&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline',
                    )}
                />
            </div>
        </div>
    );
}

function ToolbarButton({
    label,
    icon: Icon,
    onClick,
}: {
    label: string;
    icon: typeof Bold;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl bg-white"
            onMouseDown={(event) => {
                event.preventDefault();
                onClick();
            }}
        >
            <Icon className="size-4" />
            <span className="sr-only">{label}</span>
        </Button>
    );
}
