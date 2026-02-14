'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Skeleton } from '@nexus/ui';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import type { QuizQuestion, LessonMaterial } from '@nexus/types';
import { YouTubePlayer } from './_components/youtube-player';
import { QuizForm } from './_components/quiz-form';
import { LessonMaterials } from './_components/lesson-materials';

interface CourseDetail {
  id: string;
  title: string;
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      description: string | null;
      youtubeVideoId: string;
      durationSeconds: number;
      hasQuiz: boolean;
    }[];
  }[];
}

interface LessonData {
  title: string;
  description: string | null;
  youtubeVideoId: string;
  durationSeconds: number;
  materials: LessonMaterial[];
  quiz: QuizQuestion[] | null;
  minQuizScore: number;
  moduleName: string;
}

export default function LessonPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('enrollmentId') ?? undefined;
  const courseId = params.courseId;
  const lessonId = params.lessonId;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get<CourseDetail>(`/learning/courses/${courseId}`);
        const course = response.data;
        setCourseTitle(course.title);

        // Find the lesson in modules
        for (const mod of course.modules) {
          const foundLesson = mod.lessons.find((l) => l.id === lessonId);
          if (foundLesson) {
            setLesson({
              title: foundLesson.title,
              description: foundLesson.description,
              youtubeVideoId: foundLesson.youtubeVideoId,
              durationSeconds: foundLesson.durationSeconds,
              materials: [],
              quiz: null,
              minQuizScore: 70,
              moduleName: mod.title,
            });
            break;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar aula';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [courseId, lessonId]);

  const handleQuizComplete = useCallback(() => {
    // Could refresh progress or redirect
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="space-y-6">
        <Link
          href={`/learning/${courseId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao curso
        </Link>
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Erro ao carregar aula.</p>
          {error && <p className="mt-1 text-xs opacity-90">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/learning/${courseId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          {courseTitle}
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          {/* YouTube Player */}
          <YouTubePlayer
            videoId={lesson.youtubeVideoId}
            enrollmentId={enrollmentId}
            lessonId={lessonId}
          />

          {/* Lesson Info */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {lesson.moduleName}
            </p>
            <h1 className="text-xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-muted-foreground mt-2">{lesson.description}</p>
            )}
          </div>

          {/* Quiz */}
          {lesson.quiz && lesson.quiz.length > 0 && enrollmentId && (
            <QuizForm
              questions={lesson.quiz}
              enrollmentId={enrollmentId}
              lessonId={lessonId}
              minScore={lesson.minQuizScore}
              onComplete={handleQuizComplete}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {lesson.materials.length > 0 && (
            <LessonMaterials materials={lesson.materials} />
          )}
        </div>
      </div>
    </div>
  );
}
