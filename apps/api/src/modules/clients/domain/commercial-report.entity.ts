export type VisitReceiptMethodDetailRow = {
  receiptForm?: string | null;
  pmr?: number | null;
  salesPercent?: number | null;
};

export type SupplierPaymentDetailRow = {
  paymentForm?: string | null;
  purchasesPercent?: number | null;
  averagePaymentDays?: number | null;
};

export type CommercialReportProposalLine = {
  id: string;
  reportId: string;
  modality?: string | null;
  limitAmount?: number | null;
  guarantee?: string | null;
  rate?: string | null;
  concentrationPct?: number | null;
  term?: string | null;
  tranche?: string | null;
  tacValue?: number | null;
  boletoTariff?: number | null;
  tedValue?: number | null;
  serasa?: string | null;
  sortOrder: number;
  createdAt: Date;
};

export type CommercialReportGuarantorLine = {
  id: string;
  reportId: string;
  fullName: string;
  cpf?: string | null;
  sortOrder: number;
  createdAt: Date;
};

export type CommercialReportPropertyLine = {
  id: string;
  reportId: string;
  propertyName?: string | null;
  situation?: string | null;
  totalArea?: string | null;
  builtArea?: string | null;
  appraisedValue?: number | null;
  sortOrder: number;
  createdAt: Date;
};

export interface CommercialReportProps {
  id: string;
  clientId: string;
  createdBy: string;

  // Metadados
  visitDate?: string | null;
  reportDate?: string | null;
  proposalType?: string | null;

  employeeCount?: number | null;
  referralSource?: string | null;
  averageTicket?: string | null;
  operationNotes?: string | null;
  serasaNotes?: string | null;
  partnersNotes?: string | null;
  relatedCompaniesNotes?: string | null;
  mainProducts?: string | null;
  anticipaGrandesRedes?: boolean | null;
  anticipaGrandesRedesList?: string | null;
  preBillingPercentage?: number | null;
  cteDays?: number | null;
  salesSouthPercentage?: number | null;
  salesSoutheastPercentage?: number | null;
  salesNorthPercentage?: number | null;
  salesNortheastPercentage?: number | null;
  salesMidwestPercentage?: number | null;

  // Dados Produtivos
  installedCapacity?: string | null;
  utilizedCapacity?: string | null;
  productiveCapacity?: string | null;
  mainClients?: string | null;
  mainSuppliers?: string | null;
  inventory?: string | null;

  // Financeiro
  grossPayroll?: number | null;
  accountsReceivable?: number | null;
  availableCash?: number | null;
  advancesToSuppliers?: number | null;
  advancesFromClients?: number | null;
  inventoryValue?: number | null;
  banksBalance?: number | null;
  fundsBalance?: number | null;
  suppliersBalance?: number | null;

  receiptMethodsDetail?: VisitReceiptMethodDetailRow[] | null;
  externalReceiptMethodsDetail?: VisitReceiptMethodDetailRow[] | null;
  suppliersDetail?: SupplierPaymentDetailRow[] | null;

  // Concentração
  concentration?: number | null;
  concentrationDrawee?: number | null;

  // Vendas
  salesPercentageCash?: number | null;
  salesPercentageTerm?: number | null;
  internalMarketPercentage?: number | null;
  externalMarketPercentage?: number | null;

  // Logística e Prazos
  averagePaymentTerm?: number | null;
  averageReceiptTerm?: number | null;
  averageDeliveryTime?: number | null;
  transportType?: string | null;
  deliveredPercentage?: number | null;
  shippedPercentage?: number | null;
  deliveryProofType?: string | null;
  hasCarrierSiteAccess?: boolean | null;

  paymentMethods?: string | null;
  receiptMethods?: string | null;

  // Tarifas
  tacValue?: number | null;
  tedValue?: number | null;
  boletoTariff?: number | null;
  notaryTerm?: number | null;
  expiredTitleTariff?: number | null;
  protestedTitleTariff?: number | null;
  sustainedTitleTariff?: number | null;

  // Comercial
  commercialDefense?: string | null;

  proposals: CommercialReportProposalLine[];
  guarantors: CommercialReportGuarantorLine[];
  properties: CommercialReportPropertyLine[];

  createdAt: Date;
  updatedAt: Date;
}

export class CommercialReportEntity {
  private readonly props: CommercialReportProps;

