# Banco de Dados Legado — DLSGS

Documentação completa do schema legado da Sarfaty, extraído do arquivo `docs/136_schemas.xlsx` (aba `DLSGS`).

## O que é o DLSGS

O DLSGS é um **Data Lake / Data Warehouse consolidado** que agrega dados de dois sistemas legados:

- **SGS** — sistema anterior à plataforma NetFactor
- **NetFactor** — sistema operacional principal (ERP de factoring/FIDC)

O DLSGS não é um sistema transacional. É uma camada de consolidação com dados normalizados e desnormalizados para relatórios, integrações e migração. Toda tabela carrega os campos `id_sgs` e `id_net_factor` como chaves de rastreabilidade cruzada entre os dois sistemas de origem.

## Estrutura de arquivos

| Arquivo | Domínio | Tabelas |
|---------|---------|---------|
| [01-clientes.md](./01-clientes.md) | Cedentes (clientes) | 9 |
| [02-sacados.md](./02-sacados.md) | Sacados (devedores) | 7 |
| [03-fornecedores.md](./03-fornecedores.md) | Fornecedores | 5 |
| [04-grupos-economicos.md](./04-grupos-economicos.md) | Grupos econômicos (empresas do grupo Sarfaty) | 7 |
| [05-conta-corrente.md](./05-conta-corrente.md) | Conta corrente e extrato financeiro | 8 |
| [06-debentures.md](./06-debentures.md) | Debêntures e investimentos | 11 |
| [07-taxas-estoque.md](./07-taxas-estoque.md) | Taxas de mercado e posição de carteira FIDC | 7 |
| [08-checagem-credito.md](./08-checagem-credito.md) | Checagem de canhoto e crédito | 1 |

**Total: 55 tabelas de negócio documentadas** (excluídas: `awsdms_truncation_safeguard`, `systranschemas`, `Staging_CadastroBmp`, `Log_Auditoria_Origem` — tabelas de infra/staging).

## Convenções de nomenclatura do legado

### Prefixos de tabela

| Prefixo | Significado |
|---------|-------------|
| `cadastro_clientes_*` | Dados cadastrais dos cedentes (clientes) |
| `cadastro_sacados_*` | Dados cadastrais dos sacados (devedores/pagadores) |
| `cadastro_fornecedores_*` | Dados cadastrais de fornecedores da Sarfaty |
| `cadastro_empresas_grupo_*` | Dados das empresas do grupo Sarfaty |
| `conta_corrente_*` | Movimentação financeira e extrato de conta corrente |
| `DLDB_*` | Data Lake Database — debêntures, investimentos e cadastro consolidado |
| `DLSA_*` | Data Lake SA — estoque de carteira FIDC e taxas de mercado |
| `credito_*` | Módulo de crédito operacional |

### Padrão estrutural dos domínios de cadastro

Clientes, sacados e fornecedores seguem **exatamente a mesma estrutura** de sub-tabelas:

```
{entidade}_dados_basicos     → identidade PF/PJ, documentos pessoais/empresariais
{entidade}_dados_contato     → emails, telefones, WhatsApp, homepage
{entidade}_dados_endereco    → endereços múltiplos com tipo de uso
{entidade}_dados_adicionais  → gerente responsável, compliance (PEP/OFAC), ciclo cadastral
{entidade}_dados_bancarios   → contas bancárias para pagamento/recebimento
```

Isso indica um **modelo de Party** subjacente, onde PF e PJ são variantes da mesma entidade.

## IDs de migração

Toda tabela de negócio do DLSGS carrega dois campos de rastreabilidade:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id_sgs` | `int` | Identificador no sistema SGS (legado anterior) |
| `id_net_factor` | `int` | Identificador no NetFactor (sistema operacional) |

Durante a migração para a nova plataforma, esses campos devem ser preservados como `legacy_sgs_id` e `legacy_nf_id` nas tabelas destino, garantindo rastreabilidade completa e possibilidade de rollback ou consulta cruzada.

## Tipos de dados do legado (SQL Server → PostgreSQL)

| SQL Server | PostgreSQL (Drizzle) |
|------------|----------------------|
| `int` | `integer` |
| `varchar(n)` | `text` ou `varchar(n)` |
| `char(n)` | `char(n)` |
| `bit` | `boolean` |
| `date` | `date` |
| `datetime` / `datetime2` | `timestamp with time zone` |
| `numeric(p,s)` / `decimal(p,s)` | `numeric(p,s)` |
| `bigint` | `bigint` |
| `varbinary` | `bytea` (ou storage externo via Supabase Storage) |
| `varchar(MAX)` | `text` |
| `nvarchar(n)` | `text` |
| `time` | `time` |

## Status de campos comuns

Em praticamente todas as tabelas existe o campo `status_cadastro varchar(10)` com os valores:

- `'ATIVO'` — registro vigente
- `'INATIVO'` — registro inativo mas preservado
- `'EXCLUIDO'` — exclusão lógica

O campo `data_carga datetime2` com default `(sysutcdatetime())` indica a data em que o registro foi carregado no Data Lake (não a data de criação no sistema operacional).
