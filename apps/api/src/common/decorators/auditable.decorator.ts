import { SetMetadata } from '@nestjs/common';

export interface AuditableOptions {
  /** Action identifier, e.g. 'reimbursement.approve', 'collaborator.update' */
  action: string;
  /** Entity type, e.g. 'reimbursement', 'collaborator', 'pj_invoice' */
  entity: string;
  /** Name of the route param that holds the entity ID (default: 'id') */
  idParam?: string;
}

export const AUDITABLE_KEY = 'auditable';

export const Auditable = (options: AuditableOptions) =>
  SetMetadata(AUDITABLE_KEY, options);
