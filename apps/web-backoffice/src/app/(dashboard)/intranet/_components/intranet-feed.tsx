'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
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
  Skeleton,
  Textarea,
} from '@nexus/ui';
import type { Announcement } from '@nexus/types';

const INTRANET_SKELETONS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6'];

function renderAnnouncementsGrid({
  loading,
  announcements,
  onCreateClick,
}: {
  loading: boolean;
  announcements: Announcement[];
  onCreateClick: () => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTRANET_SKELETONS.map((k) => (
          <Skeleton key={k} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }
  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">Nenhum comunicado publicado.</p>
          <Button className="mt-4" onClick={onCreateClick}>
            Criar primeiro comunicado
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card className="overflow-hidden">
      {announcement.coverImageUrl && (
        <div className="h-40 overflow-hidden bg-muted">
          <img
            src={announcement.coverImageUrl}
            alt={announcement.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg leading-snug">{announcement.title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {announcement.publishedAt
            ? new Date(announcement.publishedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : 'Não publicado'}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
          {announcement.content}
        </p>
      </CardContent>
    </Card>
  );
}

function CreateAnnouncementDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (announcement: Announcement) => void;
}) {
  const [form, setForm] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<Announcement>('/intranet/announcements', {
        title: form.title,
        content: form.content,
        targetRoles: [],
        status: 'published',
      });
      onCreated(res.data);
      toast.success('Comunicado publicado');
      onClose();
    } catch {
      toast.error('Erro ao publicar comunicado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Comunicado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Aviso Importante"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Conteúdo *</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Digite o conteúdo do comunicado..."
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Publicando...' : 'Publicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function IntranetFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Announcement[]>('/intranet/announcements', {
        status: 'published',
        pageSize: 20,
      });
      setAnnouncements(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {announcements.length} comunicado{announcements.length === 1 ? '' : 's'} publicado{announcements.length === 1 ? '' : 's'}
        </p>
        <div className="flex gap-2">
          <Link href="/intranet/admin">
            <Button variant="outline" size="sm">Gerenciar</Button>
          </Link>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Novo Comunicado
          </Button>
        </div>
      </div>

      {renderAnnouncementsGrid({
        loading,
        announcements,
        onCreateClick: () => setCreateOpen(true),
      })}

      <CreateAnnouncementDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(announcement) => setAnnouncements((prev) => [announcement, ...prev])}
      />
    </div>
  );
}
