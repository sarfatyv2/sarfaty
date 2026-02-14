'use client';

import { IMaskInput } from 'react-imask';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@nexus/ui';

const inputClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: string | object;
  value?: string;
  onAccept?: (value: string) => void;
  className?: string;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onAccept, className, ...props }, ref) => {
    return (
      <IMaskInput
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mask={mask as any}
        value={value}
        onAccept={onAccept}
        inputRef={ref as React.Ref<HTMLInputElement>}
        className={cn(inputClassName, className)}
        {...props}
      />
    );
  },
);
MaskedInput.displayName = 'MaskedInput';

export const CPF_MASK = '000.000.000-00';
export const CNPJ_MASK = '00.000.000/0001-00';
export const PHONE_MASK = [
  { mask: '(00) 0000-0000' },
  { mask: '(00) 00000-0000' },
];
export const CEP_MASK = '00000-000';
