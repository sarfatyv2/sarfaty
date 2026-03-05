import { Injectable } from '@nestjs/common';
import type { CnabParsedHeader, CnabParsedDetail, CnabParseResult, CnabParseError } from '@nexus/types';
import type { CnabParserStrategy } from './cnab-parser.strategy';
import { substr, parseDate, parseCents } from './cnab400-utils';

/**
 * BMP Money Plus (code 274) follows the same base CNAB 400 layout as Bradesco
 * but includes an optional record type 2 right after each detail, carrying the
 * drawee e-mail address.
 */
@Injectable()
export class BmpParser implements CnabParserStrategy {
  readonly bankCode = '274';

  parse(content: string): CnabParseResult {
    const lines = content.split(/\r?\n/).filter((l) => l.length >= 2);
    const errors: CnabParseError[] = [];
    const details: CnabParsedDetail[] = [];
    let header: CnabParsedHeader | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const recordType = line.charAt(0);

      try {
        if (recordType === '0') {
          header = this.parseHeader(line);
        } else if (recordType === '1') {
          const detail = this.parseDetail(line);
          const nextLine = lines[i + 1];
          if (nextLine?.startsWith('2')) {
            detail.draweeEmail = substr(nextLine, 2, 100) || null;
            i++;
          }
          details.push(detail);
        }
      } catch (err) {
        errors.push({
          line: i + 1,
          message: err instanceof Error ? err.message : 'Unknown parse error',
          rawContent: line.substring(0, 100),
        });
      }
    }

    if (!header) {
      throw new Error('CNAB header (record type 0) not found');
    }

    return { header, details, totalRecords: details.length, errors };
  }

  private parseHeader(line: string): CnabParsedHeader {
    return {
      fileType: substr(line, 2, 8).toUpperCase() === 'REMESSA' ? 'remittance' : 'return',
      serviceCode: substr(line, 10, 11),
      cedentCode: substr(line, 27, 46),
      cedentName: substr(line, 47, 76),
      bankCode: substr(line, 77, 79),
      bankName: substr(line, 80, 94),
      remittanceDate: parseDate(substr(line, 95, 100)),
      sequentialNumber: Number.parseInt(substr(line, 111, 117), 10) || 0,
    };
  }

  private parseDetail(line: string): CnabParsedDetail {
    const draweeDocRaw = substr(line, 219, 220);
    const draweeDocType = draweeDocRaw === '01' ? 'cpf' : 'cnpj';

    return {
      recordSequence: Number.parseInt(substr(line, 395, 400), 10) || 0,
      cedentDocType: substr(line, 2, 3) === '01' ? 'cpf' : 'cnpj',
      cedentDoc: substr(line, 4, 17),
      ourNumber: substr(line, 111, 120),
      documentNumber: substr(line, 63, 76),
      portfolioCode: substr(line, 108, 110),
      dueDate: parseDate(substr(line, 121, 126)),
      faceValue: parseCents(substr(line, 127, 139)),
      bankCode: substr(line, 140, 142),
      branch: substr(line, 143, 147),
      speciesCode: substr(line, 148, 149),
      acceptance: substr(line, 150, 150),
      issueDate: parseDate(substr(line, 151, 156)),
      instruction1: substr(line, 157, 158),
      instruction2: substr(line, 159, 160),
      interestPerDay: parseCents(substr(line, 161, 173)),
      discountDeadline: parseDate(substr(line, 174, 179)) || null,
      discountValue: parseCents(substr(line, 180, 192)),
      iofValue: parseCents(substr(line, 193, 205)),
      penaltyValue: parseCents(substr(line, 206, 218)),
      draweeDocType,
      draweeDoc: substr(line, 221, 234),
      draweeName: substr(line, 235, 274),
      draweeAddress: substr(line, 275, 314),
      draweeNeighborhood: '',
      draweeZip: substr(line, 327, 334),
      draweeCity: substr(line, 335, 349),
      draweeState: substr(line, 350, 351),
      draweeEmail: null,
      rawLine: line,
    };
  }
}
