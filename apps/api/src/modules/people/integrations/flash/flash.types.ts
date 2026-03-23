/**
 * Types for Flash API (https://docs.api.flashapp.services).
 * Field names follow the API contract.
 */

export interface FlashEmployee {
  id: string;
  companyId: string;
  documentNumber?: string;
  name?: string;
  email?: string;
  corporateEmail?: string;
  externalId?: string;
  invitationDate?: string;
  phoneNumber?: string;
  managerId?: string;
  costCenterId?: string;
  profilePicture?: string;
  status?: string;
  groups?: unknown[];
  departments?: unknown[];
  roles?: unknown[];
  groupIds?: string[];
}

export interface FlashListEmployeesParams {
  page: number;
  limit?: number;
  order?: string;
  sortBy?: string;
  query?: string;
  companyId?: string;
  status?: string;
  roleId?: string;
  documentNumbers?: string;
  externalIds?: string;
}

export interface FlashListEmployeesMetadata {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface FlashListEmployeesResponse {
  records: FlashEmployee[];
  metadata: FlashListEmployeesMetadata;
}

export interface FlashCreateEmployeeRequest {
  companyId: string;
  documentNumber: string;
  name: string;
  email?: string;
  externalId?: string;
  invitationDate?: string;
  phoneNumber?: string;
  managerId?: string;
}

export interface FlashUpdateEmployeeRequest {
  companyId?: string;
  corporateEmail?: string;
  email?: string;
  externalId?: string;
  invitationDate?: string;
  name?: string;
  phoneNumber?: string;
  managerId?: string;
  costCenterId?: string;
}
