# Implementação do Módulo Learning (LMS) — Treinamentos Corporativos

**Versão:** 1.0  
**Data:** 14 de Fevereiro de 2026  
**Status:** Implementado  

---

## 1. Visão Geral

Sistema de gestão de aprendizagem (LMS) integrado à plataforma Sarfaty. Permite criar cursos com vídeos do YouTube, organizar conteúdo em módulos e aulas, aplicar quizzes, anexar materiais (PDF/imagem), matricular colaboradores e acompanhar o progresso de cada um.

**Princípios:**
- Vídeos hospedados no YouTube (unlisted) — custo zero de hospedagem
- Cursos direcionados por role (targetRoles) — cada perfil vê apenas cursos relevantes
- Progresso automático — assistir 90%+ do vídeo conclui a aula; quiz com nota mínima quando aplicável
- Curso 100% concluído = enrollment completado automaticamente

---

## 2. Arquitetura

### 2.1 Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS + Fastify + Drizzle ORM |
| Frontend | Next.js 15 (App Router) + Tailwind + shadcn/ui |
| Banco | Supabase PostgreSQL (5 tabelas) |
| Storage | Supabase Storage (bucket `learning-materials`) |
| Tipos compartilhados | `@nexus/types`, `@nexus/validators`, `@nexus/utils` |

### 2.2 Padrão DDD-light

```
Controller → UseCase → Domain Entity → Repository (interface)
                                            ↓
                                   Drizzle Repository (infra)
```

### 2.3 Estrutura de Diretórios

**Backend:** `apps/api/src/modules/learning/`

```
learning/
├── controllers/
│   ├── courses.controller.ts      # CRUD cursos, módulos, aulas, materiais
│   ├── enrollments.controller.ts  # Matrículas, my-enrollment, admin progress
│   └── progress.controller.ts     # Progresso de aulas e quiz
├── use-cases/
│   ├── create-course.use-case.ts
│   ├── update-course.use-case.ts
│   ├── get-course.use-case.ts
│   ├── list-courses.use-case.ts
│   ├── publish-course.use-case.ts
│   ├── enroll-collaborator.use-case.ts
│   ├── auto-enroll-mandatory.use-case.ts
│   ├── list-my-enrollments.use-case.ts
│   ├── update-lesson-progress.use-case.ts
│   ├── submit-quiz.use-case.ts
│   └── list-admin-progress.use-case.ts
├── domain/
│   ├── course.entity.ts
│   ├── enrollment.entity.ts
│   ├── course.repository.ts       # Interface
│   ├── enrollment.repository.ts   # Interface
│   └── exceptions/
│       ├── course-not-found.exception.ts
│       ├── course-not-published.exception.ts
│       ├── enrollment-not-found.exception.ts
│       ├── already-enrolled.exception.ts
│       └── quiz-failed.exception.ts
├── infra/
│   ├── drizzle-course.repository.ts
│   ├── drizzle-enrollment.repository.ts
│   ├── learning-storage.service.ts  # Upload/delete Supabase Storage
│   └── mappers/
│       ├── course.mapper.ts
│       └── enrollment.mapper.ts
├── dto/
│   ├── create-course.dto.ts
│   ├── update-course.dto.ts
│   ├── list-courses-query.dto.ts
│   ├── create-module.dto.ts
│   ├── create-lesson.dto.ts
│   ├── update-lesson-progress.dto.ts
│   └── submit-quiz.dto.ts
└── learning.module.ts
```

**Frontend:** `apps/web-backoffice/src/app/(dashboard)/learning/`

```
learning/
├── page.tsx                         # "Meus Cursos" + "Catálogo"
├── _components/
│   ├── course-card.tsx              # Card com status e progresso
│   └── course-filters.tsx           # Filtros do catálogo
├── [courseId]/
│   ├── page.tsx                     # Detalhe do curso + botão inscrever
│   ├── _components/
│   │   ├── enroll-button.tsx        # Botão "Inscrever-se"
│   │   ├── module-accordion.tsx     # Accordion de módulos
│   │   └── lesson-item.tsx          # Item de aula com status
│   └── [lessonId]/
│       ├── page.tsx                 # Player + quiz + materiais
│       └── _components/
│           ├── youtube-player.tsx   # Player YouTube com tracking
│           ├── quiz-form.tsx        # Formulário de quiz
│           └── lesson-materials.tsx # Materiais para download
└── admin/
    ├── page.tsx                     # Gestão: abas "Cursos" + "Progresso"
    ├── new/
    │   └── page.tsx                 # Criar novo curso
    └── [courseId]/
        ├── edit/
        │   ├── page.tsx             # Editar curso
        │   └── _components/
        │       ├── module-editor.tsx # CRUD de módulos
        │       └── lesson-editor.tsx # CRUD de aulas + upload materiais
        └── progress/
            ├── page.tsx             # Drill-down progresso por colaborador
            └── _components/
                └── progress-filters.tsx # Filtros status/busca
```

