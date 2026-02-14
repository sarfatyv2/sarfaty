'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Skeleton,
} from '@nexus/ui';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { MaskedInput, PHONE_MASK, CEP_MASK } from '@/components/masked-input';
import type { DocumentChecklistItem, CanSubmitResult } from '@nexus/types';
import { Stepper } from './_components/stepper';
import { CnpjField } from './_components/cnpj-field';
import { GuaranteeList, type GuaranteeItem } from './_components/guarantee-list';
import { DocumentChecklist } from './_components/document-checklist';

const STEPS = [
  { number: 1, label: 'Dados Básicos' },
  { number: 2, label: 'Operação' },
  { number: 3, label: 'Documentos' },
];

interface Segment {
  id: string;
  name: string;
}

interface CreditProduct {
  id: string;
  name: string;
}

interface GuaranteeType {
  id: string;
  name: string;
}

interface CnpjValidationResult {
  companyName: string;
  tradeName: string | null;
  cnae: string | null;
  suggestedSegmentId: string | null;
  suggestedSegmentName: string | null;
  address: {
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  } | null;
}

// --- Step 1 Form Data ---
interface Step1Data {
  cnpj: string;
  companyName: string;
  tradeName: string;
  phone: string;
  email: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  requestedAmount: string;
}

// --- Step 2 Form Data ---
interface Step2Data {
  segmentId: string;
  creditProductId: string;
  isJudicialRecovery: boolean;
  hasGuarantees: boolean;
  guarantees: GuaranteeItem[];
}

