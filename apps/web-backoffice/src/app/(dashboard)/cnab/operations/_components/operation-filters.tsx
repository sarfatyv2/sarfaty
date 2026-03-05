'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
} from '@nexus/ui';
import { X } from 'lucide-react';
import { ClientPicker } from '@/components/client-picker';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'under_evaluation', label: 'Em avaliação' },
  { value: 'evaluated', label: 'Avaliada' },
  { value: 'active', label: 'Ativa' },
];

export function OperationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clientId = searchParams.get('clientId') ?? '';
  const status = searchParams.get('status') ?? '';

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasFilters = clientId || status;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1 min-w-[220px]">
        <label className="text-xs text-muted-foreground">Cliente</label>
        <ClientPicker
          value={clientId || undefined}
          onChange={(v) => updateParams('clientId', v ?? '')}
          placeholder="Todos os clientes"
        />
      </div>

      <Select value={status || 'all'} onValueChange={(v) => updateParams('status', v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X size={14} />
          Limpar
        </Button>
      )}
    </div>
  );
}
