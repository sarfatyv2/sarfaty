'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Badge } from '@nexus/ui';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { QuizQuestion } from '@nexus/types';
import { toast } from 'sonner';

interface QuizFormProps {
  questions: QuizQuestion[];
  enrollmentId: string;
  lessonId: string;
  minScore: number;
  onComplete?: () => void;
}

interface QuizResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
}

export function QuizForm({
  questions,
  enrollmentId,
  lessonId,
  minScore,
  onComplete,
}: QuizFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    if (!allAnswered) return;

    setSubmitting(true);
    try {
      const response = await api.post<QuizResult>(
        `/learning/enrollments/${enrollmentId}/lessons/${lessonId}/quiz`,
        {
          answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
          })),
        },
      );

      setResult(response.data);

      if (response.data.passed) {
        toast.success(`Quiz aprovado! Nota: ${response.data.score}%`);
        onComplete?.();
      } else {
        toast.error(`Nota: ${response.data.score}%. Mínimo: ${minScore}%. Tente novamente.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar quiz';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Quiz</h3>
        <Badge variant="outline">Nota mínima: {minScore}%</Badge>
      </div>

      {result && (
        <Card className={result.passed ? 'border-primary' : 'border-destructive'}>
          <CardContent className="p-4 flex items-center gap-3">
            {result.passed ? (
              <CheckCircle2 size={24} className="text-primary shrink-0" />
            ) : (
              <XCircle size={24} className="text-destructive shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {result.passed ? 'Aprovado!' : 'Não aprovado'}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.correctAnswers}/{result.totalQuestions} respostas corretas — Nota:{' '}
                {result.score}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardContent className="p-4 space-y-3">
              <p className="font-medium text-sm">
                {qIndex + 1}. {question.question}
              </p>
              <div className="space-y-2">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      } ${result ? 'pointer-events-none opacity-75' : ''}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={isSelected}
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: option.id,
                          }))
                        }
                        className="sr-only"
                        disabled={!!result}
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-primary' : 'border-muted-foreground/40'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm">{option.text}</span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        {!result ? (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Enviar Respostas
          </Button>
        ) : !result.passed ? (
          <Button onClick={handleRetry} variant="outline">
            Tentar Novamente
          </Button>
        ) : null}
      </div>
    </div>
  );
}
