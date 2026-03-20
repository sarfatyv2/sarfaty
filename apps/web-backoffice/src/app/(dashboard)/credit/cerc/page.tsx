import type { Metadata } from 'next';
import { CercValidatorClient } from './_components/cerc-validator-client';

export const metadata: Metadata = {
  title: 'Validação CERC | Sarfaty',
};

export default function CercValidacaoPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-8 py-5">
        <h1 className="text-lg font-semibold">Validação CERC</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Valide duplicatas mercantis junto à CERC para antecipação de recebíveis.
        </p>
      </div>
      <div className="flex-1 overflow-auto">
        <CercValidatorClient />
      </div>
    </div>
  );
}