  constructor(props: CommercialReportProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }
  get clientId() {
    return this.props.clientId;
  }
  get createdBy() {
    return this.props.createdBy;
  }
  get visitDate() {
    return this.props.visitDate;
  }
  get reportDate() {
    return this.props.reportDate;
  }
  get proposalType() {
    return this.props.proposalType;
  }
  get employeeCount() {
    return this.props.employeeCount;
  }
  get referralSource() {
    return this.props.referralSource;
  }
  get averageTicket() {
    return this.props.averageTicket;
  }
  get operationNotes() {
    return this.props.operationNotes;
  }
  get serasaNotes() {
    return this.props.serasaNotes;
  }
  get partnersNotes() {
    return this.props.partnersNotes;
  }
  get relatedCompaniesNotes() {
    return this.props.relatedCompaniesNotes;
  }
  get mainProducts() {
    return this.props.mainProducts;
  }
  get anticipaGrandesRedes() {
    return this.props.anticipaGrandesRedes;
  }
  get anticipaGrandesRedesList() {
    return this.props.anticipaGrandesRedesList;
  }
  get preBillingPercentage() {
    return this.props.preBillingPercentage;
  }
  get cteDays() {
    return this.props.cteDays;
  }
  get salesSouthPercentage() {
    return this.props.salesSouthPercentage;
  }
  get salesSoutheastPercentage() {
    return this.props.salesSoutheastPercentage;
  }
  get salesNorthPercentage() {
    return this.props.salesNorthPercentage;
  }
  get salesNortheastPercentage() {
    return this.props.salesNortheastPercentage;
  }
  get salesMidwestPercentage() {
    return this.props.salesMidwestPercentage;
  }
  get installedCapacity() {
    return this.props.installedCapacity;
  }
  get utilizedCapacity() {
    return this.props.utilizedCapacity;
  }
  get productiveCapacity() {
    return this.props.productiveCapacity;
  }
  get mainClients() {
    return this.props.mainClients;
  }
  get mainSuppliers() {
    return this.props.mainSuppliers;
  }
  get inventory() {
    return this.props.inventory;
  }
  get grossPayroll() {
    return this.props.grossPayroll;
  }
  get accountsReceivable() {
    return this.props.accountsReceivable;
  }
  get availableCash() {
    return this.props.availableCash;
  }
  get advancesToSuppliers() {
    return this.props.advancesToSuppliers;
  }
  get advancesFromClients() {
    return this.props.advancesFromClients;
  }
  get inventoryValue() {
    return this.props.inventoryValue;
  }
  get banksBalance() {
    return this.props.banksBalance;
  }
  get fundsBalance() {
    return this.props.fundsBalance;
  }
  get suppliersBalance() {
    return this.props.suppliersBalance;
  }
  get receiptMethodsDetail() {
    return this.props.receiptMethodsDetail;
  }
  get externalReceiptMethodsDetail() {
    return this.props.externalReceiptMethodsDetail;
  }
  get suppliersDetail() {
    return this.props.suppliersDetail;
  }
  get concentration() {
    return this.props.concentration;
  }
  get concentrationDrawee() {
    return this.props.concentrationDrawee;
  }
  get salesPercentageCash() {
    return this.props.salesPercentageCash;
  }
  get salesPercentageTerm() {
    return this.props.salesPercentageTerm;
  }
  get internalMarketPercentage() {
    return this.props.internalMarketPercentage;
  }
  get externalMarketPercentage() {
    return this.props.externalMarketPercentage;
  }
  get averagePaymentTerm() {
    return this.props.averagePaymentTerm;
  }
  get averageReceiptTerm() {
    return this.props.averageReceiptTerm;
  }
  get averageDeliveryTime() {
    return this.props.averageDeliveryTime;
  }
  get transportType() {
    return this.props.transportType;
  }
  get deliveredPercentage() {
    return this.props.deliveredPercentage;
  }
  get shippedPercentage() {
    return this.props.shippedPercentage;
  }
  get deliveryProofType() {
    return this.props.deliveryProofType;
  }
  get hasCarrierSiteAccess() {
    return this.props.hasCarrierSiteAccess;
  }
  get paymentMethods() {
    return this.props.paymentMethods;
  }
  get receiptMethods() {
    return this.props.receiptMethods;
  }
  get tacValue() {
    return this.props.tacValue;
  }
  get tedValue() {
    return this.props.tedValue;
  }
  get boletoTariff() {
    return this.props.boletoTariff;
  }
  get notaryTerm() {
    return this.props.notaryTerm;
  }
  get expiredTitleTariff() {
    return this.props.expiredTitleTariff;
  }
  get protestedTitleTariff() {
    return this.props.protestedTitleTariff;
  }
  get sustainedTitleTariff() {
    return this.props.sustainedTitleTariff;
  }
  get commercialDefense() {
    return this.props.commercialDefense;
  }
  get proposals() {
    return this.props.proposals;
  }
  get guarantors() {
    return this.props.guarantors;
  }
  get properties() {
    return this.props.properties;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      ...this.props,
    };
  }
}
