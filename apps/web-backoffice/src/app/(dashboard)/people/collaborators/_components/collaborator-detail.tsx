'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
} from '@nexus/ui';
import { ROLE_PERMISSIONS, type Role } from '@nexus/types';

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

interface CollaboratorDetailProps {
  collaborator: CollaboratorData;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || '—'}</dd>
    </div>
  );
}

export function CollaboratorDetail({ collaborator }: CollaboratorDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getInitials(collaborator.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{collaborator.fullName}</h2>
                <Badge variant={collaborator.isActive ? 'default' : 'destructive'}>
                  {collaborator.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant="secondary">
                  {collaborator.employmentType === 'clt' ? 'CLT' : 'PJ'}
                </Badge>
              </div>
              {collaborator.socialName && (
                <p className="text-sm text-muted-foreground">
                  Nome social: {collaborator.socialName}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {collaborator.jobTitle ?? 'Sem cargo'} — {collaborator.department ?? 'Sem departamento'}
              </p>
              {collaborator.corporateEmail && (
                <p className="text-sm text-muted-foreground">{collaborator.corporateEmail}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <InfoRow label="CPF" value={collaborator.cpf} />
            <InfoRow label="Data de Nascimento" value={formatDate(collaborator.dateOfBirth)} />
            <InfoRow label="Gênero" value={collaborator.gender} />
            <InfoRow label="Estado Civil" value={collaborator.maritalStatus} />
            <InfoRow label="Nacionalidade" value={collaborator.nationality} />
            <InfoRow label="Telefone" value={collaborator.phone} />
            <InfoRow label="Email Pessoal" value={collaborator.personalEmail} />
            <InfoRow label="Matrícula" value={collaborator.registrationNumber} />
          </dl>
        </CardContent>
      </Card>

      {/* Professional Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <InfoRow label="Empresa" value={collaborator.company} />
            <InfoRow label="Diretoria" value={collaborator.directorate} />
            <InfoRow label="Departamento" value={collaborator.department} />
            <InfoRow label="Filial" value={collaborator.branch} />
            <InfoRow
              label="Permissão"
              value={collaborator.role ? (ROLE_PERMISSIONS[collaborator.role as Role]?.label ?? collaborator.role) : null}
            />
            <InfoRow label="Cargo" value={collaborator.jobTitle} />
            <InfoRow label="Nível" value={collaborator.roleLevel} />
            <InfoRow label="Admissão" value={formatDate(collaborator.startDateOriginal)} />
          </dl>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endereço</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <InfoRow label="CEP" value={collaborator.addressZip} />
            <InfoRow
              label="Logradouro"
              value={
                collaborator.addressStreet
                  ? `${collaborator.addressStreet}, ${collaborator.addressNumber ?? 'S/N'}${collaborator.addressComplement ? ` - ${collaborator.addressComplement}` : ''}`
                  : null
              }
            />
            <InfoRow label="Bairro" value={collaborator.addressNeighborhood} />
            <InfoRow
              label="Cidade/UF"
              value={
                collaborator.addressCity
                  ? `${collaborator.addressCity}/${collaborator.addressState ?? ''}`
                  : null
              }
            />
          </dl>
        </CardContent>
      </Card>

      {/* CLT data */}
      {collaborator.employmentType === 'clt' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados CLT</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <InfoRow label="CTPS" value={collaborator.cltData?.ctpsNumber} />
              <InfoRow label="Série CTPS" value={collaborator.cltData?.ctpsSeries} />
              <InfoRow label="PIS/PASEP" value={collaborator.cltData?.pisPasep} />
              <InfoRow label="Sistema de Ponto" value={collaborator.cltData?.timesheetSystem} />
              <InfoRow label="ID Ponto" value={collaborator.cltData?.timesheetId} />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* PJ data */}
      {collaborator.employmentType === 'pj' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados PJ</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <InfoRow label="Razão Social" value={collaborator.pjData?.companyName} />
              <InfoRow label="CNPJ" value={collaborator.pjData?.companyCnpj} />
              <InfoRow label="CNAE" value={collaborator.pjData?.companyCnae} />
              <InfoRow
                label="Valor NF Mensal"
                value={
                  collaborator.pjData?.monthlyNfAmount != null
                    ? formatCurrency(collaborator.pjData.monthlyNfAmount)
                    : undefined
                }
              />
              <InfoRow
                label="Dia Vencimento NF"
                value={
                  collaborator.pjData?.nfDueDay != null
                    ? String(collaborator.pjData.nfDueDay)
                    : undefined
                }
              />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Financial (only shown to hr/dp/admin — controlled at API level) */}
      {collaborator.currentSalary !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados Financeiros</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <InfoRow label="Salário Atual" value={formatCurrency(collaborator.currentSalary)} />
              <InfoRow label="Banco" value={collaborator.bankName} />
              <InfoRow label="Agência" value={collaborator.bankBranch} />
              <InfoRow label="Conta" value={collaborator.bankAccount} />
              <InfoRow label="Tipo Conta" value={collaborator.bankAccountType === 'pf' ? 'Pessoa Física' : collaborator.bankAccountType === 'pj' ? 'Pessoa Jurídica' : null} />
              <InfoRow label="Plano de Saúde" value={collaborator.hasMedicalAssistance ? 'Sim' : 'Não'} />
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
