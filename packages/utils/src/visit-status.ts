export type VisitStatus = 'on_track' | 'approaching' | 'overdue' | 'never_visited';

const VISIT_INTERVAL_DAYS = 90;
const APPROACHING_THRESHOLD_DAYS = 15;

export function computeVisitStatusFromDate(lastVisitDate: string | null): {
  status: VisitStatus;
  nextVisitDue: string | null;
  daysUntilDue: number | null;
  daysOverdue: number | null;
} {
  if (!lastVisitDate) {
    return { status: 'never_visited', nextVisitDue: null, daysUntilDue: null, daysOverdue: null };
  }

  const last = new Date(lastVisitDate);
  const nextDue = new Date(last);
  nextDue.setDate(nextDue.getDate() + VISIT_INTERVAL_DAYS);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextDue.setHours(0, 0, 0, 0);

  const diffMs = nextDue.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const nextVisitDueSt = nextDue.toISOString().split('T')[0] ?? '';

  if (diffDays < 0) {
    return { status: 'overdue', nextVisitDue: nextVisitDueSt, daysUntilDue: null, daysOverdue: Math.abs(diffDays) };
  }
  if (diffDays <= APPROACHING_THRESHOLD_DAYS) {
    return { status: 'approaching', nextVisitDue: nextVisitDueSt, daysUntilDue: diffDays, daysOverdue: null };
  }
  return { status: 'on_track', nextVisitDue: nextVisitDueSt, daysUntilDue: diffDays, daysOverdue: null };
}
