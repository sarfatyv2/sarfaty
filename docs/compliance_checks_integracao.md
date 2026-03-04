# Compliance Checks — Verificações Automatizadas de Fontes Públicas

**Versão:** 2.0  
**Data:** 03 de Março de 2026  
**Status:** Implementado (Adapters, Persistência, UI e Testes + OSINT/Presença Digital)  

---

## 1. Visão Geral

Este documento descreve a implementação das verificações automatizadas de compliance integradas à plataforma Sarfaty. O módulo consulta **9 fontes públicas/gratuitas** em paralelo com a consulta VADU existente, cobrindo risco fiscal, trabalhista, reputacional, sanções, validação de endereço, mídia negativa (OSINT) e presença digital.

As verificações são disparadas automaticamente pelos mesmos eventos do VADU (`ClientCreatedEvent` / `ClientSubmittedEvent`) e os resultados são exibidos na aba **Bureau** da página de detalhe do cliente no backoffice.

### 1.1 Fontes Integradas

| # | Fonte | O que verifica | API/Método | Risco coberto |
|---|-------|---------------|------------|--------------|
| 1 | **CGU — Portal da Transparência** | CEIS (empresas sancionadas), CNEP (penalidades), CEPIM (entidades sem fins lucrativos impedidas) | REST (api.portaldatransparencia.gov.br) | Sanções governamentais |
| 2 | **PGFN — Dívida Ativa** | Débitos inscritos na Dívida Ativa da União | Web scraping (solucoes.receita.fazenda.gov.br) | Risco fiscal |
| 3 | **CNDT — TST** | Certidão Negativa de Débitos Trabalhistas | Probe HTTP (cndt-certidao.tst.jus.br) | Risco trabalhista |
| 4 | **PEP — CGU** | Pessoa Exposta Politicamente (sócios/representantes) | REST (api.portaldatransparencia.gov.br) | Compliance/PLD |
| 5 | **Listas de Sanções** | OFAC (SDN List) — correspondência fuzzy por nome | Dados OFAC (sanctionssearch.ofac.treas.gov) | Sanções internacionais |
| 6 | **Lista de Trabalho Escravo** | "Lista Suja" do Ministério do Trabalho | REST (api.portaldatransparencia.gov.br) | Risco reputacional/trabalhista |
| 7 | **ViaCEP** | Validação de endereço por CEP + comparação com cadastro | REST (viacep.com.br) | Fraude cadastral |
| 8 | **Mídia Negativa (OSINT)** | Busca e classificação de notícias negativas sobre a empresa | Gemini API + Google Search Grounding | Risco reputacional |
| 9 | **Presença Digital** | Verificação de site ativo, DNS e tipo de e-mail (corporativo vs gratuito) | DNS + HTTP probe | Fraude cadastral / presença real |

---

## 2. Arquitetura

### 2.1 Fluxo

```
ClientCreatedEvent / ClientSubmittedEvent
       │
       ▼
ComplianceCheckListener (@OnEvent)
       │
       ▼
SyncComplianceChecksUseCase.execute()
       │
       ├──► CguAdapter.checkAll(cnpj)        → CguCheckResult (3 registros: CEIS, CNEP, CEPIM)
       ├──► PgfnAdapter.queryByCnpj(cnpj)    → PgfnCheckResult
       ├──► CndtAdapter.queryByCnpj(cnpj)    → CndtCheckResult
       ├──► PepAdapter.checkCpfs(cpfs[])      → PepCheckResult[]
       ├──► SanctionsAdapter.screenEntity()   → SanctionsCheckResult[]
       ├──► SlaveLaborAdapter.checkByCnpj()   → SlaveLaborCheckResult
       ├──► ViacepAdapter.queryCep(cep)       → AddressValidationResult
       ├──► NegativeMediaAdapter.search()     → NegativeMediaResult
       └──► DigitalPresenceAdapter.check()    → DigitalPresenceResult
```

Todas as verificações rodam em **paralelo** via `Promise.allSettled`. Se uma falha, as demais continuam normalmente.

### 2.2 Estrutura de Arquivos

