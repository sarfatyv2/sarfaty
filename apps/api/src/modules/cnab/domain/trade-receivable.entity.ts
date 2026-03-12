import type { TradeReceivableStatus, EvaluationStatus } from '@nexus/types';

export interface TradeReceivableProps {
  id: string;
  clientId: string;
  draweeId: string | null;
  cnabFileId: string;
  documentNumber: string | null;
  ourNumber: string | null;
  documentType: string | null;
  speciesCode: string | null;
  issueDate: string | null;
  dueDate: string | null;
  faceValue: string | null;
  interestPerDay: string | null;
  discountValue: string | null;
  discountDeadline: string | null;
  penaltyValue: string | null;
  iofValue: string | null;
  acceptance: string | null;
  instruction1: string | null;
  instruction2: string | null;
  cedentDocType: string | null;
  cedentDoc: string | null;
  draweeDocType: string | null;
  draweeDoc: string | null;
  draweeName: string | null;
  draweeAddress: string | null;
  draweeNeighborhood: string | null;
  draweeZip: string | null;
  draweeCity: string | null;
  draweeState: string | null;
  draweeEmail: string | null;
  bankCode: string | null;
  branch: string | null;
  portfolioCode: string | null;
  status: TradeReceivableStatus;
  operationId: string | null;
  evaluationStatus: EvaluationStatus;
  rejectionReason: string | null;
  portfolioPositionId: string | null;
  cnabRecordSequence: number | null;
  rawLine: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class TradeReceivableEntity {
  readonly id: string;
  readonly clientId: string;
  readonly draweeId: string | null;
  readonly cnabFileId: string;
  readonly documentNumber: string | null;
  readonly ourNumber: string | null;
  readonly documentType: string | null;
  readonly speciesCode: string | null;
  readonly issueDate: string | null;
  readonly dueDate: string | null;
  readonly faceValue: string | null;
  readonly interestPerDay: string | null;
  readonly discountValue: string | null;
  readonly discountDeadline: string | null;
  readonly penaltyValue: string | null;
  readonly iofValue: string | null;
  readonly acceptance: string | null;
  readonly instruction1: string | null;
  readonly instruction2: string | null;
  readonly cedentDocType: string | null;
  readonly cedentDoc: string | null;
  readonly draweeDocType: string | null;
  readonly draweeDoc: string | null;
  readonly draweeName: string | null;
  readonly draweeAddress: string | null;
  readonly draweeNeighborhood: string | null;
  readonly draweeZip: string | null;
  readonly draweeCity: string | null;
  readonly draweeState: string | null;
  readonly draweeEmail: string | null;
  readonly bankCode: string | null;
  readonly branch: string | null;
  readonly portfolioCode: string | null;
  readonly status: TradeReceivableStatus;
  readonly operationId: string | null;
  readonly evaluationStatus: EvaluationStatus;
  readonly rejectionReason: string | null;
  readonly portfolioPositionId: string | null;
  readonly cnabRecordSequence: number | null;
  readonly rawLine: string | null;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: TradeReceivableProps) {
    Object.assign(this, props);
    this.id = props.id;
    this.clientId = props.clientId;
    this.draweeId = props.draweeId;
    this.cnabFileId = props.cnabFileId;
    this.documentNumber = props.documentNumber;
    this.ourNumber = props.ourNumber;
    this.documentType = props.documentType;
    this.speciesCode = props.speciesCode;
    this.issueDate = props.issueDate;
    this.dueDate = props.dueDate;
    this.faceValue = props.faceValue;
    this.interestPerDay = props.interestPerDay;
    this.discountValue = props.discountValue;
    this.discountDeadline = props.discountDeadline;
    this.penaltyValue = props.penaltyValue;
    this.iofValue = props.iofValue;
    this.acceptance = props.acceptance;
    this.instruction1 = props.instruction1;
    this.instruction2 = props.instruction2;
    this.cedentDocType = props.cedentDocType;
    this.cedentDoc = props.cedentDoc;
    this.draweeDocType = props.draweeDocType;
    this.draweeDoc = props.draweeDoc;
    this.draweeName = props.draweeName;
    this.draweeAddress = props.draweeAddress;
    this.draweeNeighborhood = props.draweeNeighborhood;
    this.draweeZip = props.draweeZip;
    this.draweeCity = props.draweeCity;
    this.draweeState = props.draweeState;
    this.draweeEmail = props.draweeEmail;
    this.bankCode = props.bankCode;
    this.branch = props.branch;
    this.portfolioCode = props.portfolioCode;
    this.status = props.status;
    this.operationId = props.operationId;
    this.evaluationStatus = props.evaluationStatus;
    this.rejectionReason = props.rejectionReason;
    this.portfolioPositionId = props.portfolioPositionId;
    this.cnabRecordSequence = props.cnabRecordSequence;
    this.rawLine = props.rawLine;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<TradeReceivableProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): TradeReceivableEntity {
    return new TradeReceivableEntity({ ...props, id: props.id ?? '', createdAt: null, updatedAt: null });
  }

  static reconstitute(props: TradeReceivableProps): TradeReceivableEntity {
    return new TradeReceivableEntity(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      clientId: this.clientId,
      draweeId: this.draweeId,
      cnabFileId: this.cnabFileId,
      documentNumber: this.documentNumber,
      ourNumber: this.ourNumber,
      documentType: this.documentType,
      speciesCode: this.speciesCode,
      issueDate: this.issueDate,
      dueDate: this.dueDate,
      faceValue: this.faceValue,
      interestPerDay: this.interestPerDay,
      discountValue: this.discountValue,
      discountDeadline: this.discountDeadline,
      penaltyValue: this.penaltyValue,
      iofValue: this.iofValue,
      acceptance: this.acceptance,
      instruction1: this.instruction1,
      instruction2: this.instruction2,
      cedentDocType: this.cedentDocType,
      cedentDoc: this.cedentDoc,
      draweeDocType: this.draweeDocType,
      draweeDoc: this.draweeDoc,
      draweeName: this.draweeName,
      draweeAddress: this.draweeAddress,
      draweeNeighborhood: this.draweeNeighborhood,
      draweeZip: this.draweeZip,
      draweeCity: this.draweeCity,
      draweeState: this.draweeState,
      draweeEmail: this.draweeEmail,
      bankCode: this.bankCode,
      branch: this.branch,
      portfolioCode: this.portfolioCode,
      status: this.status,
      operationId: this.operationId,
      evaluationStatus: this.evaluationStatus,
      rejectionReason: this.rejectionReason,
      portfolioPositionId: this.portfolioPositionId,
      cnabRecordSequence: this.cnabRecordSequence,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
