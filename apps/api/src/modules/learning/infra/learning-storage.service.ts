import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../../../config/supabase';

const BUCKET_ID = 'learning-materials';
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export interface UploadResult {
  storagePath: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class LearningStorageService {
  async uploadMaterial(
    courseId: string,
    lessonId: string,
    file: { buffer: Buffer; originalName: string; mimetype: string },
  ): Promise<UploadResult> {
    this.validateFile(file.buffer, file.mimetype);

    const sanitized = file.originalName.replaceAll(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitized}`;
    const storagePath = `${courseId}/${lessonId}/${filename}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return {
      storagePath,
      size: file.buffer.length,
      mimeType: file.mimetype,
    };
  }

  async deleteMaterial(storagePath: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .remove([storagePath]);

    if (error) {
      throw new Error(`Storage delete failed: ${error.message}`);
    }
  }

  async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string | null> {
    const { data } = await supabaseAdmin.storage
      .from(BUCKET_ID)
      .createSignedUrl(storagePath, expiresInSeconds);
    return data?.signedUrl ?? null;
  }

  private validateFile(buffer: Buffer, mimetype: string): void {
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
    }

    const normalizedMimeType = this.normalizeMimeType(mimetype);
    const detectedMimeType = this.detectMimeTypeFromMagicBytes(buffer);

    if (!detectedMimeType) {
      throw new Error('Invalid file content signature');
    }

    if (!ALLOWED_MIME_TYPES.has(detectedMimeType)) {
      throw new Error('Invalid file type. Accepted: PDF, JPEG, PNG, WebP');
    }

    if (normalizedMimeType && normalizedMimeType !== detectedMimeType) {
      throw new Error('File MIME type does not match file content');
    }
  }

  private normalizeMimeType(mimetype: string): string {
    const normalizedMimeType = mimetype.trim().toLowerCase();
    if (normalizedMimeType === 'image/jpg') return 'image/jpeg';
    return normalizedMimeType;
  }

  private detectMimeTypeFromMagicBytes(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;

    const startsWithPdf =
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46;

    if (startsWithPdf) {
      return 'application/pdf';
    }

    const startsWithPng =
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;

    if (startsWithPng) {
      return 'image/png';
    }

    const startsWithJpeg =
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    if (startsWithJpeg) {
      return 'image/jpeg';
    }

    const startsWithWebp =
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    if (startsWithWebp) {
      return 'image/webp';
    }

    return null;
  }
}
