'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateCollaboratorAdminSchema,
  type UpdateCollaboratorAdminDto,
} from '@nexus/validators';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Separator,
  Switch,
} from '@nexus/ui';
import { Loader2, Save } from 'lucide-react';
import { ROLES, ROLE_PERMISSIONS, type Role } from '@nexus/types';
import { api } from '@/lib/api';
import { MaskedInput, CPF_MASK, PHONE_MASK, CEP_MASK, CNPJ_MASK } from '@/components/masked-input';
import { ManagerPicker } from '@/components/manager-picker';

const UF_OPTIONS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'nao_informado', label: 'Não informado' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União estável' },
  { value: 'outro', label: 'Outro' },
];

interface CollaboratorData {
  id: string;
  fullName: string;
  socialName: string | null;
  corporateEmail: string | null;
  personalEmail: string | null;
  phone: string | null;
  cpf: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  nationality: string;
  employmentType: string;
  isActive: boolean;
  department: string | null;
  directorate: string | null;
  jobTitle: string | null;
  role: string | null;
  roleLevel: string | null;
  company: string;
  branch: string | null;
  managerId: string | null;
  startDateOriginal: string | null;
  registrationNumber: string | null;
  badgeNumber: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccount: string | null;
  bankAccountType: string | null;
  currentSalary: number | null;
  hasMedicalAssistance: boolean;
  cltData?: {
    ctpsNumber: string | null;
    ctpsSeries: string | null;
    pisPasep: string | null;
    timesheetSystem: string | null;
    timesheetId: string | null;
  } | null;
  pjData?: {
    companyName: string | null;
    companyCnpj: string | null;
    companyCnae: string | null;
    monthlyNfAmount: number | null;
    nfDueDay: number | null;
  } | null;
}

