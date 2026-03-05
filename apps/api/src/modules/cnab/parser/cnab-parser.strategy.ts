import type { CnabParseResult } from '@nexus/types';

export const CNAB_PARSER_STRATEGY = Symbol('CNAB_PARSER_STRATEGY');

export interface CnabParserStrategy {
  readonly bankCode: string;
  parse(content: string): CnabParseResult;
}
