import { CnabFile, type CnabFileProps } from '../../domain/cnab-file.entity';
import type { CnabFileType, CnabLayoutVersion, CnabFileStatus } from '@nexus/types';
import type { cnabRemittanceFiles } from '../../../../database/schema';

type CnabFileRow = typeof cnabRemittanceFiles.$inferSelect;

export class CnabFileMapper {
  static toDomain(row: CnabFileRow): CnabFile {
    const props: CnabFileProps = {
      id: row.id,
      clientId: row.clientId,
      fileType: (row.fileType ?? 'remittance') as CnabFileType,
      layoutVersion: (row.layoutVersion ?? 'cnab400') as CnabLayoutVersion,
      bankCode: row.bankCode,
      bankName: row.bankName,
      cedentCode: row.cedentCode,
      cedentName: row.cedentName,
      remittanceDate: row.remittanceDate,
      sequentialNumber: row.sequentialNumber,
      storagePath: row.storagePath,
      originalFilename: row.originalFilename,
      totalRecords: row.totalRecords,
      totalAmount: row.totalAmount,
      status: (row.status ?? 'uploaded') as CnabFileStatus,
      parsingErrors: row.parsingErrors,
      processedAt: row.processedAt,
      createdAt: row.createdAt,
    };
    return CnabFile.reconstitute(props);
  }

  static toPersistence(entity: CnabFile): Record<string, unknown> {
    return {
      clientId: entity.clientId,
      fileType: entity.fileType,
      layoutVersion: entity.layoutVersion,
      bankCode: entity.bankCode,
      bankName: entity.bankName,
      cedentCode: entity.cedentCode,
      cedentName: entity.cedentName,
      remittanceDate: entity.remittanceDate,
      sequentialNumber: entity.sequentialNumber,
      storagePath: entity.storagePath,
      originalFilename: entity.originalFilename,
      totalRecords: entity.totalRecords,
      totalAmount: entity.totalAmount,
      status: entity.status,
      parsingErrors: entity.parsingErrors,
      processedAt: entity.processedAt,
    };
  }
}
