# Serasa Experian — Guia de Implementação e Troubleshooting

**Data:** 26 de fevereiro de 2026  
**Status:** ✅ Autenticação IAM + relatório 200 com CNPJ oficial 50638274000189 (`optionalFeatures=LOCALIZACAO_PJ`)  
**Versão:** Guia de implementação + troubleshooting  

---

## 1. Contexto

Implementar integração com a API Serasa Experian para o produto **Relatório Avançado PJ** (Business Information Report), seguindo o padrão existente (Vadu + Creditbox) no módulo de crédito da plataforma Sarfaty.

**Referência:** [developer.serasaexperian.com.br/api/relatorio-avancado-pj](https://developer.serasaexperian.com.br/api/relatorio-avancado-pj)

---

## 2. Decisão — Auth IAM vs OAuth2

**Causa raiz do 401:** O fluxo **não é** OAuth2 clássico (`/oauth2/v1/token`). Este produto autentica via IAM próprio.

| Ambiente | Endpoint de login |
|----------|-------------------|
| UAT (Homologação) | `https://uat-api.serasaexperian.com.br/security/iam/v1/client-identities/login` |
| Produção | `https://api.serasaexperian.com.br/security/iam/v1/client-identities/login` |

### 2.1 Authorization (Basic IAM)

Dois modos de uso — **não misturar**:

| Modo | Quando usar | Implementação |
|------|-------------|---------------|
| **Base64 padrão** | Serasa forneceu ClientID + ClientSecret | Gerar localmente: `Basic base64(client_id:client_secret)` |
| **Pré-montado** | Serasa forneceu `Authorization: Basic xxxx...` pronto | Guardar em `SERASA_IAM_BASIC` (sem "Basic") e não regenerar |

### 2.2 Token — expiresIn

**⚠️ Atenção:** O campo `expiresIn` retornado pode ser **timestamp epoch** (ex.: `1772141122`) em vez de TTL em segundos (ex.: `3600`). A documentação indica validade de ~1h.

- **Sempre** cachear por ~55 min (3300s) — nunca usar `expiresIn` bruto como TTL (ex.: 1.772.141.122 segundos).
- **Registrar** o payload real (com token mascarado) para confirmar formato: `expiresIn: 3600` vs epoch.

---

## 3. Business Information Report

**Método:** GET com querystring

| Ambiente | URL |
|----------|-----|
| UAT | `GET https://uat-api.serasaexperian.com.br/credit-services/business-information-report/v1/reports?reportName=<relatorio>&optionalFeatures=<features>` |
| Produção | `GET https://api.serasaexperian.com.br/credit-services/business-information-report/v1/reports?reportName=<relatorio>&optionalFeatures=<features>` |

**Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`, `X-Document-Id: <CNPJ 14 dígitos>`

**Parâmetros:**
- `reportName` — obrigatório (ex.: `RELATORIO_AVANCADO_PJ`, `RELATORIO_AVANCADO_PJ_PME`)
- `optionalFeatures` — separado por vírgula (ex.: `QSA_AVANCADO,LOCALIZACAO_PJ`). Se vazio, omitir ou enviar string vazia conforme tolerância da API. Case-sensitive.
- `reportParameters` — JSON em base64 (para features que exigem parâmetros)

**X-Document-Id:** Normalizar apenas dígitos, 14 caracteres.

---

## 4. Interpretação de Erros

| Código | Interpretação | Ação |
|--------|---------------|------|
| **404** | Documento não encontrado na Serasa Experian | Endpoint OK. CNPJ pode não constar na base (ou UAT tem base limitada). Usar CNPJ confirmado pela Serasa como consultável em UAT. |
| **503** | Erro no processamento com features | Instabilidade/feature quebrada no UAT ou entitlement parcial. **Para isolar:** retestar removendo features uma a uma (ou bisect) até achar qual quebra. Abrir chamado com "feature X quebra; sem ela funciona". |
| **412** | Documento inválido, feature inexistente ou usuário não autorizado | Verificar X-Document-Id, features no contrato, logon/CNPJ vinculado. |
| **401** | Authorization falhou | Token expirado ou inválido. Renovar token. |

---

## 5. CNPJ de Teste — Portal de Integração Serasa

A Serasa esclarece no Portal de Integração: os exemplos vêm "com os valores de CPF ou CNPJ zerados" e é preciso "substituí-los por documentos válidos e que estejam previamente cadastrados em nosso ambiente de homologação."

### 5.1 CNPJs oficiais de homologação

| CNPJ | Nome fictício | Usado em |
|------|---------------|----------|
| **50638274000189** | "DAHSUDHASUDHAHDAOSHDAO" (ofuscado) | Relato, Concentre PJ, InfoMais PJ |
| 00000000000188 | "TESTE CLIENTE" | Relatório Avançado PJ (IP20) |

**Resultados na API REST (26/fev/2026):**

| CNPJ | omit | empty | LOCALIZACAO_PJ | QSA_AVANCADO, MAIS_ANOTACOES, SITUACAO_FISCAL |
|------|------|-------|---------------|-----------------------------------------------|
| **50638274000189** | 503 | 503 | **200** | 503 |
| 00000000000188 | 412 | 412 | 412 | 412 |

- **50638274000189**: ✅ Funciona com `optionalFeatures=LOCALIZACAO_PJ`. Resposta completa (facts, judgementFilings, inquiryCompanyResponse, etc.).
- **00000000000188**: 412 em todos os modos — "informe o documento válido em X-Document-Id". Pode ser válido apenas para protocolos antigos (IP20/String), não para API REST.

### 5.2 CNPJs não cadastrados em homologação

- `22295040000140`, `14266773000129` — 404 ou 503; não estão na base de homologação.
- Para novos CNPJs em UAT, solicitar à Serasa o cadastro no ambiente de homologação.

### 5.3 O que fazer

1. **Testar com 50638274000189** — CNPJ oficial; usar `optionalFeatures=LOCALIZACAO_PJ` para obter 200.
2. **Se 404/500 persistir** — CNPJs podem ser válidos só para protocolos antigos; pedir à Serasa os CNPJs específicos para API REST.
3. **Logon de homologação** — vigência de 90 dias; verificar se segue ativo.
4. **Suporte de integração** — Gerente Comercial ou Central: **(11) 3003-7372**

---

## 6. Evidências de Teste (26/fev/2026)

### Token (sucesso)

```json
{
  "accessToken": "eyJ4NXQjUzI1NiI6...",
  "tokenType": "Bearer",
  "expiresIn": "1772141122",
  "scope": ["READ", "WRITE"]
}
```

*Nota: `expiresIn` parece timestamp; doc indica ~1h. Cachear 55 min.*

### Relatórios

| Report | CNPJ 22295040000140 | CNPJ 14266773000129 | CNPJ 50638274000189 (oficial) |
|--------|---------------------|---------------------|--------------------------------|
| RELATORIO_AVANCADO_PJ | 404 | 503 [identification, inquiryCompany] | **200** com features específicas; 503 com omit/empty |

### Mapeamento de features (50638274000189, RELATORIO_AVANCADO_PJ)

**Comando:** `./scripts/serasa-api-test.sh --feature-sweep-full`

| 200 (OK) | 412 (não autorizada) | 500/503/504 (erro UAT) |
|----------|---------------------|-------------------------|
| LIMITE_CREDITO | RECOMENDACAO_LIMITE_CREDITO | PARTICIPACOES, SCORE_POSITIVO, PONTUALIDADE_PAGAMENTO |
| GASTO_ESTIMADO_POSITIVO | SCORE_CUSTOMIZADO | CAPACIDADE_MENSAL_PAGAMENTO, FATURAMENTO_ESTIMADO_POSITIVO |
| QSA_AVANCADO | FATURAMENTO_RECEBIVEIS | QSA_COMPLETO (variável), ANOTACOES_CONSULTAS_SPC |
| QSA_COMPLETO | | HISTORICO_PAGAMENTO_*, PERFIL_FINANCEIRO, MAIS_ANOTACOES |
| DIVIDAS_ORGAOS_PUBLICOS | | LOCALIZACAO_PJ (variável), SITUACAO_FISCAL, SCORE_FRAUDE_PJ |
| ALERTA_CAD_SOCIOS_ADMS | | ... (demais features) |
| INDICADOR_RECUPERACAO_CREDITO_PJ | | |
| AGRO_SCORE_PJ | | |

*UAT instável: LOCALIZACAO_PJ, PARTICIPACOES e outras podem alternar 200/503 entre execuções.*

---

## 7. Checklist de Implementação

### 7.1 Token provider (IAM)

- [ ] Reuso do token por TTL (~55 min)
- [ ] Refresh automático no 401/403 após expirar
- [ ] Logar `x-request-id` / `correlation-id` se a API devolver

### 7.2 Adapter do Bureau

- [ ] Método `getReport(cnpj, reportName, optionalFeatures[])`
- [ ] Normalizar `X-Document-Id` = apenas dígitos, 14 chars

### 7.3 Persistência

- [ ] Tabela `serasa_relatorio_pj_results`:
  - `cnpj`, `report_name`, `optional_features` (json/array)
  - `request_id` / `correlation_id` (se a API devolver)
  - `status_code`, `raw_response` (jsonb), `created_at`
  - Índice em `(cnpj, report_name, created_at desc)`

### 7.4 Governança / LGPD

- [ ] Definir TTL de retenção do `raw_response` (ex.: 90 dias) se aplicável
- [ ] Mascarar logs — **token nunca em log**

---

## 8. Troubleshooting (401 no IAM)

- **SERASA_IAM_BASIC** — Se a Serasa passou Basic pré-montado, use em `.env.local`.
- Credenciais não ativadas no UAT.
- IP fora da allowlist.

---

## 9. Bateria de Testes (`--battery`)

1. **optionalFeatures omitido** — URL sem o param (apenas `?reportName=X`)
2. **optionalFeatures vazio** — URL com `optionalFeatures=` 
3. **Uma feature por vez** — LOCALIZACAO_PJ, QSA_AVANCADO, MAIS_ANOTACOES, SITUACAO_FISCAL
4. **Comparação** — exibe se omit vs empty retornam o mesmo código HTTP

---

## 10. Artefatos

| Arquivo | Descrição |
|---------|-----------|
| `apps/api/src/config/env.ts` | `SERASA_CLIENT_ID`, `SERASA_CLIENT_SECRET` |
| `.env.example` | Documentação das variáveis |
| `scripts/serasa-api-test.sh` | Script de teste (token + relatório; `--battery`, `--feature-sweep`, `--feature-sweep-full`) |
| `docs/serasa_business_information_report_spec.md` | Spec técnica completa |

---

## 11. Comandos

```bash
# Teste básico (CNPJ padrão: 50638274000189)
./scripts/serasa-api-test.sh

# Bateria rápida (omit, empty, 4 features)
./scripts/serasa-api-test.sh --battery

# Mapear todas as 38 features — 200/412/500 (demora ~10 min)
./scripts/serasa-api-test.sh --feature-sweep-full

# Modo feature sweep (3 reports + 3 features)
./scripts/serasa-api-test.sh --feature-sweep

# Report específico
SERASA_REPORT=RELATORIO_AVANCADO_PJ ./scripts/serasa-api-test.sh

# Obter token manualmente
B64=$(printf "%s:%s" "$CLIENT_ID" "$CLIENT_SECRET" | base64 | tr -d '\n')
curl -X POST "https://uat-api.serasaexperian.com.br/security/iam/v1/client-identities/login" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $B64" \
  -d '{}'
```

---

## 11. Histórico Antes do Diagnóstico

- **Data Trust:** Username/Password; ClientID/ClientSecret não aceitos.
- **OAuth2:** `/oauth2/v1/token` retornava 401 — endpoint incorreto para este produto.
