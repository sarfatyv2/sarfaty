import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Button, Badge, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from '@nexus/ui';
import { Plus, BarChart3 } from 'lucide-react';
import {
  getCourseStatusLabel,
  getCourseStatusColor,
  getCourseCategoryLabel,
  formatDuration,
} from '@nexus/utils';

export const metadata: Metadata = {
  title: 'Gestao de Cursos | Sarfaty',
};

interface CourseRow {
  id: string;
  title: string;
  category: string;
  status: string;
  totalDurationSeconds: number;
  isMandatory: boolean;
  targetRoles: string[];
  createdAt: string;
}

interface ProgressSummary {
  courseId: string;
  courseTitle: string;
  category: string;
  isMandatory: boolean;
  totalEnrolled: number;
  inProgress: number;
  completed: number;
  avgProgressPct: number;
}

async function CoursesAdminTable() {
  try {
    const response = await serverFetch<CourseRow[]>('/learning/courses', {
      page: 1,
      pageSize: 50,
    });
    const courses = response.data ?? [];

    if (courses.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum curso criado ainda.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Comece criando seu primeiro curso de treinamento.
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
                Curso
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                Categoria
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                Status
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                Duracao
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                Perfis
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b last:border-b-0 hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{course.title}</span>
                    {course.isMandatory && (
                      <Badge variant="destructive" className="text-xs">
                        Obrigatorio
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="text-xs">
                    {getCourseCategoryLabel(course.category)}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge variant={getCourseStatusColor(course.status)} className="text-xs">
                    {getCourseStatusLabel(course.status)}
                  </Badge>
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {formatDuration(course.totalDurationSeconds)}
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {course.targetRoles.length}
                </td>
                <td className="p-3">
                  <Link
                    href={`/learning/admin/${course.id}/edit`}
                    className="text-sm text-primary hover:underline"
                  >
                    Editar
                  </Link>
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
        <p className="font-medium">Erro ao carregar cursos.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

async function ProgressSummaryTable() {
  try {
    const response = await serverFetch<ProgressSummary[]>('/learning/admin/progress');
    const summaries = response.data ?? [];

    if (summaries.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum curso publicado com matriculas.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Publique um curso e inscreva colaboradores para acompanhar o progresso.
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
                Curso
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                Categoria
              </th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                Inscritos
              </th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                Em andamento
              </th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                Concluidos
              </th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                Progresso medio
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((row) => (
                <tr key={row.courseId} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{row.courseTitle}</span>
                      {row.isMandatory && (
                        <Badge variant="destructive" className="text-xs">
                          Obrigatorio
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      {getCourseCategoryLabel(row.category)}
                    </Badge>
                  </td>
                  <td className="p-3 text-center text-sm font-medium">
                    {row.totalEnrolled}
                  </td>
                  <td className="p-3 text-center text-sm text-amber-600">
                    {row.inProgress}
                  </td>
                  <td className="p-3 text-center text-sm text-green-600">
                    {row.completed}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${row.avgProgressPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {row.avgProgressPct}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/learning/admin/${row.courseId}/progress`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <BarChart3 size={14} />
                      Detalhes
                    </Link>
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
        <p className="font-medium">Erro ao carregar progresso.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={`skel-${String(i)}`} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function LearningAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestao de Cursos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie cursos e acompanhe o progresso dos colaboradores
          </p>
        </div>
        <Button asChild>
          <Link href="/learning/admin/new">
            <Plus size={16} />
            Novo Curso
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4">
          <Suspense fallback={<TableSkeleton />}>
            <CoursesAdminTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <Suspense fallback={<TableSkeleton />}>
            <ProgressSummaryTable />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
