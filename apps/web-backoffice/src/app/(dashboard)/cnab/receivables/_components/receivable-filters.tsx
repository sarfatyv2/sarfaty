'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
} from '@nexus/ui';
import { Search, X } from 'lucide-react';

const EVALUATION_OPTIONS = [
  { value: 'pending', label: 'Pendente avaliação' },
  { value: 'approved', label: 'Aprovada' },
  { value: 'rejected', label: 'Rejeitada' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'registered', label: 'Registrado' },
  { value: 'paid', label: 'Pago' },
  { value: 'overdue', label: 'Vencido' },
  { value: 'protested', label: 'Protestado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'written_off', label: 'Baixado' },
];

export function ReceivableFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const evaluationStatus = searchParams.get('evaluationStatus') ?? '';
  const dueDateFrom = searchParams.get('dueDateFrom') ?? '';
  const dueDateTo = searchParams.get('dueDateTo') ?? '';

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasFilters = search || status || evaluationStatus || dueDateFrom || dueDateTo;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar sacado, documento..."
          defaultValue={search}
          onChange={(e) => {
            const value = e.target.value;
            const timeout = setTimeout(() => updateParams('search', value), 400);
            return () => clearTimeout(timeout);
          }}
        />
      </div>

      <Select value={status} onValueChange={(v) => updateParams('status', v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[160px]">
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

      <Select value={evaluationStatus} onValueChange={(v) => updateParams('evaluationStatus', v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Avaliação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {EVALUATION_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Vencimento de</label>
          <Input
            type="date"
            className="w-[150px]"
            value={dueDateFrom}
            onChange={(e) => updateParams('dueDateFrom', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">até</label>
          <Input
            type="date"
            className="w-[150px]"
            value={dueDateTo}
            onChange={(e) => updateParams('dueDateTo', e.target.value)}
          />
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X size={14} />
          Limpar
        </Button>
      )}
    </div>
  );
}
