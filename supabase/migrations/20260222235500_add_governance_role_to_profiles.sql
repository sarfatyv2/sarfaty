-- Add governance role to profiles_role_check constraint
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (
  role = ANY (ARRAY[
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'employee',
    'people_manager', 'hr', 'dp', 'hr_admin', 'governance', 'admin'
  ])
);
