import { User, type CreateUserProps } from '@/modules/users/domain/user.entity';
type UserOverrides = Partial<CreateUserProps>;
export declare function createUserFactory(overrides?: UserOverrides): User;
export declare function createUserWithCollaboratorFactory(overrides?: UserOverrides): User;
export {};
//# sourceMappingURL=user.factory.d.ts.map