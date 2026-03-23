import { Module } from '@nestjs/common';
import { CollaboratorsController } from './controllers/collaborators.controller';
import { MeController } from './controllers/me.controller';
import { DependentsController } from './controllers/dependents.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { BillingCompaniesController } from './controllers/billing-companies.controller';
import { ReimbursementsController } from './controllers/reimbursements.controller';
import { ListCollaboratorsUseCase } from './use-cases/list-collaborators.use-case';
import { GetCollaboratorUseCase } from './use-cases/get-collaborator.use-case';
import { UpdateCollaboratorUseCase } from './use-cases/update-collaborator.use-case';
import { SyncFlashCollaboratorsUseCase } from './use-cases/sync-flash-collaborators.use-case';
import { RegisterCollaboratorToFlashUseCase } from './use-cases/register-collaborator-to-flash.use-case';
import { DeactivateFlashCollaboratorUseCase } from './use-cases/deactivate-flash-collaborator.use-case';
import { ReactivateFlashCollaboratorUseCase } from './use-cases/reactivate-flash-collaborator.use-case';
import { FlashAdapter } from './integrations/flash/flash.adapter';
import { GetMyProfileUseCase } from './use-cases/get-my-profile.use-case';
import { UpdateMyProfileUseCase } from './use-cases/update-my-profile.use-case';
import { ListDependentsUseCase } from './use-cases/list-dependents.use-case';
import { CreateDependentUseCase } from './use-cases/create-dependent.use-case';
import { UpdateDependentUseCase } from './use-cases/update-dependent.use-case';
import { DeleteDependentUseCase } from './use-cases/delete-dependent.use-case';
import { ListInvoicesUseCase } from './use-cases/list-invoices.use-case';
import { UploadInvoiceUseCase } from './use-cases/upload-invoice.use-case';
import { ApproveInvoiceUseCase } from './use-cases/approve-invoice.use-case';
import { RejectInvoiceUseCase } from './use-cases/reject-invoice.use-case';
import { PayInvoiceUseCase } from './use-cases/pay-invoice.use-case';
import { ListOverdueInvoicesUseCase } from './use-cases/list-overdue-invoices.use-case';
import { SendInvoiceRemindersUseCase } from './use-cases/send-invoice-reminders.use-case';
import { ListReimbursementsUseCase } from './use-cases/list-reimbursements.use-case';
import { CreateReimbursementUseCase } from './use-cases/create-reimbursement.use-case';
import { UpdateReimbursementUseCase } from './use-cases/update-reimbursement.use-case';
import { ApproveReimbursementUseCase } from './use-cases/approve-reimbursement.use-case';
import { RejectReimbursementUseCase } from './use-cases/reject-reimbursement.use-case';
import { PayReimbursementUseCase } from './use-cases/pay-reimbursement.use-case';
import { UploadReceiptUseCase } from './use-cases/upload-receipt.use-case';
import { GetReceiptUrlUseCase } from './use-cases/get-receipt-url.use-case';
import { UploadAvatarUseCase } from './use-cases/upload-avatar.use-case';
import { GenerateMonthlyPjInvoicesUseCase } from './use-cases/generate-monthly-pj-invoices.use-case';
import { AssignInvoiceBillingCompaniesUseCase } from './use-cases/assign-invoice-billing-companies.use-case';
import { ListBillingCompaniesUseCase } from './use-cases/list-billing-companies.use-case';
import { CreateBillingCompanyUseCase } from './use-cases/create-billing-company.use-case';
import { UpdateBillingCompanyUseCase } from './use-cases/update-billing-company.use-case';
import { PjInvoiceCronService } from './pj-invoice-cron.service';
import { DrizzleCollaboratorRepository } from './infra/drizzle-collaborator.repository';
import { DrizzleDependentRepository } from './infra/drizzle-dependent.repository';
import { DrizzlePjInvoiceRepository } from './infra/drizzle-pj-invoice.repository';
import { DrizzleReimbursementRepository } from './infra/drizzle-reimbursement.repository';
import { DrizzleBillingCompanyRepository } from './infra/drizzle-billing-company.repository';
import { PeopleStorageService } from './infra/people-storage.service';
import { COLLABORATOR_REPOSITORY } from './domain/collaborator.repository';
import { DEPENDENT_REPOSITORY } from './domain/dependent.repository';
import { PJ_INVOICE_REPOSITORY } from './domain/pj-invoice.repository';
import { REIMBURSEMENT_REPOSITORY } from './domain/reimbursement.repository';
import { BILLING_COMPANY_REPOSITORY } from './domain/billing-company.repository';

@Module({
  controllers: [
    CollaboratorsController,
    MeController,
    DependentsController,
    InvoicesController,
    BillingCompaniesController,
    ReimbursementsController,
  ],
  providers: [
    // Use cases
    ListCollaboratorsUseCase,
    GetCollaboratorUseCase,
    UpdateCollaboratorUseCase,
    FlashAdapter,
    SyncFlashCollaboratorsUseCase,
    RegisterCollaboratorToFlashUseCase,
    DeactivateFlashCollaboratorUseCase,
    ReactivateFlashCollaboratorUseCase,
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    ListDependentsUseCase,
    CreateDependentUseCase,
    UpdateDependentUseCase,
    DeleteDependentUseCase,
    ListInvoicesUseCase,
    UploadInvoiceUseCase,
    ApproveInvoiceUseCase,
    RejectInvoiceUseCase,
    PayInvoiceUseCase,
    ListOverdueInvoicesUseCase,
    SendInvoiceRemindersUseCase,
    ListReimbursementsUseCase,
    CreateReimbursementUseCase,
    UpdateReimbursementUseCase,
    ApproveReimbursementUseCase,
    RejectReimbursementUseCase,
    PayReimbursementUseCase,
    UploadReceiptUseCase,
    GetReceiptUrlUseCase,
    UploadAvatarUseCase,
    GenerateMonthlyPjInvoicesUseCase,
    AssignInvoiceBillingCompaniesUseCase,
    ListBillingCompaniesUseCase,
    CreateBillingCompanyUseCase,
    UpdateBillingCompanyUseCase,
    PjInvoiceCronService,
    // Repositories
    { provide: COLLABORATOR_REPOSITORY, useClass: DrizzleCollaboratorRepository },
    { provide: DEPENDENT_REPOSITORY, useClass: DrizzleDependentRepository },
    { provide: PJ_INVOICE_REPOSITORY, useClass: DrizzlePjInvoiceRepository },
    { provide: REIMBURSEMENT_REPOSITORY, useClass: DrizzleReimbursementRepository },
    { provide: BILLING_COMPANY_REPOSITORY, useClass: DrizzleBillingCompanyRepository },
    PeopleStorageService,
  ],
})
export class PeopleModule {}
