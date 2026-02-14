'use client';

import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Avatar,
  AvatarFallback,
} from '@nexus/ui';

interface CollaboratorRow {
  id: string;
  fullName: string;
  corporateEmail: string | null;
  department: string | null;
  jobTitle: string | null;
  employmentType: string;
  isActive: boolean;
  startDateOriginal: string | null;
}

interface CollaboratorsTableProps {
  collaborators: CollaboratorRow[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getEmploymentTypeLabel(type: string): string {
  return type === 'clt' ? 'CLT' : 'PJ';
}

export function CollaboratorsTable({ collaborators }: CollaboratorsTableProps) {
  if (collaborators.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        Nenhum colaborador encontrado
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Colaborador</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Admissão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaborators.map((collab) => (
            <TableRow key={collab.id}>
              <TableCell>
                <Link href={`/people/collaborators/${collab.id}`} className="flex items-center gap-3 hover:underline">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(collab.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{collab.fullName}</span>
                    {collab.corporateEmail && (
                      <p className="text-xs text-muted-foreground">{collab.corporateEmail}</p>
                    )}
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {collab.department ?? '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {collab.jobTitle ?? '—'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{getEmploymentTypeLabel(collab.employmentType)}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={collab.isActive ? 'default' : 'destructive'}>
                  {collab.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(collab.startDateOriginal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
