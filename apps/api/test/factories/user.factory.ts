import { v4 as uuidv4 } from 'uuid';
import { User, type CreateUserProps } from '@/modules/users/domain/user.entity';

type UserOverrides = Partial<CreateUserProps>;

export function createUserFactory(overrides: UserOverrides = {}): User {
  const defaults: CreateUserProps = {
    id: uuidv4(),
    email: `test-${Date.now()}@sarfaty.com`,
    fullName: 'Test User',
    role: 'employee',
    ...overrides,
  };

  return User.create(defaults);
}

export function createUserWithCollaboratorFactory(overrides: UserOverrides = {}): User {
  return createUserFactory({
    employmentType: 'clt',
    cpf: '123.456.789-00',
    department: 'Engineering',
    jobTitle: 'Developer',
    ...overrides,
  });
}
