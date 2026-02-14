'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nexus/ui';
import { Search } from 'lucide-react';
import { ENROLLMENT_STATUS_LABELS } from '@nexus/utils';

interface ProgressFiltersProps {
  currentStatus?: string;
  currentSearch?: string;
}

const STATUS_OPTIONS = Object.entries(ENROLLMENT_STATUS_LABELS) as [string, string][];

export function ProgressFilters({ currentStatus, currentSearch }: ProgressFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch ?? '');

  const updateParams = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleSearchSubmit = () => {
    updateParams('search', searchValue.trim() || undefined);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          onBlur={handleSearchSubmit}
          placeholder="Buscar por nome..."
          className="pl-9 h-9 text-sm"
        />
      </div>

      <Select
        value={currentStatus ?? 'all'}
        onValueChange={(value) => updateParams('status', value === 'all' ? undefined : value)}
      >
        <SelectTrigger className="w-48 h-9 text-sm">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {STATUS_OPTIONS.map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
