import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import type { PjInvoiceRepository } from '../domain/pj-invoice.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';
import type { CollaboratorRepository } from '../domain/collaborator.repository';
import { COLLABORATOR_REPOSITORY } from '../domain/collaborator.repository';
import type { BillingCompanyRepository } from '../domain/billing-company.repository';
import { BILLING_COMPANY_REPOSITORY } from '../domain/billing-company.repository';
import type { Collaborator } from '../domain/collaborator.entity';
import { EmailService } from '../../email/email.service';
import { env } from '../../../config/env';
import {
  buildPjInvoiceAssignmentEmailHtml,
  buildPjInvoiceAssignmentEmailSubject,
} from '../templates/pj-invoice-assignment-email.template';

export interface AssignInvoiceBillingCompaniesInput {
  referenceMonth: number;
  referenceYear: number;
  assignments: Array<{
    billingCompanyId: string;
    collaboratorIds: string[];
  }>;
}

export interface AssignInvoiceBillingCompaniesResult {
  assigned: number;
  emailsSent: number;
  emailsSkippedNoAddress: number;
}

@Injectable()
export class AssignInvoiceBillingCompaniesUseCase {
  private readonly logger = new Logger(AssignInvoiceBillingCompaniesUseCase.name);

  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
    @Inject(BILLING_COMPANY_REPOSITORY)
    private readonly billingCompanyRepository: BillingCompanyRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: AssignInvoiceBillingCompaniesInput): Promise<AssignInvoiceBillingCompaniesResult> {
    const allCollaboratorIds = input.assignments.flatMap((a) => a.collaboratorIds);
    const collaborators = await this.collaboratorRepository.findByIds(allCollaboratorIds);
    const collaboratorById = new Map(collaborators.map((c) => [c.id, c]));

    const assigned = await this.persistAssignments(input, collaboratorById);

    if (!this.emailService.isConfigured()) {
      this.logger.warn('SendGrid not configured; skipping invoice assignment emails');
      return { assigned, emailsSent: 0, emailsSkippedNoAddress: 0 };
    }

    const { emailsSent, emailsSkippedNoAddress } = await this.sendAssignmentEmails(
      input,
      collaboratorById,
    );

    return { assigned, emailsSent, emailsSkippedNoAddress };
  }

  private async persistAssignments(
    input: AssignInvoiceBillingCompaniesInput,
    collaboratorById: Map<string, Collaborator>,
  ): Promise<number> {
    let assigned = 0;
    for (const group of input.assignments) {
      const billingCompany = await this.billingCompanyRepository.findById(group.billingCompanyId);
      if (!billingCompany) {
        throw new BadRequestException(`Billing company not found: ${group.billingCompanyId}`);
      }
      if (!billingCompany.isActive) {
        throw new BadRequestException(`Billing company is inactive: ${group.billingCompanyId}`);
      }

      for (const collaboratorId of group.collaboratorIds) {
        const collaborator = collaboratorById.get(collaboratorId);
        this.assertCollaboratorEligible(collaboratorId, collaborator);

        let invoice = await this.invoiceRepository.findByCollaboratorAndPeriod(
          collaboratorId,
          input.referenceMonth,
          input.referenceYear,
        );

        if (!invoice) {
          invoice = await this.invoiceRepository.create({
            collaboratorId,
            referenceMonth: input.referenceMonth,
            referenceYear: input.referenceYear,
            invoiceAmount: '0',
            status: 'pending_upload',
          });
        }

        await this.invoiceRepository.update(invoice.id, {
          billingCompanyId: billingCompany.id,
        });
        assigned += 1;
      }
    }
    return assigned;
  }

  private assertCollaboratorEligible(
    collaboratorId: string,
    collaborator: Collaborator | undefined,
  ): asserts collaborator is Collaborator {
    if (!collaborator) {
      throw new BadRequestException(`Collaborator not found: ${collaboratorId}`);
    }
    if (collaborator.employmentType !== 'pj') {
      throw new BadRequestException(`Collaborator ${collaborator.fullName} is not PJ`);
    }
    if (!collaborator.isActive) {
      throw new BadRequestException(`Collaborator ${collaborator.fullName} is not active`);
    }
  }

  private async sendAssignmentEmails(
    input: AssignInvoiceBillingCompaniesInput,
    collaboratorById: Map<string, Collaborator>,
  ): Promise<{ emailsSent: number; emailsSkippedNoAddress: number }> {
    let emailsSent = 0;
    let emailsSkippedNoAddress = 0;

    for (const group of input.assignments) {
      const billingCompany = await this.billingCompanyRepository.findById(group.billingCompanyId);
      if (!billingCompany) {
        continue;
      }

      for (const collaboratorId of group.collaboratorIds) {
        const collaborator = collaboratorById.get(collaboratorId);
        if (!collaborator) {
          continue;
        }

        const invoice = await this.invoiceRepository.findByCollaboratorAndPeriod(
          collaboratorId,
          input.referenceMonth,
          input.referenceYear,
        );
        if (!invoice) {
          continue;
        }

        const toEmail = collaborator.personalEmail?.trim() || collaborator.corporateEmail?.trim();
        if (!toEmail) {
          this.logger.warn(
            `No email for collaborator ${collaborator.id}; skipping invoice assignment email`,
          );
          emailsSkippedNoAddress += 1;
          continue;
        }

        await this.sendOneAssignmentEmail(input, collaborator, billingCompany, toEmail);

        await this.invoiceRepository.update(invoice.id, {
          emailNotifiedAt: new Date(),
        });
        emailsSent += 1;
      }
    }

    return { emailsSent, emailsSkippedNoAddress };
  }

  private async sendOneAssignmentEmail(
    input: AssignInvoiceBillingCompaniesInput,
    collaborator: Collaborator,
    billingCompany: { name: string; cnpj: string },
    toEmail: string,
  ): Promise<void> {
    const subject = buildPjInvoiceAssignmentEmailSubject(input.referenceMonth, input.referenceYear);
    const templateId = env.SENDGRID_INVOICE_TEMPLATE_ID;

    if (templateId) {
      await this.emailService.sendEmail({
        to: toEmail,
        subject,
        templateId,
        dynamicTemplateData: {
          collaborator_name: collaborator.fullName,
          billing_company_name: billingCompany.name,
          billing_company_cnpj: billingCompany.cnpj,
          reference_month_year: `${input.referenceMonth}/${input.referenceYear}`,
          deadline: '',
        },
      });
      return;
    }

    const html = buildPjInvoiceAssignmentEmailHtml({
      collaboratorName: collaborator.fullName,
      billingCompanyName: billingCompany.name,
      billingCompanyCnpjDigits: billingCompany.cnpj,
      referenceMonth: input.referenceMonth,
      referenceYear: input.referenceYear,
    });
    await this.emailService.sendEmail({
      to: toEmail,
      subject,
      html,
    });
  }
}
