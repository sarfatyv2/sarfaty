export type BadgeType = 'success' | 'danger' | 'warning' | 'neutral';

export interface VaduPersonResult {
  id: string;
  authorizedPersonId: string | null;
  cpf: string;
  name: string | null;
  birthDate: string | null;
  motherName: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: any;
  queriedAt: string;
}

export interface VaduCompanyResult {
  id: string;
  cnpj: string;
  companyName: string | null;
  tradeName: string | null;
  revenueStatus: string | null;
  revenueStatusDate: string | null;
  specialStatus: string | null;
  capitalSocial: string | null;
  legalNature: string | null;
  isSimplesNacional: boolean | null;
  companySize: string | null;
  environmentalScore: number | null;
  environmentalLevel: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: any;
  queriedAt: string;
}

export interface VaduResultsOutput {
  company: VaduCompanyResult | null;
  persons: VaduPersonResult[];
}

export interface CreditboxReport {
  id: string;
  clientId: string;
  processId: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  reportJson: Record<string, unknown> | null;
  pdfBase64: string | null;
  errorMessage: string | null;
  requestedAt: string;
  completedAt: string | null;
}

export interface SerasaReportData {
  id: string;
  clientId: string;
  cnpj: string;
  reportName: string;
  optionalFeatures: string[] | null;
  statusCode: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawResponse: any;
  errorMessage: string | null;
  requestId: string | null;
  createdAt: string;
}

export type ComplianceCheckName =
  | 'cgu' | 'pep' | 'pgfn' | 'cndt'
  | 'addressValidation' | 'sanctions' | 'slaveLaborCheck'
  | 'negativeMedia' | 'digitalPresence';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ComplianceResults {
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR' | 'PENDING';
  pendingChecks: ComplianceCheckName[];
  cgu: {
    ceis: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: any; queriedAt: string | null };
    cnep: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: any; queriedAt: string | null };
    cepim: { hasMatch: boolean; matchCount: number; summary: string | null; rawData: any; queriedAt: string | null };
  };
  pep: Array<{
    cpf: string; personName: string | null; hasMatch: boolean;
    matchedRole: string | null; matchedOrg: string | null; rawData: any; queriedAt: string | null;
  }>;
  pgfn: { hasDebt: boolean; totalDebtAmount: number | null; debtCount: number; summary: string | null; rawData: any; queriedAt: string | null } | null;
  cndt: { certificateStatus: string; certificateNumber: string | null; validUntil: string | null; rawData: any; queriedAt: string | null } | null;
  addressValidation: {
    cep: string | null; isValid: boolean; street: string | null; neighborhood: string | null;
    city: string | null; state: string | null; matchesRegistered: boolean | null; rawData: any; queriedAt: string | null;
  } | null;
  sanctions: Array<{
    entityName: string | null; source: string; hasMatch: boolean;
    matchScore: number | null; matchDetails: string | null; rawData: any; queriedAt: string | null;
  }>;
  slaveLaborCheck: {
    hasMatch: boolean; employerName: string | null; rescuedWorkers: number | null;
    inspectionDate: string | null; rawData: any; queriedAt: string | null;
  } | null;
  negativeMedia: Array<{
    id: string; riskLevel: string; findingsCount: number;
    findings: Array<{
      category: string; title: string; snippet: string;
      sourceUrl: string | null; sourceName: string | null; date: string | null;
    }>;
    summary: string | null; groundingSources: Array<{ uri: string; title: string }>;
    queriedAt: string;
  }>;
  digitalPresence: {
    domain: string | null; emailType: string;
    hasDns: boolean; hasActiveSite: boolean;
    siteTitle: string | null; queriedAt: string | null;
  } | null;
}
