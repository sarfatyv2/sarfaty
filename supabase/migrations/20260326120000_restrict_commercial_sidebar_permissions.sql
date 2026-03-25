-- Restrict commercial sidebar: only sales_director keeps drawees/receivables/operations/CERC;
-- sales_director no longer has pipeline. Other commercial roles lose those sidebar items.

DELETE FROM role_permissions
WHERE role_id IN (SELECT id FROM roles WHERE key IN ('sales_rep', 'sales_supervisor', 'sales_manager'))
  AND feature_key IN (
    'sidebar:commercial/drawees',
    'sidebar:commercial/receivables',
    'sidebar:commercial/operations',
    'sidebar:commercial/pipeline',
    'sidebar:credit/cerc'
  );

DELETE FROM role_permissions
WHERE role_id = (SELECT id FROM roles WHERE key = 'sales_director')
  AND feature_key = 'sidebar:commercial/pipeline';
