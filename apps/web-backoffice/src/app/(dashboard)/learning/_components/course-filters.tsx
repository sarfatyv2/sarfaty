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
import { COURSE_CATEGORY_LABELS } from '@nexus/utils';

export function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';

  const updateParams = useCallback(
    (key: string, value: string) => {
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

  const hasFilters = search || category;

  const clearFilters = useCallback(() => {
    router.push('?');
  }, [router]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cursos..."
          className="pl-9"
          defaultValue={search}
          onChange={(e) => updateParams('search', e.target.value)}
        />
      </div>
      <Select value={category} onValueChange={(val) => updateParams('category', val)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(COURSE_CATEGORY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="outline" size="icon" onClick={clearFilters}>
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
