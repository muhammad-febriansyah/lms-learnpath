import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerFieldProps = {
    id?: string;
    value?: string | null;
    placeholder?: string;
    disabled?: boolean;
    onChange: (value: string | null) => void;
};

export function DatePickerField({
    id,
    value,
    placeholder = 'Pilih tanggal',
    disabled,
    onChange,
}: DatePickerFieldProps) {
    const selectedDate = value ? new Date(value) : undefined;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground',
                    )}
                >
                    <CalendarIcon className="mr-2 size-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                        if (!date) {
                            onChange(null);

                            return;
                        }

                        onChange(format(date, 'yyyy-MM-dd'));
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
