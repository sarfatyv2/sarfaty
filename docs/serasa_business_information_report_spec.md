# Serasa Experian — Business Information Report (Spec Técnica)

Especificação técnica para implementação do adapter Serasa.

---

## 1. URLs e Ambiente

| Ambiente | Base URL | Relatório |
|----------|----------|-----------|
| Homologação | `https://uat-api.serasaexperian.com.br` | `/credit-services/business-information-report/v1/reports` |
| Produção | `https://api.serasaexperian.com.br` | `/credit-services/business-information-report/v1/reports` |

**Endpoint completo:** `GET {base}/credit-services/business-information-report/v1/reports?reportName={relatorio}&optionalFeatures={features}&reportParameters={base64}`

---

## 2. Autenticação (IAM)

| Ambiente | Endpoint |
|----------|----------|
| UAT | `POST https://uat-api.serasaexperian.com.br/security/iam/v1/client-identities/login` |
| Prod | `POST https://api.serasaexperian.com.br/security/iam/v1/client-identities/login` |

**Request:** `Authorization: Basic base64(client_id:client_secret)`, `Content-Type: application/json`, body `{}`  
**Response:** `{ accessToken, tokenType (Bearer), expiresIn, scope }`  
**Cache:** ~55 min (expira em 1h)

---

## 3. Query Params do Relatório

| Param | Tipo | Descrição |
|-------|------|------------|
| reportName | string | Nome do relatório (obrigatório) |
| optionalFeatures | string | Features opcionais separadas por vírgula |
| reportParameters | string | JSON em base64 (para features que exigem parâmetros) |

---

## 4. Headers do Relatório

| Header | Obrigatório | Descrição |
|--------|-------------|-----------|
| Content-Type | sim | `application/json` |
| Authorization | sim | `Bearer <token>` |
| X-Document-Id | sim | CNPJ (14 dígitos) |
| X-Retailer-Document-Id | não | Centro de custo (CNPJ do cliente consultante, se distribuidor) |
| X-Cost-Center | não | Código centro de custo (12 chars) |

---

## 5. Relatórios Disponíveis

| Nome | Descrição |
|------|-----------|
| RELATORIO_AVANCADO_PJ | Dados Cadastrais Avançados, Anotações Negativas e Consultas à Serasa |
| RELATORIO_AVANCADO_PJ_ANALITICO | + Dados Analíticos |
| RELATORIO_AVANCADO_TOP_SCORE_PJ | + Quadro Social Administrativo e Score Positivo |
| RELATORIO_AVANCADO_TOP_SCORE_PJ_ANALITICO | + Dados Analíticos |
| RELATORIO_AVANCADO_PJ_PME | + Quadro Social, Score Positivo e Limite de Crédito |
| RELATORIO_AVANCADO_PJ_PME_ANALITICO | + Dados Analíticos |

---

## 6. Features Opcionais

