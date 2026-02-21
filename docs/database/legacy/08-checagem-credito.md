# Checagem de Crédito e Canhoto — Banco Legado

Domínio operacional de **checagem de canhoto** — processo de verificação física ou eletrônica do canhoto (comprovante de entrega) de títulos de crédito, especialmente duplicatas e cheques.

O canhoto é o comprovante de que a mercadoria/serviço foi efetivamente entregue ao sacado. Sua verificação é etapa obrigatória no processo de factoring antes da efetivação de operações, pois valida que o título tem lastro real.

## Processo de checagem

```
Operação (cedente → Sarfaty)
  └── Ingresso (título na operação)
        └── Checagem de Canhoto
              ├── Situação: Pendente / OK / Rejeitado
              ├── Coleta física (ordem de coleta)
              └── Movimentação vinculada (baixa, liquidação)
```

---

## `credito_canhoto_checagem`

**Propósito:** Registro consolidado de cada título que passou pelo processo de checagem — une dados do título (ingresso), do cedente, do sacado, do produto e do resultado da verificação.

Esta é uma tabela desnormalizada (visão de relatório) que agrega dados de múltiplas entidades do NetFactor em uma única linha por título.

| Coluna | Tipo | Nulável | Descrição |
|--------|------|---------|-----------|
| `ID_credito_canhoto` | `int` | PK | Identificador legado. |
| `empCodigo` | `int` | sim | Código da empresa operadora no NetFactor. |
| `cedCodigo` | `int` | sim | Código do cedente no NetFactor. |
| `ingDocumento` | `varchar(20)` | sim | Número do documento do ingresso (título). |
| `ingCanhoto` | `varchar(200)` | sim | Código/referência do canhoto. |
| `dataCanhoto` | `date` | sim | Data de emissão/registro do canhoto. |
| `ced_cnpj_cpf` | `varchar(20)` | sim | CNPJ/CPF do cedente. |
| `ced_nome` | `varchar(300)` | sim | Nome/razão social do cedente. |
| `ced_uf` | `char(2)` | sim | UF do cedente. |
| `ced_id_sgs` | `int` | sim | ID do cedente no SGS. |
| `sac_cnpj_cpf` | `varchar(20)` | sim | CNPJ/CPF do sacado. |
| `sac_nome` | `varchar(300)` | sim | Nome/razão social do sacado. |
| `sac_uf` | `char(2)` | sim | UF do sacado. |
| `idgCodigo` | `varchar(20)` | sim | Código do identificador global (carteira/produto). |
| `focoCodigo` | `varchar(10)` | sim | Código do foco de negócio (segmento comercial). |
| `focoDescricao` | `varchar(200)` | sim | Descrição do foco (ex: `Agronegócio`, `Varejo`, `Serviços`). |
| `papelCodigo` | `varchar(10)` | sim | Código do papel/produto financeiro. |
| `papelDescricao` | `varchar(200)` | sim | Descrição do papel (ex: `Duplicata`, `Cheque`, `NF-e`). |
| `produtoDescricao` | `varchar(400)` | sim | Descrição completa do produto da operação. |
| `ingValordeFace` | `decimal(18,4)` | sim | Valor de face do título (valor nominal). |
| `ingDataOpe` | `date` | sim | Data da operação de factoring. |
| `ingVencimento` | `date` | sim | Data de vencimento do título. |
| `ingRegistroLiquidacao` | `date` | sim | Data de registro da liquidação. |
| `ingEmissao` | `date` | sim | Data de emissão do título pelo cedente. |
| `ingConfirmacaoTipo` | `int` | sim | Tipo de confirmação do título pelo sacado: `1=Físico`, `2=Digital`, `3=Implícito`. |
| `tcoDescricao` | `varchar(200)` | sim | Descrição do tipo de confirmação. |
| `tcoSituacao` | `int` | sim | Situação da confirmação: `0=Pendente`, `1=Confirmado`, `2=Rejeitado`. |
| `tcoSigla` | `varchar(50)` | sim | Sigla do tipo de confirmação. |
| `ingCodigo` | `int` | sim | Código interno do ingresso (título) no NetFactor. |
| `movDescricao` | `varchar(500)` | sim | Descrição da movimentação financeira vinculada. |
| `movData` | `date` | sim | Data da movimentação. |
| `movAnexo` | `varchar(500)` | sim | Referência ao anexo da movimentação (arquivo digitalizado). |
| `dataChecagem` | `date` | sim | Data em que a checagem foi realizada. |
| `situacaoChecagem` | `varchar(50)` | sim | Resultado: `Pendente`, `OK`, `Rejeitado`, `Em análise`. |
| `complementoChecagem` | `varchar(500)` | sim | Observação do analista sobre a checagem. |
| `Status_Cadastro` | `varchar(20)` | sim | Status do registro: `ATIVO`, `INATIVO`. |
| `Data_Carga` | `datetime2` | sim | Data de carga no Data Lake. Default: `sysutcdatetime()`. |
| `ingSituacaoCanhoto` | `varchar(200)` | sim | Situação detalhada do canhoto: `Recebido`, `Pendente de coleta`, `Extraviado`. |
| `ingOrdemColeta` | `varchar(200)` | sim | Número da ordem de coleta física do canhoto. |
| `ingSituacaoColeta` | `varchar(200)` | sim | Situação da coleta: `Agendada`, `Realizada`, `Cancelada`. |
| `cedClassificacao` | `varchar(100)` | sim | Classificação de risco do cedente (ex: `AA`, `A`, `B`). |
| `nfxNumero` | `varchar(50)` | sim | Número da nota fiscal eletrônica (NF-e) vinculada. |
| `nfxValor` | `decimal(18,4)` | sim | Valor da NF-e. |
| `opeCodigo` | `int` | sim | Código da operação de factoring no NetFactor. |

---

## Campos de referência cruzada

| Campo | Referência no NetFactor |
|-------|------------------------|
| `empCodigo` | `nfEmpresa.empCodigo` |
| `cedCodigo` | `nfCedente.cedCodigo` |
| `ingCodigo` | `nfIngressos.ingCodigo` |
| `opeCodigo` | `nfOperacao.opeCodigo` |

---

## Observações de migração

1. **Tabela desnormalizada:** `credito_canhoto_checagem` é uma visão analítica — não deve ser migrada como está. Seus dados serão reconstituídos pelas relações entre as entidades no novo sistema.

2. **Mapeamento para `client_documents`:** o processo de checagem de canhoto no novo sistema deve ser modelado como um tipo de documento vinculado à operação:
   - `document_type = 'canhoto'`
   - Campos adicionais: `verification_status`, `verification_date`, `verification_notes`, `collection_order`, `collection_status`

3. **Classificação do cedente:** `cedClassificacao` é o rating de risco do cedente — deve ser um campo em `clients` (`risk_rating`) atualizado periodicamente.

4. **NF-e vinculada:** `nfxNumero` e `nfxValor` apontam para a integração com monitoramento de NF-e — processo de verificação eletrônica que pode substituir a checagem física do canhoto.

5. **Confirmação do sacado:** `ingConfirmacaoTipo` e `tcoSituacao` são dados críticos de confirmação — o sacado confirmando o recebimento é equivalente ao aceite eletrônico no novo sistema.

6. **Foco de negócio e papel:** `focoCodigo`/`focoDescricao` e `papelCodigo`/`papelDescricao` correspondem aos segmentos e produtos financeiros da nova plataforma — mapear para `segments` e `credit_products`.
