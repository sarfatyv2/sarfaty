'use client';

import Link from 'next/link';
import { Card, CardContent, Badge } from '@nexus/ui';
import { Clock, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import {
  getCourseCategoryLabel,
  getCourseStatusColor,
  getCourseStatusLabel,
  getEnrollmentStatusLabel,
  getEnrollmentStatusColor,
  formatDuration,
} from '@nexus/utils';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    category: string;
    status: string;
    totalDurationSeconds: number;
    isMandatory: boolean;
    targetRoles: string[];
  };
  enrollmentProgress?: number | null;
  enrollmentStatus?: string | null;
  href?: string;
}

export function CourseCard({ course, enrollmentProgress, enrollmentStatus, href }: CourseCardProps) {
  const linkHref = href ?? `/learning/${course.id}`;
  const isCompleted = enrollmentStatus === 'completed';

  return (
    <Link href={linkHref}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="aspect-video bg-muted relative">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <BookOpen size={48} className="text-primary/30" />
            </div>
          )}
          {course.isMandatory && (
            <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
              Obrigatorio
            </Badge>
          )}
          {isCompleted && (
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
                <CheckCircle2 size={10} className="mr-1" />
                Concluido
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="outline" className="text-xs shrink-0">
              {getCourseCategoryLabel(course.category)}
            </Badge>
            {enrollmentStatus && !isCompleted && (
              <Badge variant={getEnrollmentStatusColor(enrollmentStatus)} className="text-xs">
                {getEnrollmentStatusLabel(enrollmentStatus)}
              </Badge>
            )}
            {!enrollmentStatus && course.status !== 'published' && (
              <Badge variant={getCourseStatusColor(course.status)} className="text-xs">
                {getCourseStatusLabel(course.status)}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{course.title}</h3>
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDuration(course.totalDurationSeconds)}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {course.targetRoles.length} perfis
            </span>
          </div>
          {enrollmentProgress !== null && enrollmentProgress !== undefined && !isCompleted && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{enrollmentProgress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${enrollmentProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
