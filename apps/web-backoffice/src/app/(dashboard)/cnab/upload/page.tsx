import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@nexus/ui';
import { ArrowLeft } from 'lucide-react';
import { CnabUploadForm } from './_components/cnab-upload-form';

export const metadata: Metadata = {
  title: 'Upload CNAB | Sarfaty',
  description: 'Upload e processamento de arquivos CNAB 400',
};

export default function UploadPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/cnab/receivables">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft size={14} />
            Voltar para Duplicatas
          </Button>
        </Link>
        <h1 className="text-3xl font-normal">Upload CNAB</h1>
        <p className="text-sm text-muted-foreground">
          Envie um arquivo CNAB 400 (remessa) para importar duplicatas
        </p>
      </div>

      <CnabUploadForm />
    </div>
  );
}
