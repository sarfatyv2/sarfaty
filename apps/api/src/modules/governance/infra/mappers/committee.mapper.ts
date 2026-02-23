import { Committee, type CommitteeProps } from '../../domain/committee.entity';
import type { CommitteeFrequency, CommitteeStatus } from '@nexus/types';
import type { govCommittees } from '../../../../database/schema';

type CommitteeRow = typeof govCommittees.$inferSelect;

export class CommitteeMapper {
  static toDomain(row: CommitteeRow): Committee {
    const props: CommitteeProps = {
      id: row.id,
      name: row.name,
      description: row.description,
      regulation: row.regulation,
      frequency: row.frequency as CommitteeFrequency,
      status: row.status as CommitteeStatus,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Committee.reconstitute(props);
  }

  static toPersistence(committee: Committee): Record<string, unknown> {
    return {
      name: committee.name,
      description: committee.description,
      regulation: committee.regulation,
      frequency: committee.frequency,
      status: committee.status,
      createdBy: committee.createdBy,
    };
  }
}
