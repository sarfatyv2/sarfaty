import type { CnabFileType, CnabLayoutVersion, CnabFileStatus } from '@nexus/types';

export interface CnabFileProps {
  id: string;
  clientId: string;
  fileType: CnabFileType;
  layoutVersion: CnabLayoutVersion;
  bankCode: string;
  bankName: string | null;
  cedentCode: string | null;
  cedentName: string | null;
  remittanceDate: string | null;
  sequentialNumber: number | null;
  storagePath: string;
  originalFilename: string;
  totalRecords: number | null;
  totalAmount: string | null;
  status: CnabFileStatus;
  parsingErrors: unknown;
  processedAt: Date | null;
  createdAt: Date | null;
}

export class CnabFile {
  readonly id: string;
  readonly clientId: string;
  readonly fileType: CnabFileType;
  readonly layoutVersion: CnabLayoutVersion;
  readonly bankCode: string;
  readonly bankName: string | null;
  readonly cedentCode: string | null;
  readonly cedentName: string | null;
  readonly remittanceDate: string | null;
  readonly sequentialNumber: number | null;
  readonly storagePath: string;
  readonly originalFilename: string;
  readonly totalRecords: number | null;
  readonly totalAmount: string | null;
  readonly status: CnabFileStatus;
  readonly parsingErrors: unknown;
  readonly processedAt: Date | null;
  readonly createdAt: Date | null;

  private constructor(props: CnabFileProps) {
    Object.assign(this, props);
    this.id = props.id;
    this.clientId = props.clientId;
    this.fileType = props.fileType;
    this.layoutVersion = props.layoutVersion;
    this.bankCode = props.bankCode;
    this.bankName = props.bankName;
    this.cedentCode = props.cedentCode;
    this.cedentName = props.cedentName;
    this.remittanceDate = props.remittanceDate;
    this.sequentialNumber = props.sequentialNumber;
    this.storagePath = props.storagePath;
    this.originalFilename = props.originalFilename;
    this.totalRecords = props.totalRecords;
    this.totalAmount = props.totalAmount;
    this.status = props.status;
    this.parsingErrors = props.parsingErrors;
    this.processedAt = props.processedAt;
    this.createdAt = props.createdAt;
  }

  static create(props: Omit<CnabFileProps, 'id' | 'createdAt'> & { id?: string }): CnabFile {
    return new CnabFile({ ...props, id: props.id ?? '', createdAt: null });
  }

  static reconstitute(props: CnabFileProps): CnabFile {
    return new CnabFile(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      clientId: this.clientId,
      fileType: this.fileType,
      layoutVersion: this.layoutVersion,
      bankCode: this.bankCode,
      bankName: this.bankName,
      cedentCode: this.cedentCode,
      cedentName: this.cedentName,
      remittanceDate: this.remittanceDate,
      sequentialNumber: this.sequentialNumber,
      storagePath: this.storagePath,
      originalFilename: this.originalFilename,
      totalRecords: this.totalRecords,
      totalAmount: this.totalAmount,
      status: this.status,
      parsingErrors: this.parsingErrors,
      processedAt: this.processedAt?.toISOString() ?? null,
      createdAt: this.createdAt?.toISOString() ?? null,
    };
  }
}
