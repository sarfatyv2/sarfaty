import type { CercResultadoDimensao, CercResultadoEscopo, CercResultadoImpacto } from '../bureaus/cerc/cerc.types';

export interface CercValidationResultadoProps {
  id: string;
  cercValidationId: string;

  resultadoCercId: string;
  codigo: string | null;

  algoritmoId: string | null;
  algoritmoCodigo: string | null;
  algoritmoNome: string | null;
  algoritmoTipo: string;
  algoritmoDimensao: CercResultadoDimensao;
  algoritmoEscopo: CercResultadoEscopo;

  mensagem: string;
  impacto: CercResultadoImpacto;

  dadosUtilizados: string | null;
  parametrosDoAlgoritmo: string | null;
  informacoesComplementares: string | null;

  dataConclusao: Date;
  createdAt: Date;
}

export class CercValidationResultado {
  constructor(private readonly props: CercValidationResultadoProps) {}

  get id(): string { return this.props.id; }
  get cercValidationId(): string { return this.props.cercValidationId; }
  get resultadoCercId(): string { return this.props.resultadoCercId; }
  get codigo(): string | null { return this.props.codigo; }
  get algoritmoId(): string | null { return this.props.algoritmoId; }
  get algoritmoCodigo(): string | null { return this.props.algoritmoCodigo; }
  get algoritmoNome(): string | null { return this.props.algoritmoNome; }
  get algoritmoTipo(): string { return this.props.algoritmoTipo; }
  get algoritmoDimensao(): CercResultadoDimensao { return this.props.algoritmoDimensao; }
  get algoritmoEscopo(): CercResultadoEscopo { return this.props.algoritmoEscopo; }
  get mensagem(): string { return this.props.mensagem; }
  get impacto(): CercResultadoImpacto { return this.props.impacto; }
  get dadosUtilizados(): string | null { return this.props.dadosUtilizados; }
  get parametrosDoAlgoritmo(): string | null { return this.props.parametrosDoAlgoritmo; }
  get informacoesComplementares(): string | null { return this.props.informacoesComplementares; }
  get dataConclusao(): Date { return this.props.dataConclusao; }
  get createdAt(): Date { return this.props.createdAt; }

  isCritico(): boolean { return this.props.impacto === 'critico'; }
  isAlerta(): boolean { return this.props.impacto === 'alerta'; }

  static create(
    input: Omit<CercValidationResultadoProps, 'id' | 'createdAt'>,
  ): CercValidationResultado {
    return new CercValidationResultado({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstruct(props: CercValidationResultadoProps): CercValidationResultado {
    return new CercValidationResultado(props);
  }
}
