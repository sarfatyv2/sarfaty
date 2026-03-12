import { BadRequestException, Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../../../config/supabase';

const BUCKET_ID = 'client-documents';
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
]);

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

    const sanitized = file.originalName.replaceAll(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitized}`;
    const path = `${clientId}/${documentType}/${filename}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      const detail = (error as { statusCode?: string; error?: string }).statusCode
        ? `[${(error as { statusCode?: string }).statusCode}] ${error.message}`
        : error.message;
      throw new Error(`Falha ao enviar arquivo para o armazenamento: ${detail}. Verifique se o arquivo não está corrompido ou protegido por senha.`);
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

  async downloadDocument(path: string): Promise<Buffer> {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .download(path);

    if (error || !data) {
      throw new Error(`Storage download failed for path "${path}": ${error?.message ?? 'no data'}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
    const { data } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .createSignedUrl(path, expiresInSeconds);
    return data?.signedUrl ?? null;
  }

  private validateFile(buffer: Buffer, mimetype: string): void {
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(`File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
    }
    if (!ALLOWED_MIME_TYPES.has(mimetype)) {
      throw new BadRequestException('Invalid file type. Accepted: PDF, JPEG, PNG, WebP, XLS, XLSX');
    }
  }
}
