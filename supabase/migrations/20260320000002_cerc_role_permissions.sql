-- Add sidebar:credit/cerc feature key to roles that should see the CERC validation page

-- Credit roles
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, 'sidebar:credit/cerc'
FROM "roles" r
WHERE r.key IN ('credit_analyst', 'approver', 'risk_manager', 'admin')
ON CONFLICT DO NOTHING;

-- Commercial roles
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, 'sidebar:credit/cerc'
FROM "roles" r
WHERE r.key IN ('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director')
ON CONFLICT DO NOTHING;
