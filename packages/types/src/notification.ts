/**
 * Notification types stored in the database.
 * Must match the strings used in ROLE_PERMISSIONS[role].notifications.
 */
export const NOTIFICATION_TYPES = [
  // Comercial
  'document_rejected',
  'client_approved',
  'client_rejected',
  'client_auto_rejected',
  'client_reassigned_to_me',
  'client_reassigned_from_me',
  'goal_achieved',
  'client_inactive_7days',
  'team_goal_achieved',
  'region_goal_achieved',
  'team_below_target',
  'national_goal_achieved',
  'large_operation_approved',
  'region_below_target',
  // Crédito
  'new_client_in_queue',
  'bureau_query_failed',
  'bureau_unavailable',
  'auto_reject_override_requested',
  // Compliance
  'new_client_compliance_queue',
  'pep_match_found',
  'sanction_match_found',
  'monitoring_alert',
  'coaf_report_due',
  // Aprovação
  'new_client_approval_queue',
  'report_ready_for_review',
  'approval_sla_warning',
  // Backoffice
  'homologation_complete',
  'homologation_rejected',
  'partner_docs_uploaded',
  'divergence_detected',
  'contract_signed',
  // Jurídico
  'contract_generation_ready',
  'contract_review_requested',
  'extrajudicial_auto_generated',
  'litigation_update',
  'signature_completed',
  'regulation_review_requested',
  // Risco
  'client_entered_risk',
  'client_entered_recovery',
  'client_entered_litigation',
  'payment_received',
  'negotiation_deadline',
  'settlement_expired',
  // People
  'reimbursement_approved',
  'reimbursement_rejected',
  'reimbursement_pending_approval',
  'reimbursement_pending_payment',
  'pj_invoice_uploaded',
  'pj_invoice_overdue',
  'review_cycle_open',
  'onboarding_task_due',
  'review_cycle_deadline',
  'turnover_alert',
  // Admin
  'system_error',
  'integration_down',
  'security_alert',
  'new_user_created',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/**
 * Domain event types that trigger notifications.
 * Used with @nestjs/event-emitter.
 */
export type NotificationEventType =
  | 'client.created'
  | 'client.submitted'
  | 'client.approved'
  | 'client.rejected'
  | 'client.auto_rejected'
  | 'document.rejected'
  | 'reimbursement.approved'
  | 'reimbursement.rejected'
  | 'reimbursement.pending_approval'
  | 'invoice.uploaded'
  | 'invoice.approved'
  | 'invoice.rejected'
  | 'invoice.overdue'
  | 'course.published'
  | 'enrollment.completed';

export interface NotificationEventPayload {
  type: NotificationEventType;
  actorId: string;
  actorName?: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}