| Nome | Descrição |
|------|-----------|
| PARTICIPACOES | Participação em Empresas |
| LIMITE_CREDITO | Limite de Crédito |
| GASTO_ESTIMADO_POSITIVO | Gasto Estimado com Positivo |
| SCORE_POSITIVO | Score Positivo |
| PONTUALIDADE_PAGAMENTO | Pontualidade de Pagamento |
| CAPACIDADE_MENSAL_PAGAMENTO | Capacidade Mensal de Pagamento |
| FATURAMENTO_ESTIMADO_POSITIVO | Faturamento Estimado com Positivo |
| QSA_AVANCADO | Quadro Social Administrativo |
| QSA_COMPLETO | QSA Mais Completo |
| ANOTACOES_CONSULTAS_SPC | Anotações e Consultas ao SPC |
| RECOMENDACAO_LIMITE_CREDITO | Recomendação e limite de crédito |
| HISTORICO_PAGAMENTO_COMERCIAL_AVANCADO_PJ | Histórico de Pagamento Comercial Avançado |
| FEATURE_HISTORICO_PAGAMENTO_FINANCEIRO_RELATO | Histórico de Pagamento Financeiro Avançado |
| PERFIL_FINANCEIRO | Perfil financeiro |
| INDICE_RELACIONAMENTO_MERCADO_SETOR_PJ | Índice de Relacionamento mercado setor PJ |
| RISCO_NOVAS_EMPRESAS | Risco de novas empresas |
| MAIS_ANOTACOES | Mais anotações (até 99 por bloco) |
| CLASSIFICACAO_RISCO | Classificação de Risco |
| SCORE_FRAUDE_PJ | Score de Fraude PJ |
| SCORE_CUSTOMIZADO | Score Customizado |
| INDICADORES_RECEBIVEIS_SEM_CONSENTIMENTO | Indicadores de recebíveis |
| DIVIDAS_ORGAOS_PUBLICOS | Dívidas com órgãos públicos |
| LOCALIZACAO_PJ | Telefones e endereços |
| CONSULTAS_DETALHADAS_SERASA | Consultas detalhadas à Serasa |
| SCORE_DE_SOCIO_PF | Score dos sócios |
| ANOTACOES_CONSULTAS_SPC_SOCIOS_ADMINISTRADORES | Anotações SPC dos sócios e administradores |
| SITUACAO_FISCAL | Situação Fiscal |
| COMPORTAMENTO_PAGAMENTO_SETOR | Comportamento de pagamento do setor |
| MOSAIC_BUSINESS | Mosaic PJ |
| SCORE_DE_CREDITO_SETORIAL | Score de crédito setorial |
| ALERTA_CAD_SOCIOS_ADMS | Alerta cadastral de sócios e administradores |
| ALERTA_CAD_EMPRESAS | Alerta cadastral de empresas |
| SCORE_EMPRESA_E_SETOR | Score positivo + score setorial |
| VENDAS_CARTAO | Vendas com cartão |
| SCORE_LONGEVIDADE_EMPRESA | Indicador de longevidade empresarial |
| INDICADOR_RECUPERACAO_CREDITO_PJ | Indicador de recuperação crédito |
| AGRO_SCORE_PJ | Análise de risco crédito rural PJ |
| FATURAMENTO_RECEBIVEIS | Faturamento por recebíveis |
| SCORE_SEGUROS | Score Seguradoras |

Verificar em contrato as features disponíveis para o cliente.

---

## 7. reportParameters (base64)

Para features que exigem parâmetros (ex: Histórico de Pagamento Analítico, RECOMENDACAO_LIMITE_CREDITO):

```json
{
  "reportParameters": [
    { "name": "VAR_1", "value": "VALUE_1" },
    { "name": "VAR_2", "value": "VALUE_2" }
  ]
}
```

Codificar em base64 e enviar no queryParam `reportParameters`.

---

## 8. Erros e Códigos de Retorno

| Código | Tipo | Mensagem |
|--------|------|----------|
| 400 | Bad Request | Bad Request |
| 401 | Authorization Failed | Authorization Failed |
| 404 | Not Found | [ERROR][DOCUMENT_NOT_FOUND] Documento não encontrado na Serasa Experian |
| 412 | Documento Inválido | [ERROR][INVALID-REQUEST] informe o documento a ser consultado válido em [X-Document-Id] |
| 412 | Feature Inexistente/Inválida | [ERROR][INVALID-REQUEST] Features solicitadas não existem ou não estão autorizadas para o relatório |
| 412 | Usuário Sem Transações | [ERROR][USER-NOT-AUTHORIZED] Transações negadas |
| 412 | Usuário Sem Logon/CNPJ | [ERROR][USER-NOT-AUTHORIZED] Usuário não autorizado |
| 429 | Too Many Requests | Too Many Requests |
| 500 | Internal Server Error | Internal Server Error |
| 500 | Erro no Processamento | [ERROR][PROCESSING] Ocorreu um erro com as features: [,...] |
| default | Unexpected Error | Unexpected Error |

---

## 9. Retorno das Features Opcionais (principais)

### 9.1 Limite de Crédito (HLC1)
`scores > scoreResponse`: `score` (integer), `scoreModel` (string), `message` (string)

### 9.2 Gasto Estimado com Positivo
`score > scoreResponse`: `scoreModel`, `scoreParam` (key, value), `message`

### 9.3 Score Positivo (HPJ8/HPJ9)
`scores > scoreResponse`: `scoreModel`, `scoreParam`, `message`

### 9.4 Pontualidade de Pagamento (HIP2)
`scoreResponse`: `score`, `scoreModel`, `defaultRate`, `message`

### 9.5 Capacidade Mensal de Pagamento (HCP1)
`scoreResponse`: `score`, `scoreModel`, `defaultRate`, `message`

