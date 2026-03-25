'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Button,
  Input,
  Label,
  ScrollArea,
  Separator,
  Textarea,
} from '@nexus/ui';
import { createCommercialReportSchema, type CreateCommercialReportDto } from '@nexus/validators';
import { Plus, Trash2 } from 'lucide-react';

const EMPTY_FORM_DEFAULTS: CreateCommercialReportDto = {
  proposals: [],
  guarantors: [],
  properties: [],
  receiptMethodsDetail: [],
  externalReceiptMethodsDetail: [],
  suppliersDetail: [],
};

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
    defaultValues: EMPTY_FORM_DEFAULTS,
  });

  const proposalsArray = useFieldArray({ control: form.control, name: 'proposals' });
  const guarantorsArray = useFieldArray({ control: form.control, name: 'guarantors' });
  const propertiesArray = useFieldArray({ control: form.control, name: 'properties' });
  const receiptDetailArray = useFieldArray({ control: form.control, name: 'receiptMethodsDetail' });
  const externalReceiptArray = useFieldArray({ control: form.control, name: 'externalReceiptMethodsDetail' });
  const suppliersDetailArray = useFieldArray({ control: form.control, name: 'suppliersDetail' });

  useEffect(() => {
    if (!open) return;
    if (parsedData) {
      form.reset({
        ...EMPTY_FORM_DEFAULTS,
        ...parsedData,
        proposals: parsedData.proposals ?? [],
        guarantors: parsedData.guarantors ?? [],
        properties: parsedData.properties ?? [],
        receiptMethodsDetail: parsedData.receiptMethodsDetail ?? [],
        externalReceiptMethodsDetail: parsedData.externalReceiptMethodsDetail ?? [],
        suppliersDetail: parsedData.suppliersDetail ?? [],
      });
    } else {
      form.reset(EMPTY_FORM_DEFAULTS);
    }
  }, [parsedData, open, form]);

  const handleSubmit = (values: CreateCommercialReportDto) => {
    onConfirm(values);
  };

  const hasExcelContext = Boolean(fileName);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Relatório Comercial</DialogTitle>
          <DialogDescription>
            {hasExcelContext ? (
              <>Extraímos os dados do arquivo <strong>{fileName}</strong>. Revise-os abaixo antes de salvar.</>
            ) : (
              <>Preencha os campos do relatório comercial.</>
            )}
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
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Funcionários</Label>
                  <Input id="employeeCount" type="number" min={0} {...form.register('employeeCount')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="averageTicket">Ticket médio</Label>
                  <Input id="averageTicket" {...form.register('averageTicket')} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="referralSource">Fonte de indicação</Label>
                  <Input id="referralSource" {...form.register('referralSource')} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Proposta comercial</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => proposalsArray.append({})}
                >
                  <Plus size={14} /> Linha
                </Button>
              </div>
              {proposalsArray.fields.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma linha. Use &quot;Linha&quot; para adicionar modalidade / limite / garantia.</p>
              ) : (
                <div className="space-y-3">
                  {proposalsArray.fields.map((fieldItem, index) => (
                    <div key={fieldItem.id} className="rounded-lg border p-3 space-y-3 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-destructive"
                        onClick={() => proposalsArray.remove(index)}
                        aria-label="Remover linha"
                      >
                        <Trash2 size={16} />
                      </Button>
                      <div className="grid grid-cols-2 gap-3 pr-10">
                        <div className="space-y-1">
                          <Label>Modalidade</Label>
                          <Input {...form.register(`proposals.${index}.modality`)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Limite (R$)</Label>
                          <Input type="number" step="0.01" {...form.register(`proposals.${index}.limitAmount`)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Garantia</Label>
                          <Input {...form.register(`proposals.${index}.guarantee`)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Taxa</Label>
                          <Input {...form.register(`proposals.${index}.rate`)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Concentração (%)</Label>
                          <Input type="number" step="0.01" {...form.register(`proposals.${index}.concentrationPct`)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Prazo</Label>
                          <Input {...form.register(`proposals.${index}.term`)} placeholder="ex: 180 DIAS" />
                        </div>
                        <div className="space-y-1">
                          <Label>Tranche</Label>
                          <Input {...form.register(`proposals.${index}.tranche`)} />
                        </div>
                        <div className="space-y-1">
                          <Label>TAC (R$)</Label>
                          <Input type="number" step="0.01" {...form.register(`proposals.${index}.tacValue`)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Tar. Boleto (R$)</Label>
                          <Input type="number" step="0.01" {...form.register(`proposals.${index}.boletoTariff`)} />
                        </div>
                        <div className="space-y-1">
                          <Label>TED (R$)</Label>
                          <Input type="number" step="0.01" {...form.register(`proposals.${index}.tedValue`)} />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label>Serasa</Label>
                          <Input {...form.register(`proposals.${index}.serasa`)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Avalistas</h3>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => guarantorsArray.append({ fullName: '', cpf: '' })}>
                  <Plus size={14} /> Avalista
                </Button>
              </div>
              {guarantorsArray.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label>Nome</Label>
                    <Input {...form.register(`guarantors.${index}.fullName`)} />
                  </div>
                  <div className="w-40 space-y-1">
                    <Label>CPF</Label>
                    <Input {...form.register(`guarantors.${index}.cpf`)} />
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-destructive mb-0.5" onClick={() => guarantorsArray.remove(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Observações</h3>
              <div className="space-y-2">
                <Label htmlFor="operationNotes">Observações da operação</Label>
                <Textarea id="operationNotes" rows={3} {...form.register('operationNotes')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serasaNotes">Restrições SERASA (justificativas)</Label>
                <Textarea id="serasaNotes" rows={3} {...form.register('serasaNotes')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnersNotes">Sócios — observações</Label>
                <Textarea id="partnersNotes" rows={2} {...form.register('partnersNotes')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relatedCompaniesNotes">Empresas ligadas — observações</Label>
                <Textarea id="relatedCompaniesNotes" rows={2} {...form.register('relatedCompaniesNotes')} />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="mainProducts">Principais produtos e/ou serviços</Label>
              <Textarea id="mainProducts" rows={2} {...form.register('mainProducts')} />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-2">
                <Controller
                  name="anticipaGrandesRedes"
                  control={form.control}
                  render={({ field }) => (
                    <input
                      id="anticipaGrandesRedes"
                      type="checkbox"
                      className="h-4 w-4 rounded border"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked ? true : false)}
                    />
                  )}
                />
                <Label htmlFor="anticipaGrandesRedes" className="font-normal cursor-pointer">Antecipa com grandes redes?</Label>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="anticipaGrandesRedesList">Quais redes (se aplicável)</Label>
                <Input id="anticipaGrandesRedesList" {...form.register('anticipaGrandesRedesList')} />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">% vendas por região</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Sul</Label>
                  <Input type="number" step="0.01" {...form.register('salesSouthPercentage')} />
                </div>
                <div className="space-y-2">
                  <Label>Sudeste</Label>
                  <Input type="number" step="0.01" {...form.register('salesSoutheastPercentage')} />
                </div>
                <div className="space-y-2">
                  <Label>Norte</Label>
                  <Input type="number" step="0.01" {...form.register('salesNorthPercentage')} />
                </div>
                <div className="space-y-2">
                  <Label>Nordeste</Label>
                  <Input type="number" step="0.01" {...form.register('salesNortheastPercentage')} />
                </div>
                <div className="space-y-2">
                  <Label>Centro-Oeste</Label>
                  <Input type="number" step="0.01" {...form.register('salesMidwestPercentage')} />
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
                  <Label htmlFor="inventory">Estoques (texto)</Label>
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
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Meios circulantes (gerencial)</h3>
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
                  <Label htmlFor="inventoryValue">Estoques (R$)</Label>
                  <Input id="inventoryValue" type="number" step="0.01" {...form.register('inventoryValue')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advancesToSuppliers">Adiant. a Fornecedores (R$)</Label>
                  <Input id="advancesToSuppliers" type="number" step="0.01" {...form.register('advancesToSuppliers')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advancesFromClients">Adiant. de Clientes (R$)</Label>
                  <Input id="advancesFromClients" type="number" step="0.01" {...form.register('advancesFromClients')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banksBalance">Bancos CP (R$)</Label>
                  <Input id="banksBalance" type="number" step="0.01" {...form.register('banksBalance')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundsBalance">Fundos (R$)</Label>
                  <Input id="fundsBalance" type="number" step="0.01" {...form.register('fundsBalance')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suppliersBalance">Fornecedores passivo (R$)</Label>
                  <Input id="suppliersBalance" type="number" step="0.01" {...form.register('suppliersBalance')} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Mercado interno — formas de recebimento</h3>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => receiptDetailArray.append({})}>
                  <Plus size={14} /> Linha
                </Button>
              </div>
              {receiptDetailArray.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[120px] space-y-1">
                    <Label>Forma</Label>
                    <Input {...form.register(`receiptMethodsDetail.${index}.receiptForm`)} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label>PMR</Label>
                    <Input type="number" {...form.register(`receiptMethodsDetail.${index}.pmr`)} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label>% vendas</Label>
                    <Input type="number" step="0.01" {...form.register(`receiptMethodsDetail.${index}.salesPercent`)} />
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => receiptDetailArray.remove(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Mercado externo — recebimento</h3>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => externalReceiptArray.append({})}>
                  <Plus size={14} /> Linha
                </Button>
              </div>
              {externalReceiptArray.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[120px] space-y-1">
                    <Label>Forma</Label>
                    <Input {...form.register(`externalReceiptMethodsDetail.${index}.receiptForm`)} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label>PMR</Label>
                    <Input type="number" {...form.register(`externalReceiptMethodsDetail.${index}.pmr`)} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label>% vendas</Label>
                    <Input type="number" step="0.01" {...form.register(`externalReceiptMethodsDetail.${index}.salesPercent`)} />
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => externalReceiptArray.remove(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Fornecedores — formas de pagamento</h3>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => suppliersDetailArray.append({})}>
                  <Plus size={14} /> Linha
                </Button>
              </div>
              {suppliersDetailArray.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[100px] space-y-1">
                    <Label>Forma pgto.</Label>
                    <Input {...form.register(`suppliersDetail.${index}.paymentForm`)} />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label>% compras</Label>
                    <Input type="number" step="0.01" {...form.register(`suppliersDetail.${index}.purchasesPercent`)} />
                  </div>
                  <div className="w-28 space-y-1">
                    <Label>Prazo médio</Label>
                    <Input type="number" {...form.register(`suppliersDetail.${index}.averagePaymentDays`)} />
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => suppliersDetailArray.remove(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Concentração e vendas (%)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="concentration">Concentração (%)</Label>
                  <Input id="concentration" type="number" step="0.01" {...form.register('concentration')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concentrationDrawee">Concentração sacado (%)</Label>
                  <Input id="concentrationDrawee" type="number" step="0.01" {...form.register('concentrationDrawee')} />
                </div>
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
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Prazos, logística e mercadoria</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="averagePaymentTerm">Prazo médio pagamento (dias)</Label>
                  <Input id="averagePaymentTerm" type="number" {...form.register('averagePaymentTerm')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="averageReceiptTerm">Prazo médio recebimento (dias)</Label>
                  <Input id="averageReceiptTerm" type="number" {...form.register('averageReceiptTerm')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="averageDeliveryTime">Prazo médio entrega (dias)</Label>
                  <Input id="averageDeliveryTime" type="number" {...form.register('averageDeliveryTime')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportType">Tipo de transporte</Label>
                  <Input id="transportType" {...form.register('transportType')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveredPercentage">% Entregue</Label>
                  <Input id="deliveredPercentage" type="number" step="0.01" {...form.register('deliveredPercentage')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippedPercentage">% Embarcado</Label>
                  <Input id="shippedPercentage" type="number" step="0.01" {...form.register('shippedPercentage')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preBillingPercentage">% Pré-faturamento</Label>
                  <Input id="preBillingPercentage" type="number" step="0.01" {...form.register('preBillingPercentage')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryProofType">Tipo comprovante entrega</Label>
                  <Input id="deliveryProofType" {...form.register('deliveryProofType')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cteDays">CTE — quantos dias</Label>
                  <Input id="cteDays" type="number" {...form.register('cteDays')} />
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Controller
                    name="hasCarrierSiteAccess"
                    control={form.control}
                    render={({ field }) => (
                      <input
                        id="hasCarrierSiteAccess"
                        type="checkbox"
                        className="h-4 w-4 rounded border"
                        checked={field.value === true}
                        onChange={(e) => field.onChange(e.target.checked ? true : false)}
                      />
                    )}
                  />
                  <Label htmlFor="hasCarrierSiteAccess" className="font-normal cursor-pointer">Acesso ao site da transportadora?</Label>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="paymentMethods">Formas de pagamento (texto)</Label>
                  <Input id="paymentMethods" {...form.register('paymentMethods')} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="receiptMethods">Formas de recebimento (texto)</Label>
                  <Input id="receiptMethods" {...form.register('receiptMethods')} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Tarifas</h3>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="notaryTerm">Prazo de Cartório (dias)</Label>
                  <Input id="notaryTerm" type="number" {...form.register('notaryTerm')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiredTitleTariff">Tarifa título vencido (R$)</Label>
                  <Input id="expiredTitleTariff" type="number" step="0.01" {...form.register('expiredTitleTariff')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protestedTitleTariff">Tarifa título protestado (R$)</Label>
                  <Input id="protestedTitleTariff" type="number" step="0.01" {...form.register('protestedTitleTariff')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sustainedTitleTariff">Tarifa título sustado (R$)</Label>
                  <Input id="sustainedTitleTariff" type="number" step="0.01" {...form.register('sustainedTitleTariff')} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Estrutura operacional (imóveis)</h3>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => propertiesArray.append({})}>
                  <Plus size={14} /> Imóvel
                </Button>
              </div>
              {propertiesArray.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="rounded-lg border p-3 space-y-3">
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => propertiesArray.remove(index)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 col-span-2">
                      <Label>Imóvel</Label>
                      <Input {...form.register(`properties.${index}.propertyName`)} />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label>Situação</Label>
                      <Input {...form.register(`properties.${index}.situation`)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Área total</Label>
                      <Input {...form.register(`properties.${index}.totalArea`)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Área construída</Label>
                      <Input {...form.register(`properties.${index}.builtArea`)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Avaliação (R$)</Label>
                      <Input type="number" step="0.01" {...form.register(`properties.${index}.appraisedValue`)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Defesa comercial</h3>
              <div className="space-y-2">
                <Label htmlFor="commercialDefense">Parecer / histórico</Label>
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