interface EditCollaboratorFormProps {
  collaborator: CollaboratorData;
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const defaultValuesFromCollaborator = (c: CollaboratorData): UpdateCollaboratorAdminDto => ({
  fullName: c.fullName,
  cpf: c.cpf ?? undefined,
  socialName: c.socialName ?? undefined,
  dateOfBirth: c.dateOfBirth ?? undefined,
  gender: (c.gender as UpdateCollaboratorAdminDto['gender']) ?? undefined,
  maritalStatus: (c.maritalStatus as UpdateCollaboratorAdminDto['maritalStatus']) ?? undefined,
  nationality: c.nationality ?? undefined,
  phone: c.phone ?? undefined,
  personalEmail: c.personalEmail ?? undefined,
  corporateEmail: c.corporateEmail ?? undefined,
  addressStreet: c.addressStreet ?? undefined,
  addressNumber: c.addressNumber ?? undefined,
  addressComplement: c.addressComplement ?? undefined,
  addressNeighborhood: c.addressNeighborhood ?? undefined,
  addressCity: c.addressCity ?? undefined,
  addressState: (c.addressState as UpdateCollaboratorAdminDto['addressState']) ?? undefined,
  addressZip: c.addressZip ?? undefined,
  employmentType: (c.employmentType as UpdateCollaboratorAdminDto['employmentType']) ?? 'clt',
  company: c.company ?? undefined,
  directorate: c.directorate ?? undefined,
  department: c.department ?? undefined,
  branch: c.branch ?? undefined,
  managerId: c.managerId ?? undefined,
  jobTitle: c.jobTitle ?? undefined,
  role: (c.role as UpdateCollaboratorAdminDto['role']) ?? undefined,
  roleLevel: c.roleLevel ?? undefined,
  registrationNumber: c.registrationNumber ?? undefined,
  badgeNumber: c.badgeNumber ?? undefined,
  startDateOriginal: c.startDateOriginal ?? undefined,
  bankName: c.bankName ?? undefined,
  bankBranch: c.bankBranch ?? undefined,
  bankAccount: c.bankAccount ?? undefined,
  bankAccountType: (c.bankAccountType as UpdateCollaboratorAdminDto['bankAccountType']) ?? undefined,
  currentSalary: c.currentSalary ?? undefined,
  isActive: c.isActive,
  hasMedicalAssistance: c.hasMedicalAssistance,
  ctpsNumber: c.cltData?.ctpsNumber ?? undefined,
  ctpsSeries: c.cltData?.ctpsSeries ?? undefined,
  pisPasep: c.cltData?.pisPasep ?? undefined,
  timesheetSystem: c.cltData?.timesheetSystem ?? undefined,
  timesheetId: c.cltData?.timesheetId ?? undefined,
  companyName: c.pjData?.companyName ?? undefined,
  companyCnpj: c.pjData?.companyCnpj ?? undefined,
  companyCnae: c.pjData?.companyCnae ?? undefined,
  monthlyNfAmount: c.pjData?.monthlyNfAmount ?? undefined,
  nfDueDay: c.pjData?.nfDueDay ?? undefined,
});

export function EditCollaboratorForm({ collaborator }: EditCollaboratorFormProps) {
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateCollaboratorAdminDto>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateCollaboratorAdminSchema) as any,
    mode: 'onBlur',
    defaultValues: defaultValuesFromCollaborator(collaborator),
  });

  useEffect(() => {
    reset(defaultValuesFromCollaborator(collaborator));
  }, [collaborator, reset]);

  async function onSubmit(data: UpdateCollaboratorAdminDto) {
    try {
      await api.patch(`/people/collaborators/${collaborator.id}`, data);
      toast.success('Colaborador atualizado com sucesso');
      router.refresh();
    } catch {
      toast.error('Erro ao atualizar colaborador');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Editar Colaborador</CardTitle>
          <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField label="Nome Completo" error={errors.fullName?.message}>
                <Input {...register('fullName')} placeholder="Nome completo" />
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
              <FormField label="Nome Social" error={errors.socialName?.message}>
                <Input {...register('socialName')} placeholder="Nome social" />
              </FormField>
              <FormField label="Data de Nascimento" error={errors.dateOfBirth?.message}>
                <Input {...register('dateOfBirth')} type="date" />
              </FormField>
              <FormField label="Gênero" error={errors.gender?.message}>
                <Select
                  value={watch('gender') ?? ''}
                  onValueChange={(v) => setValue('gender', v as UpdateCollaboratorAdminDto['gender'], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Estado Civil" error={errors.maritalStatus?.message}>
                <Select
                  value={watch('maritalStatus') ?? ''}
                  onValueChange={(v) => setValue('maritalStatus', v as UpdateCollaboratorAdminDto['maritalStatus'], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Nacionalidade" error={errors.nationality?.message}>
                <Input {...register('nationality')} placeholder="Ex: Brasileira" />
              </FormField>
            </div>
          </div>

          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <Input {...register('personalEmail')} type="email" placeholder="email@pessoal.com" />
              </FormField>
              <FormField label="Email Corporativo" error={errors.corporateEmail?.message}>
                <Input {...register('corporateEmail')} type="email" placeholder="email@empresa.com" />
              </FormField>
            </div>
          </div>

          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4">Dados Profissionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField label="Permissão (Role)" error={errors.role?.message}>
                <Select
                  value={watch('role') ?? ''}
                  onValueChange={(v) => setValue('role', v as UpdateCollaboratorAdminDto['role'], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_PERMISSIONS[r as Role]?.label ?? r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Tipo de Vínculo" error={errors.employmentType?.message}>
                <Select
                  value={watch('employmentType') ?? ''}
                  onValueChange={(v) => setValue('employmentType', v as UpdateCollaboratorAdminDto['employmentType'], { shouldDirty: true })}
                >
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
              <FormField label="Departamento" error={errors.department?.message}>
                <Input {...register('department')} placeholder="Departamento" />
              </FormField>
              <FormField label="Filial" error={errors.branch?.message}>
                <Input {...register('branch')} placeholder="Filial" />
              </FormField>
              <FormField label="Cargo" error={errors.jobTitle?.message}>
                <Input {...register('jobTitle')} placeholder="Cargo" />
              </FormField>
              <FormField label="Nível" error={errors.roleLevel?.message}>
                <Input {...register('roleLevel')} placeholder="Jr, Pl, Sr" />
              </FormField>
              <FormField label="Matrícula" error={errors.registrationNumber?.message}>
                <Input {...register('registrationNumber')} placeholder="Matrícula" />
              </FormField>
              <FormField label="Crachá" error={errors.badgeNumber?.message}>
                <Input {...register('badgeNumber')} placeholder="Nº crachá" />
              </FormField>
              <FormField label="Data de Admissão" error={errors.startDateOriginal?.message}>
                <Input {...register('startDateOriginal')} type="date" />
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
            </div>
          </div>

          {watch('employmentType') === 'clt' && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-4">Dados CLT</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField label="CTPS" error={errors.ctpsNumber?.message}>
                    <Input {...register('ctpsNumber')} placeholder="Número da CTPS" />
                  </FormField>
                  <FormField label="Série CTPS" error={errors.ctpsSeries?.message}>
                    <Input {...register('ctpsSeries')} placeholder="Série" />
                  </FormField>
                  <FormField label="PIS/PASEP" error={errors.pisPasep?.message}>
                    <Input {...register('pisPasep')} placeholder="PIS ou PASEP" />
                  </FormField>
                  <FormField label="Sistema de Ponto" error={errors.timesheetSystem?.message}>
                    <Input {...register('timesheetSystem')} placeholder="Ex: ponto_mais" />
                  </FormField>
                  <FormField label="ID no Sistema de Ponto" error={errors.timesheetId?.message}>
                    <Input {...register('timesheetId')} placeholder="ID" />
                  </FormField>
                </div>
              </div>
            </>
          )}

          {watch('employmentType') === 'pj' && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-4">Dados PJ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField label="Razão Social" error={errors.companyName?.message}>
                    <Input {...register('companyName')} placeholder="Razão social da PJ" />
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
                    <Input {...register('companyCnae')} placeholder="CNAE principal" />
                  </FormField>
                  <FormField label="Valor NF Mensal" error={errors.monthlyNfAmount?.message}>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="0,00"
                      {...register('monthlyNfAmount')}
                    />
                  </FormField>
                  <FormField label="Dia Vencimento NF" error={errors.nfDueDay?.message}>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="25"
                      {...register('nfDueDay')}
                    />
                  </FormField>
                </div>
              </div>
            </>
          )}

          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <FormField label="Rua" error={errors.addressStreet?.message}>
                <Input {...register('addressStreet')} placeholder="Rua" />
              </FormField>
              <FormField label="Número" error={errors.addressNumber?.message}>
                <Input {...register('addressNumber')} placeholder="123" />
              </FormField>
              <FormField label="Complemento" error={errors.addressComplement?.message}>
                <Input {...register('addressComplement')} placeholder="Apto" />
              </FormField>
              <FormField label="Bairro" error={errors.addressNeighborhood?.message}>
                <Input {...register('addressNeighborhood')} placeholder="Bairro" />
              </FormField>
              <FormField label="Cidade" error={errors.addressCity?.message}>
                <Input {...register('addressCity')} placeholder="Cidade" />
              </FormField>
              <FormField label="Estado" error={errors.addressState?.message}>
                <Select
                  value={watch('addressState') ?? ''}
                  onValueChange={(v) => setValue('addressState', v as UpdateCollaboratorAdminDto['addressState'], { shouldDirty: true })}
                >
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
            </div>
          </div>

          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4">Dados Financeiros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField label="Salário Atual" error={errors.currentSalary?.message}>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0,00"
                  {...register('currentSalary')}
                />
              </FormField>
              <FormField label="Banco" error={errors.bankName?.message}>
                <Input {...register('bankName')} placeholder="Banco" />
              </FormField>
              <FormField label="Agência" error={errors.bankBranch?.message}>
                <Input {...register('bankBranch')} placeholder="Agência" />
              </FormField>
              <FormField label="Conta" error={errors.bankAccount?.message}>
                <Input {...register('bankAccount')} placeholder="Conta" />
              </FormField>
              <FormField label="Tipo de Conta" error={errors.bankAccountType?.message}>
                <Select
                  value={watch('bankAccountType') ?? ''}
                  onValueChange={(v) => setValue('bankAccountType', v as UpdateCollaboratorAdminDto['bankAccountType'], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pf">Pessoa Física</SelectItem>
                    <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>

          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4">Status</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('isActive')}
                  onCheckedChange={(v) => setValue('isActive', v, { shouldDirty: true })}
                />
                <Label>Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('hasMedicalAssistance')}
                  onCheckedChange={(v) => setValue('hasMedicalAssistance', v, { shouldDirty: true })}
                />
                <Label>Plano de Saúde</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
