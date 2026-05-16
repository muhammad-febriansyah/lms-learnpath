import { Label } from '@/components/ui/label';

type RequiredLabelProps = {
    htmlFor?: string;
    children: React.ReactNode;
    required?: boolean;
};

export function RequiredLabel({ htmlFor, children, required = false }: RequiredLabelProps) {
    return (
        <Label htmlFor={htmlFor} className="text-sm font-medium">
            {children}
            {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
    );
}
