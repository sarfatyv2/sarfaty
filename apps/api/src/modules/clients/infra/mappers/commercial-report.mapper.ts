import { CommercialReportEntity } from '../../domain/commercial-report.entity';

export class CommercialReportMapper {
  static toDomain(row: any): CommercialReportEntity {
    return new CommercialReportEntity({
      id: row.id,
      clientId: row.clientId,
      createdBy: row.createdBy,
      
      visitDate: row.visitDate,
      reportDate: row.reportDate,
      proposalType: row.proposalType,
      
      installedCapacity: row.installedCapacity,
      utilizedCapacity: row.utilizedCapacity,
      productiveCapacity: row.productiveCapacity,
      mainClients: row.mainClients,
      mainSuppliers: row.mainSuppliers,
      inventory: row.inventory,
      
      grossPayroll: row.grossPayroll ? Number(row.grossPayroll) : null,
      accountsReceivable: row.accountsReceivable ? Number(row.accountsReceivable) : null,
      availableCash: row.availableCash ? Number(row.availableCash) : null,
      advancesToSuppliers: row.advancesToSuppliers ? Number(row.advancesToSuppliers) : null,
      advancesFromClients: row.advancesFromClients ? Number(row.advancesFromClients) : null,
      
      concentration: row.concentration ? Number(row.concentration) : null,
      concentrationDrawee: row.concentrationDrawee ? Number(row.concentrationDrawee) : null,
      
      salesPercentageCash: row.salesPercentageCash ? Number(row.salesPercentageCash) : null,
      salesPercentageTerm: row.salesPercentageTerm ? Number(row.salesPercentageTerm) : null,
      internalMarketPercentage: row.internalMarketPercentage ? Number(row.internalMarketPercentage) : null,
      externalMarketPercentage: row.externalMarketPercentage ? Number(row.externalMarketPercentage) : null,
      
      averagePaymentTerm: row.averagePaymentTerm,
      averageReceiptTerm: row.averageReceiptTerm,
      averageDeliveryTime: row.averageDeliveryTime,
      transportType: row.transportType,
      deliveredPercentage: row.deliveredPercentage ? Number(row.deliveredPercentage) : null,
      shippedPercentage: row.shippedPercentage ? Number(row.shippedPercentage) : null,
      deliveryProofType: row.deliveryProofType,
      hasCarrierSiteAccess: row.hasCarrierSiteAccess,
      
      paymentMethods: row.paymentMethods,
      receiptMethods: row.receiptMethods,
      
      tacValue: row.tacValue ? Number(row.tacValue) : null,
      tedValue: row.tedValue ? Number(row.tedValue) : null,
      boletoTariff: row.boletoTariff ? Number(row.boletoTariff) : null,
      notaryTerm: row.notaryTerm,
      expiredTitleTariff: row.expiredTitleTariff ? Number(row.expiredTitleTariff) : null,
      protestedTitleTariff: row.protestedTitleTariff ? Number(row.protestedTitleTariff) : null,
      sustainedTitleTariff: row.sustainedTitleTariff ? Number(row.sustainedTitleTariff) : null,
      
      commercialDefense: row.commercialDefense,
      
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(entity: CommercialReportEntity): any {
    return {
      id: entity.id,
      clientId: entity.clientId,
      createdBy: entity.createdBy,
      
      visitDate: entity.visitDate,
      reportDate: entity.reportDate,
      proposalType: entity.proposalType,
      
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