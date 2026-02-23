'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserDto } from '@nexus/validators';
import { ROLES } from '@nexus/types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
  Switch,
  Card,
  CardContent,
} from '@nexus/ui';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MaskedInput, CPF_MASK, PHONE_MASK, CEP_MASK, CNPJ_MASK } from '@/components/masked-input';
import { ManagerPicker } from '@/components/manager-picker';

const ROLE_LABELS: Record<string, string> = {
  sales_rep: 'Representante Comercial',
  sales_supervisor: 'Supervisor Comercial',
  sales_manager: 'Gerente Regional',
  sales_director: 'Diretor Comercial',
  credit_analyst: 'Analista de Crédito',
  compliance_officer: 'Compliance',
  approver: 'Mesa Aprovadora',
  backoffice: 'Backoffice',
  legal: 'Jurídico',
  risk_manager: 'Gestão de Risco',
  recovery: 'Recuperação',
  litigation: 'Contencioso',
  employee: 'Colaborador',
  people_manager: 'Gestor de Pessoas',
  hr: 'RH',
  dp: 'Departamento Pessoal',
  hr_admin: 'Admin RH',
  governance: 'Governança',
  admin: 'Administrador',
};

const DEPARTMENT_OPTIONS = [
  'Comercial',
  'Crédito',
  'Compliance',
  'Jurídico',
  'Backoffice',
  'Gestão de Risco',
  'RH',
  'Departamento Pessoal',
  'Governança',
  'Tecnologia',
  'Diretoria',
  'Operações',
  'Financeiro',
];

