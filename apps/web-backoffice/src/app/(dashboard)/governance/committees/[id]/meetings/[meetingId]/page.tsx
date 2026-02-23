import type { Metadata } from 'next';
import { MeetingDetail } from './_components/meeting-detail';

export const metadata: Metadata = { title: 'Reunião | Sarfaty' };

export default function MeetingDetailPage({
  params,
}: {
  params: { id: string; meetingId: string };
}) {
  return <MeetingDetail committeeId={params.id} meetingId={params.meetingId} />;
}
