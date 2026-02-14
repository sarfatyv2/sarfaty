'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
import { CLIENT_STATUS_LABELS } from '@nexus/utils';
import { api } from '@/lib/api';

interface Segment {
  id: string;
  name: string;
}

export function ClientFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [segments, setSegments] = useState<Segment[]>([]);

  useEffect(() => {
    api.get<Segment[]>('/segments').then((res) => {
      setSegments(res.data ?? []);
    }).catch(() => {
      /* ignore */
    });
  }, []);

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
    searchParams.has('status') ||
    searchParams.has('segmentId');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por empresa, CNPJ..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => updateFilter('search', e.target.value || undefined)}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get('status') ?? ''}
        onValueChange={(value) => updateFilter('status', value || undefined)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CLIENT_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('segmentId') ?? ''}
        onValueChange={(value) => updateFilter('segmentId', value || undefined)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Segmento" />
        </SelectTrigger>
        <SelectContent>
          {segments.map((seg) => (
            <SelectItem key={seg.id} value={seg.id}>
              {seg.name}
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