---

## 3. Banco de Dados

### 3.1 Tabelas

| Tabela | Descrição | FK |
|--------|-----------|----|
| `learning_courses` | Cursos com título, categoria, roles alvo, status | `created_by → profiles.id` |
| `learning_modules` | Módulos dentro de um curso, com ordem | `course_id → learning_courses.id` (cascade) |
| `learning_lessons` | Aulas com vídeo YouTube, materiais (JSONB), quiz (JSONB) | `module_id → learning_modules.id` (cascade) |
| `learning_enrollments` | Matrículas de colaboradores em cursos | `course_id`, `collaborator_id` (unique pair) |
| `learning_lesson_completions` | Progresso por aula (watchedPct, quiz score) | `enrollment_id` (cascade), `lesson_id` (unique pair) |

### 3.2 Campos-chave

**learning_courses:**
- `target_roles` — `text[]` — define quais perfis podem ver/acessar o curso
- `status` — `draft` | `published` | `archived`
- `is_mandatory` — cursos obrigatórios podem ter auto-enroll
- `total_duration_seconds` — recalculado ao publicar

**learning_lessons:**
- `youtube_video_id` — ID do vídeo no YouTube (ex: `dQw4w9WgXcQ`)
- `materials` — `jsonb` — array de `{ name, storagePath }` para PDFs/imagens
- `quiz` — `jsonb` — array de `{ id, question, options[], correctOptionId }`
- `min_quiz_score` — nota mínima para aprovação (padrão: 70)

**learning_enrollments:**
- `status` — `enrolled` | `in_progress` | `completed` | `expired`
- `progress_pct` — percentual calculado (aulas concluídas / total)
- `deadline_at` — prazo para conclusão (opcional)

---

## 4. API — Endpoints

### 4.1 Cursos (admin: `hr`, `hr_admin`, `admin`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/learning/courses` | Criar curso (draft) |
| `GET` | `/learning/courses` | Listar cursos (paginado, filtros) |
| `GET` | `/learning/courses/:id` | Detalhe com módulos e aulas |
| `PATCH` | `/learning/courses/:id` | Atualizar curso |
| `POST` | `/learning/courses/:id/publish` | Publicar curso |

### 4.2 Módulos (admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/learning/courses/:courseId/modules` | Criar módulo |
| `GET` | `/learning/courses/:courseId/modules` | Listar módulos |
| `PATCH` | `/learning/courses/:courseId/modules/:moduleId` | Editar módulo |
| `DELETE` | `/learning/courses/:courseId/modules/:moduleId` | Excluir módulo |

### 4.3 Aulas (admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `.../:moduleId/lessons` | Criar aula |
| `PATCH` | `.../:moduleId/lessons/:lessonId` | Editar aula |
| `DELETE` | `.../:moduleId/lessons/:lessonId` | Excluir aula |

### 4.4 Materiais (admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `.../:lessonId/materials` | Upload de PDF/imagem (multipart) |
| `DELETE` | `.../:lessonId/materials/:materialIndex` | Remover material |

### 4.5 Matrículas (todos os roles)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/learning/courses/:courseId/enroll` | Inscrever-se no curso |
| `GET` | `/learning/courses/:courseId/my-enrollment` | Minha matrícula + completedLessonIds |
| `GET` | `/learning/my-enrollments` | Minhas matrículas com dados do curso |

### 4.6 Progresso (todos os roles)

| Método | Rota | Descrição |
|--------|------|-----------|
| `PATCH` | `/learning/enrollments/:enrollmentId/lessons/:lessonId/progress` | Atualizar % assistido |
| `POST` | `/learning/enrollments/:enrollmentId/lessons/:lessonId/quiz` | Submeter quiz |

### 4.7 Admin — Acompanhamento (`hr`, `hr_admin`, `admin`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/learning/admin/progress` | Resumo por curso (inscritos, em andamento, concluídos, média) |
| `GET` | `/learning/admin/progress/:courseId` | Detalhamento por colaborador (nome, dept, progresso, datas) |

---

## 5. Lógica de Negócio

### 5.1 Ciclo de vida do curso

```
draft → published → archived
```

- Curso criado como `draft`
- Publicação via `POST /publish` — recalcula `totalDurationSeconds`, muda status para `published`
- Somente cursos publicados aparecem para colaboradores não-admin

### 5.2 Conclusão de aula

**Aula sem quiz:**
- O `YouTubePlayer` reporta `watchedPct` a cada 10 segundos via `PATCH .../progress`
- Quando `watchedPct >= 90` → aula marcada como concluída (`completedAt = now()`)

