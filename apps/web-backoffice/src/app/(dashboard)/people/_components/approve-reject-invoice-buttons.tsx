'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Textarea,
  Label,
} from '@nexus/ui';
import { Check, X } from 'lucide-react';
import { api } from '@/lib/api';

const rejectSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório'),
});

type RejectFormData = z.infer<typeof rejectSchema>;

interface ApproveRejectInvoiceButtonsProps {
  invoiceId: string;
  onSuccess: () => void;
}

export function ApproveRejectInvoiceButtons({
  invoiceId,
  onSuccess,
}: ApproveRejectInvoiceButtonsProps) {
  const [rejectOpen, setRejectOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema) as never,
  });

  async function handleApprove() {
    try {
      await api.post(`/people/invoices/${invoiceId}/approve`);
      toast.success('Nota fiscal aprovada');
      onSuccess();
    } catch {
      toast.error('Erro ao aprovar nota fiscal');
    }
  }

  async function handleRejectSubmit(data: RejectFormData) {
    try {
      await api.post(`/people/invoices/${invoiceId}/reject`, {
        reason: data.reason,
      });
      toast.success('Nota fiscal rejeitada');
      reset();
      setRejectOpen(false);
      onSuccess();
    } catch {
      toast.error('Erro ao rejeitar nota fiscal');
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="default" size="sm" onClick={handleApprove}>
          <Check size={14} className="mr-1" />
          Aprovar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)}>
          <X size={14} className="mr-1" />
          Rejeitar
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar nota fiscal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleRejectSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo da rejeição</Label>
                <Textarea
                  id="reason"
                  {...register('reason')}
                  placeholder="Descreva o motivo..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                Rejeitar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
