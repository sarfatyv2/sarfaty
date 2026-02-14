import { z } from 'zod';

export const emailSchema = z.string().email();

export const cpfSchema = z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido');

export const cnpjSchema = z.string().regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, 'CNPJ inválido');

export const phoneSchema = z.string().min(10).max(15);

export const uuidSchema = z.string().uuid();

export const dateStringSchema = z.string().date();