**Aula com quiz:**
- Colaborador assiste o vídeo e depois responde o quiz via `POST .../quiz`
- Score calculado: `(acertos / total) * 100`
- Se `score >= minQuizScore` (padrão 70) → aula concluída

### 5.3 Conclusão do curso

- Após cada aula concluída, `progressPct` é recalculado: `(aulas concluídas / total aulas) * 100`
- Quando `progressPct === 100` → enrollment marcado como `status: 'completed'`, `completedAt = now()`

### 5.4 Início automático

- Na primeira interação de progresso, se enrollment está em `enrolled`, muda para `in_progress` com `startedAt = now()`

---

## 6. Permissões (RBAC)

### 6.1 Sidebar

| Role | Itens |
|------|-------|
| Todos os 18 roles | "Meus Cursos" (`/learning`) |
| `admin`, `hr`, `hr_admin` | + "Gestão de Cursos" (`/learning/admin`) |

### 6.2 Ações por role

| Ação | Roles permitidas |
|------|-----------------|
| Criar/editar/publicar cursos | `admin`, `hr`, `hr_admin` |
| Criar/editar/excluir módulos e aulas | `admin`, `hr`, `hr_admin` |
| Upload/delete de materiais | `admin`, `hr`, `hr_admin` |
| Ver painel de progresso admin | `admin`, `hr`, `hr_admin` |
| Inscrever-se em cursos | Todos os 18 roles |
| Ver catálogo e meus cursos | Todos os 18 roles |
| Registrar progresso e quiz | Todos os 18 roles |

### 6.3 Global action

- `manage_courses` — atribuída a `admin`, `hr`, `hr_admin`

---

## 7. Pacotes Compartilhados

### 7.1 `@nexus/types` — `packages/types/src/learning.ts`

| Tipo | Valores |
|------|---------|
| `CourseStatus` | `'draft'` \| `'published'` \| `'archived'` |
| `EnrollmentStatus` | `'enrolled'` \| `'in_progress'` \| `'completed'` \| `'expired'` |
| `CourseCategory` | `'onboarding'` \| `'compliance'` \| `'product'` \| `'process'` \| `'skills'` \| `'leadership'` \| `'other'` |
| `QuizQuestion` | `{ id, question, options: { id, text }[], correctOptionId }` |
| `LessonMaterial` | `{ name, storagePath }` |

### 7.2 `@nexus/validators` — `packages/validators/src/learning.schema.ts`

9 schemas Zod: `createCourseSchema`, `updateCourseSchema`, `createModuleSchema`, `updateModuleSchema`, `createLessonSchema`, `updateLessonSchema`, `listCoursesQuerySchema`, `updateLessonProgressSchema`, `submitQuizSchema`.

### 7.3 `@nexus/utils` — `packages/utils/src/learning-status.ts`

Labels, cores e ícones para status de curso, enrollment e categoria. Funções helpers: `getCourseStatusLabel()`, `getEnrollmentStatusLabel()`, `getCourseCategoryLabel()`, `formatDuration()`.

---

## 8. Storage de Materiais

- **Bucket:** `learning-materials` (Supabase Storage)
- **Path:** `{courseId}/{lessonId}/{timestamp}-{filename}`
- **Tipos aceitos:** PDF, JPEG, PNG, WebP
- **Tamanho máximo:** 25 MB
- **Service:** `LearningStorageService` — upload, delete, signed URL
- **Referência:** materiais ficam no JSONB `materials` da aula como `{ name, storagePath }[]`

---

## 9. Frontend — Fluxos

### 9.1 Fluxo do Colaborador

1. Acessa `/learning` → aba "Meus Cursos" (matrículas) ou "Catálogo" (cursos publicados)
2. Clica em um curso → página de detalhe com módulos e aulas
3. Se não inscrito → botão "Inscrever-se" que chama `POST /enroll`
4. Se inscrito → vê barra de progresso e status; aulas concluídas marcadas com check
5. Clica em aula → player YouTube + quiz (se houver) + materiais para download
6. Progresso salvo automaticamente (watch tracking a cada 10s)
7. Quiz submetido → feedback imediato de aprovação/reprovação

### 9.2 Fluxo do Admin/RH

1. Acessa `/learning/admin` → aba "Cursos" (tabela com CRUD) ou "Progresso" (resumo por curso)
2. Cria curso via `/learning/admin/new` (título, descrição, categoria, roles alvo)
3. Edita curso via `/learning/admin/{id}/edit` — adiciona módulos, aulas (YouTube ID, duração, descrição), materiais
4. Publica o curso → disponível para colaboradores dos roles alvo
5. Acompanha progresso via aba "Progresso" → resumo por curso (inscritos, em andamento, concluídos, % média)
6. Drill-down via "Detalhes" → tabela por colaborador com nome, departamento, status, barra de progresso, datas