```
apps/api/src/modules/credit/
├── bureaus/
│   ├── cgu/
│   │   ├── cgu.adapter.ts              # Adapter CGU (CEIS, CNEP, CEPIM)
│   │   └── cgu.adapter.spec.ts
│   ├── pgfn/
│   │   ├── pgfn.adapter.ts             # Adapter PGFN (Dívida Ativa)
│   │   └── pgfn.adapter.spec.ts
│   ├── cndt/
│   │   ├── cndt.adapter.ts             # Adapter CNDT (TST)
│   │   └── cndt.adapter.spec.ts
│   ├── pep/
│   │   ├── pep.adapter.ts              # Adapter PEP (CGU)
│   │   └── pep.adapter.spec.ts
│   ├── sanctions/
│   │   ├── sanctions.adapter.ts         # Adapter Sanções (OFAC)
│   │   └── sanctions.adapter.spec.ts
│   ├── slave-labor/
│   │   ├── slave-labor.adapter.ts       # Adapter Trabalho Escravo
│   │   └── slave-labor.adapter.spec.ts
│   ├── viacep/
│   │   ├── viacep.adapter.ts            # Adapter ViaCEP
│   │   └── viacep.adapter.spec.ts
│   ├── negative-media/
│   │   ├── negative-media.adapter.ts    # Adapter Mídia Negativa (Gemini API)
│   │   └── negative-media.adapter.spec.ts
│   └── digital-presence/
│       ├── digital-presence.adapter.ts  # Adapter Presença Digital (DNS/HTTP)
│       └── digital-presence.adapter.spec.ts
├── domain/
│   ├── cgu-check-result.entity.ts
│   ├── pgfn-check-result.entity.ts
│   ├── cndt-check-result.entity.ts
│   ├── pep-check-result.entity.ts
│   ├── sanctions-check-result.entity.ts
│   ├── slave-labor-check-result.entity.ts
│   ├── address-validation-result.entity.ts
│   ├── negative-media-result.entity.ts
│   ├── digital-presence-result.entity.ts
│   ├── cgu-check.repository.ts          # Interface
│   ├── pgfn-check.repository.ts
│   ├── cndt-check.repository.ts
│   ├── pep-check.repository.ts
│   ├── sanctions-check.repository.ts
│   ├── slave-labor-check.repository.ts
│   ├── address-validation.repository.ts
│   ├── negative-media.repository.ts
│   └── digital-presence.repository.ts
├── infra/
│   ├── drizzle-cgu-check.repository.ts
│   ├── drizzle-pgfn-check.repository.ts
│   ├── drizzle-cndt-check.repository.ts
│   ├── drizzle-pep-check.repository.ts
│   ├── drizzle-sanctions-check.repository.ts
│   ├── drizzle-slave-labor-check.repository.ts
│   ├── drizzle-address-validation.repository.ts
│   ├── mappers/
│   │   ├── cgu-check-result.mapper.ts
│   │   ├── pgfn-check-result.mapper.ts
│   │   ├── cndt-check-result.mapper.ts
│   │   ├── pep-check-result.mapper.ts
│   │   ├── sanctions-check-result.mapper.ts
│   │   ├── slave-labor-check-result.mapper.ts
│   │   └── address-validation-result.mapper.ts
│   └── events/
│       └── compliance-check.listener.ts
├── use-cases/
│   ├── sync-compliance-checks.use-case.ts
│   ├── sync-compliance-checks.use-case.spec.ts
│   ├── get-compliance-results.use-case.ts
│   └── get-compliance-results.use-case.spec.ts
└── controllers/
    └── credit.controller.ts             # Rota GET compliance-results
```

---

## 3. Adapters (Comunicação Externa)

### 3.1 CguAdapter

Consulta o Portal da Transparência da CGU (api.portaldatransparencia.gov.br). Requer a env var `CGU_API_KEY` (chave gratuita obtida em dados.gov.br).

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `checkCeis(cnpj)` | `/ceis` | Cadastro de Empresas Inidôneas e Suspensas |
| `checkCnep(cnpj)` | `/cnep` | Cadastro Nacional de Empresas Punidas |
| `checkCepim(cnpj)` | `/cepim` | Cadastro de Entidades Privadas Sem Fins Lucrativos Impedidas |
| `checkAll(cnpj)` | — | Executa as 3 consultas em paralelo |

### 3.2 PgfnAdapter

Consulta a dívida ativa via scraping do portal da Receita Federal.

| Método | Descrição |
|--------|-----------|
| `queryByCnpj(cnpj)` | Retorna `{ found, totalDebtAmount, debtCount, rawEntries }` |

### 3.3 CndtAdapter

