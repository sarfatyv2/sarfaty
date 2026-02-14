'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@nexus/ui';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@nexus/utils';
import { api } from '@/lib/api';

const paySchema = z.object({
  paymentReference: z.string().optional(),
});

type PayFormData = z.infer<typeof paySchema>;

interface PjInvoice {
  id: string;
  referenceMonth: number;
  referenceYear: number;
  invoiceAmount: string;
  [key: string]: unknown;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface PayInvoiceDialogProps {
  invoice: PjInvoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PayInvoiceDialog({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: PayInvoiceDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<PayFormData>({
    resolver: zodResolver(paySchema) as never,
  });

  async function onSubmit(data: PayFormData) {
    try {
      await api.post(`/people/invoices/${invoice.id}/pay`, {
        paymentReference: data.paymentReference || undefined,
      });
      toast.success('Nota fiscal marcada como paga');
      reset();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Erro ao marcar como paga');
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) reset();
    onOpenChange(newOpen);
  }

  const periodLabel = `${MONTH_NAMES[invoice.referenceMonth - 1]} ${invoice.referenceYear}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como paga</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {periodLabel} — {formatCurrency(Number(invoice.invoiceAmount))}
            </p>
            <div className="space-y-2">
              <Label htmlFor="paymentReference">Referência do pagamento</Label>
              <Input
                id="paymentReference"
                {...register('paymentReference')}
                placeholder="Ex: Lote 123, PIX..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
