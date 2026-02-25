'use client';

import { useState } from 'react';
import { Badge, Button } from '@nexus/ui';
import { Mail, Phone, FileText, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { ClientAuthorizedPerson } from '@nexus/types';
import { ExpandableContent, RotatingChevron } from './motion-wrapper';
import { IrpfExtractionCard } from './tabs/client-irpf-tab';
import type { IrpfExtraction } from './tabs/client-irpf-tab';

const AUTH_TYPE_LABELS: Record<string, string> = {
  partner: 'Sócio',
  attorney: 'Procurador',
  legal_representative: 'Representante Legal',
  authorized: 'Autorizado',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

const AVATAR_PALETTE = [
  'bg-[hsl(30,30%,93%)] text-[hsl(150,50%,15%)]',
  'bg-[hsl(150,20%,90%)] text-[hsl(150,50%,20%)]',
  'bg-[hsl(40,30%,90%)] text-[hsl(40,30%,30%)]',
  'bg-[hsl(150,15%,85%)] text-[hsl(150,40%,18%)]',
  'bg-[hsl(35,25%,88%)] text-[hsl(35,30%,25%)]',
  'bg-[hsl(150,30%,92%)] text-[hsl(150,50%,15%)]',
  'bg-[hsl(45,25%,92%)] text-[hsl(45,25%,30%)]',
  'bg-[hsl(150,10%,88%)] text-[hsl(150,30%,22%)]',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (name.codePointAt(i) ?? 0) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]!;
}

function irpfLabel(count: number): string {
  return count === 1 ? '1 IRPF' : `${count} IRPFs`;
}

function formatCpf(cpf: string): string {
  const d = cpf.replaceAll(/\D/g, '');
  if (d.length !== 11) return cpf;
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

interface PartnerCardProps {
  person: ClientAuthorizedPerson;
  clientId: string;
  irpfExtractions: IrpfExtraction[];
  reprocessingId: string | null;
  onReprocess: (extraction: IrpfExtraction) => Promise<void>;
  onEdit: (person: ClientAuthorizedPerson) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
}

export function PartnerCard({
  person,
  clientId,
  irpfExtractions,
  reprocessingId,
  onReprocess,
  onEdit,
  onDelete,
  deleting,
}: PartnerCardProps) {
  const [expanded, setExpanded] = useState(false);

  const initials = getInitials(person.fullName);
  const avatarColor = getAvatarColor(person.fullName);
  const typeLabel = person.authorizationType ? (AUTH_TYPE_LABELS[person.authorizationType] ?? person.authorizationType) : null;
  const irpfCount = irpfExtractions.length;
  const cpfFormatted = person.cpf ? formatCpf(person.cpf) : null;

  return (
    <div className="rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-sm">
      {/* Collapsed header — always visible */}
      <div
        role="button"
        tabIndex={0}
        className="w-full text-left cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((v) => !v); } }}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Avatar */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}>
            {initials}
          </div>

          {/* Name + metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold truncate">{person.fullName}</span>
              {typeLabel && (
                <Badge variant="secondary" className="text-xs shrink-0">{typeLabel}</Badge>
              )}
              {!person.isActive && (
                <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">Inativo</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {cpfFormatted && (
                <span className="text-xs text-muted-foreground font-mono">{cpfFormatted}</span>
              )}
              {person.email && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail size={10} />
                  {person.email}
                </span>
              )}
              {person.phone && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone size={10} />
                  {person.phone}
                </span>
              )}
            </div>
          </div>

          {/* Right side: IRPF count + actions + chevron */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
              <FileText size={11} />
              {irpfCount > 0 ? irpfLabel(irpfCount) : 'Sem IRPF'}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onEdit(person); }}
            >
              <Pencil size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(person.id); }}
              disabled={deleting === person.id}
            >
              {deleting === person.id
                ? <Loader2 size={13} className="animate-spin" />
                : <Trash2 size={13} />}
            </Button>
            <RotatingChevron isOpen={expanded} className="text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Expandable content */}
      <ExpandableContent isOpen={expanded}>
        <div className="border-t bg-muted/20 px-5 py-5 space-y-5">
          {/* IRPF extractions */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              IRPF
            </p>
            {irpfExtractions.length === 0 ? (
              <div className="flex items-center gap-3 py-4 text-center justify-center">
                <FileText size={20} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma extração IRPF para este sócio.
                  Os documentos são processados automaticamente após o upload.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {irpfExtractions.map((extraction) => (
                  <IrpfExtractionCard
                    key={extraction.id}
                    extraction={extraction}
                    clientId={clientId}
                    onReprocess={onReprocess}
                    reprocessingId={reprocessingId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ExpandableContent>
    </div>
  );
}