Consulta a Certidão Negativa de Débitos Trabalhistas no TST. O portal requer CAPTCHA, então o adapter faz apenas uma probe HTTP e retorna `UNAVAILABLE` quando detecta o CAPTCHA.

| Método | Descrição |
|--------|-----------|
| `queryByCnpj(cnpj)` | Retorna `{ status, certificateNumber, validUntil, reason, rawHtml }` |

**Status possíveis:** `NEGATIVE` (sem débitos), `POSITIVE` (com débitos), `POSITIVE_WITH_EFFECTS`, `UNAVAILABLE` (CAPTCHA/indisponível), `UNKNOWN`.

### 3.4 PepAdapter

Consulta PEPs (Pessoas Expostas Politicamente) no Portal da Transparência por CPF.

| Método | Descrição |
|--------|-----------|
| `checkCpfs(cpfs[])` | Recebe array de `{ cpf, name }` e retorna `PepMatch[]` com função e órgão |

### 3.5 SanctionsAdapter

Consulta a OFAC SDN List com correspondência fuzzy (distância de Levenshtein) por razão social e nome fantasia.

| Método | Descrição |
|--------|-----------|
| `screenEntity(companyName, tradeName?)` | Retorna `SanctionsMatch[]` com `score` (0-1) e detalhes |

### 3.6 SlaveLaborAdapter

Consulta a "Lista Suja" de trabalho escravo via Portal da Transparência.

| Método | Descrição |
|--------|-----------|
| `checkByCnpj(cnpj)` | Retorna `SlaveLaborMatch | null` com nome do empregador e trabalhadores resgatados |

### 3.7 ViacepAdapter

Consulta o ViaCEP para validação de endereço e comparação com o endereço cadastrado.

| Método | Descrição |
|--------|-----------|
| `queryCep(cep)` | Retorna `ViacepResult` com logradouro, bairro, cidade, UF |

### 3.8 NegativeMediaAdapter (OSINT)

Usa a **Gemini API com Google Search Grounding** para buscar e classificar automaticamente notícias negativas sobre a empresa. O modelo `gemini-2.5-flash` executa a busca no Google, analisa os resultados e retorna um JSON estruturado. Requer a env var `GEMINI_API_KEY`.

| Método | Descrição |
|--------|-----------|
| `search(companyName, cnpj, tradeName?)` | Retorna `NegativeMediaSearchResult` com riskLevel (HIGH/MEDIUM/LOW/CLEAR), findings, summary e groundingSources |

**Categorias de risco:** fraude, golpe, recuperação judicial, trabalho escravo, multa ambiental, processo criminal, outro.

**Limites:** 5.000 prompts/mês gratuitos (Gemini free tier). Timeout de 45s. Findings limitados a 10.

### 3.9 DigitalPresenceAdapter

Verificação de presença digital sem dependência de API externa. Usa DNS lookup e HTTP probe do Node.js.

| Método | Descrição |
|--------|-----------|
| `check(email)` | Retorna `DigitalPresenceResult` com domain, emailType (corporate/free/unknown), hasDns, hasActiveSite, siteTitle |

**E-mails gratuitos reconhecidos:** gmail, hotmail, outlook, yahoo, uol, bol, terra, ig, protonmail, zoho, icloud e mais.

---

## 4. Banco de Dados — 9 Tabelas

Todas as tabelas possuem FK para `clients.id` e índices por `client_id` e campos de busca.

| Tabela | Descrição |
|--------|-----------|
| `cgu_check_results` | Resultados CGU (1 registro por check_type: CEIS, CNEP, CEPIM) |
| `pgfn_check_results` | Resultado PGFN (dívida ativa) |
| `cndt_check_results` | Resultado CNDT (certidão trabalhista) |
| `pep_check_results` | Resultados PEP (1 por CPF verificado) |
| `sanctions_check_results` | Resultados de sanções (1 por source/match) |
| `slave_labor_check_results` | Resultado trabalho escravo |
| `address_validation_results` | Resultado validação de endereço |
| `negative_media_results` | Resultado OSINT/mídia negativa (Gemini + Google Search) |
| `digital_presence_results` | Resultado verificação de presença digital |

**Schemas Drizzle:** `apps/api/src/database/schema/`

---

## 5. Domínio — Entities e Repositories

Cada fonte possui uma entity imutável com métodos `create()` e `reconstitute()`, e uma interface de repositório com `save()` e `getLatestByClientId()`.