const UF_OPTIONS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, error, children, className }: FieldProps) {
  return (
    <div className={className ?? 'space-y-1.5'}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SectionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>;
}

export function CreateUserForm() {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CreateUserDto>({
    resolver: zodResolver(createUserSchema) as unknown as Resolver<CreateUserDto>,
    mode: 'onBlur',
    defaultValues: {
      employmentType: 'clt',
      nationality: 'Brasileira',
      company: 'Sarfaty',
      isInternal: true,
      hasMedicalAssistance: true,
      plrEligible: false,
      thirteenthPj: false,
      timesheetSystem: 'ponto_mais',
      nfDueDay: 25,
    },
  });

  const employmentType = watch('employmentType');

  async function onSubmit(data: CreateUserDto) {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      toast.error('Sessão expirada. Faça login novamente.');
      router.push('/login');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

    const response = await fetch(`${apiUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.error?.message ?? errorBody?.message ?? 'Erro ao criar usuário';
      toast.error(message);
      return;
    }

    toast.success('Usuário criado com sucesso!');
    router.push('/admin/users');
  }

  const tabHasErrors = (fields: string[]) =>
    fields.some((field) => field in errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Criando...' : 'Criar Usuário'}
        </Button>
      </div>

      <Tabs defaultValue="access" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="access" className="relative">
            Acesso
            {tabHasErrors(['email', 'password', 'role', 'fullName', 'department']) && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
          <TabsTrigger value="personal" className="relative">
            Dados Pessoais
            {tabHasErrors(['socialName', 'cpf', 'rg', 'dateOfBirth', 'gender', 'maritalStatus']) && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
          <TabsTrigger value="address">Endereço</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="professional" className="relative">
            Profissional
            {tabHasErrors(['employmentType', 'jobTitle']) && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="benefits">Benefícios</TabsTrigger>
          <TabsTrigger value="cltpj">
            {employmentType === 'pj' ? 'Dados PJ' : 'Dados CLT'}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Acesso */}
        <TabsContent value="access">
          <Card>
            <CardContent className="pt-6">
              <SectionGrid>
                <FormField label="Nome Completo *" error={errors.fullName?.message}>
                  <Input {...register('fullName')} placeholder="Nome completo" />
                </FormField>
                <FormField label="Email *" error={errors.email?.message}>
                  <Input {...register('email')} type="email" placeholder="email@sarfaty.com" />
                </FormField>
                <FormField label="Senha *" error={errors.password?.message}>
                  <Input {...register('password')} type="password" placeholder="Mínimo 6 caracteres" />
                </FormField>
                <FormField label="Role *" error={errors.role?.message}>
                  <Select onValueChange={(value) => setValue('role', value as CreateUserDto['role'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role] ?? role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Departamento" error={errors.department?.message}>
                  <Select onValueChange={(value) => setValue('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </SectionGrid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Dados Pessoais */}
        <TabsContent value="personal">
          <Card>
            <CardContent className="pt-6">
              <SectionGrid>
                <FormField label="Nome Social" error={errors.socialName?.message}>
                  <Input {...register('socialName')} placeholder="Nome social (se houver)" />
                </FormField>
                <FormField label="Data de Nascimento" error={errors.dateOfBirth?.message}>
                  <Input {...register('dateOfBirth')} type="date" />
                </FormField>
                <FormField label="Gênero" error={errors.gender?.message}>
                  <Select onValueChange={(value) => setValue('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="nao_binario">Não-binário</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                      <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Estado Civil" error={errors.maritalStatus?.message}>
                  <Select onValueChange={(value) => setValue('maritalStatus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      <SelectItem value="uniao_estavel">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Nacionalidade" error={errors.nationality?.message}>
                  <Input {...register('nationality')} placeholder="Brasileira" />
                </FormField>
                <FormField label="CPF" error={errors.cpf?.message}>
                  <Controller
                    control={control}
                    name="cpf"
                    render={({ field }) => (
                      <MaskedInput
                        mask={CPF_MASK}
                        value={field.value ?? ''}
                        onAccept={field.onChange}
                        placeholder="000.000.000-00"
                      />
                    )}
                  />
                </FormField>
                <FormField label="RG" error={errors.rg?.message}>
                  <Input {...register('rg')} placeholder="Número do RG" />
                </FormField>
                <FormField label="Órgão Emissor" error={errors.rgIssuer?.message}>
                  <Input {...register('rgIssuer')} placeholder="SSP/SP" />
                </FormField>
                <FormField label="Título de Eleitor" error={errors.voterRegistration?.message}>
                  <Input {...register('voterRegistration')} placeholder="Número" />
                </FormField>
                <FormField label="Zona Eleitoral" error={errors.voterZone?.message}>
                  <Input {...register('voterZone')} placeholder="Zona" />
                </FormField>
                <FormField label="Seção Eleitoral" error={errors.voterSection?.message}>
                  <Input {...register('voterSection')} placeholder="Seção" />
                </FormField>
                <FormField label="Certificado Militar" error={errors.militaryCert?.message}>
                  <Input {...register('militaryCert')} placeholder="Número" />
                </FormField>
              </SectionGrid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Endereço */}
        <TabsContent value="address">
          <Card>
            <CardContent className="pt-6">
              <SectionGrid>
                <FormField label="CEP" error={errors.addressZip?.message}>
                  <Controller
                    control={control}
                    name="addressZip"
                    render={({ field }) => (
                      <MaskedInput
                        mask={CEP_MASK}
                        value={field.value ?? ''}
                        onAccept={field.onChange}
                        placeholder="00000-000"
                      />
                    )}
                  />
                </FormField>
                <FormField label="Rua" error={errors.addressStreet?.message} className="space-y-1.5 md:col-span-2">
                  <Input {...register('addressStreet')} placeholder="Rua, Avenida, etc." />
                </FormField>
                <FormField label="Número" error={errors.addressNumber?.message}>
                  <Input {...register('addressNumber')} placeholder="123" />
                </FormField>
                <FormField label="Complemento" error={errors.addressComplement?.message}>
                  <Input {...register('addressComplement')} placeholder="Apto, Sala, etc." />
                </FormField>
                <FormField label="Bairro" error={errors.addressNeighborhood?.message}>
                  <Input {...register('addressNeighborhood')} placeholder="Bairro" />
                </FormField>
                <FormField label="Cidade" error={errors.addressCity?.message}>
                  <Input {...register('addressCity')} placeholder="Cidade" />
                </FormField>
                <FormField label="Estado" error={errors.addressState?.message}>
                  <Select onValueChange={(value) => setValue('addressState', value as CreateUserDto['addressState'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {UF_OPTIONS.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </SectionGrid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Contato */}
        <TabsContent value="contact">
          <Card>
            <CardContent className="pt-6">
              <SectionGrid>
                <FormField label="Telefone" error={errors.phone?.message}>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <MaskedInput
                        mask={PHONE_MASK}
                        value={field.value ?? ''}
                        onAccept={field.onChange}
                        placeholder="(11) 99999-9999"
                      />
                    )}
                  />
                </FormField>
                <FormField label="Email Pessoal" error={errors.personalEmail?.message}>
                  <Input {...register('personalEmail')} type="email" placeholder="pessoal@email.com" />
                </FormField>
                <FormField label="Email Corporativo" error={errors.corporateEmail?.message}>
                  <Input {...register('corporateEmail')} type="email" placeholder="nome@sarfaty.com" />
                </FormField>
                <FormField label="Ramal" error={errors.extension?.message}>
                  <Input {...register('extension')} placeholder="1234" />
                </FormField>
              </SectionGrid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Profissional */}
        <TabsContent value="professional">
          <Card>
            <CardContent className="pt-6">
              <SectionGrid>
                <FormField label="Tipo de Contratação" error={errors.employmentType?.message}>
                  <Select onValueChange={(value) => setValue('employmentType', value as 'clt' | 'pj')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clt">CLT</SelectItem>
                      <SelectItem value="pj">PJ</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Empresa" error={errors.company?.message}>
                  <Input {...register('company')} placeholder="Sarfaty" />
                </FormField>
                <FormField label="Diretoria" error={errors.directorate?.message}>
                  <Input {...register('directorate')} placeholder="Diretoria" />
                </FormField>
                <FormField label="Filial" error={errors.branch?.message}>
                  <Input {...register('branch')} placeholder="Filial" />
                </FormField>
                <FormField label="Cargo" error={errors.jobTitle?.message}>
                  <Input {...register('jobTitle')} placeholder="Cargo" />
                </FormField>
                <FormField label="Código do Cargo" error={errors.roleCode?.message}>
                  <Input {...register('roleCode')} placeholder="Código" />
                </FormField>
                <FormField label="Nível" error={errors.roleLevel?.message}>
                  <Input {...register('roleLevel')} placeholder="Júnior, Pleno, Sênior" />
                </FormField>
                <FormField label="Matrícula" error={errors.registrationNumber?.message}>
                  <Input {...register('registrationNumber')} placeholder="Número de matrícula" />
                </FormField>
                <FormField label="Crachá" error={errors.badgeNumber?.message}>
                  <Input {...register('badgeNumber')} placeholder="Número do crachá" />
                </FormField>
                <FormField label="Data Admissão Original" error={errors.startDateOriginal?.message}>
                  <Input {...register('startDateOriginal')} type="date" />
                </FormField>
                <FormField label="Data Admissão Atual" error={errors.startDateCurrent?.message}>
                  <Input {...register('startDateCurrent')} type="date" />
                </FormField>
                <FormField label="Data Cadastro" error={errors.registrationDate?.message}>
                  <Input {...register('registrationDate')} type="date" />
                </FormField>
                <FormField label="Gestor Direto" error={errors.managerId?.message}>
                  <Controller
                    control={control}
                    name="managerId"
                    render={({ field }) => (
                      <ManagerPicker
                        value={field.value ?? null}
                        onChange={(val) => field.onChange(val ?? '')}
                      />
                    )}
                  />
                </FormField>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={watch('isInternal')}
                    onCheckedChange={(checked) => setValue('isInternal', checked)}
                  />
                  <Label>Colaborador Interno</Label>
                </div>
              </SectionGrid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Financeiro */}
        <TabsContent value="financial">
          <Card>
            <CardContent className="pt-6">
              <SectionGrid>
                <FormField label="Salário Atual (R$)" error={errors.currentSalary?.message}>
                  <Input {...register('currentSalary', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                </FormField>
                <FormField label="Banco" error={errors.bankName?.message}>
                  <Input {...register('bankName')} placeholder="Nome do banco" />
                </FormField>
                <FormField label="Agência" error={errors.bankBranch?.message}>
                  <Input {...register('bankBranch')} placeholder="0001" />
                </FormField>
                <FormField label="Conta" error={errors.bankAccount?.message}>
                  <Input {...register('bankAccount')} placeholder="00000-0" />
                </FormField>
                <FormField label="Tipo de Conta" error={errors.bankAccountType?.message}>
                  <Select onValueChange={(value) => setValue('bankAccountType', value as 'pf' | 'pj')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pf">Pessoa Física</SelectItem>
                      <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Comissão (%)" error={errors.commissionPct?.message}>
                  <Input {...register('commissionPct', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                </FormField>
                <FormField label="Bônus Garantido (R$)" error={errors.guaranteedBonus?.message}>
                  <Input {...register('guaranteedBonus', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                </FormField>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={watch('plrEligible')}
                    onCheckedChange={(checked) => setValue('plrEligible', checked)}
                  />
                  <Label>Elegível PLR</Label>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={watch('thirteenthPj')}
                    onCheckedChange={(checked) => setValue('thirteenthPj', checked)}
                  />
                  <Label>13º PJ</Label>
                </div>
              </SectionGrid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Benefícios */}
        <TabsContent value="benefits">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4 max-w-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={watch('hasMedicalAssistance')}
                    onCheckedChange={(checked) => setValue('hasMedicalAssistance', checked)}
                  />
                  <Label>Possui Assistência Médica</Label>
                </div>
                <FormField label="Observações Plano de Saúde" error={errors.medicalPlanNotes?.message}>
                  <Textarea
                    {...register('medicalPlanNotes')}
                    placeholder="Observações sobre o plano de saúde"
                    rows={4}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 8: CLT / PJ */}
        <TabsContent value="cltpj">
          <Card>
            <CardContent className="pt-6">
              {!employmentType && (
                <p className="text-sm text-muted-foreground">
                  Selecione o tipo de contratação na aba &quot;Profissional&quot; para habilitar esses campos.
                </p>
              )}

              {employmentType === 'clt' && (
                <SectionGrid>
                  <FormField label="CTPS Número" error={errors.ctpsNumber?.message}>
                    <Input {...register('ctpsNumber')} placeholder="Número CTPS" />
                  </FormField>
                  <FormField label="CTPS Série" error={errors.ctpsSeries?.message}>
                    <Input {...register('ctpsSeries')} placeholder="Série CTPS" />
                  </FormField>
                  <FormField label="PIS/PASEP" error={errors.pisPasep?.message}>
                    <Input {...register('pisPasep')} placeholder="Número PIS/PASEP" />
                  </FormField>
                  <FormField label="Sistema de Ponto" error={errors.timesheetSystem?.message}>
                    <Input {...register('timesheetSystem')} placeholder="ponto_mais" />
                  </FormField>
                  <FormField label="ID no Ponto" error={errors.timesheetId?.message}>
                    <Input {...register('timesheetId')} placeholder="ID do colaborador no sistema de ponto" />
                  </FormField>
                </SectionGrid>
              )}

              {employmentType === 'pj' && (
                <SectionGrid>
                  <FormField label="Razão Social" error={errors.companyName?.message}>
                    <Input {...register('companyName')} placeholder="Nome da empresa" />
                  </FormField>
                  <FormField label="CNPJ" error={errors.companyCnpj?.message}>
                    <Controller
                      control={control}
                      name="companyCnpj"
                      render={({ field }) => (
                        <MaskedInput
                          mask={CNPJ_MASK}
                          value={field.value ?? ''}
                          onAccept={field.onChange}
                          placeholder="00.000.000/0001-00"
                        />
                      )}
                    />
                  </FormField>
                  <FormField label="CNAE" error={errors.companyCnae?.message}>
                    <Input {...register('companyCnae')} placeholder="Código CNAE" />
                  </FormField>
                  <FormField label="Valor Mensal NF (R$)" error={errors.monthlyNfAmount?.message}>
                    <Input {...register('monthlyNfAmount', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                  </FormField>
                  <FormField label="Dia Vencimento NF" error={errors.nfDueDay?.message}>
                    <Input {...register('nfDueDay', { valueAsNumber: true })} type="number" min={1} max={31} placeholder="25" />
                  </FormField>
                </SectionGrid>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
