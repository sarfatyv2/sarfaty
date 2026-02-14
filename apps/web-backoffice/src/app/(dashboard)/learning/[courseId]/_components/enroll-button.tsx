'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nexus/ui';
import { Loader2, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface EnrollButtonProps {
  courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const [enrolling, setEnrolling] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/learning/courses/${courseId}/enroll`, {});
      toast.success('Inscricao realizada com sucesso!');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao se inscrever';
      toast.error(message);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Button onClick={handleEnroll} disabled={enrolling} size="lg">
      {enrolling ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <GraduationCap size={18} />
      )}
      Inscrever-se neste curso
    </Button>
  );
}
