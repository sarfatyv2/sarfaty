import { Injectable } from '@nestjs/common';

export type IrpfDocumentClassification =
  | 'receipt'
  | 'declaration'
  | 'both'
  | 'unknown';

export interface IrpfClassification {
  type: IrpfDocumentClassification;
  label: string;
  hasNativeText: boolean;
}

const RECEIPT_ANCHOR = 'RECIBO DE ENTREGA';
const DECLARATION_ANCHOR = 'DECLARAÇÃO DE AJUSTE ANUAL';
const DECLARATION_ANCHOR_ASCII = 'DECLARACAO DE AJUSTE ANUAL';
const MIN_USEFUL_CHARS = 100;

@Injectable()
export class IrpfClassifierService {
  async classify(pdfBuffer: Buffer): Promise<IrpfClassification> {
    const text = await this.extractTextLayer(pdfBuffer);
    const normalized = text.toUpperCase();

    const hasReceipt = normalized.includes(RECEIPT_ANCHOR);
    const hasDeclaration =
      normalized.includes(DECLARATION_ANCHOR) ||
      normalized.includes(DECLARATION_ANCHOR_ASCII);
    const hasNativeText = text.length >= MIN_USEFUL_CHARS;

    if (hasReceipt && hasDeclaration) {
      return {
        type: 'both',
        label: 'Recibo de Entrega + Declaração de Ajuste Anual',
        hasNativeText,
      };
    }
    if (hasReceipt) {
      return { type: 'receipt', label: 'Recibo de Entrega', hasNativeText };
    }
    if (hasDeclaration) {
      return { type: 'declaration', label: 'Declaração de Ajuste Anual', hasNativeText };
    }
    return {
      type: 'unknown',
      label: 'Documento IRPF (tipo não identificado)',
      hasNativeText,
    };
  }

  private async extractTextLayer(pdfBuffer: Buffer): Promise<string> {
    try {
      // pdf-parse exports a function as the module default
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(pdfBuffer);
      return result.text ?? '';
    } catch {
      return '';
    }
  }
}
