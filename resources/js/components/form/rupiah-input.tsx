import { Input } from '@/components/ui/input';

type RupiahInputProps = {
    id?: string;
    value: number | string;
    placeholder?: string;
    disabled?: boolean;
    onChange: (value: number) => void;
};

function formatRupiah(value: number | string): string {
    const numericValue = String(value ?? '').replace(/\D/g, '');

    if (!numericValue) {
return '';
}

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(Number(numericValue));
}

export function RupiahInput({
    id,
    value,
    placeholder = 'Contoh: Rp 250.000',
    disabled,
    onChange,
}: RupiahInputProps) {
    return (
        <Input
            id={id}
            inputMode="numeric"
            placeholder={placeholder}
            disabled={disabled}
            value={formatRupiah(value)}
            onChange={(event) => {
                const rawValue = event.target.value.replace(/\D/g, '');
                onChange(rawValue ? Number(rawValue) : 0);
            }}
        />
    );
}
