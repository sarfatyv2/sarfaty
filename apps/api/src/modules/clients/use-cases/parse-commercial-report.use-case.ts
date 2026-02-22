import { Injectable, BadRequestException } from '@nestjs/common';
import { ExcelExtractionService } from '../infra/excel-extraction.service';
import type { CreateCommercialReportDto } from '@nexus/validators';

export interface ParseCommercialReportInput {
  file: { buffer: Buffer; originalName: string; mimetype: string };
}

@Injectable()
export class ParseCommercialReportUseCase {
  constructor(
    private readonly excelExtractionService: ExcelExtractionService,
  ) {}

  async execute(input: ParseCommercialReportInput): Promise<Partial<CreateCommercialReportDto>> {
    // Validação simples
    if (!input.file?.buffer) {
      throw new BadRequestException('File is missing or empty.');
    }
    
    // Suporta .xlsx, .xls, .xlsm, e o Excel padrão retorna application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    if (!/\.(xlsx|xls)$/i.exec(input.file.originalName) && !input.file.mimetype.includes('excel') && !input.file.mimetype.includes('spreadsheetml')) {
      throw new BadRequestException('File must be an Excel spreadsheet (.xlsx, .xls).');
    }

    const reportData = this.excelExtractionService.parseCommercialReport(input.file.buffer);
    
    return reportData;
  }
}