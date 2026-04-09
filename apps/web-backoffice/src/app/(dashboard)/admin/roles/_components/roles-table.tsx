'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Switch,
} from '@nexus/ui';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface RoleRow {
  id: string;
  key: string;
  label: string;
  homeRoute: string;
  isSystem: boolean;
  isActive: boolean;
}

interface RolesTableProps {
  roles: RoleRow[];
}

export function RolesTable({ roles: initialRoles }: Readonly<RolesTableProps>) {
  const [roles, setRoles] = useState(initialRoles);
  const [isPending, startTransition] = useTransition();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);
  const [form, setForm] = useState({ key: '', label: '', homeRoute: '/dashboard' });

  function openCreate() {
    setForm({ key: '', label: '', homeRoute: '/dashboard' });
    setCreateDialogOpen(true);
  }

  function openEdit(role: RoleRow) {
    setSelectedRole(role);
    setForm({ key: role.key, label: role.label, homeRoute: role.homeRoute });
    setEditDialogOpen(true);
  }

  function openDelete(role: RoleRow) {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  }

  function handleCreate() {
    startTransition(async () => {
      try {
        const response = await api.post<RoleRow>('/roles', form);
        const newRole = response.data;
        setRoles((prev) => [...prev, newRole]);
        setCreateDialogOpen(false);
        toast.success('Role criado com sucesso');
      } catch {
        toast.error('Erro ao criar role');
      }
    });
  }

  function handleEdit() {
    if (!selectedRole) return;
    const roleId = selectedRole.id;
    startTransition(async () => {
      try {
        const response = await api.patch<RoleRow>(`/roles/${roleId}`, {
          label: form.label,
          homeRoute: form.homeRoute,
        });
        const updatedRole = response.data;
        setRoles(roles.map((r) => (r.id === roleId ? updatedRole : r)));
        setEditDialogOpen(false);
        toast.success('Role atualizado com sucesso');
      } catch {
        toast.error('Erro ao atualizar role');
      }
    });
  }

  function handleDelete() {
    if (!selectedRole) return;
    const roleId = selectedRole.id;
    startTransition(async () => {
      try {
        await api.delete(`/roles/${roleId}`);
        setRoles(roles.filter((r) => r.id !== roleId));
        setDeleteDialogOpen(false);
        toast.success('Role removido com sucesso');
      } catch {
        toast.error('Erro ao remover role');
      }
    });
  }

  async function toggleActive(role: RoleRow) {
    try {
      const response = await api.patch<RoleRow>(`/roles/${role.id}`, {
        isActive: !role.isActive,
      });
      setRoles((prev) => prev.map((r) => (r.id === role.id ? response.data : r)));
    } catch {
      toast.error('Erro ao atualizar status');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal">Roles & Permissões</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os roles do sistema e configure as permissões de cada um
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Novo Role
        </Button>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Rota Inicial</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-mono text-xs">{role.key}</TableCell>
                <TableCell className="font-medium">{role.label}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{role.homeRoute}</TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <Badge variant="secondary">Sistema</Badge>
                  ) : (
                    <Badge variant="outline">Customizado</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={role.isActive}
                    onCheckedChange={() => toggleActive(role)}
                    title={role.isActive ? 'Desativar role' : 'Ativar role'}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/roles/${role.id}/permissions`}>
                      <Button variant="outline" size="sm" title="Gerenciar permissões">
                        <ShieldCheck size={14} />
                        Permissões
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar role"
                      onClick={() => openEdit(role)}
                    >
                      <Pencil size={14} />
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Remover role"
                        onClick={() => openDelete(role)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-key">Chave (key)</Label>
              <Input
                id="create-key"
                placeholder="ex: financial_analyst"
                value={form.key}
                onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Letras minúsculas, números e underscore. Não pode ser alterado depois.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-label">Label</Label>
              <Input
                id="create-label"
                placeholder="ex: Analista Financeiro"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-route">Rota inicial</Label>
              <Input
                id="create-route"
                placeholder="/dashboard"
                value={form.homeRoute}
                onChange={(e) => setForm((f) => ({ ...f, homeRoute: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={isPending || !form.key || !form.label}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Chave</Label>
              <Input value={form.key} disabled className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-label">Label</Label>
              <Input
                id="edit-label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-route">Rota inicial</Label>
              <Input
                id="edit-route"
                value={form.homeRoute}
                onChange={(e) => setForm((f) => ({ ...f, homeRoute: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={isPending || !form.label}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Role</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Tem certeza que deseja remover o role <strong>{selectedRole?.label}</strong>?
            Esta ação não pode ser desfeita. Usuários com este role perderão o acesso.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
