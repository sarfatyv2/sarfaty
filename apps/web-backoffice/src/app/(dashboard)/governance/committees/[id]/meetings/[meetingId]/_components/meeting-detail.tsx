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
  RichTextEditor,
  Separator,
  Skeleton,
} from '@nexus/ui';
import type { Meeting, MeetingMinute } from '@nexus/types';

const MEETING_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  happening: 'Em curso',
  completed: 'Concluída',
  canceled: 'Cancelada',
};

export function MeetingDetail({
  committeeId,
  meetingId,
}: {
  committeeId: string;
  meetingId: string;
}) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [minute, setMinute] = useState<MeetingMinute | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editorContent, setEditorContent] = useState<unknown>(null);
  const [isDirty, setIsDirty] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [meetingRes, minuteRes] = await Promise.all([
        api.get<Meeting>(`/governance/committees/${committeeId}/meetings/${meetingId}`),
        api.get<MeetingMinute | null>(`/governance/committees/${committeeId}/meetings/${meetingId}/minute`),
      ]);
      setMeeting(meetingRes.data);
      setMinute(minuteRes.data);
      if (minuteRes.data?.content) {
        setEditorContent(minuteRes.data.content);
      }
    } finally {
      setLoading(false);
    }
  }, [committeeId, meetingId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post<MeetingMinute>(
        `/governance/committees/${committeeId}/meetings/${meetingId}/minute`,
        { content: editorContent },
      );
      setMinute(res.data);
      setIsDirty(false);
      toast.success('Ata salva com sucesso');
    } catch {
      toast.error('Erro ao salvar ata');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await api.post<MeetingMinute>(
        `/governance/committees/${committeeId}/meetings/${meetingId}/minute/publish`,
      );
      setMinute(res.data);
      toast.success('Ata publicada com sucesso');
    } catch {
      toast.error('Erro ao publicar ata');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!meeting) {
    return <p className="text-muted-foreground">Reunião não encontrada.</p>;
  }

  const isMinutePublished = minute?.status === 'published';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <Badge variant="outline">{MEETING_STATUS_LABELS[meeting.status] ?? meeting.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {new Date(meeting.scheduledAt).toLocaleString('pt-BR')}
            {meeting.locationOrLink && <span className="ml-2">· {meeting.locationOrLink}</span>}
          </p>
        </div>
        <Link href={`/governance/committees/${committeeId}`}>
          <Button variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Ata da Reunião</h2>
            {minute && (
              <p className="text-xs text-muted-foreground">
                {isMinutePublished
                  ? `Publicada em ${new Date(minute.publishedAt ?? '').toLocaleDateString('pt-BR')}`
                  : 'Rascunho'}
              </p>
            )}
          </div>
          {!isMinutePublished && (
            <div className="flex items-center gap-2">
              {isDirty && (
                <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar rascunho'}
                </Button>
              )}
              {minute && (
                <Button size="sm" onClick={handlePublish} disabled={publishing}>
                  {publishing ? 'Publicando...' : 'Publicar Ata'}
                </Button>
              )}
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <RichTextEditor
              value={editorContent}
              onChange={(content) => {
                setEditorContent(content);
                setIsDirty(true);
              }}
              placeholder="Registre aqui as deliberações, decisões e encaminhamentos da reunião..."
              minHeight="400px"
              readOnly={isMinutePublished}
              toolbar={!isMinutePublished}
            />
          </CardContent>
        </Card>

        {!minute && !isMinutePublished && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Criando ata...' : 'Criar Ata'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
