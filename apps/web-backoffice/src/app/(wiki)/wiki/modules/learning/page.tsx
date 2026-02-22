'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { BookOpen } from 'lucide-react';

export default function LearningModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={BookOpen}
        name="Módulo de Aprendizagem"
        domain="Módulo"
        description="Plataforma de ensino corporativo com cursos estruturados em módulos e lições (vídeos YouTube). Rastreamento de progresso, quizzes, auto-enroll para cursos obrigatórios e gestão de certificados."
        color="purple"
        gradient="bg-gradient-to-br from-[hsl(270,50%,18%)] to-[hsl(270,40%,26%)]"
        roles={['employee', 'people_manager', 'hr', 'hr_admin', 'admin']}
        flowSteps={[
          { label: 'Criação', desc: 'Admin ou HR cria curso com categoria, carga horária e módulos. Status inicial: draft.' },
          { label: 'Publicação', desc: 'Curso publicado e disponível para inscrição. Cursos obrigatórios geram auto-enroll.' },
          { label: 'Inscrição', desc: 'Colaborador se inscreve ou é inscrito automaticamente (mandatory courses).' },
          { label: 'Progresso', desc: 'Colaborador assiste lições. Cada lição assistida registra completion. Quiz validado.' },
          { label: 'Conclusão', desc: '100% das lições completadas = enrollment status muda para completed. Certificado disponível.' },
        ]}
        features={[
          'Cursos organizados em módulos e lições',
          'Lições com vídeo YouTube embedded e duração',
          'Quizzes por lição para validar aprendizado',
          'Auto-enrollment para cursos marcados como obrigatórios',
          'Rastreamento granular de progresso por lição',
          'Status de enrollment: enrolled → in_progress → completed → expired',
          'Categorias: compliance, sales, credit, operations, leadership',
          'Relatórios de progresso por equipe e curso para gestores',
          'Notificações automáticas de prazo de cursos',
          'Exportação de lista de concluintes',
        ]}
        tables={[
          { name: 'learning_courses', description: 'Cursos disponíveis na plataforma.', keyColumns: ['id', 'title', 'category', 'status', 'mandatory', 'duration_hours'] },
          { name: 'learning_modules', description: 'Módulos dentro de cada curso (ordenados).', keyColumns: ['id', 'course_id', 'title', 'order'] },
          { name: 'learning_lessons', description: 'Lições com vídeo YouTube e quiz opcional.', keyColumns: ['id', 'module_id', 'title', 'youtube_url', 'duration_min', 'has_quiz'] },
          { name: 'learning_enrollments', description: 'Inscrições de colaboradores em cursos.', keyColumns: ['id', 'course_id', 'collaborator_id', 'status', 'enrolled_at', 'completed_at'] },
          { name: 'learning_lesson_completions', description: 'Registro de lições assistidas por colaborador.', keyColumns: ['enrollment_id', 'lesson_id', 'completed_at', 'quiz_score'] },
        ]}
      />
    </PageWrapper>
  );
}
