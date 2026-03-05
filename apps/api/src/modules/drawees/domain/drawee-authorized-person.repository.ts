import type { DraweeAuthorizedPerson } from './drawee-authorized-person.entity';

export const DRAWEE_AUTHORIZED_PERSON_REPOSITORY = Symbol('DRAWEE_AUTHORIZED_PERSON_REPOSITORY');

export interface DraweeAuthorizedPersonRepository {
  findAllByDraweeId(draweeId: string): Promise<DraweeAuthorizedPerson[]>;
  findById(id: string): Promise<DraweeAuthorizedPerson | null>;
  findByDraweeAndSource(draweeId: string, source: string): Promise<DraweeAuthorizedPerson[]>;
  save(person: DraweeAuthorizedPerson): Promise<DraweeAuthorizedPerson>;
  update(id: string, data: Record<string, unknown>): Promise<DraweeAuthorizedPerson | null>;
  delete(id: string): Promise<void>;
}
