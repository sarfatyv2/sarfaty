import {
  CommercialReportEntity,
  type CommercialReportGuarantorLine,
  type CommercialReportPropertyLine,
  type CommercialReportProposalLine,
  type SupplierPaymentDetailRow,
  type VisitReceiptMethodDetailRow,
} from '../../domain/commercial-report.entity';

function parseReceiptRows(value: unknown): VisitReceiptMethodDetailRow[] | null {
  if (value == null) return null;
  if (!Array.isArray(value)) return null;
  return value as VisitReceiptMethodDetailRow[];
}

function parseSupplierRows(value: unknown): SupplierPaymentDetailRow[] | null {
  if (value == null) return null;
  if (!Array.isArray(value)) return null;
  return value as SupplierPaymentDetailRow[];
}

function mapProposalRow(row: Record<string, unknown>): CommercialReportProposalLine {
  return {
    id: String(row.id),
    reportId: String(row.reportId),
    modality: row.modality != null ? String(row.modality) : null,
    limitAmount: row.limitAmount != null ? Number(row.limitAmount) : null,
    guarantee: row.guarantee != null ? String(row.guarantee) : null,
    rate: row.rate != null ? String(row.rate) : null,
    concentrationPct: row.concentrationPct != null ? Number(row.concentrationPct) : null,
    term: row.term != null ? String(row.term) : null,
    tranche: row.tranche != null ? String(row.tranche) : null,
    tacValue: row.tacValue != null ? Number(row.tacValue) : null,
    boletoTariff: row.boletoTariff != null ? Number(row.boletoTariff) : null,
    tedValue: row.tedValue != null ? Number(row.tedValue) : null,
    serasa: row.serasa != null ? String(row.serasa) : null,
    sortOrder: Number(row.sortOrder ?? 0),
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
  };
}

function mapGuarantorRow(row: Record<string, unknown>): CommercialReportGuarantorLine {
  return {
    id: String(row.id),
    reportId: String(row.reportId),
    fullName: String(row.fullName),
    cpf: row.cpf != null ? String(row.cpf) : null,
    sortOrder: Number(row.sortOrder ?? 0),
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
  };
}

function mapPropertyRow(row: Record<string, unknown>): CommercialReportPropertyLine {
  return {
    id: String(row.id),
    reportId: String(row.reportId),
    propertyName: row.propertyName != null ? String(row.propertyName) : null,
    situation: row.situation != null ? String(row.situation) : null,
    totalArea: row.totalArea != null ? String(row.totalArea) : null,
    builtArea: row.builtArea != null ? String(row.builtArea) : null,
    appraisedValue: row.appraisedValue != null ? Number(row.appraisedValue) : null,
    sortOrder: Number(row.sortOrder ?? 0),
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
  };
}

