import type { Schema } from '@google/genai';

// zodToJsonSchema cannot infer the type of deeply nested Zod schemas at compile time.
// We use require at runtime and cast the result to avoid TS2589 (type instantiation too deep).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { zodToJsonSchema } = require('zod-to-json-schema') as {
  zodToJsonSchema: (schema: unknown, options: Record<string, unknown>) => unknown;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { irpfRawExtractionSchema } = require('@nexus/validators') as {
  irpfRawExtractionSchema: unknown;
};

export const IRPF_GEMINI_JSON_SCHEMA = zodToJsonSchema(irpfRawExtractionSchema, {
  name: 'IrpfExtraction',
  $refStrategy: 'none',
}) as Schema;

export const IRPF_EXTRACTION_PROMPT = `Você é um especialista em análise de documentos fiscais brasileiros (IRPF — Imposto de Renda Pessoa Física).

Analise o documento PDF fornecido e extraia TODOS os dados estruturados.

REGRAS DE EXTRAÇÃO:
- CPF: retorne apenas os 11 dígitos numéricos, sem pontos, traços ou formatação (ex: "12345678900")
- CNPJ: retorne apenas os 14 dígitos numéricos, sem formatação
- Datas: retorne no formato ISO 8601 (YYYY-MM-DD). Ex: "1980-05-15"
- Valores monetários: retorne como número decimal sem formatação. Ex: 125000.50 (NÃO "125.000,50")
- CEP: retorne apenas os 8 dígitos numéricos, sem hífen
- UF: retorne as 2 letras maiúsculas do estado. Ex: "SP"
- Se um campo NÃO existir no documento, retorne null
- Se uma seção do documento disser "Sem Informações", retorne array vazio []
- Para o campo "confidence": avalie a qualidade geral da extração
  - "high": todos os campos principais foram extraídos com certeza
  - "medium": maioria dos campos extraídos, alguns com incerteza
  - "low": muitos campos não encontrados ou texto de baixa qualidade (OCR)

RETORNE OBRIGATORIAMENTE UM JSON COM EXATAMENTE ESTES CAMPOS (camelCase, em inglês):

{
  "cpf": string | null,
  "fullName": string | null,
  "exerciseYear": number | null,
  "calendarYear": number | null,
  "declarationType": "original" | "rectifying" | null,
  "taxationOption": "deductions" | "simplified" | null,
  "receiptNumber": string | null,
  "deliveryTimestamp": string | null,
  "birthDate": string | null,
  "occupation": string | null,
  "occupationCode": string | null,
  "nationality": string | null,
  "naturality": string | null,
  "phone": string | null,
  "email": string | null,
  "addressStreet": string | null,
  "addressNumber": string | null,
  "addressComplement": string | null,
  "addressNeighborhood": string | null,
  "addressCity": string | null,
  "addressState": string | null,
  "addressZip": string | null,
  "spouseName": string | null,
  "spouseCpf": string | null,
  "totalTaxableIncome": number | null,
  "totalExemptIncome": number | null,
  "totalExclusiveIncome": number | null,
  "totalDeductions": number | null,
  "taxableBase": number | null,
  "taxDue": number | null,
  "taxPaid": number | null,
  "taxRefund": number | null,
  "taxBalance": number | null,
  "totalAssetsCurrentYear": number | null,
  "totalAssetsPreviousYear": number | null,
  "totalDebtsCurrentYear": number | null,
  "totalDebtsPreviousYear": number | null,
  "dependents": [{ "name": string, "cpf": string | null, "birthDate": string | null, "relationship": string }],
  "taxableIncomeItems": [{ "sourceName": string, "sourceCnpj": string, "grossIncome": number, "taxWithheld": number, "socialSecurity": number | null, "thirteenthSalary": number | null }],
  "exemptIncomeItems": [{ "code": string, "description": string, "beneficiaryName": string | null, "beneficiaryCpfCnpj": string | null, "amount": number }],
  "exclusiveIncomeItems": [{ "code": string, "description": string, "beneficiaryName": string | null, "beneficiaryCpfCnpj": string | null, "amount": number }],
  "payments": [{ "code": string, "description": string, "beneficiaryName": string | null, "beneficiaryCpfCnpj": string | null, "amount": number, "refundAmount": number | null }],
  "assets": [{ "groupCode": string, "itemCode": string, "description": string, "situation": string | null, "valuePreviousYear": number, "valueCurrentYear": number }],
  "debts": [{ "code": string, "description": string, "creditorName": string | null, "creditorCpfCnpj": string | null, "valuePreviousYear": number, "valueCurrentYear": number }],
  "confidence": "high" | "medium" | "low",
  "evidence": []
}

NÃO use outros nomes de campo. NÃO aninhe os dados. Retorne APENAS o JSON, sem texto adicional.

ATENÇÃO: O documento pode conter apenas o Recibo de Entrega, apenas a Declaração, ou ambos juntos. Extraia o que estiver disponível.`;
