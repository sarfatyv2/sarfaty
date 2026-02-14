'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
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

export function CollaboratorFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push('?');
  }, [router]);

  const hasFilters =
    searchParams.has('search') ||
    searchParams.has('employmentType') ||
    searchParams.has('isActive') ||
    searchParams.has('department');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email, CPF..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => updateFilter('search', e.target.value || undefined)}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get('employmentType') ?? ''}
        onValueChange={(value) => updateFilter('employmentType', value || undefined)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="clt">CLT</SelectItem>
          <SelectItem value="pj">PJ</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('isActive') ?? ''}
        onValueChange={(value) => updateFilter('isActive', value || undefined)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Ativo</SelectItem>
          <SelectItem value="false">Inativo</SelectItem>
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