### 5.1 Entities

| Entity | Props principais |
|--------|------------------|
| `CguCheckResult` | `clientId`, `cnpj`, `checkType` (CEIS/CNEP/CEPIM), `hasMatch`, `matchCount`, `summary` |
| `PgfnCheckResult` | `clientId`, `cnpj`, `hasDebt`, `totalDebtAmount`, `debtCount`, `summary` |
| `CndtCheckResult` | `clientId`, `cnpj`, `certificateStatus`, `certificateNumber`, `validUntil` |
| `PepCheckResult` | `clientId`, `cpf`, `personName`, `hasMatch`, `matchedRole`, `matchedOrg` |
| `SanctionsCheckResult` | `clientId`, `entityName`, `documentSearched`, `source`, `hasMatch`, `matchScore`, `matchDetails` |
| `SlaveLaborCheckResult` | `clientId`, `cnpj`, `hasMatch`, `employerName`, `rescuedWorkers`, `inspectionDate` |
| `AddressValidationResult` | `clientId`, `cep`, `isValid`, `street`, `neighborhood`, `city`, `state`, `matchesRegistered` |
| `NegativeMediaResult` | `clientId`, `cnpj`, `companyName`, `riskLevel`, `findingsCount`, `findings` (jsonb), `summary`, `groundingSources` (jsonb) |
| `DigitalPresenceResult` | `clientId`, `domain`, `emailType`, `hasDns`, `hasActiveSite`, `siteTitle` |

### 5.2 Repository Interfaces

Todas seguem o padrão:
```typescript
export interface XxxRepository {
  save(result: XxxEntity): Promise<void>;
  getLatestByClientId(clientId: string): Promise<XxxEntity | XxxEntity[] | null>;
}
```

---

## 6. Use Cases

### 6.1 SyncComplianceChecksUseCase

Orquestra a execução de todas as verificações. Recebe os dados do cliente via `SyncComplianceChecksInput`:

```typescript
interface SyncComplianceChecksInput {
  clientId: string;
  cnpj: string;
  companyName?: string;
  tradeName?: string;
  cep?: string;
  registeredStreet?: string;
  registeredCity?: string;
  registeredState?: string;
  email?: string;
  authorizedPersons?: Array<{ cpf: string; name: string }>;
}
```

Cada verificação é encapsulada em método privado (`syncCgu`, `syncPgfn`, `syncCndt`, `syncNegativeMedia`, `syncDigitalPresence`, etc.) e executada via `Promise.allSettled` para tolerância a falhas.

### 6.2 GetComplianceResultsUseCase

Busca os últimos resultados salvos no banco e calcula o **risco geral** (`overallRisk`):

| Nível | Condição |
|-------|----------|
| `CRITICAL` | Trabalho escravo **ou** sanções com score ≥ 0.85 |
| `HIGH` | PGFN com dívida **ou** CGU com match (CEIS/CNEP/CEPIM) **ou** mídia negativa com risco HIGH |
| `MEDIUM` | CNDT positiva **ou** PEP encontrado **ou** mídia negativa com risco MEDIUM |
| `LOW` | CNDT indisponível/desconhecido (demais limpos) |
| `CLEAR` | Todas as verificações limpas |
| `PENDING` | Nenhuma verificação executada ainda |

---

## 7. Endpoint

```
GET /api/clients/:clientId/credit-analysis/compliance-results
```

**Roles permitidos:** `sales_rep`, `sales_supervisor`, `sales_manager`, `sales_director`, `credit_analyst`, `compliance_officer`, `approver`, `backoffice`, `legal`, `risk_manager`, `recovery`, `litigation`, `admin`

**Response:**
```json
{
  "data": {
    "overallRisk": "CLEAR",
    "cgu": {
      "ceis": { "hasMatch": false, "matchCount": 0, "queriedAt": "..." },
      "cnep": { "hasMatch": false, "matchCount": 0, "queriedAt": "..." },
      "cepim": { "hasMatch": false, "matchCount": 0, "queriedAt": "..." }
    },
    "pep": [],
    "pgfn": { "hasDebt": false, "totalDebtAmount": null, "debtCount": 0, "queriedAt": "..." },
    "cndt": { "certificateStatus": "UNAVAILABLE", "certificateNumber": null, "validUntil": null, "queriedAt": "..." },
    "addressValidation": { "isValid": true, "matchesRegistered": true, "queriedAt": "..." },
    "sanctions": [],
    "slaveLaborCheck": { "hasMatch": false, "queriedAt": "..." },
    "negativeMedia": { "riskLevel": "CLEAR", "findingsCount": 0, "findings": [], "summary": "...", "groundingSources": [], "queriedAt": "..." },
    "digitalPresence": { "domain": "empresa.com.br", "emailType": "corporate", "hasDns": true, "hasActiveSite": true, "siteTitle": "...", "queriedAt": "..." }
  }
}
```

