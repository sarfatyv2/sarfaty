'use client';

import { useState } from 'react';
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
} from '@nexus/ui';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { MaskedInput, PHONE_MASK, CEP_MASK } from '@/components/masked-input';
import { Stepper } from '../../clients/new/_components/stepper';

const STEPS = [
  { number: 1, label: 'Dados Básicos' },
  { number: 2, label: 'Contatos e Endereço' },
  { number: 3, label: 'Conta Bancária' },
];

type PersonType = 'company' | 'individual';

interface Step1Data {
  personType: PersonType;
  companyName: string;
  tradeName: string;
  cnpj: string;
  cpf: string;
  isPep: boolean;
  isOfacListed: boolean;
}

interface Step2Data {
  phone: string;
  email: string;
  billingEmail: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}

interface Step3Data {
  bankCode: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountType: string;
  pixKey: string;
}

export default function NewDraweePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [draweeId, setDraweeId] = useState<string | null>(null);

  const [step1, setStep1] = useState<Step1Data>({
    personType: 'company',
    companyName: '',
    tradeName: '',
    cnpj: '',
    cpf: '',
    isPep: false,
    isOfacListed: false,
  });

  const [step2, setStep2] = useState<Step2Data>({
    phone: '', email: '', billingEmail: '',
    addressStreet: '', addressNumber: '', addressComplement: '',
    addressNeighborhood: '', addressCity: '', addressState: '', addressZip: '',
  });

  const [step3, setStep3] = useState<Step3Data>({
    bankCode: '', bankName: '', branch: '',
    accountNumber: '', accountType: '', pixKey: '',
  });

  function isStep1Valid(): boolean {
    if (!step1.companyName.trim() || step1.companyName.trim().length < 2) return false;
    if (step1.personType === 'company') return step1.cnpj.replaceAll(/\D/g, '').length === 14;
    return step1.cpf.replaceAll(/\D/g, '').length === 11;
  }

  async function handleStep2Next() {
    if (draweeId) {
      setCurrentStep(3);
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        personType: step1.personType,
        companyName: step1.companyName,
        tradeName: step1.tradeName || undefined,
        isPep: step1.isPep,
        isOfacListed: step1.isOfacListed,
        ...(step1.personType === 'company'
          ? { cnpj: step1.cnpj.replaceAll(/\D/g, '') }
          : { cpf: step1.cpf.replaceAll(/\D/g, '') }),
      };
      const res = await api.post<{ id: string }>('/drawees', body);
      const newId = res.data.id;
      setDraweeId(newId);

      if (step2.phone || step2.email) {
        await api.post(`/drawees/${newId}/contacts`, {
          phone: step2.phone.replaceAll(/\D/g, '') || undefined,
          email: step2.email || undefined,
          billingEmail: step2.billingEmail || undefined,
          isPrimary: true,
        });
      }

      if (step2.addressStreet) {
        await api.post(`/drawees/${newId}/addresses`, {
          useType: 'fiscal',
          street: step2.addressStreet || undefined,
          number: step2.addressNumber || undefined,
          complement: step2.addressComplement || undefined,
          neighborhood: step2.addressNeighborhood || undefined,
          zipCode: step2.addressZip?.replaceAll(/\D/g, '') || undefined,
          city: step2.addressCity || undefined,
          state: step2.addressState || undefined,
          isPrimary: true,
        });
      }

      setCurrentStep(3);
      toast.success('Sacado criado');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao criar sacado');
    } finally {
      setSaving(false);
    }
  }

  async function handleFinish() {
    if (!draweeId) return;
    setSaving(true);
    try {
      if (step3.bankCode || step3.accountNumber || step3.pixKey) {
        await api.post(`/drawees/${draweeId}/bank-accounts`, {
          bankCode: step3.bankCode || undefined,
          bankName: step3.bankName || undefined,
          branch: step3.branch || undefined,
          accountNumber: step3.accountNumber || undefined,
          accountType: step3.accountType || undefined,
          pixKey: step3.pixKey || undefined,
          isPrimary: true,
        });
      }
      toast.success('Sacado cadastrado com sucesso');
      router.push(`/drawees/${draweeId}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar conta bancária');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/drawees">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Sacado</h1>
          <p className="text-sm text-muted-foreground">Cadastre um novo sacado</p>
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
            <div className="space-y-3">
              <Label>Tipo de Pessoa</Label>
              <div className="flex gap-3">
                {(['company', 'individual'] as PersonType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setStep1((p) => ({ ...p, personType: type, cnpj: '', cpf: '' }))}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                      step1.personType === type
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {type === 'company' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {step1.personType === 'company' ? 'Razão Social / Nome' : 'Nome Completo'} *
                </Label>
                <Input
                  id="companyName"
                  value={step1.companyName}
                  onChange={(e) => setStep1((p) => ({ ...p, companyName: e.target.value }))}
                  placeholder={step1.personType === 'company' ? 'Razão social da empresa' : 'Nome completo'}
                />
              </div>
              {step1.personType === 'company' && (
                <div className="space-y-2">
                  <Label htmlFor="tradeName">Nome Fantasia</Label>
                  <Input
                    id="tradeName"
                    value={step1.tradeName}
                    onChange={(e) => setStep1((p) => ({ ...p, tradeName: e.target.value }))}
                    placeholder="Opcional"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">
                {step1.personType === 'company' ? 'CNPJ *' : 'CPF *'}
              </Label>
              <Input
                id="document"
                value={step1.personType === 'company' ? step1.cnpj : step1.cpf}
                onChange={(e) => {
                  const val = e.target.value;
                  setStep1((p) => step1.personType === 'company' ? { ...p, cnpj: val } : { ...p, cpf: val });
                }}
                placeholder={step1.personType === 'company' ? '00.000.000/0000-00' : '000.000.000-00'}
                maxLength={step1.personType === 'company' ? 18 : 14}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Compliance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Pessoa Politicamente Exposta (PEP)?</Label>
                  <p className="text-xs text-muted-foreground">Sócio ou titular é politicamente exposto</p>
                </div>
                <Switch
                  checked={step1.isPep}
                  onCheckedChange={(v) => setStep1((p) => ({ ...p, isPep: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Listado na OFAC?</Label>
                  <p className="text-xs text-muted-foreground">Consta em listas de sanções internacionais</p>
                </div>
                <Switch
                  checked={step1.isOfacListed}
                  onCheckedChange={(v) => setStep1((p) => ({ ...p, isOfacListed: v }))}
                />
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

      {/* Step 2: Contatos e Endereço */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Contatos e Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <MaskedInput
                  mask={PHONE_MASK}
                  value={step2.phone}
                  onAccept={(v) => setStep2((p) => ({ ...p, phone: v }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={step2.email}
                  onChange={(e) => setStep2((p) => ({ ...p, email: e.target.value }))}
                  placeholder="contato@empresa.com"
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label>Email para NF-e (XML)</Label>
                <Input
                  type="email"
                  value={step2.billingEmail}
                  onChange={(e) => setStep2((p) => ({ ...p, billingEmail: e.target.value }))}
                  placeholder="nfe@empresa.com"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Endereço Fiscal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Rua</Label>
                  <Input value={step2.addressStreet} onChange={(e) => setStep2((p) => ({ ...p, addressStreet: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={step2.addressNumber} onChange={(e) => setStep2((p) => ({ ...p, addressNumber: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input value={step2.addressComplement} onChange={(e) => setStep2((p) => ({ ...p, addressComplement: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input value={step2.addressNeighborhood} onChange={(e) => setStep2((p) => ({ ...p, addressNeighborhood: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <MaskedInput
                    mask={CEP_MASK}
                    value={step2.addressZip}
                    onAccept={(v) => setStep2((p) => ({ ...p, addressZip: v }))}
                    placeholder="00000-000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={step2.addressCity} onChange={(e) => setStep2((p) => ({ ...p, addressCity: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Estado (UF)</Label>
                  <Input
                    value={step2.addressState}
                    maxLength={2}
                    onChange={(e) => setStep2((p) => ({ ...p, addressState: e.target.value.toUpperCase() }))}
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft size={16} />
                Voltar
              </Button>
              <Button onClick={handleStep2Next} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Próximo
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Conta Bancária */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Conta Bancária</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banco (Código)</Label>
                <Input value={step3.bankCode} onChange={(e) => setStep3((p) => ({ ...p, bankCode: e.target.value }))} placeholder="001" />
              </div>
              <div className="space-y-2">
                <Label>Banco (Nome)</Label>
                <Input value={step3.bankName} onChange={(e) => setStep3((p) => ({ ...p, bankName: e.target.value }))} placeholder="Banco do Brasil" />
              </div>
              <div className="space-y-2">
                <Label>Agência</Label>
                <Input value={step3.branch} onChange={(e) => setStep3((p) => ({ ...p, branch: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Conta</Label>
                <Input value={step3.accountNumber} onChange={(e) => setStep3((p) => ({ ...p, accountNumber: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <Select value={step3.accountType} onValueChange={(v) => setStep3((p) => ({ ...p, accountType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="payment">Pagamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chave PIX</Label>
                <Input value={step3.pixKey} onChange={(e) => setStep3((p) => ({ ...p, pixKey: e.target.value }))} placeholder="CPF, CNPJ, email ou telefone" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft size={16} />
                Voltar
              </Button>
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Finalizar Cadastro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