export class CommercialReportMapper {
  static toDomain(
    row: Record<string, unknown>,
    bundles: {
      proposals: Record<string, unknown>[];
      guarantors: Record<string, unknown>[];
      properties: Record<string, unknown>[];
    } = { proposals: [], guarantors: [], properties: [] },
  ): CommercialReportEntity {
    return new CommercialReportEntity({
      id: String(row.id),
      clientId: String(row.clientId),
      createdBy: String(row.createdBy),

      visitDate: row.visitDate != null ? String(row.visitDate) : null,
      reportDate: row.reportDate != null ? String(row.reportDate) : null,
      proposalType: row.proposalType != null ? String(row.proposalType) : null,

      employeeCount: row.employeeCount != null ? Number(row.employeeCount) : null,
      referralSource: row.referralSource != null ? String(row.referralSource) : null,
      averageTicket: row.averageTicket != null ? String(row.averageTicket) : null,
      operationNotes: row.operationNotes != null ? String(row.operationNotes) : null,
      serasaNotes: row.serasaNotes != null ? String(row.serasaNotes) : null,
      partnersNotes: row.partnersNotes != null ? String(row.partnersNotes) : null,
      relatedCompaniesNotes: row.relatedCompaniesNotes != null ? String(row.relatedCompaniesNotes) : null,
      mainProducts: row.mainProducts != null ? String(row.mainProducts) : null,
      anticipaGrandesRedes:
        row.anticipaGrandesRedes === true || row.anticipaGrandesRedes === false
          ? Boolean(row.anticipaGrandesRedes)
          : null,
      anticipaGrandesRedesList: row.anticipaGrandesRedesList != null ? String(row.anticipaGrandesRedesList) : null,
      preBillingPercentage: row.preBillingPercentage != null ? Number(row.preBillingPercentage) : null,
      cteDays: row.cteDays != null ? Number(row.cteDays) : null,
      salesSouthPercentage: row.salesSouthPercentage != null ? Number(row.salesSouthPercentage) : null,
      salesSoutheastPercentage: row.salesSoutheastPercentage != null ? Number(row.salesSoutheastPercentage) : null,
      salesNorthPercentage: row.salesNorthPercentage != null ? Number(row.salesNorthPercentage) : null,
      salesNortheastPercentage: row.salesNortheastPercentage != null ? Number(row.salesNortheastPercentage) : null,
      salesMidwestPercentage: row.salesMidwestPercentage != null ? Number(row.salesMidwestPercentage) : null,

      installedCapacity: row.installedCapacity != null ? String(row.installedCapacity) : null,
      utilizedCapacity: row.utilizedCapacity != null ? String(row.utilizedCapacity) : null,
      productiveCapacity: row.productiveCapacity != null ? String(row.productiveCapacity) : null,
      mainClients: row.mainClients != null ? String(row.mainClients) : null,
      mainSuppliers: row.mainSuppliers != null ? String(row.mainSuppliers) : null,
      inventory: row.inventory != null ? String(row.inventory) : null,

      grossPayroll: row.grossPayroll != null ? Number(row.grossPayroll) : null,
      accountsReceivable: row.accountsReceivable != null ? Number(row.accountsReceivable) : null,
      availableCash: row.availableCash != null ? Number(row.availableCash) : null,
      advancesToSuppliers: row.advancesToSuppliers != null ? Number(row.advancesToSuppliers) : null,
      advancesFromClients: row.advancesFromClients != null ? Number(row.advancesFromClients) : null,
      inventoryValue: row.inventoryValue != null ? Number(row.inventoryValue) : null,
      banksBalance: row.banksBalance != null ? Number(row.banksBalance) : null,
      fundsBalance: row.fundsBalance != null ? Number(row.fundsBalance) : null,
      suppliersBalance: row.suppliersBalance != null ? Number(row.suppliersBalance) : null,

      receiptMethodsDetail: parseReceiptRows(row.receiptMethodsDetail),
      externalReceiptMethodsDetail: parseReceiptRows(row.externalReceiptMethodsDetail),
      suppliersDetail: parseSupplierRows(row.suppliersDetail),

      concentration: row.concentration != null ? Number(row.concentration) : null,
      concentrationDrawee: row.concentrationDrawee != null ? Number(row.concentrationDrawee) : null,

      salesPercentageCash: row.salesPercentageCash != null ? Number(row.salesPercentageCash) : null,
      salesPercentageTerm: row.salesPercentageTerm != null ? Number(row.salesPercentageTerm) : null,
      internalMarketPercentage: row.internalMarketPercentage != null ? Number(row.internalMarketPercentage) : null,
      externalMarketPercentage: row.externalMarketPercentage != null ? Number(row.externalMarketPercentage) : null,

      averagePaymentTerm: row.averagePaymentTerm != null ? Number(row.averagePaymentTerm) : null,
      averageReceiptTerm: row.averageReceiptTerm != null ? Number(row.averageReceiptTerm) : null,
      averageDeliveryTime: row.averageDeliveryTime != null ? Number(row.averageDeliveryTime) : null,
      transportType: row.transportType != null ? String(row.transportType) : null,
      deliveredPercentage: row.deliveredPercentage != null ? Number(row.deliveredPercentage) : null,
      shippedPercentage: row.shippedPercentage != null ? Number(row.shippedPercentage) : null,
      deliveryProofType: row.deliveryProofType != null ? String(row.deliveryProofType) : null,
      hasCarrierSiteAccess:
        row.hasCarrierSiteAccess === true || row.hasCarrierSiteAccess === false
          ? Boolean(row.hasCarrierSiteAccess)
          : null,

      paymentMethods: row.paymentMethods != null ? String(row.paymentMethods) : null,
      receiptMethods: row.receiptMethods != null ? String(row.receiptMethods) : null,

      tacValue: row.tacValue != null ? Number(row.tacValue) : null,
      tedValue: row.tedValue != null ? Number(row.tedValue) : null,
      boletoTariff: row.boletoTariff != null ? Number(row.boletoTariff) : null,
      notaryTerm: row.notaryTerm != null ? Number(row.notaryTerm) : null,
      expiredTitleTariff: row.expiredTitleTariff != null ? Number(row.expiredTitleTariff) : null,
      protestedTitleTariff: row.protestedTitleTariff != null ? Number(row.protestedTitleTariff) : null,
      sustainedTitleTariff: row.sustainedTitleTariff != null ? Number(row.sustainedTitleTariff) : null,

      commercialDefense: row.commercialDefense != null ? String(row.commercialDefense) : null,

      proposals: bundles.proposals.map((p) => mapProposalRow(p)),
      guarantors: bundles.guarantors.map((g) => mapGuarantorRow(g)),
      properties: bundles.properties.map((p) => mapPropertyRow(p)),

      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(String(row.updatedAt)),
    });
  }

