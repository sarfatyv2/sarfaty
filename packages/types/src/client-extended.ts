export interface ClientContact {
  id: string;
  clientId: string;
  contactName: string | null;
  useType: string | null;  // 'commercial' | 'financial' | 'operational' | 'billing'
  email: string | null;
  emailSecondary: string | null;
  phone: string | null;
  phoneMobile: string | null;
  phoneSms: string | null;
  whatsapp: boolean;
  homepage: string | null;
  notes: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ClientAddress {
  id: string;
  clientId: string;
  useType: string | null;  // 'commercial' | 'fiscal' | 'correspondence' | 'billing'
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

export interface ClientBankAccount {
  id: string;
  clientId: string;
  bankCode: string | null;
  bankName: string | null;
  branch: string | null;
  accountNumber: string | null;
  accountType: string | null;  // 'checking' | 'savings' | 'payment'
  pixKey: string | null;
  nickname: string | null;
  openedAt: string | null;
  closedAt: string | null;
  status: string;
  isPrimary: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ClientAuthorizedPerson {
  id: string;
  clientId: string;
  authorizationType: string | null;  // 'partner' | 'attorney' | 'legal_representative' | 'authorized'
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
