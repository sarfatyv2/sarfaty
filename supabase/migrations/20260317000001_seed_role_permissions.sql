-- Seed initial role_permissions based on legacy ROLE_PERMISSIONS static config.
-- The 'admin' role receives the wildcard '*' granting access to everything.
-- Other roles receive the specific feature keys that map to their original sidebar/permissions.

-- admin: full access via wildcard
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, '*'
FROM "roles" r
WHERE r.key = 'admin'
ON CONFLICT DO NOTHING;

-- sales_rep
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:commercial/dashboard'),
  ('sidebar:commercial/clients'),
  ('sidebar:commercial/drawees'),
  ('sidebar:commercial/receivables'),
  ('sidebar:commercial/operations'),
  ('sidebar:commercial/pipeline'),
  ('sidebar:commercial/activities'),
  ('sidebar:commercial/goals'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:activities'),
  ('action:edit_draft'),
  ('action:upload_document'),
  ('action:submit_for_analysis'),
  ('action:register_activity'),
  ('global:create_client')
) AS f(feature_key)
WHERE r.key = 'sales_rep'
ON CONFLICT DO NOTHING;

-- sales_supervisor
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:commercial/dashboard'),
  ('sidebar:commercial/clients'),
  ('sidebar:commercial/drawees'),
  ('sidebar:commercial/receivables'),
  ('sidebar:commercial/operations'),
  ('sidebar:commercial/pipeline'),
  ('sidebar:commercial/activities'),
  ('sidebar:commercial/goals'),
  ('sidebar:commercial/team'),
  ('sidebar:commercial/ranking'),
  ('sidebar:commercial/teams_goals'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:activities'),
  ('tab:assignment_history'),
  ('action:edit_draft'),
  ('action:upload_document'),
  ('action:submit_for_analysis'),
  ('action:register_activity'),
  ('action:reassign_within_team'),
  ('global:create_client'),
  ('global:reassign_client'),
  ('global:manage_teams')
) AS f(feature_key)
WHERE r.key = 'sales_supervisor'
ON CONFLICT DO NOTHING;

-- sales_manager
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:commercial/dashboard'),
  ('sidebar:commercial/clients'),
  ('sidebar:commercial/drawees'),
  ('sidebar:commercial/receivables'),
  ('sidebar:commercial/operations'),
  ('sidebar:commercial/pipeline'),
  ('sidebar:commercial/activities'),
  ('sidebar:commercial/goals'),
  ('sidebar:commercial/team'),
  ('sidebar:commercial/ranking'),
  ('sidebar:commercial/teams_goals'),
  ('sidebar:commercial/teams'),
  ('sidebar:commercial/teams_ranking'),
  ('sidebar:commercial/regional_goals'),
  ('sidebar:commercial/heatmap'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:activities'),
  ('tab:assignment_history'),
  ('action:edit_draft'),
  ('action:upload_document'),
  ('action:submit_for_analysis'),
  ('action:register_activity'),
  ('action:reassign_within_team'),
  ('action:reassign_within_region'),
  ('global:create_client'),
  ('global:reassign_client'),
  ('global:manage_teams'),
  ('global:manage_regions'),
  ('global:manage_goals')
) AS f(feature_key)
WHERE r.key = 'sales_manager'
ON CONFLICT DO NOTHING;

-- sales_director
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:commercial/dashboard'),
  ('sidebar:commercial/clients'),
  ('sidebar:commercial/drawees'),
  ('sidebar:commercial/receivables'),
  ('sidebar:commercial/operations'),
  ('sidebar:commercial/pipeline'),
  ('sidebar:commercial/activities'),
  ('sidebar:commercial/goals'),
  ('sidebar:commercial/team'),
  ('sidebar:commercial/ranking'),
  ('sidebar:commercial/teams_goals'),
  ('sidebar:commercial/teams'),
  ('sidebar:commercial/teams_ranking'),
  ('sidebar:commercial/regional_goals'),
  ('sidebar:commercial/heatmap'),
  ('sidebar:commercial/regions'),
  ('sidebar:commercial/nat_ranking'),
  ('sidebar:commercial/nat_goals'),
  ('sidebar:commercial/trends'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:activities'),
  ('tab:assignment_history'),
  ('action:edit_draft'),
  ('action:upload_document'),
  ('action:submit_for_analysis'),
  ('action:register_activity'),
  ('action:reassign_anywhere'),
  ('global:create_client'),
  ('global:reassign_client'),
  ('global:manage_teams'),
  ('global:manage_regions'),
  ('global:manage_goals')
) AS f(feature_key)
WHERE r.key = 'sales_director'
ON CONFLICT DO NOTHING;

