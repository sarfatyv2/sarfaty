import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Badge, Skeleton, Button } from '@nexus/ui';
import { ArrowLeft } from 'lucide-react';
import { getEnrollmentStatusLabel, getEnrollmentStatusColor } from '@nexus/utils';
import { ProgressFilters } from './_components/progress-filters';

export const metadata: Metadata = {
  title: 'Progresso do Curso | Sarfaty',
};

interface EnrollmentRow {
  enrollmentId: string;
  collaboratorId: string;
  collaboratorName: string;
  department: string | null;
  jobTitle: string | null;
  status: string;
  progressPct: number;
  enrolledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  deadlineAt: string | null;
}

interface CourseProgressPageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ status?: string; search?: string }>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

async function EnrollmentsTable({
  courseId,
  status,
  search,
}: {
  courseId: string;
  status?: string;
  search?: string;
}) {
  try {
    const response = await serverFetch<EnrollmentRow[]>(
      `/learning/admin/progress/${courseId}`,
      { status, search },
    );
    const enrollments = response.data ?? [];

    if (enrollments.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma matricula encontrada.</p>
          <p className="text-sm text-muted-foreground mt-1">
            {status || search
              ? 'Tente ajustar os filtros.'
              : 'Nenhum colaborador esta inscrito neste curso.'}
          </p>
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                Colaborador
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                Departamento
              </th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                Status
              </th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                Progresso
              </th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                Inscrito em
              </th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                Concluido em
              </th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                Prazo
              </th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((row) => (
              <tr key={row.enrollmentId} className="border-b last:border-b-0 hover:bg-muted/30">
                <td className="p-3">
                  <div>
                    <span className="font-medium text-sm">{row.collaboratorName}</span>
                    {row.jobTitle && (
                      <span className="block text-xs text-muted-foreground">{row.jobTitle}</span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {row.department ?? '-'}
                </td>
                <td className="p-3 text-center">
                  <Badge variant={getEnrollmentStatusColor(row.status)} className="text-xs">
                    {getEnrollmentStatusLabel(row.status)}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${row.progressPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {row.progressPct}%
                    </span>
                  </div>
                </td>
                <td className="p-3 text-center text-sm text-muted-foreground">
                  {formatDate(row.enrolledAt)}
                </td>
                <td className="p-3 text-center text-sm text-muted-foreground">
                  {formatDate(row.completedAt)}
                </td>
                <td className="p-3 text-center text-sm text-muted-foreground">
                  {formatDate(row.deadlineAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">Erro ao carregar matriculas.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={`skel-${String(i)}`} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default async function CourseProgressPage({
  params,
  searchParams,
}: CourseProgressPageProps) {
  const { courseId } = await params;
  const { status, search } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/learning/admin">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Progresso do Curso</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o andamento de cada colaborador inscrito
          </p>
        </div>
      </div>

      <ProgressFilters currentStatus={status} currentSearch={search} />

      <Suspense fallback={<TableSkeleton />}>
        <EnrollmentsTable courseId={courseId} status={status} search={search} />
      </Suspense>
    </div>
  );
}