  /** Main row only (for INSERT — jsonb columns accept plain objects / arrays). */
  static toPersistenceMain(entity: CommercialReportEntity): Record<string, unknown> {
    return {
      id: entity.id,
      clientId: entity.clientId,
      createdBy: entity.createdBy,

      visitDate: entity.visitDate,
      reportDate: entity.reportDate,
      proposalType: entity.proposalType,

      employeeCount: entity.employeeCount,
      referralSource: entity.referralSource,
      averageTicket: entity.averageTicket,
      operationNotes: entity.operationNotes,
      serasaNotes: entity.serasaNotes,
      partnersNotes: entity.partnersNotes,
      relatedCompaniesNotes: entity.relatedCompaniesNotes,
      mainProducts: entity.mainProducts,
      anticipaGrandesRedes: entity.anticipaGrandesRedes,
      anticipaGrandesRedesList: entity.anticipaGrandesRedesList,
      preBillingPercentage: entity.preBillingPercentage?.toString(),
      cteDays: entity.cteDays,
      salesSouthPercentage: entity.salesSouthPercentage?.toString(),
      salesSoutheastPercentage: entity.salesSoutheastPercentage?.toString(),
      salesNorthPercentage: entity.salesNorthPercentage?.toString(),
      salesNortheastPercentage: entity.salesNortheastPercentage?.toString(),
      salesMidwestPercentage: entity.salesMidwestPercentage?.toString(),

      installedCapacity: entity.installedCapacity,
      utilizedCapacity: entity.utilizedCapacity,
      productiveCapacity: entity.productiveCapacity,
      mainClients: entity.mainClients,
      mainSuppliers: entity.mainSuppliers,
      inventory: entity.inventory,

      grossPayroll: entity.grossPayroll?.toString(),
      accountsReceivable: entity.accountsReceivable?.toString(),
      availableCash: entity.availableCash?.toString(),
      advancesToSuppliers: entity.advancesToSuppliers?.toString(),
      advancesFromClients: entity.advancesFromClients?.toString(),
      inventoryValue: entity.inventoryValue?.toString(),
      banksBalance: entity.banksBalance?.toString(),
      fundsBalance: entity.fundsBalance?.toString(),
      suppliersBalance: entity.suppliersBalance?.toString(),

      receiptMethodsDetail: entity.receiptMethodsDetail,
      externalReceiptMethodsDetail: entity.externalReceiptMethodsDetail,
      suppliersDetail: entity.suppliersDetail,

      concentration: entity.concentration?.toString(),
      concentrationDrawee: entity.concentrationDrawee?.toString(),

      salesPercentageCash: entity.salesPercentageCash?.toString(),
      salesPercentageTerm: entity.salesPercentageTerm?.toString(),
      internalMarketPercentage: entity.internalMarketPercentage?.toString(),
      externalMarketPercentage: entity.externalMarketPercentage?.toString(),

      averagePaymentTerm: entity.averagePaymentTerm,
      averageReceiptTerm: entity.averageReceiptTerm,
      averageDeliveryTime: entity.averageDeliveryTime,
      transportType: entity.transportType,
      deliveredPercentage: entity.deliveredPercentage?.toString(),
      shippedPercentage: entity.shippedPercentage?.toString(),
      deliveryProofType: entity.deliveryProofType,
      hasCarrierSiteAccess: entity.hasCarrierSiteAccess,

      paymentMethods: entity.paymentMethods,
      receiptMethods: entity.receiptMethods,

      tacValue: entity.tacValue?.toString(),
      tedValue: entity.tedValue?.toString(),
      boletoTariff: entity.boletoTariff?.toString(),
      notaryTerm: entity.notaryTerm,
      expiredTitleTariff: entity.expiredTitleTariff?.toString(),
      protestedTitleTariff: entity.protestedTitleTariff?.toString(),
      sustainedTitleTariff: entity.sustainedTitleTariff?.toString(),

      commercialDefense: entity.commercialDefense,
    };
  }
}
