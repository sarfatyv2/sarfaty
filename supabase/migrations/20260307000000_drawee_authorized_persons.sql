-- drawee_authorized_persons: sócios e administradores do sacado (PJ)
CREATE TABLE IF NOT EXISTS drawee_authorized_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  authorization_type TEXT,
  full_name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  email TEXT,
  source TEXT,
  source_queried_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drawee_auth_persons_drawee ON drawee_authorized_persons (drawee_id);
CREATE INDEX IF NOT EXISTS idx_drawee_auth_persons_active ON drawee_authorized_persons (is_active);
CREATE INDEX IF NOT EXISTS idx_drawee_auth_persons_cpf ON drawee_authorized_persons (cpf);
CREATE INDEX IF NOT EXISTS idx_drawee_auth_persons_source ON drawee_authorized_persons (drawee_id, source);

COMMENT ON TABLE drawee_authorized_persons IS 'Sócios e administradores do sacado, enriquecidos por Serasa (QSA) ou cadastrados manualmente';
