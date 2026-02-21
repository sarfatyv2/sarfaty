# Integração VADU — Consulta de CNPJ e CPF

**Versão:** 1.0  
**Data:** 21 de Fevereiro de 2026  
**Status:** Adaptador e Persistência completos (Backend)  

---

## 1. Visão Geral

Este documento descreve a implementação da integração com a API da VADU para consulta automatizada de dados de CNPJ (empresas) e CPF (sócios/pessoas autorizadas). A integração segue os princípios de Domain-Driven Design (DDD) leve estabelecidos na arquitetura do sistema, separando claramente a comunicação externa, as regras de domínio e a persistência no banco de dados.

O objetivo da integração é enriquecer a base de dados do cliente durante o processo de análise de crédito (CreditAnalysisWorkflow), extraindo informações valiosas da VADU e armazenando o histórico completo (JSON) e dados estruturados essenciais.

---

## 2. Banco de Dados — Schemas Drizzle

Foram criadas duas novas tabelas para armazenar os resultados das consultas da VADU, vinculando-os aos clientes e pessoas autorizadas do nosso sistema.

**Diretório:** `apps/api/src/database/schema/`

### 2.1 `vadu_company_results` (vadu-company-results.ts)

Armazena o resultado da consulta de CNPJ de uma empresa.

- **`clientId`**: Relacionamento obrigatório com a tabela `clients`.
- **Campos estruturados**: `cnpj`, `companyName`, `tradeName`, `revenueStatus`, `revenueStatusDate`, `specialStatus`, `capitalSocial`, `legalNature`, `isSimplesNacional`, `companySize`, `environmentalScore`, `environmentalLevel`.
- **`rawData`** (`jsonb`): Payload original completo retornado pela API da VADU.
- **`queriedAt`**: Timestamp do momento em que a consulta foi realizada no nosso sistema.

### 2.2 `vadu_person_results` (vadu-person-results.ts)

Armazena o resultado da consulta de CPF de uma pessoa física (sócio, representante, etc).

- **`clientId`**: Relacionamento obrigatório com a tabela `clients` (a qual cliente este CPF pertence).
- **`authorizedPersonId`**: Relacionamento opcional com `client_authorized_persons` (se quisermos atrelar o resultado à entidade exata do sócio cadastrado).
- **Campos estruturados**: `cpf`, `name`, `birthDate`, `motherName`.
- **`rawData`** (`jsonb`): Payload original completo retornado pela API da VADU.
- **`queriedAt`**: Timestamp da consulta.

Ambas as tabelas foram incluídas no `index.ts` de schemas e a migration correspondente foi gerada (`pnpm drizzle-kit generate`).

---

## 3. Módulo NestJS — `credit`

A integração foi implementada dentro do módulo `credit`, estruturada em camadas.

**Diretório Base:** `apps/api/src/modules/credit/`

### 3.1 Infraestrutura (Comunicação com API Externa)

**Arquivo:** `bureaus/vadu/vadu.adapter.ts`

Responsável exclusivamente pela comunicação HTTP com a API da VADU.
- Obtém o token temporário via endpoint `/Autenticacao/JSONPegarToken` utilizando a chave definida na variável de ambiente `VADU_API_KEY`.
- Implementa um mecanismo de cache interno em memória para o token (expira em 17 horas, já que a VADU expira em 18h).
- Implementa `queryCnpj(cnpj)` realizando POST em `/ServicoAnaliseOperacao/Consulta/{cnpj}`.
- Implementa `queryCpf(cpf)` realizando POST em `/ServicoAnaliseOperacao/ConsultaPF/{cpf}`.
- **Nota técnica**: Foi adicionado o cabeçalho `Content-Length: 0` nas chamadas POST para resolver o erro HTTP 411 (Length Required) retornado pelo servidor da VADU.

### 3.2 Domínio (Entities e Repository Interface)

**Arquivos:** 
- `domain/vadu-company-result.entity.ts`
- `domain/vadu-person-result.entity.ts`
- `domain/vadu.repository.ts`

- As classes `VaduCompanyResult` e `VaduPersonResult` encapsulam os dados da consulta no formato do domínio, garantindo que o restante da aplicação não dependa diretamente do formato bruto da VADU ou das colunas do Drizzle.
- O `VaduRepository` define a interface (contrato) para salvar e recuperar essas entidades (`saveCompanyResult`, `savePersonResult`, `getLatestCompanyResult`, `getLatestPersonResults`).

### 3.3 Mappers (Tradução Domínio ↔ Drizzle)

**Arquivos:** 
- `infra/mappers/vadu-company-result.mapper.ts`
- `infra/mappers/vadu-person-result.mapper.ts`

Transformam o objeto de Domínio (`VaduCompanyResult`) em objeto pronto para inserção no banco pelo Drizzle (`InsertVaduCompanyResult`) e fazem o caminho inverso após um `SELECT`. Tratam também conversões de tipos (como cast de `string` do Drizzle numeric para `number` do domínio).

### 3.4 Persistência (Drizzle Repository)

**Arquivo:** `infra/drizzle/drizzle-vadu.repository.ts`

A implementação concreta da interface `VaduRepository` usando o Drizzle ORM. Injeta o `DB_CONNECTION` e realiza as operações de inserção e busca nas tabelas recém-criadas.

### 3.5 UseCase (Orquestração)

**Arquivo:** `use-cases/sync-vadu-client.use-case.ts`

A classe `SyncVaduClientUseCase` orquestra o fluxo. Ela recebe o `clientId`, o `cnpj` da empresa e um array com os `cpfs` dos sócios.
1. Faz as requisições através do `VaduAdapter` de forma paralela usando `Promise.allSettled` (se um CPF falhar, não impede a gravação do CNPJ e dos outros CPFs).
2. Pega os dados brutos da VADU (`rawData`).
3. Mapeia e instancia os objetos de domínio (`VaduCompanyResult` e `VaduPersonResult`) com os campos normalizados.
4. Chama o `VaduRepository` para salvar as entidades no banco.

---

## 4. Configurações e Variáveis de Ambiente

Foi adicionada e tornada obrigatória a variável de ambiente `VADU_API_KEY` para autenticação com a VADU.

**Arquivo:** `apps/api/src/config/env.ts`
```typescript
VADU_API_KEY: z.string().min(1),
```

---

## 5. Fluxo de Execução Recomendado (Próximos Passos)

1. No workflow do Temporal (`CreditAnalysisWorkflow`) ou em um listener de evento (`client.submitted`), o sistema injeta o `SyncVaduClientUseCase`.
2. O sistema busca os CPFs atrelados ao cliente na base de dados (`client_authorized_persons`).
3. O sistema chama `syncVaduClientUseCase.execute({ clientId, cnpj, authorizedPersons })`.
4. Os dados são salvos nas tabelas `vadu_company_results` e `vadu_person_results`.
5. Quando a mesa de aprovação for visualizar o cliente, uma rota GET no controller fará o `getLatestCompanyResult` para mostrar no frontend (Dashboard de Crédito) de forma limpa, sem precisar realizar uma nova requisição à VADU.