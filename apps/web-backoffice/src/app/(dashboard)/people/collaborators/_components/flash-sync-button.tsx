'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@nexus/ui';
import { api, ApiError } from '@/lib/api';

interface FlashSyncResponseData {
  linked: number;
}

export function FlashSyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      try {
        const response = await api.post<FlashSyncResponseData>('/people/collaborators/flash-sync');
        const linked = response.data.linked ?? 0;
        toast.success(
          linked === 0
            ? 'Sincronização concluída. Nenhum novo vínculo por CPF.'
            : `Sincronização concluída. ${linked} colaborador(es) vinculado(s) ao Flash.`,
        );
        router.refresh();
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Erro ao sincronizar com o Flash.';
        toast.error(message);
      }
    });
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleSync} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Sincronizando…
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
          Sincronizar Flash
        </>
      )}
    </Button>
  );
}
