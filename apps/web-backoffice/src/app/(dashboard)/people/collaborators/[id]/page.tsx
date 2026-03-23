import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { serverFetch } from '@/lib/api-server';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/constants';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@nexus/ui';
import { ArrowLeft } from 'lucide-react';
import { CollaboratorDetail } from '../_components/collaborator-detail';
import { EditCollaboratorForm } from '../_components/edit-collaborator-form';
import { DependentsList } from '../_components/dependents-list';
import { ROLES, type Role } from '@nexus/types';

export const metadata: Metadata = {
  title: 'Detalhe do Colaborador | Sarfaty',
};

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

interface DependentData {
  id: string;
  collaboratorId: string;
  fullName: string;
  relationship: string | null;
  dateOfBirth: string | null;
  cpf: string | null;
  isIrDependent: boolean;
  isHealthPlan: boolean;
  notes: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const EDIT_COLLABORATOR_ROLES = new Set<Role>(['hr', 'dp', 'hr_admin', 'admin']);

export default async function CollaboratorDetailPage({ params }: PageProps) {
  const { id } = await params;

  let collaborator: CollaboratorData;
  let dependents: DependentData[] = [];

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  let role: Role = 'employee';
  if (accessToken) {
    try {
      const payload = decodeJwt(accessToken);
      const r = payload.role;
      if (typeof r === 'string' && ROLES.includes(r as Role)) {
        role = r as Role;
      }
    } catch {
      role = 'employee';
    }
  }
  const canEdit = EDIT_COLLABORATOR_ROLES.has(role);

  try {
    const collabResponse = await serverFetch<CollaboratorData>(`/people/collaborators/${id}`);
    collaborator = collabResponse.data;
  } catch {
    return (
      <div className="space-y-4">
        <Link href="/people/collaborators">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Voltar
          </Button>
        </Link>
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Colaborador não encontrado ou erro ao carregar dados.
        </div>
      </div>
    );
  }

  try {
    const depsResponse = await serverFetch<DependentData[]>(
      `/people/collaborators/${id}/dependents`,
    );
    dependents = depsResponse.data;
  } catch {
    // Dependents might fail for people_manager, that's ok
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/people/collaborators">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-3xl font-normal">{collaborator.fullName}</h1>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          {canEdit && <TabsTrigger value="editar">Editar</TabsTrigger>}
          <TabsTrigger value="dependentes">Dependentes</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-6">
          <CollaboratorDetail collaborator={collaborator} />
        </TabsContent>

        {canEdit && (
          <TabsContent value="editar" className="mt-6">
            <EditCollaboratorForm collaborator={collaborator} />
          </TabsContent>
        )}

        <TabsContent value="dependentes" className="mt-6">
          <DependentsList
            collaboratorId={id}
            dependents={dependents}
            canEdit={canEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
