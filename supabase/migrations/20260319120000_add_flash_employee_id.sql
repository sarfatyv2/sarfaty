-- Flash (benefícios) — ID do colaborador na API Flash
ALTER TABLE public.collaborators
  ADD COLUMN IF NOT EXISTS flash_employee_id text;

CREATE UNIQUE INDEX IF NOT EXISTS collaborators_flash_employee_id_key
  ON public.collaborators (flash_employee_id)
  WHERE flash_employee_id IS NOT NULL;
