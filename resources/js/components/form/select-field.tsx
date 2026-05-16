import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type SelectFieldOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

type SelectFieldProps = {
    id?: string;
    value?: string | null;
    placeholder?: string;
    disabled?: boolean;
    options: SelectFieldOption[];
    onChange: (value: string) => void;
};

export function SelectField({
    id,
    value,
    placeholder = 'Pilih opsi',
    disabled,
    options,
    onChange,
}: SelectFieldProps) {
    return (
        <Select
            value={value ?? undefined}
            onValueChange={onChange}
            disabled={disabled}
        >
            <SelectTrigger id={id} className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
                {options.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
