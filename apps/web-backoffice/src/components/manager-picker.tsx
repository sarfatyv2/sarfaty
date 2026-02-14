'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Button,
  cn,
} from '@nexus/ui';
import { api } from '@/lib/api';

interface ManagerOption {
  id: string;
  fullName: string;
  department: string | null;
}

interface ManagerPickerProps {
  value: string | null | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ManagerPicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecionar gestor...',
}: Readonly<ManagerPickerProps>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<ManagerOption[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchManagers = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const result = await api.get<
        Array<{
          id: string;
          fullName: string;
          department: string | null;
        }>
      >('/users', {
        search: query || undefined,
        isActive: true,
        pageSize: 20,
      });

      setOptions(
        (result.data ?? []).map((user) => ({
          id: user.id,
          fullName: user.fullName,
          department: user.department,
        })),
      );
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchManagers('');
  }, [open, fetchManagers]);

  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchManagers(search);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, open, fetchManagers]);

  // Resolve the selected label when value changes externally
  useEffect(() => {
    if (!value) {
      setSelectedLabel('');
      return;
    }

    // Check if we already have it in the options list
    const found = options.find((opt) => opt.id === value);
    if (found) {
      setSelectedLabel(found.fullName);
      return;
    }

    // Otherwise, fetch the user by searching for the id won't work — keep the label if already set
    if (!selectedLabel) {
      setSelectedLabel('Carregando...');
      api
        .get<
          Array<{ id: string; fullName: string; department: string | null }>
        >('/users', { search: '', isActive: true, pageSize: 100 })
        .then((result) => {
          const match = (result.data ?? []).find((u) => u.id === value);
          setSelectedLabel(match?.fullName ?? value);
        })
        .catch(() => {
          setSelectedLabel(value);
        });
    }
  }, [value, options, selectedLabel]);

  const handleSelect = (managerId: string) => {
    if (managerId === value) {
      onChange(undefined);
      setSelectedLabel('');
    } else {
      onChange(managerId);
      const found = options.find((opt) => opt.id === managerId);
      setSelectedLabel(found?.fullName ?? managerId);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSelectedLabel('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <span className="truncate">
            {value ? selectedLabel || 'Carregando...' : placeholder}
          </span>
          <div className="ml-2 flex shrink-0 items-center gap-1">
            {value && (
              <span
                role="button"
                tabIndex={0}
                className="rounded-sm p-0.5 hover:bg-accent"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleClear(e as unknown as React.MouseEvent);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-50 hover:opacity-100"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-50"
            >
              <path d="m7 15 5 5 5-5" />
              <path d="m7 9 5-5 5 5" />
            </svg>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nome..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Buscando...
              </div>
            ) : (
              <>
                <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={handleSelect}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cn(
                          'mr-2 shrink-0',
                          value === option.id ? 'opacity-100' : 'opacity-0',
                        )}
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{option.fullName}</span>
                        {option.department && (
                          <span className="text-xs text-muted-foreground">
                            {option.department}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
