import { CercValidationResultado } from '../../domain/cerc-validation-resultado.entity';
import type { CercResultadoDimensao, CercResultadoEscopo, CercResultadoImpacto } from '../../bureaus/cerc/cerc.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRow = Record<string, any>;

export class CercValidationResultadoMapper {
  static toDomain(raw: RawRow): CercValidationResultado {
    return CercValidationResultado.reconstruct({
      id: raw.id,
      cercValidationId: raw.cercValidationId,
      resultadoCercId: raw.resultadoCercId,
      codigo: raw.codigo ?? null,
      algoritmoId: raw.algoritmoId ?? null,
      algoritmoCodigo: raw.algoritmoCodigo ?? null,
      algoritmoNome: raw.algoritmoNome ?? null,
      algoritmoTipo: raw.algoritmoTipo,
      algoritmoDimensao: raw.algoritmoDimensao as CercResultadoDimensao,
      algoritmoEscopo: raw.algoritmoEscopo as CercResultadoEscopo,
      mensagem: raw.mensagem,
      impacto: raw.impacto as CercResultadoImpacto,
      dadosUtilizados: raw.dadosUtilizados ?? null,
      parametrosDoAlgoritmo: raw.parametrosDoAlgoritmo ?? null,
      informacoesComplementares: raw.informacoesComplementares ?? null,
      dataConclusao: new Date(raw.dataConclusao),
      createdAt: new Date(raw.createdAt),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toPersistence(entity: CercValidationResultado): any {
    return {
      id: entity.id,
      cercValidationId: entity.cercValidationId,
      resultadoCercId: entity.resultadoCercId,
      codigo: entity.codigo,
      algoritmoId: entity.algoritmoId,
      algoritmoCodigo: entity.algoritmoCodigo,
      algoritmoNome: entity.algoritmoNome,
      algoritmoTipo: entity.algoritmoTipo,
      algoritmoDimensao: entity.algoritmoDimensao,
      algoritmoEscopo: entity.algoritmoEscopo,
      mensagem: entity.mensagem,
      impacto: entity.impacto,
      dadosUtilizados: entity.dadosUtilizados,
      parametrosDoAlgoritmo: entity.parametrosDoAlgoritmo,
      informacoesComplementares: entity.informacoesComplementares,
      dataConclusao: entity.dataConclusao,
    };
  }

  static toResponse(entity: CercValidationResultado): Record<string, unknown> {
    return {
      id: entity.id,
      resultadoCercId: entity.resultadoCercId,
      algoritmoTipo: entity.algoritmoTipo,
      algoritmoDimensao: entity.algoritmoDimensao,
      algoritmoEscopo: entity.algoritmoEscopo,
      mensagem: entity.mensagem,
      impacto: entity.impacto,
      dadosUtilizados: entity.dadosUtilizados,
      parametrosDoAlgoritmo: entity.parametrosDoAlgoritmo,
      informacoesComplementares: entity.informacoesComplementares,
      dataConclusao: entity.dataConclusao,
    };
  }

  static fromCercResponse(
    cercValidationId: string,
    raw: {
      id: string;
      codigo: string;
      algoritmo: {
        id: string;
        codigo: string;
        nome: string;
        tipo: string;
        dimensao: CercResultadoDimensao;
        escopo: CercResultadoEscopo;
      };
      mensagem: string;
      impacto: CercResultadoImpacto;
      dados_utilizados: string;
      parametros_do_algoritmo: string;
      informacoes_complementares: string;
      data_conclusao: string;
    },
  ): CercValidationResultado {
    return CercValidationResultado.create({
      cercValidationId,
      resultadoCercId: raw.id,
      codigo: raw.codigo || null,
      algoritmoId: raw.algoritmo.id || null,
      algoritmoCodigo: raw.algoritmo.codigo || null,
      algoritmoNome: raw.algoritmo.nome || null,
      algoritmoTipo: raw.algoritmo.tipo,
      algoritmoDimensao: raw.algoritmo.dimensao,
      algoritmoEscopo: raw.algoritmo.escopo,
      mensagem: raw.mensagem,
      impacto: raw.impacto,
      dadosUtilizados: raw.dados_utilizados || null,
      parametrosDoAlgoritmo: raw.parametros_do_algoritmo || null,
      informacoesComplementares: raw.informacoes_complementares || null,
      dataConclusao: new Date(raw.data_conclusao),
    });
  }
}
