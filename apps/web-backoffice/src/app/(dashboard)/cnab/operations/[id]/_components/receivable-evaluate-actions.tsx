'use client';

import { useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Textarea,
} from '@nexus/ui';
import { MoreHorizontal, Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ReceivableEvaluateActionsProps {
  receivableId: string;
  evaluationStatus: string;
  onEvaluated: () => void;
}

export function ReceivableEvaluateActions({
  receivableId,
  evaluationStatus,
  onEvaluated,
}: ReceivableEvaluateActionsProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.patch(`/cnab/receivables/${receivableId}/evaluate`, {
        evaluationStatus: 'approved',
      });
      toast.success('Duplicata aprovada');
      onEvaluated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao aprovar');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Informe o motivo da rejeição');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/cnab/receivables/${receivableId}/evaluate`, {
        evaluationStatus: 'rejected',
        rejectionReason: rejectionReason.trim(),
      });
      toast.success('Duplicata rejeitada');
      setRejectOpen(false);
      setRejectionReason('');
      onEvaluated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao rejeitar');
    } finally {
      setLoading(false);
    }
  };

  if (evaluationStatus !== 'pending') {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleApprove} disabled={loading}>
            <Check size={14} className="mr-2" />
            Aprovar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRejectOpen(true)} disabled={loading}>
            <X size={14} className="mr-2" />
            Rejeitar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar duplicata</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Motivo da rejeição (obrigatório)</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Ex: Sacado bloqueado, documento irregular..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleReject} disabled={loading || !rejectionReason.trim()}>
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
