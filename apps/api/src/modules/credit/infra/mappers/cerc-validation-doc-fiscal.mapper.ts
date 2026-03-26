import type {
  CercValidationDocFiscalRow,
  CercValidationNfeDuplicataRow,
  CercValidationNfeProdutoRow,
  CercValidationNfeEventoFiscalRow,
  CercValidationDocFiscalAggregate,
} from '../../domain/cerc-validation-doc-fiscal.repository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawObj = Record<string, any>;

function safeNum(val: unknown): string | null {
  if (val == null || val === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : String(n);
}

function safeDate(val: unknown): Date | null {
  if (!val || val === '') return null;
  const d = new Date(val as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

export class CercValidationDocFiscalMapper {
  static fromCercResponse(cercValidationId: string, raw: unknown): CercValidationDocFiscalAggregate {
    const outer = raw as RawObj | null;
    if (!outer) return { docFiscal: null, duplicatas: [], produtos: [], eventosFiscais: [] };

    const tipo = String(outer.tipo ?? 'nfe');
    const nfe = (outer.dados as RawObj)?.nfe as RawObj | undefined;
    if (!nfe) return { docFiscal: null, duplicatas: [], produtos: [], eventosFiscais: [] };

    const emissao = nfe.emissao as RawObj | undefined;
    const emitente = (nfe.emitente as RawObj) ?? undefined;
    const destinatario = (nfe.destinatario as RawObj) ?? undefined;
    const cobranca = nfe.cobranca as RawObj | undefined;
    const fatura = (cobranca?.fatura as RawObj) ?? undefined;
    const transporte = nfe.transporte as RawObj | undefined;
    const transportador = transporte?.transportador as RawObj | undefined;
    const totais = nfe.totais as RawObj | undefined;

    const docFiscal: CercValidationDocFiscalRow = {
      cercValidationId,
      tipo,
      chaveAcesso: String(nfe.normalizado_chave_acesso ?? nfe.chave_acesso ?? '') || null,
      numero: String(nfe.numero ?? '') || null,
      serie: String(nfe.serie ?? '') || null,
      modelo: String(nfe.modelo ?? '') || null,
      situacao: String(nfe.situacao ?? '') || null,
      naturezaOperacao: String(emissao?.natureza_operacao ?? '') || null,
      dataEmissao: safeDate(nfe.normalizado_data_emissao ?? nfe.data_emissao),
      valorTotal: safeNum(nfe.normalizado_valor_total),
      emitenteNome: String(emitente?.nome ?? '') || null,
      emitenteCnpj: String(emitente?.normalizado_cnpj ?? '') || null,
      emitenteUf: String(emitente?.uf ?? '') || null,
      destinatarioNome: String(destinatario?.nome ?? '') || null,
      destinatarioCnpj: String(destinatario?.normalizado_cnpj ?? '') || null,
      destinatarioCpf: String(destinatario?.normalizado_cpf ?? '') || null,
      destinatarioUf: String(destinatario?.uf ?? '') || null,
      faturaNumero: String(fatura?.numero ?? '') || null,
      faturaValorOriginal: safeNum(fatura?.normalizado_valor_original),
      faturaValorLiquido: safeNum(fatura?.normalizado_valor_liquido),      modalidadeFrete: String(transporte?.modalidade_frete ?? '') || null,
      transportadorNome: String(transportador?.nome ?? '') || null,
      transportadorCnpj: String(transportador?.cnpj ?? '') || null,
      valorIcms: safeNum(totais?.normalizado_valor_icms),
      valorPis: safeNum(totais?.normalizado_valor_pis),
      valorCofins: safeNum(totais?.normalizado_valor_cofins),
      valorProdutos: safeNum(totais?.normalizado_valor_produtos),
    };

    const duplicatasRaw = Array.isArray(cobranca?.duplicatas) ? (cobranca?.duplicatas as RawObj[]) : [];
    const duplicatas: CercValidationNfeDuplicataRow[] = duplicatasRaw.map((d) => ({
      cercValidationId,
      numero: String(d.numero ?? ''),
      valor: safeNum(d.normalizado_valor),
      vencimento: d.normalizado_vencimento
        ? String(new Date(d.normalizado_vencimento as string).toISOString().slice(0, 10))
        : null,
    }));

    const produtosRaw = Array.isArray(nfe.produtos) ? (nfe.produtos as RawObj[]) : [];
    const produtos: CercValidationNfeProdutoRow[] = produtosRaw.map((p) => ({
      cercValidationId,
      num: String(p.num ?? ''),
      codigo: String(p.codigo ?? '') || null,
      descricao: String(p.descricao ?? ''),
      ncm: String(p.ncm ?? '') || null,
      cfop: String(p.cfop ?? '') || null,
      unidade: String(p.unidade ?? p.unidade_comercial ?? '') || null,
      quantidade: safeNum(p.normalizado_quantidade_comercial),
      valorUnitario: safeNum(p.normalizado_valor_unitario_comercial),
      valorTotal: safeNum(p.normalizado_valor),
    }));

    const eventosRaw = Array.isArray(nfe.eventos) ? (nfe.eventos as RawObj[]) : [];
    const eventosFiscais: CercValidationNfeEventoFiscalRow[] = eventosRaw.map((e) => {
      const info = e.info as RawObj | undefined;
      return {
        cercValidationId,
        tipo: String(info?.tipo ?? '') || null,
        data: safeDate(info?.normalizado_data ?? info?.data),
        orgao: String(info?.desc_orgao ?? info?.orgao ?? '') || null,
        protocolo: String(e.protocolo ?? '') || null,
        evento: String(e.evento ?? '') || null,
      };
    });

    return { docFiscal, duplicatas, produtos, eventosFiscais };
  }
}
