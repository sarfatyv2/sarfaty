import type { CercValidationEventoRow } from '../../domain/cerc-validation-eventos.repository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawEvento = Record<string, any>;

export class CercValidationEventosMapper {
  static fromCercResponse(cercValidationId: string, raw: unknown): CercValidationEventoRow[] {
    if (!Array.isArray(raw)) return [];

    return raw
      .filter((ev): ev is RawEvento => ev != null && typeof ev === 'object')
      .map((ev) => ({
        cercValidationId,
        data: ev.data ? new Date(ev.data as string) : new Date(),
        codigo: String(ev.codigo ?? ''),
        descricao: (ev.informacoes_complementares as RawEvento)?.descricao ?? null,
      }));
  }
}
