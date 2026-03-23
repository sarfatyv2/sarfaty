import { z } from 'zod';
import { uuidSchema } from './common';

export const createBillingCompanySchema = z.object({
  name: z.string().min(1).max(500),
  tradeName: z.string().max(500).nullable().optional(),
  cnpj: z.string().min(14).max(18),
  isActive: z.boolean().optional().default(true),
});

export const updateBillingCompanySchema = z.object({
  name: z.string().min(1).max(500).optional(),
  tradeName: z.string().max(500).nullable().optional(),
  cnpj: z.string().min(14).max(18).optional(),
  isActive: z.boolean().optional(),
});

export const assignInvoiceBillingCompaniesSchema = z
  .object({
    referenceMonth: z.number().int().min(1).max(12),
    referenceYear: z.number().int().min(2024),
    assignments: z
      .array(
        z.object({
          billingCompanyId: uuidSchema,
          collaboratorIds: z.array(uuidSchema).min(1),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    const seenCollaboratorIds = new Set<string>();
    for (const assignment of data.assignments) {
      for (const collaboratorId of assignment.collaboratorIds) {
        if (seenCollaboratorIds.has(collaboratorId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Each collaborator may appear only once across assignments',
            path: ['assignments'],
          });
          return;
        }
        seenCollaboratorIds.add(collaboratorId);
      }
    }
  });

export type CreateBillingCompanyDto = z.infer<typeof createBillingCompanySchema>;
export type UpdateBillingCompanyDto = z.infer<typeof updateBillingCompanySchema>;
export type AssignInvoiceBillingCompaniesDto = z.infer<typeof assignInvoiceBillingCompaniesSchema>;
