# Integração VADU — Consulta de CNPJ, CPF e CreditBox

**Versão:** 1.2  
**Data:** 03 de Março de 2026  
**Status:** Adaptadores, Persistência e UI completos (Módulos Síncronos e Assíncronos)  

---

## 1. Visão Geral

Este documento descreve a implementação da integração com a API da VADU para consulta automatizada de dados. A integração é dividida em dois módulos principais:
1. **Módulo Básico (Síncrono):** Consulta imediata de dados cadastrais na Receita Federal (CNPJ) e dados de pessoas físicas (CPF).
2. **Módulo CreditBox (Assíncrono):** Geração de relatório de crédito profundo (Score, Protestos, Dívidas PGFN, etc.) e obtenção do PDF oficial.

A integração segue os princípios de Domain-Driven Design (DDD) leve estabelecidos na arquitetura do sistema, separando claramente a comunicação externa, as regras de domínio e a persistência no banco de dados.

O objetivo da integração é enriquecer a base de dados do cliente durante o processo de análise de crédito (CreditAnalysisWorkflow), extraindo informações valiosas da VADU e armazenando o histórico completo (JSON e PDF) e dados estruturados essenciais.

---

## 2. Banco de Dados — Schemas Drizzle

Foram criadas tabelas para armazenar os resultados das consultas, vinculando-os aos clientes e pessoas autorizadas.

**Diretório:** `apps/api/src/database/schema/`

### 2.1 `vadu_company_results` e `vadu_person_results`
Armazenam os resultados imediatos (síncronos) da consulta básica de CNPJ e CPF.
- Salvam os dados estruturados essenciais e o payload bruto em `rawData` (jsonb).

### 2.2 `creditbox_reports` (creditbox-reports.ts)
Armazena o estado e o resultado da geração assíncrona do relatório CreditBox.
- **`clientId`**: Relacionamento com a tabela `clients`.
- **`processId`**: ID retornado pela VADU ao iniciar a geração do relatório.
- **`status`**: Estado do processamento (`PENDING`, `PROCESSING`, `COMPLETED`, `ERROR`).
- **`reportJson`** (`jsonb`): O JSON completo do relatório retornado.
- **`pdfBase64`** (`text`): O arquivo PDF codificado em Base64 gerado pela VADU.
- **`errorMessage`**: Mensagem de erro caso a geração falhe (ex: "Cadastro não encontrado").

---

## 3. Módulo NestJS — `credit`

A integração foi implementada dentro do módulo `credit`, estruturada em camadas.

### 3.1 Infraestrutura (Adapters de Comunicação Externa)

Responsáveis exclusivamente pela comunicação HTTP com as APIs da VADU.

- **`VaduAdapter` (`bureaus/vadu/vadu.adapter.ts`)**: Comunica com `vadu.com.br` para consultas síncronas de CNPJ e CPF.
- **`CreditboxAdapter` (`bureaus/creditbox/creditbox.adapter.ts`)**: Comunica com `creditbox.com.br` para solicitar a geração do relatório e fazer o *polling* do status do processo.
- **Nota técnica sobre Autenticação**: Ambos os adapters obtêm tokens temporários em cache (válidos por 17h) utilizando a variável de ambiente `VADU_API_KEY`. Foi implementado um regex `replace(/^"|"$/g, '')` para limpar aspas que possam vir do `.env.local`, evitando erros HTTP 403 (Forbidden) ocasionados por aspas indevidas no cabeçalho `Bearer`. Também foi adicionado o cabeçalho `Content-Length: 0` nas chamadas POST para resolver o erro HTTP 411 (Length Required).

### 3.2 Domínio (Entities e Repository Interfaces)

- **VADU Básico**: `VaduCompanyResult`, `VaduPersonResult` e `VaduRepository`.
- **CreditBox**: A entidade `CreditboxReport` gerencia as mudanças de estado (ex: `markAsCompleted`, `markAsError`) e o `CreditboxRepository` define o contrato para persistência.

