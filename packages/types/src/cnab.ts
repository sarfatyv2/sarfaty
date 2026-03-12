// ---------------------------------------------------------------------------
// CNAB 400 Layout Types
// ---------------------------------------------------------------------------

export const CNAB_FILE_TYPES = ['remittance', 'return'] as const;
export type CnabFileType = (typeof CNAB_FILE_TYPES)[number];

export const CNAB_LAYOUT_VERSIONS = ['cnab400', 'cnab240'] as const;
export type CnabLayoutVersion = (typeof CNAB_LAYOUT_VERSIONS)[number];

export const CNAB_FILE_STATUSES = [
  'uploaded',
  'processing',
  'processed',
  'error',
  'partially_processed',
] as const;
export type CnabFileStatus = (typeof CNAB_FILE_STATUSES)[number];

export interface CnabRemittanceFile {
  id: string;
  clientId: string;
  fileType: CnabFileType;
  layoutVersion: CnabLayoutVersion;
  bankCode: string;
  bankName: string | null;
  serviceCode: string | null;
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
  processedAt: string | null;
  createdAt: string | null;
}

// ---------------------------------------------------------------------------
// Parsed CNAB Records (output of parser, before persistence)
// ---------------------------------------------------------------------------

export interface CnabParsedHeader {
  fileType: CnabFileType;
  serviceCode: string;
  cedentCode: string;
  cedentName: string;
  bankCode: string;
  bankName: string;
  remittanceDate: string;
  sequentialNumber: number;
}

export interface CnabParsedDetail {
  recordSequence: number;
  cedentDocType: string;
  cedentDoc: string;
  ourNumber: string;
  documentNumber: string;
  portfolioCode: string;
  dueDate: string;
  faceValue: number;
  bankCode: string;
  branch: string;
  speciesCode: string;
  acceptance: string;
  issueDate: string;
  instruction1: string;
  instruction2: string;
  interestPerDay: number;
  discountDeadline: string | null;
  discountValue: number;
  iofValue: number;
  penaltyValue: number;
  draweeDocType: string;
  draweeDoc: string;
  draweeName: string;
  draweeAddress: string;
  draweeNeighborhood: string;
  draweeZip: string;
  draweeCity: string;
  draweeState: string;
  draweeEmail: string | null;
  rawLine: string;
}

export interface CnabParseResult {
  header: CnabParsedHeader;
  details: CnabParsedDetail[];
  totalRecords: number;
  errors: CnabParseError[];
}

export interface CnabParseError {
  line: number;
  message: string;
  rawContent?: string;
}

export const SUPPORTED_BANK_CODES = ['237', '274'] as const;
export type SupportedBankCode = (typeof SUPPORTED_BANK_CODES)[number];
