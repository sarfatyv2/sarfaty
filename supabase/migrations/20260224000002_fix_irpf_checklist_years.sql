-- Migration: Fix IRPF checklist years
--
-- Before: cross join used CURRENT_YEAR and CURRENT_YEAR-1
--         (e.g. 2026 and 2025 in February 2026 — IRPF 2026 doesn't exist yet)
-- After:  cross join uses CURRENT_YEAR-1 and CURRENT_YEAR-2
--         (e.g. 2025 and 2024 — the two most recent completed IRPF declarations)

CREATE OR REPLACE FUNCTION get_document_checklist(p_client_id UUID)
RETURNS TABLE (
  document_type       TEXT,
  document_label      TEXT,
  description         TEXT,
  category            TEXT,
  is_required         BOOLEAN,
  guarantee_id        UUID,
  status              TEXT,
  document_id         UUID,
  file_name           TEXT,
  validation_status   TEXT,
  partner_name        TEXT,
  partner_cpf         TEXT,
  reference_year      INTEGER
) AS $$
DECLARE
  v_client clients%ROWTYPE;
BEGIN
  SELECT * INTO v_client FROM clients WHERE id = p_client_id;

  RETURN QUERY
  SELECT * FROM (

  -- ========================================
  -- 1. BASE DOCUMENTS (10 items — irpf removed)
  -- ========================================
  SELECT
    base.doc_type        AS document_type,
    base.doc_label       AS document_label,
    base.doc_desc        AS description,
    'base'::TEXT         AS category,
    true                 AS is_required,
    NULL::UUID           AS guarantee_id,
    COALESCE(
      CASE
        WHEN cd.validation_status = 'pending'    THEN 'uploaded'
        WHEN cd.validation_status = 'processing' THEN 'validating'
        ELSE cd.validation_status
      END,
      'missing'
    ),
    cd.id                AS document_id,
    cd.file_name         AS file_name,
    cd.validation_status AS validation_status,
    NULL::TEXT           AS partner_name,
    NULL::TEXT           AS partner_cpf,
    NULL::INTEGER        AS reference_year
  FROM (VALUES
    ('revenue',                   'Faturamento 2022, 2023, 2024 e 2025',                  'Faturamento mês a mês por ano'),
    ('debt_position',             'Endividamento Atual (assinado)',                         'Aberto por instituição, saldo, modalidade, garantia, % e vencimento'),
    ('balance_sheet_dre',         'Balanços e DRE 2023, 2024 e 2025',                     'Balanço patrimonial + DRE de cada exercício'),
    ('balance_trial_comparative', 'Balancete Comparativo',                                 'Mesmo período, ano atual vs anterior'),
    ('corporate_docs',            'Documentação Societária',                                'Ata, organograma, contrato social e alterações'),
    ('partner_id',                'CNH ou RG dos Sócios',                                  'Documento de identificação com foto'),
    ('partner_address_proof',     'Comprovante de Endereço dos Sócios',                    'Comprovante recente (máx. 90 dias)'),
    ('abc_curve',                 'Curva ABC — Maiores Clientes e Fornecedores',           'Ranking por volume'),
    ('visit_report',              'Proposta / Relatório de Visita',                         'Incluindo meios circulantes atuais'),
    ('superintendent_opinion',    'Parecer do Superintendente',                             'Parecer assinado sobre a operação')
  ) AS base(doc_type, doc_label, doc_desc)
  LEFT JOIN client_documents cd
    ON cd.client_id = p_client_id
    AND cd.document_type = base.doc_type
    AND cd.document_category = 'base'

  UNION ALL

  -- ========================================
  -- 2. IRPF — ONE ITEM PER PARTNER PER YEAR
  --    Uses N-1 and N-2 (last two completed declarations)
  -- ========================================
  SELECT
    'irpf'::TEXT,
    'IRPF ' || cap.full_name || ' — Exercício ' || yr.exercise_year::TEXT,
    'Declaração completa e/ou recibo de entrega'::TEXT,
    'partner'::TEXT,
    true,
    NULL::UUID,
    CASE WHEN COUNT(cd.id) > 0
      THEN COALESCE(
        CASE
          WHEN (ARRAY_AGG(cd.validation_status ORDER BY cd.created_at DESC))[1] = 'pending'    THEN 'uploaded'
          WHEN (ARRAY_AGG(cd.validation_status ORDER BY cd.created_at DESC))[1] = 'processing' THEN 'validating'
          ELSE (ARRAY_AGG(cd.validation_status ORDER BY cd.created_at DESC))[1]
        END,
        'uploaded'
      )
      ELSE 'missing'
    END,
    (ARRAY_AGG(cd.id           ORDER BY cd.created_at DESC))[1],
    (ARRAY_AGG(cd.file_name    ORDER BY cd.created_at DESC))[1],
    (ARRAY_AGG(cd.validation_status ORDER BY cd.created_at DESC))[1],
    cap.full_name,
    cap.cpf,
    yr.exercise_year
  FROM client_authorized_persons cap
  CROSS JOIN (
    SELECT (EXTRACT(YEAR FROM NOW()) - 1)::INTEGER AS exercise_year
    UNION ALL
    SELECT (EXTRACT(YEAR FROM NOW()) - 2)::INTEGER
  ) AS yr
  LEFT JOIN client_documents cd
    ON  cd.client_id      = p_client_id
    AND cd.document_type  = 'irpf'
    AND cd.partner_name   = cap.full_name
    AND cd.reference_year = yr.exercise_year
  WHERE cap.client_id        = p_client_id
    AND cap.is_active         = true
    AND cap.authorization_type = 'partner'
  GROUP BY cap.full_name, cap.cpf, yr.exercise_year

  UNION ALL

  -- ========================================
  -- 3. SEGMENT DOCUMENTS
  -- ========================================
  SELECT
    sdt.document_type,
    sdt.document_label,
    sdt.description,
    'segment'::TEXT,
    sdt.is_required,
    NULL::UUID,
    COALESCE(
      CASE
        WHEN cd.validation_status = 'pending'    THEN 'uploaded'
        WHEN cd.validation_status = 'processing' THEN 'validating'
        ELSE cd.validation_status
      END,
      'missing'
    ),
    cd.id,
    cd.file_name,
    cd.validation_status,
    NULL::TEXT,
    NULL::TEXT,
    NULL::INTEGER
  FROM segment_document_templates sdt
  LEFT JOIN client_documents cd
    ON cd.client_id          = p_client_id
    AND cd.document_type     = sdt.document_type
    AND cd.document_category = 'segment'
    AND cd.segment_template_id = sdt.id
  WHERE sdt.segment_id = v_client.segment_id

  UNION ALL

  -- ========================================
  -- 4. PRODUCT DOCUMENTS
  -- ========================================
  SELECT
    pdt.document_type,
    pdt.document_label,
    pdt.description,
    'product'::TEXT,
    pdt.is_required,
    NULL::UUID,
    COALESCE(
      CASE
        WHEN cd.validation_status = 'pending'    THEN 'uploaded'
        WHEN cd.validation_status = 'processing' THEN 'validating'
        ELSE cd.validation_status
      END,
      'missing'
    ),
    cd.id,
    cd.file_name,
    cd.validation_status,
    NULL::TEXT,
    NULL::TEXT,
    NULL::INTEGER
  FROM product_document_templates pdt
  LEFT JOIN client_documents cd
    ON cd.client_id           = p_client_id
    AND cd.document_type      = pdt.document_type
    AND cd.document_category  = 'product'
    AND cd.product_template_id = pdt.id
  WHERE pdt.product_id = v_client.credit_product_id

  UNION ALL

  -- ========================================
  -- 5. GUARANTEE DOCUMENTS
  -- ========================================
  SELECT
    gdt.document_type,
    gdt.document_label || ' — ' || COALESCE(cg.description, gt.name),
    gdt.description,
    'guarantee'::TEXT,
    gdt.is_required,
    cg.id,
    COALESCE(
      CASE
        WHEN cd.validation_status = 'pending'    THEN 'uploaded'
        WHEN cd.validation_status = 'processing' THEN 'validating'
        ELSE cd.validation_status
      END,
      'missing'
    ),
    cd.id,
    cd.file_name,
    cd.validation_status,
    NULL::TEXT,
    NULL::TEXT,
    NULL::INTEGER
  FROM client_guarantees cg
  JOIN guarantee_types gt ON gt.id = cg.guarantee_type_id
  JOIN guarantee_document_templates gdt ON gdt.guarantee_type_id = gt.id
  LEFT JOIN client_documents cd
    ON cd.client_id            = p_client_id
    AND cd.document_type       = gdt.document_type
    AND cd.document_category   = 'guarantee'
    AND cd.client_guarantee_id = cg.id
  WHERE cg.client_id = p_client_id AND v_client.has_guarantees = true

  UNION ALL

  -- ========================================
  -- 6. CONDITIONAL DOCUMENTS (judicial recovery)
  -- ========================================
  SELECT
    cond.doc_type,
    cond.doc_label,
    cond.doc_desc,
    'conditional'::TEXT,
    true,
    NULL::UUID,
    COALESCE(
      CASE
        WHEN cd.validation_status = 'pending'    THEN 'uploaded'
        WHEN cd.validation_status = 'processing' THEN 'validating'
        ELSE cd.validation_status
      END,
      'missing'
    ),
    cd.id,
    cd.file_name,
    cd.validation_status,
    NULL::TEXT,
    NULL::TEXT,
    NULL::INTEGER
  FROM (VALUES
    ('rj_plan',      'Plano de Recuperação Judicial Atual', 'Plano vigente aprovado pelo juízo'),
    ('rj_creditors', 'Lista de Credores',                   'Lista atualizada de credores da RJ'),
    ('rj_balance',   'Saldo Atual da Recuperação Judicial', 'Posição atualizada dos pagamentos da RJ')
  ) AS cond(doc_type, doc_label, doc_desc)
  LEFT JOIN client_documents cd
    ON cd.client_id      = p_client_id
    AND cd.document_type = cond.doc_type
    AND cd.document_category = 'conditional'
  WHERE v_client.is_judicial_recovery = true

  ) AS checklist
  ORDER BY category, is_required DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