### 3.3 Mappers e Persistência (Drizzle)

Transformam objetos de Domínio em objetos prontos para o banco de dados e vice-versa.
As implementações `DrizzleVaduRepository` e `DrizzleCreditboxRepository` injetam a conexão com o banco e realizam as operações SQL usando Drizzle ORM.

### 3.4 Casos de Uso (Use Cases)

A orquestração das regras de negócio foi dividida em Use Cases distintos:

**VADU Básico:**
- `SyncVaduClientUseCase`: Chama a API síncrona para CNPJ e CPFs em paralelo, salva os resultados e retorna. É disparado automaticamente via Eventos (`ClientCreatedEvent`, `ClientSubmittedEvent`) através do `VaduClientListener`.
- `GetVaduResultsUseCase`: Busca os últimos resultados salvos no banco para exibição.

**CreditBox (Assíncrono):**
- `RequestCreditboxReportUseCase`: Envia o comando para a VADU iniciar a geração e cria o registro com status `PENDING`. Lida imediatamente com erros da API como "Cadastro não encontrado".
- `SyncCreditboxReportUseCase`: Realiza o *polling* na VADU. Se o relatório estiver pronto, atualiza o status para `COMPLETED` e salva o JSON e o PDF decodificado no banco.
- `GetCreditboxReportUseCase`: Busca o último relatório do banco para exibição imediata na tela, sem novas consultas externas.

---

## 4. Frontend e Interface (Web Backoffice)

Foi criada a aba **Bureau** na página de Detalhes do Cliente (`ClientDetail`), que atua como um Dashboard consolidado:

1. **Análise da Empresa e Sócios (VADU)**: Exibe os resultados das consultas síncronas de forma elegante, dividida em Cards temáticos (Informações Principais, Atividades, Contato, Risco Ambiental, Sócios). Utilizamos `StatusBadge` para colorir dinamicamente status como "ATIVA" ou "Sem risco".
2. **Relatório Completo (CreditBox)**: 
   - Exibe o botão "Gerar Relatório CreditBox".
   - Ao ser clicado, a interface inicia um *polling* de 5 em 5 segundos (`/sync`) mostrando um spinner de carregamento.
   - Trata e exibe erros amigáveis na tela caso a VADU recuse a geração.
   - Em caso de sucesso, disponibiliza o download do PDF Oficial gerado pelo Bureau e exibe os dados do JSON em tela.
   - Há botões interativos (`<Code2 />`) para visualizar o `raw_data` (JSON bruto) de cada consulta em painéis com scroll.

---

## 5. Configurações e Variáveis de Ambiente

**Arquivo:** `apps/api/src/config/env.ts`

```typescript
VADU_API_KEY: z.string().min(1),
```
Esta mesma chave é utilizada para autenticação tanto na API padrão da VADU quanto no CreditBox.

---

## 6. Módulo de Compliance Checks (Complementar)

Além das consultas VADU e CreditBox, o sistema executa **7 verificações automatizadas de fontes públicas gratuitas** em paralelo, disparadas pelos mesmos eventos (`ClientCreatedEvent` / `ClientSubmittedEvent`).

As verificações cobrem: CGU (CEIS/CNEP/CEPIM), PGFN (Dívida Ativa), CNDT (Certidão Trabalhista), PEP (Pessoa Exposta Politicamente), Listas de Sanções (OFAC), Lista de Trabalho Escravo e Validação de Endereço (ViaCEP).

Os resultados são exibidos junto com os dados VADU/CreditBox na aba **Bureau** do detalhe do cliente, em cards expansíveis separados (Compliance e Validação de Endereço).

**Documentação completa:** `docs/compliance_checks_integracao.md`

---

## 7. Outros bureaus — CERC e upMiner

Integrações complementares à análise de crédito:

- **CERC** (validação de duplicatas mercantis, resultados de análise por algoritmo e extração de NF-e com Gemini): `docs/cerc_integracao.md`
- **upMiner** (análise PF/PJ, batch e dossier via API): `docs/upminer_integracao.md`