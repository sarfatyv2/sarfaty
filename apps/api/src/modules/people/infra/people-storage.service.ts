import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../../../config/supabase';
import { env } from '../../../config/env';

const BUCKET_ID = 'collaborator-documents';
const AVATAR_BUCKET_ID = 'avatars';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_INVOICE_MIME_TYPES = ['application/pdf'];
const ALLOWED_RECEIPT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];
const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

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

  async uploadAvatar(
    profileId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<string> {
    this.validateFile(
      file.buffer,
      file.mimetype,
      ALLOWED_AVATAR_MIME_TYPES,
      'Avatar must be an image (JPEG, PNG, or WebP)',
      MAX_AVATAR_SIZE_BYTES,
    );

    const ext = MIME_TO_EXT[file.mimetype] ?? 'jpg';
    const path = `${profileId}/avatar.${ext}`;

    // Remove any existing avatar files for this profile
    const { data: existingFiles } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET_ID)
      .list(profileId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map((f) => `${profileId}/${f.name}`);
      await supabaseAdmin.storage.from(AVATAR_BUCKET_ID).remove(filesToRemove);
    }

    const { error } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET_ID)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }

    const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET_ID}/${path}`;
    return publicUrl;
  }

  async deleteAvatar(profileId: string): Promise<void> {
    const { data: existingFiles } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET_ID)
      .list(profileId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map((f) => `${profileId}/${f.name}`);
      await supabaseAdmin.storage.from(AVATAR_BUCKET_ID).remove(filesToRemove);
    }
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
    maxSize: number = MAX_FILE_SIZE_BYTES,
  ): void {
    if (buffer.length > maxSize) {
      throw new Error(`File exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
    }
    if (!allowedTypes.includes(mimetype)) {
      throw new Error(message);
    }
  }
}