### 9.6 Faturamento Estimado com Positivo
`scores > scoreResponse`: `score`, `scoreModel`, `scoreParam` (key, value), `message`

### 9.7 Participação em Empresas
`participateds`: `participatedDocumentId`, `participatedName`, `statusCompany`, `participants`, `resume`

### 9.8 QSA — Quadro Social e Administrativo
`partnerCompleteReport > partnersList`: `documentId`, `name`, `sinceDate`, `capitalTotalValue`, `restrictionSign`  
`directorCompleteReport > directorsList`: `documentId`, `name`, `role`, `mandateStart`, `mandateEnd`

### 9.9 Recomendação e Limite de Crédito
`code`, `message`, `data`: `proposalNumber`, `companyName`, `transactionValue`, `recommendationType`, `recommendedLimitValue`, `riskLevelCode`

### 9.10 Localização
`location > addresses`, `location > phones`: endereços e telefones adicionais

### 9.11 Situação Fiscal
`fiscalSituation > federalRevenue`, `sintegra`, `suframa`: Receita Federal, Sintegra, Suframa

### 9.12 Score de Fraude PJ
`scoresFraud > scoresFraudResponse`: `score`, `scoreModel`, `recommendationRisk`, `message`

### 9.13 Histórico de Pagamento Comercial Avançado
`paymentHistory`, `monthDetail`, `mainSuppliers`, `evolutionCommitmentsSuppliers`, `businessReferences`

### 9.14 Outras features
Perfil Financeiro, Indice Relacionamento Mercado Setor PJ, Classificação de Risco, Score Customizado, Indicadores de Recebíveis, Dívidas Órgãos Públicos, etc.

---

## 10. Documentos de Apoio — Empresas sem Quadro Societário

Mensagens informativas exibidas conforme o tipo de sociedade:

- *Pelas características societárias, a empresa não apresenta acionistas/sócios*
- *Mensagem personalizada (customização por parte da empresa consultada)*
- *Pelas características societárias a informação não se aplica*

---

## 11. Tabelas de Códigos

### 11.1 participationType (QSA)

| Código | Descrição |
|--------|-----------|
| AC | Acionista |
| SC | Sócio |
| TIT | Titular |
| GR | Gerente |
| AD | Administrador |
| CS | Conselheiro |

### 11.2 Naturezas — Protestos e Ações (Concentre)

| Tipo | Código | Descrição |
|------|--------|-----------|
| Protestos | — | Falta de Pagamento |
| Ações | BA, EX, FE, FM, JB, JE, JF, TR | Busca e Apreensão, Execução, Execução Fiscal Estadual/Municipal/Federal, Pequenas Causas, Título Judicial Trabalhista |
| Falências | AF, CD, CR, CS, FD, FR, RC, RE, RH, RR | Auto Falência, Concordata, Falência, Recuperação Judicial/Extrajudicial |
| ACHEI | 12, 13, 14 | Cheques sem fundo 2ª apresentação, Conta Encerrada, Prática Espúria |

### 11.3 Naturezas REFIN

| Código | Descrição |
|--------|-----------|
| AD | Adiantamento a depositantes - c/c devedores |
| AG | Empréstimos agrícolas e industriais |
| AR | Arrendamentos, leasing |
| CA | Operações de câmbio |
| CB | CDC outros bens móveis |
| CH | Cheques sem fundos acolhidos |
| CL, CM, CV | CDC veículos leves, motos, pesados |
| C2–C5 | Consórcio veículos pesados, leves, motos, outros bens |
| CT | Cartão de crédito |
| EC | Empréstimos em conta, capital de giro |
| FI | Créditos e financiamentos |
| IM | Operações imobiliárias |
| IP | Débito IPVA |
| LL, LM, LV | Leasing veículos |
| OJ | Operações ajuizadas |
| OO | Outras operações |
| RE | Operações de repasse, FINAME, etc |
| SR | Seguro de risco decorrido |
| TD | Títulos descontados |

*Sufixo opcional: V (investimento), I (imobiliário), C (corretora), T (turismo), F (financeira), P (poupança), S (seguradora)*

### 11.4 Naturezas PEFIN (principais)

