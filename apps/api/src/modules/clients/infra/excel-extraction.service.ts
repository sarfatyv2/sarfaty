import { Injectable, Logger } from '@nestjs/common';
import * as xlsx from 'xlsx';
import type { CreateCommercialReportDto } from '@nexus/validators';

@Injectable()
export class ExcelExtractionService {
  private readonly logger = new Logger(ExcelExtractionService.name);

  parseCommercialReport(buffer: Buffer): Partial<CreateCommercialReportDto> {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
      
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) return {};
      
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) return {};

      const data = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
      
      return this.extractFields(data);
    } catch (error) {
      this.logger.error('Erro ao fazer parse da planilha Excel', error);
      return {};
    }
  }

  private extractFields(rows: any[][]): Partial<CreateCommercialReportDto> {
    const report: Partial<CreateCommercialReportDto> = {};
    
    this.extractMetadata(report, rows);
    this.extractProductiveData(report, rows);
    this.extractFinancialData(report, rows);
    this.extractConcentration(report, rows);
    this.extractSalesAndMarket(report, rows);
    this.extractLogisticsAndTerms(report, rows);
    this.extractTariffs(report, rows);
    this.extractCommercialDefense(report, rows);

    return report;
  }

  private findValue(rows: any[][], label: string): string | undefined {
    const lowerLabel = label.toLowerCase();
    for (let r = 0; r < rows.length; r++) {
      if (!rows[r]) continue;
      
      const colIndex = rows[r]!.findIndex(cell => 
        typeof cell === 'string' && cell.trim().toLowerCase().includes(lowerLabel)
      );

      if (colIndex !== -1) {
        const rightValue = rows[r]![colIndex + 1];
        if (rightValue !== undefined && rightValue !== null && rightValue !== '') {
          return String(rightValue).trim();
        }

        const bottomValue = rows[r + 1]?.[colIndex];
        if (bottomValue !== undefined && bottomValue !== null && bottomValue !== '') {
          return String(bottomValue).trim();
        }
      }
    }
    return undefined;
  }

  private findNumber(rows: any[][], label: string): number | undefined {
    const val = this.findValue(rows, label);
    if (!val) return undefined;
    // Remove symbols like 'R$', '%', spaces and replace comma with dot
    const cleanVal = val.replace(/[R$\s%]/g, '').replaceAll('.', '').replaceAll(',', '.');
    const num = Number(cleanVal);
    return Number.isNaN(num) ? undefined : num;
  }

  private findDate(rows: any[][], label: string): string | undefined {
    const val = this.findValue(rows, label);
    if (!val) return undefined;
    
    // Se já veio como Date object (via cellDates: true do xlsx)
    if (!Number.isNaN(Number(val))) {
       // Número sequencial do Excel (dias desde 1900-01-01)
       const excelEpoch = new Date(1899, 11, 30);
       const date = new Date(excelEpoch.getTime() + Number(val) * 86400000);
       return date.toISOString().split('T')[0];
    }
    
    // Tenta formatar DD/MM/YYYY para YYYY-MM-DD
    const parts = val.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    const date = new Date(val);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return undefined;
  }

  private extractMetadata(report: Partial<CreateCommercialReportDto>, rows: any[][]): void {
    report.visitDate = this.findDate(rows, 'Data da Visita');
    report.reportDate = this.findDate(rows, 'Data do Relatório');
    report.proposalType = this.findValue(rows, 'Tipo de Proposta');
  }

  private extractProductiveData(report: Partial<CreateCommercialReportDto>, rows: any[][]): void {
    report.installedCapacity = this.findValue(rows, 'Capacidade Instalada');
    report.utilizedCapacity = this.findValue(rows, 'Capacidade Utilizada');
    report.productiveCapacity = this.findValue(rows, 'Capacidade Produtiva');
    report.mainClients = this.findValue(rows, 'Principais Clientes');
    report.mainSuppliers = this.findValue(rows, 'Principais Fornecedores');
    report.inventory = this.findValue(rows, 'Estoques');
  }

  private extractFinancialData(report: Partial<CreateCommercialReportDto>, rows: any[][]): void {
    report.grossPayroll = this.findNumber(rows, 'FOPAG Bruta');
    report.accountsReceivable = this.findNumber(rows, 'Contas à receber');
    report.availableCash = this.findNumber(rows, 'Disponível');
    report.advancesToSuppliers = this.findNumber(rows, 'Adiant. À Fornecedores');
    report.advancesFromClients = this.findNumber(rows, 'Adiant. À Clientes');
  }

  private extractConcentration(report: Partial<CreateCommercialReportDto>, rows: any[][]): void {
    report.concentration = this.findNumber(rows, 'Concentração');
    report.concentrationDrawee = this.findNumber(rows, 'Concentração - Sacado');
  }

  private extractSalesAndMarket(report: Partial<CreateCommercialReportDto>, rows: any[][]): void {
    report.salesPercentageCash = this.findNumber(rows, 'À Vista');
    report.salesPercentageTerm = this.findNumber(rows, 'À Prazo');
    report.internalMarketPercentage = this.findNumber(rows, 'Mercado Interno');
    report.externalMarketPercentage = this.findNumber(rows, 'Mercado Externo');
  }

  private extractLogisticsAndTerms(report: Partial<CreateCommercialReportDto>, rows: any[][]): void {
    report.averagePaymentTerm = this.findNumber(rows, 'Prazo médio de pagto');
    report.averageReceiptTerm = this.findNumber(rows, 'Prazo Médio de Entrega'); 
    report.averageDeliveryTime = this.findNumber(rows, 'Prazo Médio de Entrega');
    report.transportType = this.findValue(rows, 'Transporte terceirizado ou próprio');
    report.deliveredPercentage = this.findNumber(rows, '% Entregue');
    report.shippedPercentage = this.findNumber(rows, '% Embarcado');
    report.deliveryProofType = this.findValue(rows, 'Tipo comprovante de entrega');
    report.hasCarrierSiteAccess = this.findValue(rows, 'Tem acesso ao site da transportadora')?.toLowerCase().includes('sim');
    report.paymentMethods = this.findValue(rows, 'Forma de pagamento');
    report.receiptMethods = this.findValue(rows, 'Forma de recebimento');
  }

  private extractTariffs(report: Partial<CreateCommercialReportDto>, rows: any[][]): void {
    report.tacValue = this.findNumber(rows, 'TAC');
    report.tedValue = this.findNumber(rows, 'TED');
    report.boletoTariff = this.findNumber(rows, 'Tar. Boleto');
    report.notaryTerm = this.findNumber(rows, 'Prazo de Cartório');
    report.expiredTitleTariff = this.findNumber(rows, 'Tarifa de título vencido');
    report.protestedTitleTariff = this.findNumber(rows, 'Tarifa de título protestado');
    report.sustainedTitleTariff = this.findNumber(rows, 'Tarifa de sustação');
  }

  private extractCommercialDefense(report: Partial<CreateCommercialReportDto>, rows: any[][]): void {
    for (let r = 0; r < rows.length; r++) {
      if (!rows[r]) continue;
      
      const colIndex = rows[r]!.findIndex(cell => 
        typeof cell === 'string' && cell.includes('Modus Operandi / Histórico da empresa')
      );

      if (colIndex !== -1) {
        const lines: string[] = [];
        for (let nr = r + 1; nr < r + 15; nr++) {
          if (rows[nr]?.[colIndex]) {
            lines.push(String(rows[nr]?.[colIndex]));
          }
        }
        if (lines.length > 0) {
          report.commercialDefense = lines.join('\n');
        }
        return;
      }
    }
  }
}