---

## 8. Frontend — Aba Bureau (Backoffice)

Os resultados de compliance são exibidos na aba **Bureau** do detalhe do cliente, organizados em cards expansíveis:

### Card "Compliance"
- **Badge de risco geral** (CRITICAL/HIGH/MEDIUM/LOW/CLEAR/PENDING) com cor dinâmica
- **Seções internas:**
  - CGU (CEIS, CNEP, CEPIM) — status por tipo
  - PGFN — dívida ativa com valor total
  - CNDT — status da certidão trabalhista (com link para verificação manual quando UNAVAILABLE)
  - PEP — lista de matches com função e órgão
  - Sanções — lista com score de correspondência
  - Trabalho Escravo — match com detalhes

### Card "Validação de Endereço"
- Status de validação (Válido/Inválido)
- Comparação endereço ViaCEP vs endereço cadastrado
- Badge "Endereço confere" ou "Divergência"

### Card "Mídia Negativa" (OSINT)
- **Badge de risco** (HIGH/MEDIUM/LOW/CLEAR) com cor dinâmica
- **Summary** — resumo gerado pelo Gemini sobre a reputação da empresa
- **Findings** — lista de notícias/menções negativas com:
  - Categoria (badge colorido: fraude, golpe, recuperação judicial, etc.)
  - Título e snippet
  - Link para a fonte original
  - Data aproximada
- Quando CLEAR: mensagem "Nenhuma menção negativa encontrada na internet"

### Card "Presença Digital"
- **Tipo de e-mail** — badge corporativo (verde) ou gratuito (amarelo)
- **DNS resolve** — sim/não
- **Site ativo** — sim/não com link para o site
- **Título do site** — extraído do HTML

**Componente:** `apps/web-backoffice/src/app/(dashboard)/clients/[id]/_components/tabs/client-credit-analysis-tab.tsx`

---

## 9. Configurações e Variáveis de Ambiente

```
CGU_API_KEY=<chave gratuita do Portal da Transparência>
GEMINI_API_KEY=<chave da Gemini API (Google AI Studio)>
```

- `CGU_API_KEY` — Obtida em: https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email
- `GEMINI_API_KEY` — Obtida em: https://aistudio.google.com/apikey (5.000 prompts/mês gratuitos)

---

## 10. Testes

Todos os adapters e use cases possuem testes unitários com Vitest:

| Arquivo | Escopo |
|---------|--------|
| `cgu.adapter.spec.ts` | Mock de fetch, testa CEIS/CNEP/CEPIM |
| `pgfn.adapter.spec.ts` | Mock de fetch, testa parsing de dívida |
| `cndt.adapter.spec.ts` | Mock de fetch, testa CAPTCHA detection |
| `pep.adapter.spec.ts` | Mock de fetch, testa matching por CPF |
| `sanctions.adapter.spec.ts` | Mock de fetch, testa fuzzy matching |
| `slave-labor.adapter.spec.ts` | Mock de fetch, testa matching por CNPJ |
| `viacep.adapter.spec.ts` | Mock de fetch, testa validação de CEP |
| `sync-compliance-checks.use-case.spec.ts` | Testa orquestração completa |
| `get-compliance-results.use-case.spec.ts` | Testa cálculo de risco |

---

## 11. Limitações Conhecidas

1. **CNDT (TST):** O portal requer CAPTCHA — o adapter retorna `UNAVAILABLE` e o UI sugere verificação manual com link direto.
2. **Sanções:** Atualmente apenas OFAC SDN List. UN/EU/OpenSanctions podem ser adicionados futuramente.
3. **PEP:** Depende da disponibilidade da API do Portal da Transparência.
4. **PGFN:** Web scraping sujeito a mudanças no layout do portal da Receita.
5. **Dados não são atualizados automaticamente** — são consultados apenas nos eventos de criação/submissão do cliente.
