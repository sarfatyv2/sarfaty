'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
  Button, Input, Label, ScrollArea, Separator, Textarea
} from '@nexus/ui';
import { createCommercialReportSchema, type CreateCommercialReportDto } from '@nexus/validators';

interface CommercialReportDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: CreateCommercialReportDto) => void;
  parsedData: Partial<CreateCommercialReportDto> | null;
  fileName: string;
}

export function CommercialReportDialog({ open, onClose, onConfirm, parsedData, fileName }: CommercialReportDialogProps) {
  const form = useForm<CreateCommercialReportDto>({
    resolver: zodResolver(createCommercialReportSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (parsedData && open) {
      form.reset({
        ...parsedData,
      });
    }
  }, [parsedData, open, form]);

  const handleSubmit = (values: CreateCommercialReportDto) => {
    onConfirm(values);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Revisão do Relatório Comercial</DialogTitle>
          <DialogDescription>
            Extraímos os dados do arquivo <strong>{fileName}</strong>. Revise-os abaixo antes de salvar.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <form id="commercial-report-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-6 pt-2">
            
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Metadados</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Data da Visita</Label>
                  <Input id="visitDate" type="date" {...form.register('visitDate')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportDate">Data do Relatório</Label>
                  <Input id="reportDate" type="date" {...form.register('reportDate')} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="proposalType">Tipo de Proposta</Label>
                  <Input id="proposalType" {...form.register('proposalType')} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Dados Produtivos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installedCapacity">Capacidade Instalada</Label>
                  <Input id="installedCapacity" {...form.register('installedCapacity')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utilizedCapacity">Capacidade Utilizada</Label>
                  <Input id="utilizedCapacity" {...form.register('utilizedCapacity')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productiveCapacity">Capacidade Produtiva</Label>
                  <Input id="productiveCapacity" {...form.register('productiveCapacity')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">Estoques</Label>
                  <Input id="inventory" {...form.register('inventory')} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="mainClients">Principais Clientes</Label>
                  <Input id="mainClients" {...form.register('mainClients')} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="mainSuppliers">Principais Fornecedores</Label>
                  <Input id="mainSuppliers" {...form.register('mainSuppliers')} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Meios Circulantes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grossPayroll">FOPAG Bruta (R$)</Label>
                  <Input id="grossPayroll" type="number" step="0.01" {...form.register('grossPayroll')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountsReceivable">Contas a Receber (R$)</Label>
                  <Input id="accountsReceivable" type="number" step="0.01" {...form.register('accountsReceivable')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableCash">Disponível / Caixa (R$)</Label>
                  <Input id="availableCash" type="number" step="0.01" {...form.register('availableCash')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advancesToSuppliers">Adiant. a Fornecedores (R$)</Label>
                  <Input id="advancesToSuppliers" type="number" step="0.01" {...form.register('advancesToSuppliers')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advancesFromClients">Adiant. de Clientes (R$)</Label>
                  <Input id="advancesFromClients" type="number" step="0.01" {...form.register('advancesFromClients')} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Vendas e Mercado</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salesPercentageCash">% Vendas à Vista</Label>
                  <Input id="salesPercentageCash" type="number" step="0.01" {...form.register('salesPercentageCash')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesPercentageTerm">% Vendas à Prazo</Label>
                  <Input id="salesPercentageTerm" type="number" step="0.01" {...form.register('salesPercentageTerm')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internalMarketPercentage">% Mercado Interno</Label>
                  <Input id="internalMarketPercentage" type="number" step="0.01" {...form.register('internalMarketPercentage')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalMarketPercentage">% Mercado Externo</Label>
                  <Input id="externalMarketPercentage" type="number" step="0.01" {...form.register('externalMarketPercentage')} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Logística e Tarifas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="averageDeliveryTime">Prazo Médio Entrega (dias)</Label>
                  <Input id="averageDeliveryTime" type="number" {...form.register('averageDeliveryTime')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportType">Tipo de Transporte</Label>
                  <Input id="transportType" {...form.register('transportType')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tacValue">TAC (R$)</Label>
                  <Input id="tacValue" type="number" step="0.01" {...form.register('tacValue')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tedValue">TED (R$)</Label>
                  <Input id="tedValue" type="number" step="0.01" {...form.register('tedValue')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boletoTariff">Tarifa de Boleto (R$)</Label>
                  <Input id="boletoTariff" type="number" step="0.01" {...form.register('boletoTariff')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notaryTerm">Prazo de Cartório</Label>
                  <Input id="notaryTerm" type="number" {...form.register('notaryTerm')} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Defesa Comercial</h3>
              <div className="space-y-2">
                <Label htmlFor="commercialDefense">Parecer / Histórico</Label>
                <Textarea 
                  id="commercialDefense" 
                  rows={8}
                  className="resize-none"
                  {...form.register('commercialDefense')} 
                />
              </div>
            </div>

          </form>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="commercial-report-form" 
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Salvando...' : 'Confirmar e Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}