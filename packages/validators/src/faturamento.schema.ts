import { z } from 'zod';

export const faturamentoMonthlyRevenuesSchema = z.object({
  jan: z.number().nullable(),
  feb: z.number().nullable(),
  mar: z.number().nullable(),
  apr: z.number().nullable(),
  may: z.number().nullable(),
  jun: z.number().nullable(),
  jul: z.number().nullable(),
  aug: z.number().nullable(),
  sep: z.number().nullable(),
  oct: z.number().nullable(),
  nov: z.number().nullable(),
  dec: z.number().nullable(),
});

export const faturamentoRawExtractionSchema = z.object({
  cnpj: z.string().nullable(),
  cpf: z.string().nullable(),
  companyName: z.string().nullable(),
  year: z.number().nullable(),
  monthlyRevenues: faturamentoMonthlyRevenuesSchema.nullable(),
  totalAnnualRevenue: z.number().nullable(),
  documentDescription: z.string().nullable(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export type FaturamentoRawExtraction = z.infer<typeof faturamentoRawExtractionSchema>;
export type FaturamentoMonthlyRevenuesDto = z.infer<typeof faturamentoMonthlyRevenuesSchema>;
