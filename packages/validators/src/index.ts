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

// Goal schemas
export {
  createGoalSchema,
  updateGoalSchema,
  listGoalsQuerySchema,
  type CreateGoalDto,
  type UpdateGoalDto,
  type ListGoalsQueryDto,
} from './goal.schema';

// Pipeline schemas
export {
  pipelineQuerySchema,
  type PipelineQueryDto,
} from './pipeline.schema';

// Client sub-resources schemas
export {
  createCommercialReportSchema,
  updateCommercialReportSchema,
  type CreateCommercialReportDto,
  type UpdateCommercialReportDto,
} from './commercial-report.schema';

export {
  createClientContactSchema,
  updateClientContactSchema,
  createClientAddressSchema,
  updateClientAddressSchema,
  createClientBankAccountSchema,
  updateClientBankAccountSchema,
  createClientAuthorizedPersonSchema,
  updateClientAuthorizedPersonSchema,
  subResourceParamSchema,
  type CreateClientContactDto,
  type UpdateClientContactDto,
  type CreateClientAddressDto,
  type UpdateClientAddressDto,
  type CreateClientBankAccountDto,
  type UpdateClientBankAccountDto,
  type CreateClientAuthorizedPersonDto,
  type UpdateClientAuthorizedPersonDto,
} from './client-sub-resources.schema';

// Drawee schemas
export {
  createDraweeSchema,
  updateDraweeSchema,
  listDraweesQuerySchema,
  createDraweeContactSchema,
  updateDraweeContactSchema,
  createDraweeAddressSchema,
  updateDraweeAddressSchema,
  createDraweeBankAccountSchema,
  updateDraweeBankAccountSchema,
  createDraweeAuthorizedPersonSchema,
  updateDraweeAuthorizedPersonSchema,
  type CreateDraweeDto,
  type UpdateDraweeDto,
  type ListDraweesQueryDto,
  type CreateDraweeContactDto,
  type UpdateDraweeContactDto,
  type CreateDraweeAddressDto,
  type UpdateDraweeAddressDto,
  type CreateDraweeBankAccountDto,
  type UpdateDraweeBankAccountDto,
  type CreateDraweeAuthorizedPersonDto,
  type UpdateDraweeAuthorizedPersonDto,
} from './drawee.schema';

// Governance schemas
export {
  createCommitteeSchema,
  updateCommitteeSchema,
  listCommitteesQuerySchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  createMeetingSchema,
  updateMeetingSchema,
  listMeetingsQuerySchema,
  upsertMinuteSchema,
  createActionItemSchema,
  updateActionItemSchema,
  listActionItemsQuerySchema,
  createActionUpdateSchema,
  type CreateCommitteeDto,
  type UpdateCommitteeDto,
  type ListCommitteesQueryDto,
  type InviteMemberDto,
  type UpdateMemberRoleDto,
  type CreateMeetingDto,
  type UpdateMeetingDto,
  type ListMeetingsQueryDto,
  type UpsertMinuteDto,
  type CreateActionItemDto,
  type UpdateActionItemDto,
  type ListActionItemsQueryDto,
  type CreateActionUpdateDto,
} from './governance.schema';

// IRPF schemas
export {
  irpfDependentSchema,
  irpfIncomeItemSchema,
  irpfExemptIncomeItemSchema,
  irpfExclusiveIncomeItemSchema,
  irpfPaymentSchema,
  irpfAssetSchema,
  irpfDebtSchema,
  irpfConflictSchema,
  irpfFieldEvidenceSchema,
  irpfRawExtractionSchema,
  type IrpfRawExtraction,
  type IrpfDependentDto,
  type IrpfIncomeItemDto,
  type IrpfPaymentDto,
  type IrpfAssetDto,
  type IrpfDebtDto,
  type IrpfConflictDto,
} from './irpf.schema';

// Faturamento schemas
export {
  faturamentoMonthlyRevenuesSchema,
  faturamentoRawExtractionSchema,
  type FaturamentoRawExtraction,
  type FaturamentoMonthlyRevenuesDto,
} from './faturamento.schema';

// Audit schemas
export {
  listAuditLogsQuerySchema,
  type ListAuditLogsQueryDto,
} from './audit.schema';

// CNAB schemas
export {
  uploadCnabFileSchema,
  parseCnabFileSchema,
  listCnabFilesQuerySchema,
  listTradeReceivablesQuerySchema,
  listCnabOperationsQuerySchema,
  evaluateReceivableSchema,
  batchEvaluateReceivablesSchema,
  type UploadCnabFileDto,
  type ParseCnabFileDto,
  type ListCnabFilesQueryDto,
  type ListTradeReceivablesQueryDto,
  type ListCnabOperationsQueryDto,
  type EvaluateReceivableDto,
  type BatchEvaluateReceivablesDto,
} from './cnab.schema';

// Communication schemas
export {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  listAnnouncementsQuerySchema,
  createWikiCategorySchema,
  updateWikiCategorySchema,
  createWikiArticleSchema,
  updateWikiArticleSchema,
  listWikiArticlesQuerySchema,
  type CreateAnnouncementDto,
  type UpdateAnnouncementDto,
  type ListAnnouncementsQueryDto,
  type CreateWikiCategoryDto,
  type UpdateWikiCategoryDto,
  type CreateWikiArticleDto,
  type UpdateWikiArticleDto,
  type ListWikiArticlesQueryDto,
} from './communication.schema';
