export const ROLES = [
  'sales_rep',
  'sales_supervisor',
  'sales_manager',
  'sales_director',
  'credit_analyst',
  'compliance_officer',
  'approver',
  'backoffice',
  'legal',
  'risk_manager',
  'recovery',
  'litigation',
  'employee',
  'people_manager',
  'hr',
  'dp',
  'hr_admin',
  'governance',
  'admin',
] as const;

export type Role = (typeof ROLES)[number];
