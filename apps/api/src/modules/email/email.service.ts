import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { env } from '../../config/env';

export interface SendEmailInput {
  to: string;
  subject: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    if (env.SENDGRID_API_KEY) {
      sgMail.setApiKey(env.SENDGRID_API_KEY);
    }
  }

  isConfigured(): boolean {
    return Boolean(env.SENDGRID_API_KEY && env.SENDGRID_FROM_EMAIL);
  }

  async sendEmail(input: SendEmailInput): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('SendGrid not configured (SENDGRID_API_KEY / SENDGRID_FROM_EMAIL); skipping email');
      return;
    }

    if (input.templateId) {
      await sgMail.send({
        to: input.to,
        from: env.SENDGRID_FROM_EMAIL,
        subject: input.subject,
        templateId: input.templateId,
        dynamicTemplateData: input.dynamicTemplateData ?? {},
      });
      return;
    }

    if (!input.html) {
      throw new Error('sendEmail requires html or templateId');
    }

    await sgMail.send({
      to: input.to,
      from: env.SENDGRID_FROM_EMAIL,
      subject: input.subject,
      html: input.html,
    });
  }

  async sendBulkEmails(messages: SendEmailInput[]): Promise<void> {
    for (const message of messages) {
      await this.sendEmail(message);
    }
  }
}
