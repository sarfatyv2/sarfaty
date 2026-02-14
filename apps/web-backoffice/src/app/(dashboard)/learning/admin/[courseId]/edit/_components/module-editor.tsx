'use client';

import { useState } from 'react';
import { Button, Input, Card, CardContent } from '@nexus/ui';
import { Plus, Loader2, GripVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { LessonEditor } from './lesson-editor';

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

interface Module {
  id: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface ModuleEditorProps {
  courseId: string;
  modules: Module[];
  onModulesChange: (modules: Module[]) => void;
}

export function ModuleEditor({ courseId, modules, onModulesChange }: ModuleEditorProps) {
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;

    setAddingModule(true);
    try {
      const response = await api.post<Module>(`/learning/courses/${courseId}/modules`, {
        title: newModuleTitle.trim(),
        courseId,
        sortOrder: modules.length,
      });

      onModulesChange([...modules, { ...response.data, lessons: [] }]);
      setNewModuleTitle('');
      toast.success('Módulo adicionado');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar módulo';
      toast.error(message);
    } finally {
      setAddingModule(false);
    }
  };

  const startEditModule = (mod: Module) => {
    setEditingModuleId(mod.id);
    setEditModuleTitle(mod.title);
  };

  const handleSaveModuleEdit = async (moduleId: string) => {
    if (!editModuleTitle.trim()) return;

    setSavingEdit(true);
    try {
      await api.patch(`/learning/courses/${courseId}/modules/${moduleId}`, {
        title: editModuleTitle.trim(),
      });

      onModulesChange(
        modules.map((m) => (m.id === moduleId ? { ...m, title: editModuleTitle.trim() } : m)),
      );
      setEditingModuleId(null);
      toast.success('Módulo atualizado');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar';
      toast.error(message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    setDeletingId(moduleId);
    try {
      await api.delete(`/learning/courses/${courseId}/modules/${moduleId}`);
      onModulesChange(modules.filter((m) => m.id !== moduleId));
      toast.success('Módulo removido');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLessonsChange = (moduleId: string, lessons: Lesson[]) => {
    onModulesChange(
      modules.map((m) => (m.id === moduleId ? { ...m, lessons } : m)),
    );
  };

  return (
    <div className="space-y-4">
      {modules.map((mod, index) => (
        <Card key={mod.id}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3 group">
              <GripVertical size={16} className="text-muted-foreground" />
              {editingModuleId === mod.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editModuleTitle}
                    onChange={(e) => setEditModuleTitle(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveModuleEdit(mod.id)}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleSaveModuleEdit(mod.id)}
                    disabled={savingEdit}
                  >
                    {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setEditingModuleId(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-sm flex-1">
                    Módulo {index + 1}: {mod.title}
                  </h3>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEditModule(mod)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteModule(mod.id)}
                      disabled={deletingId === mod.id}
                    >
                      {deletingId === mod.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <LessonEditor
              courseId={courseId}
              moduleId={mod.id}
              lessons={mod.lessons}
              onLessonsChange={(lessons) => handleLessonsChange(mod.id, lessons)}
            />
          </CardContent>
        </Card>
      ))}

      {/* Add module */}
      <div className="flex gap-2">
        <Input
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="Nome do novo módulo..."
          onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
        />
        <Button
          onClick={handleAddModule}
          disabled={addingModule || !newModuleTitle.trim()}
          variant="outline"
        >
          {addingModule ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Módulo
        </Button>
      </div>
    </div>
  );
}
