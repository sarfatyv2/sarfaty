// Common schemas
export {
  emailSchema,
  cpfSchema,
  cnpjSchema,
  phoneSchema,
  uuidSchema,
  dateStringSchema,
} from './common';

// Auth schemas
export { loginSchema, type LoginDto } from './auth.schema';

// Pagination schemas
export { paginationQuerySchema, type PaginationQueryDto } from './pagination.schema';

// Collaborator schemas
export {
  createCollaboratorSchema,
  updateCollaboratorSelfSchema,
  updateCollaboratorAdminSchema,
  listCollaboratorsQuerySchema,
  createDependentSchema,
  updateDependentSchema,
  type CreateCollaboratorDto,
  type UpdateCollaboratorSelfDto,
  type UpdateCollaboratorAdminDto,
  type ListCollaboratorsQueryDto,
  type CreateDependentDto,
  type UpdateDependentDto,
} from './collaborator.schema';

// User schemas
export {
  createUserSchema,
  listUsersQuerySchema,
  type CreateUserDto,
  type ListUsersQueryDto,
} from './user.schema';

// Client schemas
export {
  createClientSchema,
  updateClientSchema,
  uploadDocumentSchema,
  listClientsQuerySchema,
  type CreateClientDto,
  type UpdateClientDto,
  type UploadDocumentDto,
  type ListClientsQueryDto,
} from './client.schema';

// Notification schemas
export {
  listNotificationsQuerySchema,
  type ListNotificationsQueryDto,
} from './notification.schema';

// Learning schemas
export {
  createCourseSchema,
  updateCourseSchema,
  createModuleSchema,
  updateModuleSchema,
  createLessonSchema,
  updateLessonSchema,
  listCoursesQuerySchema,
  updateLessonProgressSchema,
  submitQuizSchema,
  type CreateCourseDto,
  type UpdateCourseDto,
  type CreateModuleDto,
  type UpdateModuleDto,
  type CreateLessonDto,
  type UpdateLessonDto,
  type ListCoursesQueryDto,
  type UpdateLessonProgressDto,
  type SubmitQuizDto,
} from './learning.schema';