-- credit_analyst
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:credit/queue'),
  ('sidebar:credit/reports'),
  ('sidebar:credit/history'),
  ('sidebar:credit/bureaus'),
  ('sidebar:credit/metrics'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:financial_data'),
  ('tab:bureau_results'),
  ('tab:ai_report'),
  ('tab:credit_history'),
  ('action:trigger_bureau_requery'),
  ('action:add_analyst_note'),
  ('action:flag_for_review'),
  ('action:override_auto_reject')
) AS f(feature_key)
WHERE r.key = 'credit_analyst'
ON CONFLICT DO NOTHING;

-- compliance_officer
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:compliance/queue'),
  ('sidebar:compliance/alerts'),
  ('sidebar:compliance/monitoring'),
  ('sidebar:compliance/peps'),
  ('sidebar:compliance/sanctions'),
  ('sidebar:compliance/lawsuits'),
  ('sidebar:compliance/reports'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:compliance_results'),
  ('tab:compliance_screening'),
  ('tab:pep_analysis'),
  ('tab:sanctions_check'),
  ('tab:lawsuit_details'),
  ('tab:beneficial_owners'),
  ('tab:risk_classification'),
  ('action:approve_compliance'),
  ('action:reject_compliance'),
  ('action:request_additional_info'),
  ('action:add_compliance_note'),
  ('action:flag_suspicious_activity'),
  ('action:escalate_to_pld'),
  ('global:generate_coaf_report')
) AS f(feature_key)
WHERE r.key = 'compliance_officer'
ON CONFLICT DO NOTHING;

-- approver
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:approval/queue'),
  ('sidebar:approval/history'),
  ('sidebar:approval/metrics'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:financial_data'),
  ('tab:bureau_results'),
  ('tab:ai_report'),
  ('tab:credit_history'),
  ('tab:approval_decision'),
  ('tab:compliance_results'),
  ('action:approve_credit'),
  ('action:reject_credit'),
  ('action:approve_with_conditions'),
  ('action:request_additional_analysis'),
  ('action:add_approver_note')
) AS f(feature_key)
WHERE r.key = 'approver'
ON CONFLICT DO NOTHING;

-- backoffice
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:backoffice/operations'),
  ('sidebar:backoffice/homologation'),
  ('sidebar:backoffice/divergences'),
  ('sidebar:backoffice/partner_docs'),
  ('sidebar:backoffice/contracts'),
  ('sidebar:backoffice/funds'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:partner_documents'),
  ('tab:homologation_status'),
  ('tab:contract_status'),
  ('tab:fund_eligibility'),
  ('action:trigger_homologation'),
  ('action:resolve_divergence'),
  ('action:request_partner_docs'),
  ('action:add_backoffice_note')
) AS f(feature_key)
WHERE r.key = 'backoffice'
ON CONFLICT DO NOTHING;

-- legal
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:legal/contracts'),
  ('sidebar:legal/contracts_generate'),
  ('sidebar:legal/analysis'),
  ('sidebar:legal/regulations'),
  ('sidebar:legal/extrajudicial'),
  ('sidebar:legal/litigation'),
  ('sidebar:legal/tracking'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:contracts'),
  ('tab:contract_analysis'),
  ('tab:extrajudicial_history'),
  ('tab:litigation_details'),
  ('action:generate_contract'),
  ('action:review_contract'),
  ('action:reject_contract'),
  ('action:send_to_signature'),
  ('action:generate_extrajudicial'),
  ('action:approve_extrajudicial'),
  ('action:register_lawsuit'),
  ('action:add_legal_note'),
  ('global:review_fund_regulation')
) AS f(feature_key)
WHERE r.key = 'legal'
ON CONFLICT DO NOTHING;

