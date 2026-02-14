'use client';

import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

function getCircleClass(isCompleted: boolean, isActive: boolean): string {
  if (isCompleted) return 'bg-primary text-primary-foreground';
  if (isActive) return 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2';
  return 'bg-muted text-muted-foreground';
}

function getLabelClass(isCompleted: boolean, isActive: boolean): string {
  if (isActive || isCompleted) return 'text-foreground';
  return 'text-muted-foreground';
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Progresso" className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${getCircleClass(isCompleted, isActive)}`}
              >
                {isCompleted ? <Check size={16} /> : step.number}
              </div>
              <span
                className={`text-sm font-medium hidden sm:inline ${getLabelClass(isCompleted, isActive)}`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-px w-8 sm:w-16 transition-colors ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
