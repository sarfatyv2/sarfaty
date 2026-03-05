export type PersonType = 'individual' | 'company';

export interface Drawee {
  id: string;
  personType: PersonType;
  cpf: string | null;
  cnpj: string | null;
  cnpjRoot: string | null;
  tradeName: string | null;
  companyName: string;
  legalName: string | null;
  rg: string | null;
  birthDate: string | null;
  gender: string | null;
  rgDocumentId: string | null;
  cnhDocumentId: string | null;
  isPep: boolean;
  isOfacListed: boolean;
  riskRating: string | null;
  creditScore: number | null;
  assignedTo: string | null;
  segmentId: string | null;
  economicGroupId: string | null;
  status: string;
  blockedAt: string | null;
  blockReason: string | null;
  legacySgsId: number | null;
  legacyNfId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DraweeAuthorizedPerson {
  id: string;
  draweeId: string;
  authorizationType: string | null;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  sourceQueriedAt: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DraweeContact {
  id: string;
  draweeId: string;
  contactName: string | null;
  useType: string | null;
  email: string | null;
  emailSecondary: string | null;
  billingEmail: string | null;
  xmlEmail: string | null;
  phone: string | null;
  phoneMobile: string | null;
  phoneSms: string | null;
  billingPhone: string | null;
  whatsapp: boolean;
  homepage: string | null;
  notes: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DraweeAddress {
  id: string;
  draweeId: string;
  useType: string | null;
  street: string | null;
  number: string | null;
  withoutNumber: boolean;
  complement: string | null;
  neighborhood: string | null;
  zipCode: string | null;
  city: string | null;
  state: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DraweeBankAccount {
  id: string;
  draweeId: string;
  bankCode: string | null;
  bankName: string | null;
  branch: string | null;
  accountNumber: string | null;
  accountType: string | null;
  pixKey: string | null;
  nickname: string | null;
  openedAt: string | null;
  closedAt: string | null;
  status: string;
  isPrimary: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DraweeDocument {
  id: string;
  draweeId: string;
  documentType: string;
  documentCategory: string;
  documentLabel: string | null;
  storagePath: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  validationStatus: string | null;
  validatedAt: string | null;
  uploadedBy: string;
  createdAt: string | null;
}
