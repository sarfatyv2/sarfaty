'use client';

import { useState, useRef } from 'react';
import { Button, Input, Label, Card, CardContent, Textarea } from '@nexus/ui';
import { Plus, Loader2, Video, Pencil, Trash2, Check, X, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Material {
  name: string;
  storagePath: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  durationSeconds: number;
  sortOrder: number;
  materials: Material[] | null;
  quiz: unknown;
}

interface LessonEditorProps {
  courseId: string;
  moduleId: string;
  lessons: Lesson[];
  onLessonsChange: (lessons: Lesson[]) => void;
}

export function LessonEditor({
  courseId,
  moduleId,
  lessons,
  onLessonsChange,
}: LessonEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<{ lessonId: string; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetLessonRef = useRef<string | null>(null);

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    youtubeVideoId: '',
    durationSeconds: '',
  });
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    youtubeVideoId: '',
    durationSeconds: '',
  });

  const handleAddLesson = async () => {
    if (!newLesson.title.trim() || !newLesson.youtubeVideoId.trim() || !newLesson.durationSeconds) {
      toast.error('Preencha título, vídeo e duração');
      return;
    }

    setAdding(true);
    try {
      const response = await api.post<Lesson>(
        `/learning/courses/${courseId}/modules/${moduleId}/lessons`,
        {
          title: newLesson.title.trim(),
          description: newLesson.description.trim() || undefined,
          moduleId,
          youtubeVideoId: newLesson.youtubeVideoId.trim(),
          durationSeconds: Number(newLesson.durationSeconds),
          sortOrder: lessons.length,
        },
      );

      onLessonsChange([...lessons, response.data]);
      setNewLesson({ title: '', description: '', youtubeVideoId: '', durationSeconds: '' });
      setShowForm(false);
      toast.success('Aula adicionada');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar aula';
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setEditData({
      title: lesson.title,
      description: lesson.description ?? '',
      youtubeVideoId: lesson.youtubeVideoId,
      durationSeconds: lesson.durationSeconds.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (lesson: Lesson) => {
    if (!editData.title.trim() || !editData.youtubeVideoId.trim() || !editData.durationSeconds) {
      toast.error('Preencha título, vídeo e duração');
      return;
    }

    setSavingEdit(true);
    try {
      const response = await api.patch<Lesson>(
        `/learning/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`,
        {
          title: editData.title.trim(),
          description: editData.description.trim() || undefined,
          youtubeVideoId: editData.youtubeVideoId.trim(),
          durationSeconds: Number(editData.durationSeconds),
        },
      );

      onLessonsChange(
        lessons.map((l) => (l.id === lesson.id ? { ...l, ...response.data } : l)),
      );
      setEditingId(null);
      toast.success('Aula atualizada');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar';
      toast.error(message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    setDeletingId(lessonId);
    try {
      await api.delete(`/learning/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
      onLessonsChange(lessons.filter((l) => l.id !== lessonId));
      toast.success('Aula removida');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const triggerUpload = (lessonId: string) => {
    uploadTargetLessonRef.current = lessonId;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const lessonId = uploadTargetLessonRef.current;
    if (!file || !lessonId) return;

    // Reset input so same file can be re-selected
    e.target.value = '';

    setUploadingLessonId(lessonId);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.postFormData<Lesson>(
        `/learning/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/materials`,
        formData,
      );

      onLessonsChange(
        lessons.map((l) => (l.id === lessonId ? { ...l, materials: response.data?.materials ?? l.materials } : l)),
      );
      toast.success(`"${file.name}" anexado`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar arquivo';
      toast.error(message);
    } finally {
      setUploadingLessonId(null);
      uploadTargetLessonRef.current = null;
    }
  };

  const handleDeleteMaterial = async (lessonId: string, materialIndex: number) => {
    setDeletingMaterial({ lessonId, index: materialIndex });
    try {
      const response = await api.delete<Lesson>(
        `/learning/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/materials/${materialIndex}`,
      );

      onLessonsChange(
        lessons.map((l) => (l.id === lessonId ? { ...l, materials: response.data?.materials ?? null } : l)),
      );
      toast.success('Material removido');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover material';
      toast.error(message);
    } finally {
      setDeletingMaterial(null);
    }
  };

  const formatDuration = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getMaterialIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText size={12} className="text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) return <ImageIcon size={12} className="text-blue-500" />;
    return <FileText size={12} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-2 pl-6 border-l-2 border-muted">
      {/* Hidden file input for material upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={handleFileSelected}
        className="hidden"
      />

      {lessons.map((lesson) => {
        const isEditing = editingId === lesson.id;
        const isDeleting = deletingId === lesson.id;
        const isUploading = uploadingLessonId === lesson.id;
        const materials = lesson.materials ?? [];

        if (isEditing) {
          return (
            <Card key={lesson.id} className="border-primary/50">
              <CardContent className="p-3 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Título</Label>
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição</Label>
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o conteúdo da aula..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">YouTube Video ID</Label>
                    <Input
                      value={editData.youtubeVideoId}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, youtubeVideoId: e.target.value }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Duração (segundos)</Label>
                    <Input
                      value={editData.durationSeconds}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, durationSeconds: e.target.value }))
                      }
                      type="number"
                      min={1}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Materials section in edit mode */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Materiais anexados</Label>
                  {materials.length > 0 && (
                    <div className="space-y-1">
                      {materials.map((mat, idx) => (
                        <div key={mat.storagePath} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/50">
                          {getMaterialIcon(mat.name)}
                          <span className="flex-1 truncate">{mat.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteMaterial(lesson.id, idx)}
                            disabled={deletingMaterial?.lessonId === lesson.id && deletingMaterial?.index === idx}
                          >
                            {deletingMaterial?.lessonId === lesson.id && deletingMaterial?.index === idx ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Trash2 size={10} />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => triggerUpload(lesson.id)}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    Enviar PDF ou Imagem
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSaveEdit(lesson)}
                    disabled={savingEdit}
                    size="sm"
                  >
                    {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Salvar
                  </Button>
                  <Button onClick={cancelEdit} variant="ghost" size="sm">
                    <X size={14} />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }

        return (
          <div key={lesson.id} className="space-y-1">
            <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 group">
              <Video size={14} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm truncate block">{lesson.title}</span>
                {lesson.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">{lesson.description}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {materials.length > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText size={11} />
                    {materials.length}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDuration(lesson.durationSeconds)}
                </span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="Enviar material"
                    onClick={() => triggerUpload(lesson.id)}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => startEdit(lesson)}
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(lesson.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {showForm ? (
        <Card className="border-dashed">
          <CardContent className="p-3 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Título da Aula</Label>
              <Input
                value={newLesson.title}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Introdução ao produto"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição (opcional)</Label>
              <Textarea
                value={newLesson.description}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o conteúdo da aula..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">YouTube Video ID</Label>
                <Input
                  value={newLesson.youtubeVideoId}
                  onChange={(e) =>
                    setNewLesson((prev) => ({ ...prev, youtubeVideoId: e.target.value }))
                  }
                  placeholder="Ex: dQw4w9WgXcQ"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duração (segundos)</Label>
                <Input
                  value={newLesson.durationSeconds}
                  onChange={(e) =>
                    setNewLesson((prev) => ({ ...prev, durationSeconds: e.target.value }))
                  }
                  placeholder="Ex: 600"
                  type="number"
                  min={1}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Materiais (PDF, imagens) podem ser anexados após criar a aula.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleAddLesson} disabled={adding} size="sm">
                {adding && <Loader2 size={14} className="animate-spin" />}
                Adicionar
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="ghost"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          <Plus size={14} />
          Adicionar Aula
        </Button>
      )}
    </div>
  );
}
