'use client';

import { useState, useCallback } from 'react';
import { Label } from '@nexus/ui';
import { MaskedInput, CNPJ_MASK } from '@/components/masked-input';
import { api, ApiError } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface CnpjValidationResult {
  companyName: string;
  tradeName: string | null;
  cnae: string | null;
  suggestedSegmentId: string | null;
  suggestedSegmentName: string | null;
  address: {
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  } | null;
}

interface CnpjFieldProps {
  value: string;
  onChange: (cnpj: string) => void;
  onValidated: (result: CnpjValidationResult) => void;
  onError: (message: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'error';

function validateCnpjChecksum(digits: string): boolean {
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (base: string, weights: readonly number[]): number => {
    const sum = weights.reduce((acc, weight, index) => acc + Number(base[index]) * weight, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (firstDigit !== Number(digits[12])) return false;

  const secondDigit = calcDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return secondDigit === Number(digits[13]);
}

export function CnpjField({ value, onChange, onValidated, onError, onClear, disabled }: CnpjFieldProps) {
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateCnpj = useCallback(
    async (cnpj: string) => {
      const digits = cnpj.replaceAll(/\D/g, '');
      if (digits.length !== 14) return;

      if (!validateCnpjChecksum(digits)) {
        setValidationState('error');
        const message = 'CNPJ inválido — verifique os dígitos verificadores';
        setErrorMessage(message);
        onError(message);
        return;
      }

      setValidationState('validating');
      setErrorMessage('');

      try {
        const response = await api.get<CnpjValidationResult>(`/cnpj/${digits}/validate`);
        setValidationState('valid');
        onValidated(response.data);
      } catch (err) {
        setValidationState('error');
        const message =
          err instanceof ApiError
            ? err.message
            : 'Erro ao validar CNPJ';
        setErrorMessage(message);
        onError(message);
      }
    },
    [onValidated, onError],
  );

  const handleAccept = useCallback(
    (newValue: string) => {
      onChange(newValue);
      const digits = newValue.replaceAll(/\D/g, '');

      if (digits.length < 14) {
        if (validationState !== 'idle') {
          setValidationState('idle');
          setErrorMessage('');
          onClear();
        }
        return;
      }

      if (digits.length === 14) {
        validateCnpj(newValue);
      }
    },
    [onChange, onClear, validateCnpj, validationState],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="cnpj">CNPJ</Label>
      <div className="relative">
        <MaskedInput
          id="cnpj"
          mask={CNPJ_MASK}
          value={value}
          onAccept={handleAccept}
          placeholder="00.000.000/0000-00"
          disabled={disabled || validationState === 'validating'}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validationState === 'validating' && (
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          )}
          {validationState === 'valid' && (
            <CheckCircle2 size={16} className="text-green-600" />
          )}
          {validationState === 'error' && (
            <XCircle size={16} className="text-destructive" />
          )}
        </div>
      </div>
      {validationState === 'error' && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
