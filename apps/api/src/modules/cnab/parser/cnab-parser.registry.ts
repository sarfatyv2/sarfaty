import { Injectable } from '@nestjs/common';
import type { CnabParserStrategy } from './cnab-parser.strategy';
import { BradescoParser } from './bradesco.parser';
import { BmpParser } from './bmp.parser';

@Injectable()
export class CnabParserRegistry {
  private readonly parsers = new Map<string, CnabParserStrategy>();

  constructor(
    private readonly bradescoParser: BradescoParser,
    private readonly bmpParser: BmpParser,
  ) {
    this.register(bradescoParser);
    this.register(bmpParser);
  }

  private register(parser: CnabParserStrategy): void {
    this.parsers.set(parser.bankCode, parser);
  }

  getParser(bankCode: string): CnabParserStrategy | null {
    return this.parsers.get(bankCode) ?? null;
  }

  detectBankCode(content: string): string | null {
    const firstLine = content.split(/\r?\n/)[0];
    if (!firstLine || firstLine.length < 79) return null;
    return firstLine.substring(76, 79).trim() || null;
  }
}
