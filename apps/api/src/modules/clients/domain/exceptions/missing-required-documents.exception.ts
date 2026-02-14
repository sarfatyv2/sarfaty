import { DomainException } from '@nexus/types';

export class MissingRequiredDocumentsException extends DomainException {
  readonly code = 'MISSING_REQUIRED_DOCUMENTS';
  readonly httpStatus = 422;

  constructor(missingDocuments: string[]) {
    super(`Missing required documents: ${missingDocuments.join(', ')}`, {
      missingDocuments,
    });
  }
}
