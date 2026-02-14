-- Learning Module Tables

CREATE TABLE IF NOT EXISTS "learning_courses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "thumbnail_url" text,
  "category" text NOT NULL,
  "target_roles" text[] NOT NULL,
  "is_mandatory" boolean DEFAULT false,
  "deadline_days" integer,
  "status" text NOT NULL DEFAULT 'draft',
  "total_duration_seconds" integer DEFAULT 0,
  "created_by" uuid NOT NULL REFERENCES "profiles"("id"),
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_learning_courses_status" ON "learning_courses" ("status");
CREATE INDEX IF NOT EXISTS "idx_learning_courses_category" ON "learning_courses" ("category");
CREATE INDEX IF NOT EXISTS "idx_learning_courses_created" ON "learning_courses" ("created_at");

CREATE TABLE IF NOT EXISTS "learning_modules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "course_id" uuid NOT NULL REFERENCES "learning_courses"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_learning_modules_course" ON "learning_modules" ("course_id");

CREATE TABLE IF NOT EXISTS "learning_lessons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "module_id" uuid NOT NULL REFERENCES "learning_modules"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "youtube_video_id" text NOT NULL,
  "duration_seconds" integer NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "materials" jsonb,
  "quiz" jsonb,
  "min_quiz_score" integer DEFAULT 70,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_learning_lessons_module" ON "learning_lessons" ("module_id");

CREATE TABLE IF NOT EXISTS "learning_enrollments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "course_id" uuid NOT NULL REFERENCES "learning_courses"("id"),
  "collaborator_id" uuid NOT NULL REFERENCES "collaborators"("id"),
  "status" text NOT NULL DEFAULT 'enrolled',
  "progress_pct" integer NOT NULL DEFAULT 0,
  "enrolled_at" timestamp with time zone DEFAULT now(),
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "deadline_at" timestamp with time zone,
  "certificate_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "uq_learning_enrollment" UNIQUE ("course_id", "collaborator_id")
);

CREATE INDEX IF NOT EXISTS "idx_learning_enrollments_course" ON "learning_enrollments" ("course_id");
CREATE INDEX IF NOT EXISTS "idx_learning_enrollments_collaborator" ON "learning_enrollments" ("collaborator_id");
CREATE INDEX IF NOT EXISTS "idx_learning_enrollments_status" ON "learning_enrollments" ("status");

CREATE TABLE IF NOT EXISTS "learning_lesson_completions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "enrollment_id" uuid NOT NULL REFERENCES "learning_enrollments"("id") ON DELETE CASCADE,
  "lesson_id" uuid NOT NULL REFERENCES "learning_lessons"("id"),
  "watched_pct" integer NOT NULL DEFAULT 0,
  "quiz_score" integer,
  "quiz_passed" boolean,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "uq_lesson_completion" UNIQUE ("enrollment_id", "lesson_id")
);

CREATE INDEX IF NOT EXISTS "idx_lesson_completions_enrollment" ON "learning_lesson_completions" ("enrollment_id");
CREATE INDEX IF NOT EXISTS "idx_lesson_completions_lesson" ON "learning_lesson_completions" ("lesson_id");
