export interface CommercialReportProps {
  id: string;
  clientId: string;
  createdBy: string;
  
  // Metadados
  visitDate?: string | null;
  reportDate?: string | null;
  proposalType?: string | null;

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

  createdAt: Date;
  updatedAt: Date;
}

export class CommercialReportEntity {
  private readonly props: CommercialReportProps;

  constructor(props: CommercialReportProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get clientId() { return this.props.clientId; }
  get createdBy() { return this.props.createdBy; }
  get visitDate() { return this.props.visitDate; }
  get reportDate() { return this.props.reportDate; }
  get proposalType() { return this.props.proposalType; }
  get installedCapacity() { return this.props.installedCapacity; }
  get utilizedCapacity() { return this.props.utilizedCapacity; }
  get productiveCapacity() { return this.props.productiveCapacity; }
  get mainClients() { return this.props.mainClients; }
  get mainSuppliers() { return this.props.mainSuppliers; }
  get inventory() { return this.props.inventory; }
  get grossPayroll() { return this.props.grossPayroll; }
  get accountsReceivable() { return this.props.accountsReceivable; }
  get availableCash() { return this.props.availableCash; }
  get advancesToSuppliers() { return this.props.advancesToSuppliers; }
  get advancesFromClients() { return this.props.advancesFromClients; }
  get concentration() { return this.props.concentration; }
  get concentrationDrawee() { return this.props.concentrationDrawee; }
  get salesPercentageCash() { return this.props.salesPercentageCash; }
  get salesPercentageTerm() { return this.props.salesPercentageTerm; }
  get internalMarketPercentage() { return this.props.internalMarketPercentage; }
  get externalMarketPercentage() { return this.props.externalMarketPercentage; }
  get averagePaymentTerm() { return this.props.averagePaymentTerm; }
  get averageReceiptTerm() { return this.props.averageReceiptTerm; }
  get averageDeliveryTime() { return this.props.averageDeliveryTime; }
  get transportType() { return this.props.transportType; }
  get deliveredPercentage() { return this.props.deliveredPercentage; }
  get shippedPercentage() { return this.props.shippedPercentage; }
  get deliveryProofType() { return this.props.deliveryProofType; }
  get hasCarrierSiteAccess() { return this.props.hasCarrierSiteAccess; }
  get paymentMethods() { return this.props.paymentMethods; }
  get receiptMethods() { return this.props.receiptMethods; }
  get tacValue() { return this.props.tacValue; }
  get tedValue() { return this.props.tedValue; }
  get boletoTariff() { return this.props.boletoTariff; }
  get notaryTerm() { return this.props.notaryTerm; }
  get expiredTitleTariff() { return this.props.expiredTitleTariff; }
  get protestedTitleTariff() { return this.props.protestedTitleTariff; }
  get sustainedTitleTariff() { return this.props.sustainedTitleTariff; }
  get commercialDefense() { return this.props.commercialDefense; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  toJSON() {
    return {
      ...this.props,
    };
  }
}