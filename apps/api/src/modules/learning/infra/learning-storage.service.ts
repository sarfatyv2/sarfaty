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
    if (!ALLOWED_MIME_TYPES.has(mimetype)) {
      throw new Error('Invalid file type. Accepted: PDF, JPEG, PNG, WebP');
    }
  }
}
