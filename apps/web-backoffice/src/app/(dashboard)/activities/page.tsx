import type { Metadata } from 'next';
import { ActivitiesContent } from './_components/activities-content';

export const metadata: Metadata = { title: 'Visitas | Sarfaty' };

export default function ActivitiesPage() {
  return <ActivitiesContent />;
}
