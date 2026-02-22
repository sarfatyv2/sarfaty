'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Card,
  CardContent,
  Switch,
} from '@nexus/ui';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { COURSE_CATEGORY_LABELS } from '@nexus/utils';
import { ROLES } from '@nexus/types';

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

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [deadlineDays, setDeadlineDays] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const selectAllRoles = () => {
    setSelectedRoles([...ROLES]);
  };

  const clearRoles = () => {
    setSelectedRoles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !category || selectedRoles.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<{ id: string }>('/learning/courses', {
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        category,
        targetRoles: selectedRoles,
        isMandatory,
        deadlineDays: deadlineDays ? Number(deadlineDays) : undefined,
      });

      toast.success('Curso criado com sucesso!');
      router.push(`/learning/admin/${response.data.id}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar curso';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/learning/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar à gestão
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Novo Curso</h1>
        <p className="text-sm text-muted-foreground">
          Preencha as informações básicas do curso. Após criar, adicione módulos e aulas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Onboarding Comercial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o conteúdo e objetivos do curso..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">URL da Thumbnail</Label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                // eslint-disable-next-line no-secrets/no-secrets
                placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
                type="url"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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
                  placeholder="Ex: 30"
                  type="number"
                  min={1}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Curso Obrigatório</Label>
                <p className="text-xs text-muted-foreground">
                  Colaboradores dos perfis selecionados devem concluir
                </p>
              </div>
              <Switch
                checked={isMandatory}
                onCheckedChange={setIsMandatory}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Perfis Alvo *</Label>
                <p className="text-xs text-muted-foreground">
                  Selecione os perfis que devem ter acesso a este curso
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllRoles}
                >
                  Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearRoles}
                >
                  Limpar
                </Button>
              </div>
            </div>
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/learning/admin">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            Criar Curso
          </Button>
        </div>
      </form>
    </div>
  );
}