-- risk_manager
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:risk/overview'),
  ('sidebar:risk/management'),
  ('sidebar:risk/recovery'),
  ('sidebar:risk/litigation'),
  ('sidebar:risk/collection_rules'),
  ('sidebar:risk/metrics'),
  ('sidebar:risk/aging'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:payment_history'),
  ('tab:collection_timeline'),
  ('tab:negotiation_history'),
  ('tab:contact_attempts'),
  ('action:register_contact_attempt'),
  ('action:register_negotiation'),
  ('action:propose_settlement'),
  ('action:escalate_to_recovery'),
  ('action:escalate_to_litigation'),
  ('action:request_extrajudicial'),
  ('action:add_risk_note'),
  ('global:configure_collection_rules')
) AS f(feature_key)
WHERE r.key = 'risk_manager'
ON CONFLICT DO NOTHING;

-- recovery
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:risk/recovery'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:payment_history'),
  ('tab:collection_timeline'),
  ('tab:negotiation_history'),
  ('tab:contact_attempts'),
  ('action:register_contact_attempt'),
  ('action:register_negotiation'),
  ('action:propose_settlement'),
  ('action:add_risk_note')
) AS f(feature_key)
WHERE r.key = 'recovery'
ON CONFLICT DO NOTHING;

-- litigation
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:risk/litigation'),
  ('sidebar:legal/litigation'),
  ('sidebar:legal/tracking'),
  ('sidebar:learning/my_courses'),
  ('tab:chat'),
  ('tab:overview'),
  ('tab:documents'),
  ('tab:payment_history'),
  ('tab:collection_timeline'),
  ('tab:negotiation_history'),
  ('tab:contact_attempts'),
  ('tab:litigation_details'),
  ('action:register_contact_attempt'),
  ('action:register_negotiation'),
  ('action:propose_settlement'),
  ('action:escalate_to_litigation'),
  ('action:request_extrajudicial'),
  ('action:add_risk_note'),
  ('action:register_lawsuit'),
  ('action:add_legal_note')
) AS f(feature_key)
WHERE r.key = 'litigation'
ON CONFLICT DO NOTHING;

-- employee
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:learning/my_courses')
) AS f(feature_key)
WHERE r.key = 'employee'
ON CONFLICT DO NOTHING;

-- people_manager
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:people/team'),
  ('sidebar:people/team_reimbursements'),
  ('sidebar:learning/my_courses'),
  ('sidebar:learning/admin')
) AS f(feature_key)
WHERE r.key = 'people_manager'
ON CONFLICT DO NOTHING;

-- hr
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:people/collaborators'),
  ('sidebar:people/team'),
  ('sidebar:people/team_reimbursements'),
  ('sidebar:people/dp_invoices'),
  ('sidebar:people/dp_reimbursements'),
  ('sidebar:learning/my_courses'),
  ('sidebar:learning/admin'),
  ('global:create_collaborator'),
  ('global:manage_people_settings')
) AS f(feature_key)
WHERE r.key = 'hr'
ON CONFLICT DO NOTHING;

-- dp
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:people/collaborators'),
  ('sidebar:people/dp_invoices'),
  ('sidebar:people/dp_reimbursements'),
  ('sidebar:learning/my_courses')
) AS f(feature_key)
WHERE r.key = 'dp'
ON CONFLICT DO NOTHING;

-- hr_admin
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:people/collaborators'),
  ('sidebar:people/team'),
  ('sidebar:people/team_reimbursements'),
  ('sidebar:people/dp_invoices'),
  ('sidebar:people/dp_reimbursements'),
  ('sidebar:admin/users'),
  ('sidebar:learning/my_courses'),
  ('sidebar:learning/admin'),
  ('global:create_collaborator'),
  ('global:create_user'),
  ('global:manage_people_settings'),
  ('global:manage_courses')
) AS f(feature_key)
WHERE r.key = 'hr_admin'
ON CONFLICT DO NOTHING;

-- governance
INSERT INTO "role_permissions" ("role_id", "feature_key")
SELECT r.id, f.feature_key
FROM "roles" r
CROSS JOIN (VALUES
  ('sidebar:my_space/profile'),
  ('sidebar:my_space/invoices'),
  ('sidebar:my_space/reimbursements'),
  ('sidebar:governance/overview'),
  ('sidebar:governance/committees'),
  ('sidebar:governance/actions'),
  ('sidebar:learning/my_courses')
) AS f(feature_key)
WHERE r.key = 'governance'
ON CONFLICT DO NOTHING;
