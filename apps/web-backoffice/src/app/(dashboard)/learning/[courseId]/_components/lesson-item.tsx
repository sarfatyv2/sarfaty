'use client';

import Link from 'next/link';
import { PlayCircle, CheckCircle2, HelpCircle, Clock } from 'lucide-react';

interface LessonItemProps {
  lesson: {
    id: string;
    title: string;
    durationSeconds: number;
    hasQuiz: boolean;
  };
  courseId: string;
  enrollmentId?: string;
  isCompleted: boolean;
}

function formatLessonDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function LessonItem({ lesson, courseId, enrollmentId, isCompleted }: LessonItemProps) {
  const href = enrollmentId
    ? `/learning/${courseId}/${lesson.id}?enrollmentId=${enrollmentId}`
    : `/learning/${courseId}/${lesson.id}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b last:border-b-0"
    >
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 size={18} className="text-primary" />
        ) : (
          <PlayCircle size={18} className="text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{lesson.title}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
        {lesson.hasQuiz && (
          <span className="flex items-center gap-1">
            <HelpCircle size={12} />
            Quiz
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatLessonDuration(lesson.durationSeconds)}
        </span>
      </div>
    </Link>
  );
}
