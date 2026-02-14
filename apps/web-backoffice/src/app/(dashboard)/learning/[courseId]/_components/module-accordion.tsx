'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { LessonItem } from './lesson-item';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  durationSeconds: number;
  sortOrder: number;
  hasQuiz: boolean;
}

interface Module {
  id: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface ModuleAccordionProps {
  modules: Module[];
  courseId: string;
  enrollmentId?: string;
  completedLessonIds?: string[];
}

export function ModuleAccordion({
  modules,
  courseId,
  enrollmentId,
  completedLessonIds = [],
}: ModuleAccordionProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.length > 0 ? [modules[0]!.id] : []),
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {modules.map((mod, index) => {
        const isExpanded = expandedModules.has(mod.id);
        const completedCount = mod.lessons.filter((l) =>
          completedLessonIds.includes(l.id),
        ).length;
        const totalLessons = mod.lessons.length;

        return (
          <div key={mod.id} className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleModule(mod.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={18} className="text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  Módulo {index + 1}: {mod.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completedCount}/{totalLessons} aulas concluídas
                </p>
              </div>
              <div className="shrink-0 w-16">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: totalLessons > 0 ? `${(completedCount / totalLessons) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>
            </button>
            {isExpanded && (
              <div className="border-t">
                {mod.lessons.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    courseId={courseId}
                    enrollmentId={enrollmentId}
                    isCompleted={completedLessonIds.includes(lesson.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
