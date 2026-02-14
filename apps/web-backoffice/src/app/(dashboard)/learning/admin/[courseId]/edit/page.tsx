'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Button,
  Badge,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Switch,
  Skeleton,
} from '@nexus/ui';
import { ArrowLeft, Loader2, Rocket, Save } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { COURSE_CATEGORY_LABELS, getCourseStatusLabel, getCourseStatusColor } from '@nexus/utils';
import { ROLES } from '@nexus/types';
import { ModuleEditor } from './_components/module-editor';

const ROLE_LABELS: Record<string, string> = {
  sales_rep: 'Comercial',
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
  dp: 'DP',
  hr_admin: 'Admin RH',
  admin: 'Administrador',
};

interface Material {
  name: string;
  storagePath: string;
}

interface Module {
  id: string;
  title: string;
  sortOrder: number;
  lessons: {
    id: string;
    title: string;
    description: string | null;
    youtubeVideoId: string;
    durationSeconds: number;
    sortOrder: number;
    materials: Material[] | null;
    quiz: unknown;
  }[];
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string;
  status: string;
  isMandatory: boolean;
  deadlineDays: number | null;
  targetRoles: string[];
  modules: Module[];
  totalLessons: number;
}

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [deadlineDays, setDeadlineDays] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [status, setStatus] = useState('draft');
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await api.get<CourseData>(`/learning/courses/${courseId}`);
        const course = response.data;
        setTitle(course.title);
        setDescription(course.description ?? '');
        setThumbnailUrl(course.thumbnailUrl ?? '');
        setCategory(course.category);
        setIsMandatory(course.isMandatory);
        setDeadlineDays(course.deadlineDays?.toString() ?? '');
        setSelectedRoles(course.targetRoles);
        setStatus(course.status);
        setModules(course.modules);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar curso';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    void loadCourse();
  }, [courseId]);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/learning/courses/${courseId}`, {
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        category,
        targetRoles: selectedRoles,
        isMandatory,
        deadlineDays: deadlineDays ? Number(deadlineDays) : undefined,
      });
      toast.success('Curso atualizado');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.post(`/learning/courses/${courseId}/publish`, {});
      setStatus('published');
      toast.success('Curso publicado com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao publicar';
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/learning/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar à gestão
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar Curso</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getCourseStatusColor(status)}>
              {getCourseStatusLabel(status)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} variant="outline">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar
          </Button>
          {status === 'draft' && (
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Rocket size={16} />
              )}
              Publicar
            </Button>
          )}
        </div>
      </div>

      {/* Course Info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">URL da Thumbnail</Label>
            <Input
              id="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              type="url"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COURSE_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadlineDays">Prazo (dias)</Label>
              <Input
                id="deadlineDays"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                type="number"
                min={1}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Curso Obrigatório</Label>
              <p className="text-xs text-muted-foreground">Colaboradores devem concluir</p>
            </div>
            <Switch checked={isMandatory} onCheckedChange={setIsMandatory} />
          </div>
        </CardContent>
      </Card>

      {/* Target Roles */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Label>Perfis Alvo</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROLES.map((role) => {
              const isSelected = selectedRoles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  {ROLE_LABELS[role] ?? role}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modules & Lessons */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Módulos e Aulas</h2>
        <ModuleEditor
          courseId={courseId}
          modules={modules}
          onModulesChange={setModules}
        />
      </div>
    </div>
  );
}
