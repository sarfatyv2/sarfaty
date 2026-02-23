import type { Metadata } from 'next';
import { MeetingDetail } from './_components/meeting-detail';

export const metadata: Metadata = { title: 'Reunião | Sarfaty' };

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id, meetingId } = await params;
  return <MeetingDetail committeeId={id} meetingId={meetingId} />;
}
