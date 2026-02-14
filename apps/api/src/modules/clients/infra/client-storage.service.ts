import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../../../config/supabase';

const BUCKET_ID = 'client-documents';
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_MIME_TYPES = [
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
export class ClientStorageService {
  async uploadDocument(
    clientId: string,
    documentType: string,
    file: { buffer: Buffer; originalName: string; mimetype: string },
  ): Promise<UploadResult> {
    this.validateFile(file.buffer, file.mimetype);

    const sanitized = file.originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitized}`;
    const path = `${clientId}/${documentType}/${filename}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
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

  async deleteDocument(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .remove([path]);

    if (error) {
      throw new Error(`Storage delete failed: ${error.message}`);
    }
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
    const { data } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .createSignedUrl(path, expiresInSeconds);
    return data?.signedUrl ?? null;
  }

  private validateFile(buffer: Buffer, mimetype: string): void {
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
    }
    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      throw new Error('Invalid file type. Accepted: PDF, JPEG, PNG, WebP');
    }
  }
}
