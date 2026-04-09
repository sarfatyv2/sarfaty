---
name: ""
overview: ""
todos: []
isProject: false
---

# Plano de Integração: CreditBox (Report de Crédito VADU)

O CreditBox é um módulo do VADU voltado para geração de um relatório de crédito completo e aprofundado, agregando dados de restritivos, protestos, PGFN, trabalho escravo, score, etc. 

O processo na API deles é **assíncrono**:

1. Solicita-se a geração do report (passando o CNPJ). A API retorna um `process_id`.
2. Faz-se um *polling* (consultas periódicas a cada 3+ segundos) passando o `process_id` até que o relatório esteja pronto.
3. Quando finalizado, a API retorna o JSON completo e/ou o PDF em Base64.

---

## 1. Banco de Dados (Drizzle)

Criar a tabela `creditbox_reports` para armazenar o estado assíncrono e os resultados.

**Colunas propostas:**

- `id` (uuid, pk)
- `clientId` (uuid, fk para clients)
- `processId` (text) -> ID retornado pela API na solicitação.
- `status` (enum: 'PENDING', 'PROCESSING', 'COMPLETED', 'ERROR')
- `reportJson` (jsonb) -> O JSON completo do relatório retornado.
- `pdfBase64` (text) -> Se optarmos por baixar o PDF gerado por eles.
- `requestedAt` (timestamp)
- `completedAt` (timestamp, nullable)
- `errorMessage` (text, nullable)

## 2. Camada de Integração (Adapters)

Criar o `CreditBoxAdapter` em `apps/api/src/modules/credit/bureaus/creditbox/creditbox.adapter.ts`.

**Métodos:**

1. `getAuthToken()`: Consome `GET https://www.creditbox.com.br/CreditBox.dll/Autenticacao/JSONPegarToken` (usando a mesma lógica de token temporário do VADU).
2. `requestReport(cnpj: string)`: Consome `POST .../CreditBoxReport/JSONGerarReport`.
  - Passa os formatos (JSON, PDF) e as seções (cedente, gerais, exclusivos, etc.).
  - Retorna o `processId`.
3. `consultReport(processId: string)`: Consome `GET .../CreditBoxReport/JConsultarReport/{processId}`.
  - Retorna o status atual do processamento e, se concluído, os dados.

## 3. Casos de Uso (Use Cases)

Como o processo é assíncrono, precisaremos de pelo menos dois Use Cases.

1. `**RequestCreditBoxReportUseCase**`
  - Recebe o `clientId`.
  - Busca o CNPJ do cliente.
  - Chama `creditBoxAdapter.requestReport(cnpj)`.
  - Salva no banco o `processId` com status `PENDING`.
  - Retorna para o Frontend que a solicitação foi iniciada.
2. `**SyncCreditBoxReportUseCase**`
  - Recebe o `processId` ou `clientId`.
  - Chama `creditBoxAdapter.consultReport(processId)`.
  - Se ainda estiver processando, não faz nada.
  - Se concluído, atualiza o banco com o `status = 'COMPLETED'` e salva o `reportJson` (e PDF).
  - *Como chamar isso?* Podemos ter um endpoint no Controller que o Frontend fica chamando de 5 em 5 segundos até dar "COMPLETED" (polling no front), ou um Worker/CronJob no backend. Para simplificar no MVP e dar feedback em tempo real para o analista, o **polling pelo frontend** é a melhor abordagem inicial.
3. `**GetCreditBoxReportUseCase**`
  - Apenas busca o último report do banco de dados para ser exibido ao carregar a página.

## 4. Controladores e Rotas (API)

No `CreditController` (ou novo `CreditBoxController`), criar:

- `POST /clients/:clientId/creditbox` -> Dispara a geração (chama `RequestCreditBoxReportUseCase`).
- `POST /clients/:clientId/creditbox/sync` -> Força a checagem no VADU (chama `SyncCreditBoxReportUseCase`).
- `GET /clients/:clientId/creditbox` -> Traz o último report do banco (chama `GetCreditBoxReportUseCase`).

## 5. Frontend (UI/UX)

Na aba "Bureau" (`ClientCreditAnalysisTab`) que acabamos de criar, adicionar uma nova sub-seção ou Card exclusivo para o "Relatório CreditBox".

**Fluxos na UI:**

- **Se não existir report:** Exibir botão "Gerar Relatório Completo (CreditBox)".
- **Ao clicar:** Mudar estado para *Loading* e iniciar o *polling* a cada 5 segundos no endpoint `/sync` até o backend retornar `COMPLETED`.
- **Se concluído:** 
  - Exibir um resumo dos dados do CreditBox (ex: Score do CreditBox, Protestos, etc.).
  - Exibir botão "Baixar PDF" (que decodifica o Base64 e faz o download para a máquina do analista).
  - Exibir botão "Atualizar Relatório" caso o último seja muito antigo.

---

### Pergunta antes de iniciar:

Para o CreditBox, a URL base muda (`creditbox.com.br`) mas a autenticação aparentemente usa a mesma Chave/API KEY principal do VADU. Vamos tentar usar a variável de ambiente atual (`VADU_API_KEY`) para essa integração também?