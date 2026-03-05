export const CLIENT_DRAWEE_REPOSITORY = Symbol('CLIENT_DRAWEE_REPOSITORY');

export interface ClientDraweeRecord {
  id: string;
  clientId: string;
  draweeId: string;
  status: string;
  totalTitles: number;
  totalExposure: string;
  firstOperationAt: string | null;
  lastOperationAt: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ClientDraweeRepository {
  upsert(clientId: string, draweeId: string, titleCount: number, exposure: number, operationDate: string): Promise<ClientDraweeRecord>;
  findByClientId(clientId: string): Promise<ClientDraweeRecord[]>;
  findByDraweeId(draweeId: string): Promise<ClientDraweeRecord[]>;
}
