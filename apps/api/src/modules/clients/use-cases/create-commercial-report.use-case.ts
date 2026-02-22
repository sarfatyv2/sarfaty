import { Injectable, Inject } from '@nestjs/common';
import { COMMERCIAL_REPORT_REPOSITORY, CommercialReportRepository } from '../domain/commercial-report.repository';
import { CommercialReportEntity } from '../domain/commercial-report.entity';
import type { CreateCommercialReportDto } from '@nexus/validators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateCommercialReportUseCase {
  constructor(
    @Inject(COMMERCIAL_REPORT_REPOSITORY)
    private readonly commercialReportRepository: CommercialReportRepository,
  ) {}

  async execute(clientId: string, userId: string, dto: CreateCommercialReportDto) {
    const entity = new CommercialReportEntity({
      id: uuidv4(),
      clientId,
      createdBy: userId,
      
      visitDate: dto.visitDate ?? null,
      reportDate: dto.reportDate ?? null,
      proposalType: dto.proposalType ?? null,
      
      installedCapacity: dto.installedCapacity ?? null,
      utilizedCapacity: dto.utilizedCapacity ?? null,
      productiveCapacity: dto.productiveCapacity ?? null,
      mainClients: dto.mainClients ?? null,
      mainSuppliers: dto.mainSuppliers ?? null,
      inventory: dto.inventory ?? null,
      
      grossPayroll: dto.grossPayroll ?? null,
      accountsReceivable: dto.accountsReceivable ?? null,
      availableCash: dto.availableCash ?? null,
      advancesToSuppliers: dto.advancesToSuppliers ?? null,
      advancesFromClients: dto.advancesFromClients ?? null,
      
      concentration: dto.concentration ?? null,
      concentrationDrawee: dto.concentrationDrawee ?? null,
      
      salesPercentageCash: dto.salesPercentageCash ?? null,
      salesPercentageTerm: dto.salesPercentageTerm ?? null,
      internalMarketPercentage: dto.internalMarketPercentage ?? null,
      externalMarketPercentage: dto.externalMarketPercentage ?? null,
      
      averagePaymentTerm: dto.averagePaymentTerm ?? null,
      averageReceiptTerm: dto.averageReceiptTerm ?? null,
      averageDeliveryTime: dto.averageDeliveryTime ?? null,
      transportType: dto.transportType ?? null,
      deliveredPercentage: dto.deliveredPercentage ?? null,
      shippedPercentage: dto.shippedPercentage ?? null,
      deliveryProofType: dto.deliveryProofType ?? null,
      hasCarrierSiteAccess: dto.hasCarrierSiteAccess ?? null,
      
      paymentMethods: dto.paymentMethods ?? null,
      receiptMethods: dto.receiptMethods ?? null,
      
      tacValue: dto.tacValue ?? null,
      tedValue: dto.tedValue ?? null,
      boletoTariff: dto.boletoTariff ?? null,
      notaryTerm: dto.notaryTerm ?? null,
      expiredTitleTariff: dto.expiredTitleTariff ?? null,
      protestedTitleTariff: dto.protestedTitleTariff ?? null,
      sustainedTitleTariff: dto.sustainedTitleTariff ?? null,
      
      commercialDefense: dto.commercialDefense ?? null,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.commercialReportRepository.save(entity);
    return saved.toJSON();
  }
}