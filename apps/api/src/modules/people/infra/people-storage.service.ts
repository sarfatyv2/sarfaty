import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../../../config/supabase';

const BUCKET_ID = 'collaborator-documents';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_INVOICE_MIME_TYPES = ['application/pdf'];
const ALLOWED_RECEIPT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export interface UploadResult {
  path: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class PeopleStorageService {
  async uploadInvoice(
    collaboratorId: string,
    year: number,
    month: number,
    file: { buffer: Buffer; originalName: string; mimetype: string },
  ): Promise<UploadResult> {
    this.validateFile(
      file.buffer,
      file.mimetype,
      ALLOWED_INVOICE_MIME_TYPES,
      'Invoice must be PDF',
    );

    const ext = file.originalName.includes('.') ? file.originalName.split('.').pop() : 'pdf';
    const sanitized = file.originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitized}`;
    const path = `invoices/${collaboratorId}/${year}-${month}/${filename}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return {
      path,
      size: file.buffer.length,
      mimeType: file.mimetype,
    };
  }

  async uploadReceipt(
    collaboratorId: string,
    reimbursementId: string,
    file: { buffer: Buffer; originalName: string; mimetype: string },
  ): Promise<UploadResult> {
    this.validateFile(
      file.buffer,
      file.mimetype,
      ALLOWED_RECEIPT_MIME_TYPES,
      'Receipt must be PDF or image (JPEG, PNG, WebP)',
    );

    const sanitized = file.originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitized}`;
    const path = `reimbursements/${collaboratorId}/${reimbursementId}/${filename}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return {
      path,
      size: file.buffer.length,
      mimeType: file.mimetype,
    };
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
    const { data } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .createSignedUrl(path, expiresInSeconds);
    return data?.signedUrl ?? null;
  }

  private validateFile(
    buffer: Buffer,
    mimetype: string,
    allowedTypes: string[],
    message: string,
  ): void {
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
    }
    if (!allowedTypes.includes(mimetype)) {
      throw new Error(message);
    }
  }
}