export default function NewClientPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [cnpjValid, setCnpjValid] = useState(false);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  // Lookups
  const [segments, setSegments] = useState<Segment[]>([]);
  const [creditProducts, setCreditProducts] = useState<CreditProduct[]>([]);
  const [guaranteeTypes, setGuaranteeTypes] = useState<GuaranteeType[]>([]);

  // Step 1
  const [step1, setStep1] = useState<Step1Data>({
    cnpj: '', companyName: '', tradeName: '', phone: '', email: '',
    addressStreet: '', addressNumber: '', addressComplement: '',
    addressNeighborhood: '', addressCity: '', addressState: '', addressZip: '',
    requestedAmount: '',
  });

  // Step 2
  const [step2, setStep2] = useState<Step2Data>({
    segmentId: '', creditProductId: '',
    isJudicialRecovery: false, hasGuarantees: false,
    guarantees: [],
  });

  // Step 3
  const [checklist, setChecklist] = useState<DocumentChecklistItem[]>([]);
  const [canSubmitResult, setCanSubmitResult] = useState<CanSubmitResult>({
    canSubmit: false, totalRequired: 0, totalUploaded: 0, missingDocuments: [],
  });

  // Load lookups
  useEffect(() => {
    Promise.all([
      api.get<Segment[]>('/segments'),
      api.get<CreditProduct[]>('/segments/credit-products'),
      api.get<GuaranteeType[]>('/segments/guarantee-types'),
    ]).then(([segRes, prodRes, guarRes]) => {
      setSegments(segRes.data ?? []);
      setCreditProducts(prodRes.data ?? []);
      setGuaranteeTypes(guarRes.data ?? []);
    }).catch(() => {
      toast.error('Erro ao carregar dados de referência');
    });
  }, []);

  // CNPJ validation callbacks
  const handleCnpjValidated = useCallback((result: CnpjValidationResult) => {
    setCnpjValid(true);
    setStep1((prev) => ({
      ...prev,
      companyName: result.companyName || prev.companyName,
      tradeName: result.tradeName || prev.tradeName,
      addressStreet: result.address?.street || prev.addressStreet,
      addressNumber: result.address?.number || prev.addressNumber,
      addressComplement: result.address?.complement || prev.addressComplement,
      addressNeighborhood: result.address?.neighborhood || prev.addressNeighborhood,
      addressCity: result.address?.city || prev.addressCity,
      addressState: result.address?.state || prev.addressState,
      addressZip: result.address?.zip || prev.addressZip,
    }));
    if (result.suggestedSegmentId) {
      setStep2((prev) => ({ ...prev, segmentId: result.suggestedSegmentId! }));
    }
  }, []);

  const handleCnpjError = useCallback(() => {
    setCnpjValid(false);
  }, []);

  const handleCnpjClear = useCallback(() => {
    setCnpjValid(false);
  }, []);

  // Step 1 validation
  function isStep1Valid(): boolean {
    return !!(
      cnpjValid &&
      step1.companyName.trim().length >= 2 &&
      step1.phone.replaceAll(/\D/g, '').length >= 10 &&
      step1.email.includes('@')
    );
  }

  // Step 2 validation
  function isStep2Valid(): boolean {
    return !!(step2.segmentId && step2.creditProductId);
  }

  // Create client (transition from step 2 -> step 3)
  async function handleCreateClient() {
    setCreating(true);
    try {
      const body = {
        cnpj: step1.cnpj.replaceAll(/\D/g, ''),
        companyName: step1.companyName,
        tradeName: step1.tradeName || undefined,
        phone: step1.phone.replaceAll(/\D/g, ''),
        email: step1.email,
        addressStreet: step1.addressStreet || undefined,
        addressNumber: step1.addressNumber || undefined,
        addressComplement: step1.addressComplement || undefined,
        addressNeighborhood: step1.addressNeighborhood || undefined,
        addressCity: step1.addressCity || undefined,
        addressState: step1.addressState || undefined,
        addressZip: step1.addressZip?.replaceAll(/\D/g, '') || undefined,
        segmentId: step2.segmentId,
        creditProductId: step2.creditProductId,
        requestedAmount: step1.requestedAmount ? Number(step1.requestedAmount) : undefined,
      };

      const response = await api.post<{ id: string }>('/clients', body);
      const newClientId = response.data.id;
      setClientId(newClientId);

      // Update with guarantees and flags if needed
      if (step2.hasGuarantees || step2.isJudicialRecovery) {
        const updateBody: Record<string, unknown> = {
          isJudicialRecovery: step2.isJudicialRecovery,
          hasGuarantees: step2.hasGuarantees,
        };
        if (step2.hasGuarantees && step2.guarantees.length > 0) {
          updateBody.guarantees = step2.guarantees
            .filter((g) => g.guaranteeTypeId)
            .map((g) => ({
              guaranteeTypeId: g.guaranteeTypeId,
              description: g.description || undefined,
              estimatedValue: g.estimatedValue ? Number(g.estimatedValue) : undefined,
            }));
        }
        await api.patch(`/clients/${newClientId}`, updateBody);
      }

      setCurrentStep(3);
      toast.success('Cliente criado com sucesso');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar cliente';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  // Load checklist for step 3
  const loadChecklist = useCallback(async () => {
    if (!clientId) return;
    try {
      const [checklistRes, canSubmitRes] = await Promise.all([
        api.get<DocumentChecklistItem[]>(`/clients/${clientId}/documents/checklist`),
        api.get<CanSubmitResult>(`/clients/${clientId}/documents/can-submit`),
      ]);
      setChecklist(checklistRes.data ?? []);
      setCanSubmitResult(canSubmitRes.data ?? { canSubmit: false, totalRequired: 0, totalUploaded: 0, missingDocuments: [] });
    } catch {
      toast.error('Erro ao carregar checklist');
    }
  }, [clientId]);

  useEffect(() => {
    if (currentStep === 3 && clientId) {
      loadChecklist();
    }
  }, [currentStep, clientId, loadChecklist]);

  // Submit for analysis
  async function handleSubmitForAnalysis() {
    if (!clientId) return;
    setSubmitting(true);
    try {
      await api.post(`/clients/${clientId}/submit`);
      toast.success('Cliente enviado para análise');
      router.push(`/clients/${clientId}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao enviar para análise';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Cliente</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre um novo cliente para operação de crédito
          </p>
        </div>
      </div>

      <Stepper steps={STEPS} currentStep={currentStep} />

      {/* Step 1: Dados Básicos */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <CnpjField
              value={step1.cnpj}
              onChange={(cnpj) => setStep1((prev) => ({ ...prev, cnpj }))}
              onValidated={handleCnpjValidated}
              onError={handleCnpjError}
              onClear={handleCnpjClear}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Razão Social</Label>
                <Input
                  id="companyName"
                  value={step1.companyName}
                  onChange={(e) => setStep1((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Razão social da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradeName">Nome Fantasia</Label>
                <Input
                  id="tradeName"
                  value={step1.tradeName}
                  onChange={(e) => setStep1((prev) => ({ ...prev, tradeName: e.target.value }))}
                  placeholder="Nome fantasia (opcional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <MaskedInput
                  id="phone"
                  mask={PHONE_MASK}
                  value={step1.phone}
                  onAccept={(value) => setStep1((prev) => ({ ...prev, phone: value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={step1.email}
                  onChange={(e) => setStep1((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestedAmount">Valor Pretendido (R$)</Label>
              <Input
                id="requestedAmount"
                type="number"
                value={step1.requestedAmount}
                onChange={(e) => setStep1((prev) => ({ ...prev, requestedAmount: e.target.value }))}
                placeholder="0,00"
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Endereço</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="addressStreet">Rua</Label>
                  <Input
                    id="addressStreet"
                    value={step1.addressStreet}
                    onChange={(e) => setStep1((prev) => ({ ...prev, addressStreet: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressNumber">Número</Label>
                  <Input
                    id="addressNumber"
                    value={step1.addressNumber}
                    onChange={(e) => setStep1((prev) => ({ ...prev, addressNumber: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressComplement">Complemento</Label>
                  <Input
                    id="addressComplement"
                    value={step1.addressComplement}
                    onChange={(e) => setStep1((prev) => ({ ...prev, addressComplement: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressNeighborhood">Bairro</Label>
                  <Input
                    id="addressNeighborhood"
                    value={step1.addressNeighborhood}
                    onChange={(e) => setStep1((prev) => ({ ...prev, addressNeighborhood: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressZip">CEP</Label>
                  <MaskedInput
                    id="addressZip"
                    mask={CEP_MASK}
                    value={step1.addressZip}
                    onAccept={(value) => setStep1((prev) => ({ ...prev, addressZip: value }))}
                    placeholder="00000-000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressCity">Cidade</Label>
                  <Input
                    id="addressCity"
                    value={step1.addressCity}
                    onChange={(e) => setStep1((prev) => ({ ...prev, addressCity: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressState">Estado</Label>
                  <Input
                    id="addressState"
                    value={step1.addressState}
                    onChange={(e) => setStep1((prev) => ({ ...prev, addressState: e.target.value }))}
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setCurrentStep(2)} disabled={!isStep1Valid()}>
                Próximo
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configuração da Operação */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Configuração da Operação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Segmento</Label>
                {segments.length === 0 ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Select
                    value={step2.segmentId}
                    onValueChange={(value) => setStep2((prev) => ({ ...prev, segmentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((seg) => (
                        <SelectItem key={seg.id} value={seg.id}>
                          {seg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Produto de Crédito</Label>
                {creditProducts.length === 0 ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Select
                    value={step2.creditProductId}
                    onValueChange={(value) => setStep2((prev) => ({ ...prev, creditProductId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditProducts.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isJudicialRecovery">Empresa em Recuperação Judicial?</Label>
                  <p className="text-xs text-muted-foreground">Ativa documentos adicionais de RJ</p>
                </div>
                <Switch
                  id="isJudicialRecovery"
                  checked={step2.isJudicialRecovery}
                  onCheckedChange={(checked) => setStep2((prev) => ({ ...prev, isJudicialRecovery: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="hasGuarantees">Operação com Garantias?</Label>
                  <p className="text-xs text-muted-foreground">Adicionar garantias à operação</p>
                </div>
                <Switch
                  id="hasGuarantees"
                  checked={step2.hasGuarantees}
                  onCheckedChange={(checked) => setStep2((prev) => ({
                    ...prev,
                    hasGuarantees: checked,
                    guarantees: checked ? prev.guarantees : [],
                  }))}
                />
              </div>
            </div>

            {step2.hasGuarantees && (
              <div className="border-t pt-4">
                <GuaranteeList
                  guarantees={step2.guarantees}
                  guaranteeTypes={guaranteeTypes}
                  onChange={(guarantees) => setStep2((prev) => ({ ...prev, guarantees }))}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft size={16} />
                Voltar
              </Button>
              <Button onClick={handleCreateClient} disabled={!isStep2Valid() || creating}>
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    Criar e Continuar
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Documentos */}
      {currentStep === 3 && clientId && (
        <Card>
          <CardHeader>
            <CardTitle>Upload de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            {checklist.length === 0 ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map(() => (
                  <Skeleton key={crypto.randomUUID()} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <DocumentChecklist
                clientId={clientId}
                checklist={checklist}
                canSubmitResult={canSubmitResult}
                onRefresh={loadChecklist}
                onSubmit={handleSubmitForAnalysis}
                submitting={submitting}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
