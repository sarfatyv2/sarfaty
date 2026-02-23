'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@nexus/ui';
import type { Committee, CommitteeMember, Meeting, ActionItem } from '@nexus/types';

const MEETING_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  happening: 'Em curso',
  completed: 'Concluída',
  canceled: 'Cancelada',
};

const ACTION_STATUS_LABELS: Record<string, string> = {
  todo: 'A fazer',
  in_progress: 'Em andamento',
  blocked: 'Bloqueado',
  done: 'Concluído',
};

const MEMBER_ROLE_LABELS: Record<string, string> = {
  president: 'Presidente',
  secretary: 'Secretário',
  member: 'Membro',
};

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

function resolveActionBadgeVariant(status: string): BadgeVariant {
  if (status === 'done') return 'outline';
  if (status === 'blocked') return 'destructive';
  return 'secondary';
}

function CreateMeetingDialog({
  committeeId,
  open,
  onClose,
  onCreated,
}: {
  committeeId: string;
  open: boolean;
  onClose: () => void;
  onCreated: (meeting: Meeting) => void;
}) {
  const [form, setForm] = useState({ title: '', description: '', scheduledAt: '', locationOrLink: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.scheduledAt) {
      toast.error('Título e data são obrigatórios');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<Meeting>(
        `/governance/committees/${committeeId}/meetings`,
        {
          title: form.title,
          description: form.description || undefined,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          locationOrLink: form.locationOrLink || undefined,
        },
      );
      onCreated(res.data);
      toast.success('Reunião criada');
      onClose();
    } catch {
      toast.error('Erro ao criar reunião');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Reunião</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Data e horário *</Label>
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Local / Link</Label>
            <Input
              value={form.locationOrLink}
              onChange={(e) => setForm((f) => ({ ...f, locationOrLink: e.target.value }))}
              placeholder="Sala de reuniões / link do Meet..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar Reunião'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InviteMemberDialog({
  committeeId,
  open,
  onClose,
  onInvited,
}: {
  committeeId: string;
  open: boolean;
  onClose: () => void;
  onInvited: (member: CommitteeMember) => void;
}) {
  const [profileId, setProfileId] = useState('');
  const [role, setRole] = useState('member');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!profileId.trim()) {
      toast.error('ID do perfil é obrigatório');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<CommitteeMember>(
        `/governance/committees/${committeeId}/members`,
        { profileId, role },
      );
      onInvited(res.data);
      toast.success('Membro convidado');
      onClose();
    } catch {
      toast.error('Erro ao convidar membro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Convidar Membro</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>ID do Perfil *</Label>
            <Input value={profileId} onChange={(e) => setProfileId(e.target.value)} placeholder="UUID do usuário" />
          </div>
          <div className="space-y-1.5">
            <Label>Papel</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="president">Presidente</SelectItem>
                <SelectItem value="secretary">Secretário</SelectItem>
                <SelectItem value="member">Membro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Convidando...' : 'Convidar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CommitteeDetail({ id }: { id: string }) {
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [committeeRes, membersRes, meetingsRes, actionsRes] = await Promise.all([
        api.get<Committee>(`/governance/committees/${id}`),
        api.get<CommitteeMember[]>(`/governance/committees/${id}/members`),
        api.get<Meeting[]>(`/governance/committees/${id}/meetings`, { pageSize: 20 }),
        api.get<ActionItem[]>(`/governance/actions`, { committeeId: id, pageSize: 20 }),
      ]);
      setCommittee(committeeRes.data);
      setMembers(membersRes.data ?? []);
      setMeetings(meetingsRes.data ?? []);
      setActions(actionsRes.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!committee) {
    return <p className="text-muted-foreground">Comitê não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{committee.name}</h1>
            <Badge variant={committee.status === 'active' ? 'default' : 'secondary'}>
              {committee.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          {committee.description && (
            <p className="text-muted-foreground mt-1">{committee.description}</p>
          )}
        </div>
        <Link href="/governance/committees">
          <Button variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>

      <Tabs defaultValue="meetings">
        <TabsList>
          <TabsTrigger value="meetings">Reuniões ({meetings.length})</TabsTrigger>
          <TabsTrigger value="actions">Ações ({actions.length})</TabsTrigger>
          <TabsTrigger value="members">Membros ({members.length})</TabsTrigger>
          {committee.regulation && <TabsTrigger value="regulation">Regulamento</TabsTrigger>}
        </TabsList>

        <TabsContent value="meetings" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateMeetingOpen(true)}>Nova Reunião</Button>
          </div>
          {meetings.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                Nenhuma reunião agendada.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <Link key={meeting.id} href={`/governance/committees/${id}/meetings/${meeting.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.scheduledAt).toLocaleString('pt-BR')}
                        </p>
                        {meeting.locationOrLink && (
                          <p className="text-xs text-muted-foreground">{meeting.locationOrLink}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {MEETING_STATUS_LABELS[meeting.status] ?? meeting.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Link href={`/governance/committees/${id}/actions/new`}>
              <Button>Nova Ação</Button>
            </Link>
          </div>
          {actions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                Nenhuma ação designada.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {actions.map((action) => (
                <Link key={action.id} href={`/governance/actions/${action.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-3 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{action.title}</p>
                        {action.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Prazo: {new Date(action.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <Badge variant={resolveActionBadgeVariant(action.status)}>
                        {ACTION_STATUS_LABELS[action.status] ?? action.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setInviteMemberOpen(true)}>Convidar Membro</Button>
          </div>
          {members.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                Nenhum membro.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{member.profile?.fullName ?? member.profileId}</p>
                      <p className="text-xs text-muted-foreground">{member.profile?.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {MEMBER_ROLE_LABELS[member.role] ?? 'Membro'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {committee.regulation && (
          <TabsContent value="regulation" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Regulamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{committee.regulation}</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <CreateMeetingDialog
        committeeId={id}
        open={createMeetingOpen}
        onClose={() => setCreateMeetingOpen(false)}
        onCreated={(meeting) => setMeetings((prev) => [meeting, ...prev])}
      />
      <InviteMemberDialog
        committeeId={id}
        open={inviteMemberOpen}
        onClose={() => setInviteMemberOpen(false)}
        onInvited={(member) => setMembers((prev) => [...prev, member])}
      />
    </div>
  );
}
