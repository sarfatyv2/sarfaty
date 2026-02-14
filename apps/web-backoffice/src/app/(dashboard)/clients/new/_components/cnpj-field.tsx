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

export function CnpjField({ value, onChange, onValidated, onError, onClear, disabled }: CnpjFieldProps) {
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateCnpj = useCallback(
    async (cnpj: string) => {
      const digits = cnpj.replaceAll(/\D/g, '');
      if (digits.length !== 14) return;

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
