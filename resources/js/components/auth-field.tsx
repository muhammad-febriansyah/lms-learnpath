import type { InputHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';

type FieldProps = {
    label: string;
    icon: ReactNode;
    error?: string;
    trailing?: ReactNode;
    children: ReactNode;
};

export function AuthField({ label, icon, error, trailing, children }: FieldProps) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-slate-700">{label}</span>
            <div
                className={
                    'group flex items-center gap-3 rounded-xl bg-surface px-3.5 py-3 ring-1 transition ' +
                    (error
                        ? 'ring-rose-300 focus-within:ring-2 focus-within:ring-rose-400'
                        : 'ring-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-600')
                }
            >
                <span
                    className={
                        'shrink-0 ' +
                        (error ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-brand-600')
                    }
                >
                    {icon}
                </span>
                {children}
                {trailing && <span className="shrink-0">{trailing}</span>}
            </div>
            {error && (
                <span className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] text-rose-600">
                    <svg
                        viewBox="0 0 24 24"
                        className="size-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v6" />
                        <path d="M12 16h.01" />
                    </svg>
                    {error}
                </span>
            )}
        </label>
    );
}

export function AuthInput({
    className = '',
    ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...rest}
            className={
                'peer w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400 ' +
                className
            }
        />
    );
}

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement>;

export function AuthPasswordInput({
    name,
    id,
    placeholder = '••••••••',
    autoComplete = 'current-password',
    required,
    tabIndex,
    className = '',
    ...rest
}: PasswordFieldProps) {
    const [show, setShow] = useState(false);

    return (
        <>
            <AuthInput
                id={id}
                name={name}
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                tabIndex={tabIndex}
                className={`tracking-wider ${className}`}
                {...rest}
            />
            <button
                type="button"
                aria-label={show ? 'Sembunyikan' : 'Tampilkan'}
                onClick={() => setShow((s) => !s)}
                className="text-slate-400 transition hover:text-brand-600"
            >
                {show ? (
                    <svg
                        viewBox="0 0 24 24"
                        className="size-[18px]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17.4 17.4 0 0 1-3.2 4" />
                        <path d="M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.8" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    </svg>
                ) : (
                    <svg
                        viewBox="0 0 24 24"
                        className="size-[18px]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </>
    );
}

export function MailIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="size-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 7.3 5.2a1.2 1.2 0 0 0 1.4 0L20 7" />
        </svg>
    );
}

export function LockIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="size-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="4" y="10" width="16" height="11" rx="2.5" />
            <path d="M8 10V7a4 4 0 1 1 8 0v3" />
        </svg>
    );
}

export function UserIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="size-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
    );
}
