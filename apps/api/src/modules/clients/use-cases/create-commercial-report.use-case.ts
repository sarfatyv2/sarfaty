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
    const reportId = uuidv4();
    const now = new Date();

    const nonEmptyProposals = (dto.proposals ?? []).filter((p) => {
      const hasText = [p.modality, p.guarantee, p.rate, p.term, p.tranche, p.serasa].some(
        (v) => v != null && String(v).trim().length > 0,
      );
      const hasNumber =
        p.limitAmount != null ||
        p.concentrationPct != null ||
        p.tacValue != null ||
        p.boletoTariff != null ||
        p.tedValue != null;
      return hasText || hasNumber;
    });

    const proposalLines = nonEmptyProposals.map((p, index) => ({
      id: uuidv4(),
      reportId,
      modality: p.modality ?? null,
      limitAmount: p.limitAmount ?? null,
      guarantee: p.guarantee ?? null,
      rate: p.rate ?? null,
      concentrationPct: p.concentrationPct ?? null,
      term: p.term ?? null,
      tranche: p.tranche ?? null,
      tacValue: p.tacValue ?? null,
      boletoTariff: p.boletoTariff ?? null,
      tedValue: p.tedValue ?? null,
      serasa: p.serasa ?? null,
      sortOrder: index,
      createdAt: now,
    }));

    const guarantorLines = (dto.guarantors ?? [])
      .filter((g) => (g.fullName ?? '').trim().length > 0)
      .map((g, index) => ({
        id: uuidv4(),
        reportId,
        fullName: (g.fullName ?? '').trim(),
        cpf: g.cpf ?? null,
        sortOrder: index,
        createdAt: now,
      }));

    const propertyLines = (dto.properties ?? [])
      .filter(
        (prop) =>
          (prop.propertyName ?? '').trim().length > 0 ||
          (prop.situation ?? '').trim().length > 0 ||
          (prop.totalArea ?? '').trim().length > 0 ||
          (prop.builtArea ?? '').trim().length > 0 ||
          prop.appraisedValue != null,
      )
      .map((prop, index) => ({
        id: uuidv4(),
        reportId,
        propertyName: prop.propertyName ?? null,
        situation: prop.situation ?? null,
        totalArea: prop.totalArea ?? null,
        builtArea: prop.builtArea ?? null,
        appraisedValue: prop.appraisedValue ?? null,
        sortOrder: index,
        createdAt: now,
      }));

    const entity = new CommercialReportEntity({
      id: reportId,
      clientId,
      createdBy: userId,

      visitDate: dto.visitDate ?? null,
      reportDate: dto.reportDate ?? null,
      proposalType: dto.proposalType ?? null,

      employeeCount: dto.employeeCount ?? null,
      referralSource: dto.referralSource ?? null,
      averageTicket: dto.averageTicket ?? null,
      operationNotes: dto.operationNotes ?? null,
      serasaNotes: dto.serasaNotes ?? null,
      partnersNotes: dto.partnersNotes ?? null,
      relatedCompaniesNotes: dto.relatedCompaniesNotes ?? null,
      mainProducts: dto.mainProducts ?? null,
      anticipaGrandesRedes: dto.anticipaGrandesRedes ?? null,
      anticipaGrandesRedesList: dto.anticipaGrandesRedesList ?? null,
      preBillingPercentage: dto.preBillingPercentage ?? null,
      cteDays: dto.cteDays ?? null,
      salesSouthPercentage: dto.salesSouthPercentage ?? null,
      salesSoutheastPercentage: dto.salesSoutheastPercentage ?? null,
      salesNorthPercentage: dto.salesNorthPercentage ?? null,
      salesNortheastPercentage: dto.salesNortheastPercentage ?? null,
      salesMidwestPercentage: dto.salesMidwestPercentage ?? null,

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
      inventoryValue: dto.inventoryValue ?? null,
      banksBalance: dto.banksBalance ?? null,
      fundsBalance: dto.fundsBalance ?? null,
      suppliersBalance: dto.suppliersBalance ?? null,

      receiptMethodsDetail: dto.receiptMethodsDetail ?? null,
      externalReceiptMethodsDetail: dto.externalReceiptMethodsDetail ?? null,
      suppliersDetail: dto.suppliersDetail ?? null,

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

      proposals: proposalLines,
      guarantors: guarantorLines,
      properties: propertyLines,

      createdAt: now,
      updatedAt: now,
    });

    const saved = await this.commercialReportRepository.save(entity);
    return saved.toJSON();
  }
}
