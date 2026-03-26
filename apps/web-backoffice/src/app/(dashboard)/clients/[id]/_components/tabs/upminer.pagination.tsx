'use client';

import { useState, useCallback } from 'react';
import { Button } from '@nexus/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── usePagination hook ───────────────────────────────────────────────────────

interface UsePaginationOptions {
  total: number;
  pageSize: number;
}

export interface UsePaginationReturn {
  page: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  goTo: (page: number) => void;
  prev: () => void;
  next: () => void;
  reset: () => void;
}

export function usePagination({ total, pageSize }: UsePaginationOptions): UsePaginationReturn {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const goTo = useCallback(
    (p: number) => setPage(Math.min(Math.max(1, p), totalPages)),
    [totalPages],
  );
  const prev = useCallback(() => goTo(page - 1), [goTo, page]);
  const next = useCallback(() => goTo(page + 1), [goTo, page]);
  const reset = useCallback(() => setPage(1), []);

  return {
    page,
    totalPages,
    startIndex,
    endIndex,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    goTo,
    prev,
    next,
    reset,
  };
}

// ─── PaginationBar component ──────────────────────────────────────────────────

interface PaginationBarProps {
  page: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (page: number) => void;
}

const MAX_PAGE_BUTTONS = 5;

export function PaginationBar({
  page,
  totalPages,
  startIndex,
  endIndex,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onGoTo,
}: Readonly<PaginationBarProps>) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between gap-2 border-t pt-3 mt-2">
      <p className="text-xs text-muted-foreground">
        {startIndex + 1}–{endIndex} de {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={!hasPrev}
          onClick={onPrev}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${p}-${i}`}
              className="h-7 w-7 flex items-center justify-center text-xs text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => onGoTo(p)}
              aria-label={`Página ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={!hasNext}
          onClick={onNext}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= MAX_PAGE_BUTTONS) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);

  if (rangeStart > 2) pages.push('ellipsis');
  for (let p = rangeStart; p <= rangeEnd; p += 1) pages.push(p);
  if (rangeEnd < total - 1) pages.push('ellipsis');

  pages.push(total);
  return pages;
}
