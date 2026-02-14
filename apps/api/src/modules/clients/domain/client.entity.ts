import { type ClientStatus, EDITABLE_STATUSES } from '@nexus/types';
import { InvalidStatusTransitionException } from './exceptions/invalid-status-transition.exception';

export interface ClientProps {
  id: string;
  companyName: string;
  cnpj: string;
  tradeName: string | null;
  segmentId: string;
  phone: string;
  email: string;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  creditProductId: string;
  requestedAmount: string | null;
  approvedAmount: string | null;
  hasGuarantees: boolean;
  isJudicialRecovery: boolean;
  workingCapitalNotes: unknown;
  status: ClientStatus;
  assignedTo: string;
  teamId: string | null;
  regionId: string | null;
  cnpjStatus: string | null;
  cnpjValidatedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  submittedAt: Date | null;
  approvedAt: Date | null;
  homologatedAt: Date | null;
}

export class Client {
  readonly id: string;
  readonly companyName: string;
  readonly cnpj: string;
  readonly tradeName: string | null;
  readonly segmentId: string;
  readonly phone: string;
  readonly email: string;
  readonly addressStreet: string | null;
  readonly addressNumber: string | null;
  readonly addressComplement: string | null;
  readonly addressNeighborhood: string | null;
  readonly addressCity: string | null;
  readonly addressState: string | null;
  readonly addressZip: string | null;
  readonly creditProductId: string;
  readonly requestedAmount: string | null;
  readonly approvedAmount: string | null;
  readonly hasGuarantees: boolean;
  readonly isJudicialRecovery: boolean;
  readonly workingCapitalNotes: unknown;
  readonly status: ClientStatus;
  readonly assignedTo: string;
  readonly teamId: string | null;
  readonly regionId: string | null;
  readonly cnpjStatus: string | null;
  readonly cnpjValidatedAt: Date | null;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;
  readonly submittedAt: Date | null;
  readonly approvedAt: Date | null;
  readonly homologatedAt: Date | null;

  private constructor(props: ClientProps) {
    this.id = props.id;
    this.companyName = props.companyName;
    this.cnpj = props.cnpj;
    this.tradeName = props.tradeName;
    this.segmentId = props.segmentId;
    this.phone = props.phone;
    this.email = props.email;
    this.addressStreet = props.addressStreet;
    this.addressNumber = props.addressNumber;
    this.addressComplement = props.addressComplement;
    this.addressNeighborhood = props.addressNeighborhood;
    this.addressCity = props.addressCity;
    this.addressState = props.addressState;
    this.addressZip = props.addressZip;
    this.creditProductId = props.creditProductId;
    this.requestedAmount = props.requestedAmount;
    this.approvedAmount = props.approvedAmount;
    this.hasGuarantees = props.hasGuarantees;
    this.isJudicialRecovery = props.isJudicialRecovery;
    this.workingCapitalNotes = props.workingCapitalNotes;
    this.status = props.status;
    this.assignedTo = props.assignedTo;
    this.teamId = props.teamId;
    this.regionId = props.regionId;
    this.cnpjStatus = props.cnpjStatus;
    this.cnpjValidatedAt = props.cnpjValidatedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.submittedAt = props.submittedAt;
    this.approvedAt = props.approvedAt;
    this.homologatedAt = props.homologatedAt;
  }

  static create(props: Omit<ClientProps, 'id' | 'status' | 'approvedAmount' | 'createdAt' | 'updatedAt' | 'submittedAt' | 'approvedAt' | 'homologatedAt'> & { id?: string }): Client {
    Client.validateCompanyName(props.companyName);
    Client.validateEmail(props.email);

    return new Client({
      ...props,
      id: props.id ?? '',
      status: 'draft',
      approvedAmount: null,
      createdAt: null,
      updatedAt: null,
      submittedAt: null,
      approvedAt: null,
      homologatedAt: null,
    });
  }

  static reconstitute(props: ClientProps): Client {
    return new Client(props);
  }

  canEdit(): boolean {
    return EDITABLE_STATUSES.includes(this.status);
  }

  canUploadDocuments(): boolean {
    return EDITABLE_STATUSES.includes(this.status);
  }

  canDeleteDocuments(): boolean {
    return EDITABLE_STATUSES.includes(this.status);
  }

  canSubmitForAnalysis(): boolean {
    return this.status === 'draft' || this.status === 'pending_documents' || this.status === 'document_issues';
  }

  validateStatusTransition(newStatus: ClientStatus): void {
    const allowed = VALID_TRANSITIONS[this.status];
    if (!allowed?.includes(newStatus)) {
      throw new InvalidStatusTransitionException(this.status, newStatus);
    }
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      companyName: this.companyName,
      cnpj: this.cnpj,
      tradeName: this.tradeName,
      segmentId: this.segmentId,
      phone: this.phone,
      email: this.email,
      addressStreet: this.addressStreet,
      addressNumber: this.addressNumber,
      addressComplement: this.addressComplement,
      addressNeighborhood: this.addressNeighborhood,
      addressCity: this.addressCity,
      addressState: this.addressState,
      addressZip: this.addressZip,
      creditProductId: this.creditProductId,
      requestedAmount: this.requestedAmount,
      approvedAmount: this.approvedAmount,
      hasGuarantees: this.hasGuarantees,
      isJudicialRecovery: this.isJudicialRecovery,
      workingCapitalNotes: this.workingCapitalNotes,
      status: this.status,
      assignedTo: this.assignedTo,
      teamId: this.teamId,
      regionId: this.regionId,
      cnpjStatus: this.cnpjStatus,
      cnpjValidatedAt: this.cnpjValidatedAt?.toISOString() ?? null,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
      submittedAt: this.submittedAt?.toISOString() ?? null,
      approvedAt: this.approvedAt?.toISOString() ?? null,
      homologatedAt: this.homologatedAt?.toISOString() ?? null,
    };
  }

  private static validateCompanyName(name: string): void {
    if ((name?.trim().length ?? 0) < 2) {
      throw new Error('Company name must have at least 2 characters');
    }
  }

  private static validateEmail(email: string): void {
    if (!email?.includes('@')) {
      throw new Error('Invalid email address');
    }
  }
}

const VALID_TRANSITIONS: Partial<Record<ClientStatus, ClientStatus[]>> = {
  draft: ['pending_documents', 'cancelled'],
  pending_documents: ['document_validation', 'cancelled'],
  document_validation: ['document_issues', 'credit_analysis'],
  document_issues: ['pending_documents', 'document_validation', 'cancelled'],
  credit_analysis: ['auto_rejected', 'pending_report'],
  pending_report: ['pending_approval'],
  pending_approval: ['approved', 'rejected'],
  approved: ['pending_partner_docs', 'pending_homologation'],
  pending_partner_docs: ['partner_doc_validation'],
  partner_doc_validation: ['pending_homologation', 'pending_partner_docs'],
  pending_homologation: ['homologated', 'homologation_issues'],
  homologation_issues: ['pending_homologation', 'cancelled'],
  homologated: ['active'],
  active: ['risk_management', 'settled'],
  risk_management: ['recovery', 'active', 'settled'],
  recovery: ['litigation', 'active', 'settled'],
  litigation: ['settled'],
};
