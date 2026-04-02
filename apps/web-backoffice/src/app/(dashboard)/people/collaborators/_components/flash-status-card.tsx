'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@nexus/ui';
import { api, ApiError } from '@/lib/api';

interface FlashRegisterResponseData {
  flashEmployeeId?: string | null;
}

interface FlashStatusCardProps {
  collaboratorId: string;
  initialFlashEmployeeId: string | null;
  canEdit: boolean;
}

function truncateFlashId(id: string, visibleChars = 8): string {
  if (id.length <= visibleChars * 2) return id;
  return `${id.slice(0, visibleChars)}…${id.slice(-visibleChars)}`;
}

export function FlashStatusCard({
  collaboratorId,
  initialFlashEmployeeId,
  canEdit,
}: FlashStatusCardProps) {
  const router = useRouter();
  const [flashEmployeeId, setFlashEmployeeId] = useState<string | null>(initialFlashEmployeeId);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFlashEmployeeId(initialFlashEmployeeId);
  }, [initialFlashEmployeeId]);

  const handleRegister = () => {
    startTransition(async () => {
      try {
        const response = await api.post<FlashRegisterResponseData>(
          `/people/collaborators/${collaboratorId}/flash-register`,
        );
        const nextId = response.data.flashEmployeeId ?? null;
        if (!nextId) {
          toast.warning(
            'Não foi possível vincular ao Flash. Verifique CPF, mapeamento da empresa (FLASH_COMPANY_ID_MAP) e credenciais da API.',
          );
          return;
        }
        setFlashEmployeeId(nextId);
        toast.success('Colaborador vinculado ao Flash.');
        router.refresh();
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Erro ao vincular ao Flash.';
        toast.error(message);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4" aria-hidden />
          Flash Benefícios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {flashEmployeeId ? (
            <>
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
                Vinculado ao Flash
              </Badge>
              <span className="text-xs text-muted-foreground font-mono" title={flashEmployeeId}>
                ID: {truncateFlashId(flashEmployeeId)}
              </span>
            </>
          ) : (
            <>
              <Badge variant="secondary">Não vinculado</Badge>
              {canEdit && (
                <Button type="button" size="sm" onClick={handleRegister} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Vinculando…
                    </>
                  ) : (
                    'Vincular ao Flash'
                  )}
                </Button>
              )}
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          O vínculo permite sincronizar dados cadastrais com a plataforma de benefícios. Alterações
          feitas na aba Editar são replicadas no Flash quando houver vínculo ativo.
        </p>
      </CardContent>
    </Card>
  );
}
