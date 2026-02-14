'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Switch,
} from '@nexus/ui';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { MaskedInput, CPF_MASK } from '@/components/masked-input';

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

interface DependentsListProps {
  collaboratorId: string;
  dependents: DependentData[];
  canEdit: boolean;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  conjuge: 'Cônjuge',
  filho: 'Filho',
  filha: 'Filha',
  pai: 'Pai',
  mae: 'Mãe',
  enteado: 'Enteado',
  enteada: 'Enteada',
  tutelado: 'Tutelado',
  outro: 'Outro',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function DependentsList({ collaboratorId, dependents, canEdit }: DependentsListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    dateOfBirth: '',
    cpf: '',
    isIrDependent: false,
    isHealthPlan: false,
    notes: '',
  });

  async function handleCreate() {
    if (!formData.fullName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/people/collaborators/${collaboratorId}/dependents`, {
        fullName: formData.fullName,
        relationship: formData.relationship || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        cpf: formData.cpf || undefined,
        isIrDependent: formData.isIrDependent,
        isHealthPlan: formData.isHealthPlan,
        notes: formData.notes || undefined,
      });
      toast.success('Dependente adicionado');
      setIsCreating(false);
      setFormData({
        fullName: '',
        relationship: '',
        dateOfBirth: '',
        cpf: '',
        isIrDependent: false,
        isHealthPlan: false,
        notes: '',
      });
      router.refresh();
    } catch {
      toast.error('Erro ao adicionar dependente');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(dependentId: string) {
    try {
      await api.delete(`/people/collaborators/${collaboratorId}/dependents/${dependentId}`);
      toast.success('Dependente removido');
      router.refresh();
    } catch {
      toast.error('Erro ao remover dependente');
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Dependentes</CardTitle>
        {canEdit && (
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={14} />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Dependente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Parentesco</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>CPF</Label>
                  <MaskedInput
                    mask={CPF_MASK}
                    value={formData.cpf}
                    onAccept={(value) => setFormData({ ...formData, cpf: value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.isIrDependent}
                    onCheckedChange={(checked) => setFormData({ ...formData, isIrDependent: checked })}
                  />
                  <Label>Dependente IR</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.isHealthPlan}
                    onCheckedChange={(checked) => setFormData({ ...formData, isHealthPlan: checked })}
                  />
                  <Label>Plano de Saúde</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {dependents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum dependente cadastrado
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Parentesco</TableHead>
                  <TableHead>Nascimento</TableHead>
                  <TableHead>IR</TableHead>
                  <TableHead>Plano</TableHead>
                  {canEdit && <TableHead className="w-[80px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dependents.map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell className="font-medium">{dep.fullName}</TableCell>
                    <TableCell>{dep.relationship ? RELATIONSHIP_LABELS[dep.relationship] ?? dep.relationship : '—'}</TableCell>
                    <TableCell>{formatDate(dep.dateOfBirth)}</TableCell>
                    <TableCell>
                      <Badge variant={dep.isIrDependent ? 'default' : 'secondary'}>
                        {dep.isIrDependent ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={dep.isHealthPlan ? 'default' : 'secondary'}>
                        {dep.isHealthPlan ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(dep.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