| Código | Descrição |
|--------|-----------|
| AD | Adiantamento a depositantes |
| AG | Empréstimo/financiamento agrícola |
| AL | Aluguel |
| AR | Arrendamento, leasing |
| C1–C6 | Consórcio imóvel, veículos, motos, bens, aéreo |
| CC | Cota condominial |
| CD | Crédito direto, crediário |
| CL, CM, CV | CDC veículos leves, motos, pesados |
| CP | Crédito pessoal |
| CT | Cartão de crédito |
| DC, DE | Dívidas de cheques |
| DP | Duplicata |
| EC | Empréstimos em conta, capital de giro |
| EE, EG | Energia elétrica, empréstimo consignado |
| FG | Gás |
| FI | Créditos e financiamentos |
| NF | Notas fiscais |
| OJ | Operações ajuizadas |
| OO | Outras operações |
| SB | Saneamento básico |
| SF, SG, SQ, SR, SS | Seguros (fiança, garantia, quebra, risco, saúde) |
| TC | Confissão de dívida |
| TD | Títulos descontados |
| TE, TF, TI, TM, TP, TR, TT | Telefonia e serviços |
| VM | Vendas de mercadorias |

### 11.5 Naturezas Convem (principais)

| Código | Descrição |
|--------|-----------|
| BC, BD, BS | Cobrança caucionada, descontada, simples |
| CC | Contrato de câmbio |
| CCC, CCE, CCI, CCR | Cédulas de crédito comercial, exportação, industrial, rural |
| CH | Cheque |
| DM, DMI | Duplicata de venda mercantil |
| DR, DRI | Duplicata rural |
| DS, DSI | Duplicata de prestação de serviços |
| LC, LCN | Letra de câmbio |
| NP, NPR | Nota promissória |
| SJ | Sentença judicial |
| TA | Termo de acordo |
| W | Warrant |

### 11.6 Códigos de Segmentos (segmentCode)

| Código | Descrição |
|--------|-----------|
| 001 | FORN SINAPEL |
| 002 | TEXTIL |
| 004 | CALCADOS |
| 005 | CREDINFOR |
| 006 | CONFECCOES E MALHARIA |
| 007 | TECELAGEM |
| 008 | RESINAS |
| 009 | TINTAS |
| 010 | CAMA MESA E BANHO |
| 011 | ABAFARMA |
| 012 | PRODS. P/ SAUDE ANIMAL |
| 013 | ALIMENTOS |
| 014 | INDS. CONSTRUCAO CIVIL |
| 015 | COMBUSTIVEIS |
| 016 | AGROQUIMICOS |
| 017 | ATACADISTAS |
| 018 | INDUSTRIAS DE MOVEIS |
| 019 | ASPACER |
| 020 | AGRONEGOCIOS |
| 021 | SINAPEL GRUPO II |
| 022 | CREDIAUTO |
| 024 | ARTIGOS ESPORTIVOS |
| 025 | ANDAP |
| 026 | LINGERIE |
| 027 | REFRIGERACAO |
| 028 | FACTORINGS |
| 029 | RELOGIOS |
| 030 | MODA |
| 031 | GCNA - NUTRICAO ANIMAL |
| 032 | AGRONEGOCIOS GOIANIA |
| 034 | AFUB |
| 035 | VINICOLAS |
| 036 | UTILIDADES DOMESTICAS |
| 038 | TRANSPORTES EXPRESSOS |
| 039 | INFOCRED |
| 040 | CREDICON |
| 041 | PAPELARIA |
| 042 | BRINQUEDOS |
| 043 | PLASTICOS P/ USO DOMISTICO |
| 044 | AGERFIN |
| 045 | CADERNOS |
| 046 | MEDICO HOSPITALAR |
| 047 | ASFALTO |

### 11.7 Mensagem de Reciprocidade

*ATENÇÃO!!! VOCE NÃO ESTÁ VISUALIZANDO O BLOCO 'EVOLUCAO DE COMPROMISSOS'. SUA EMPRESA ENCONTRA-SE EM ATRASO COM O ENVIO DOS DADOS DESDE dd/MM/yyyy. AO REGULARIZAR O ENVIO, O REFERIDO BLOCO VOLTARÁ A SER EXIBIDO AUTOMATICAMENTE.*

---

## 12. Blocos Base (dados cadastrais)

`identificationReport`, `companyData`, `partnersList`, `directorsList`, `pefinResponse`, `refinResponse`, `score`, `inquiryCompanyResponse`, `optionalFeatures` (bloco que agrupa retornos das features solicitadas)
