import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../../../config/s3';
import { env } from '../../../config/env';

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
  private get bucket() {
    return env.S3_BUCKET_CLIENT_DOCS;
  }

  async uploadDocument(
    clientId: string,
    documentType: string,
    file: { buffer: Buffer; originalName: string; mimetype: string },
  ): Promise<UploadResult> {
    this.validateFile(file.buffer, file.mimetype);

    const sanitized = file.originalName.replaceAll(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitized}`;
    const path = `${clientId}/${documentType}/${filename}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      path,
      size: file.buffer.length,
      mimeType: file.mimetype,
    };
  }

  async deleteDocument(path: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: [{ Key: path }] },
      }),
    );
  }

  async downloadDocument(path: string): Promise<Buffer> {
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: path }),
    );

    if (!response.Body) {
      throw new Error(`Storage download failed for path "${path}": no data`);
    }

    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
    try {
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: path });
      return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    } catch {
      return null;
    }
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
