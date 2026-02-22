'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateCollaboratorSelfSchema, type UpdateCollaboratorSelfDto } from '@nexus/validators';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Separator,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@nexus/ui';
import { Camera, Loader2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { MaskedInput, PHONE_MASK, CEP_MASK } from '@/components/masked-input';

const UF_OPTIONS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

interface CollaboratorProfile {
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
  roleLevel: string | null;
  company: string;
  startDateOriginal: string | null;
  registrationNumber: string | null;
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
  hasMedicalAssistance: boolean;
  avatarUrl: string | null;
}

interface DependentData {
  id: string;
  fullName: string;
  relationship: string | null;
  dateOfBirth: string | null;
  isIrDependent: boolean;
  isHealthPlan: boolean;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || '—'}</dd>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function MyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CollaboratorProfile | null>(null);
  const [dependents, setDependents] = useState<DependentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateCollaboratorSelfDto>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateCollaboratorSelfSchema) as any,
    mode: 'onBlur',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileRes, depsRes] = await Promise.all([
          api.get<CollaboratorProfile>('/people/me'),
          api.get<DependentData[]>('/people/me/dependents').catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data);
        setDependents(depsRes.data);

        // Pre-fill editable form fields
        const p = profileRes.data;
        reset({
          socialName: p.socialName ?? undefined,
          phone: p.phone ?? undefined,
          personalEmail: p.personalEmail ?? undefined,
          addressStreet: p.addressStreet ?? undefined,
          addressNumber: p.addressNumber ?? undefined,
          addressComplement: p.addressComplement ?? undefined,
          addressNeighborhood: p.addressNeighborhood ?? undefined,
          addressCity: p.addressCity ?? undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addressState: (p.addressState as any) ?? undefined,
          addressZip: p.addressZip ?? undefined,
          bankName: p.bankName ?? undefined,
          bankBranch: p.bankBranch ?? undefined,
          bankAccount: p.bankAccount ?? undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          bankAccountType: (p.bankAccountType as any) ?? undefined,
        });
      } catch {
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  async function onSubmit(data: UpdateCollaboratorSelfDto) {
    try {
      const response = await api.patch<CollaboratorProfile>('/people/me', data);
      setProfile(response.data);
      toast.success('Perfil atualizado com sucesso');
      router.refresh();
    } catch {
      toast.error('Erro ao atualizar perfil');
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.postFormData<{ avatarUrl: string }>('/people/me/avatar', formData);
      setProfile((prev) => prev ? { ...prev, avatarUrl: response.data.avatarUrl } : prev);
      toast.success('Foto de perfil atualizada');
      router.refresh();
    } catch {
      toast.error('Erro ao enviar foto. Use JPEG, PNG ou WebP (max 2MB).');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        Perfil não encontrado. Entre em contato com o RH.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Meu Perfil</h1>

      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative group shrink-0"
              title="Alterar foto de perfil"
            >
              <Avatar className="h-16 w-16">
                {profile.avatarUrl && (
                  <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                )}
                <AvatarFallback className="text-lg">{getInitials(profile.fullName)}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </div>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{profile.fullName}</h2>
                <Badge variant={profile.isActive ? 'default' : 'destructive'}>
                  {profile.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant="secondary">
                  {profile.employmentType === 'clt' ? 'CLT' : 'PJ'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.jobTitle ?? 'Sem cargo'} — {profile.department ?? 'Sem departamento'}
              </p>
              {profile.corporateEmail && (
                <p className="text-sm text-muted-foreground">{profile.corporateEmail}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList>
          <TabsTrigger value="dados">Meus Dados</TabsTrigger>
          <TabsTrigger value="editar">Editar Perfil</TabsTrigger>
          <TabsTrigger value="dependentes">Dependentes</TabsTrigger>
        </TabsList>

        {/* Read-only view */}
        <TabsContent value="dados" className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Dados Pessoais</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoRow label="Nome Completo" value={profile.fullName} />
                <InfoRow label="Nome Social" value={profile.socialName} />
                <InfoRow label="CPF" value={profile.cpf} />
                <InfoRow label="Data de Nascimento" value={formatDate(profile.dateOfBirth)} />
                <InfoRow label="Gênero" value={profile.gender} />
                <InfoRow label="Estado Civil" value={profile.maritalStatus} />
                <InfoRow label="Nacionalidade" value={profile.nationality} />
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Profissional</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoRow label="Empresa" value={profile.company} />
                <InfoRow label="Diretoria" value={profile.directorate} />
                <InfoRow label="Departamento" value={profile.department} />
                <InfoRow label="Cargo" value={profile.jobTitle} />
                <InfoRow label="Nível" value={profile.roleLevel} />
                <InfoRow label="Matrícula" value={profile.registrationNumber} />
                <InfoRow label="Data de Admissão" value={formatDate(profile.startDateOriginal)} />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Editable form (self-editable fields only) */}
        <TabsContent value="editar" className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Editar Dados Pessoais</CardTitle>
                <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField label="Nome Social" error={errors.socialName?.message}>
                    <Input {...register('socialName')} placeholder="Nome social" />
                  </FormField>
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
                </div>

                <Separator className="my-6" />
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
                    <Input {...register('addressComplement')} placeholder="Apto, Sala" />
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onValueChange={(value) => setValue('addressState', value as any, { shouldDirty: true })}
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

                <Separator className="my-6" />
                <h3 className="text-sm font-semibold mb-4">Dados Bancários</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Select
                      value={watch('bankAccountType') ?? ''}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onValueChange={(value) => setValue('bankAccountType', value as any, { shouldDirty: true })}
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
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Dependents (read-only for employee) */}
        <TabsContent value="dependentes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meus Dependentes</CardTitle>
            </CardHeader>
            <CardContent>
              {dependents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum dependente cadastrado
                </p>
              ) : (
                <div className="space-y-3">
                  {dependents.map((dep) => (
                    <div key={dep.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium text-sm">{dep.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {dep.relationship ?? 'Outro'} — Nasc: {formatDate(dep.dateOfBirth)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {dep.isIrDependent && <Badge variant="secondary">IR</Badge>}
                        {dep.isHealthPlan && <Badge variant="secondary">Plano</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
