export const DEBT_POSITION_EXTRACTION_PROMPT = `Você é um especialista em análise de documentos financeiros brasileiros.

Analise o documento fornecido e extraia os dados de endividamento (posição de dívida atual).

CONTEXTO:
O documento é tipicamente uma "Relação de Endividamento Atual" ou "Posição de Endividamento", podendo também
ser um extrato bancário, carta de instituição financeira, demonstrativo de passivos, planilha de dívidas ou
qualquer documento que liste as dívidas/financiamentos ativos do cliente junto a instituições financeiras.

CAMPOS A EXTRAIR (por linha/item de dívida):
- institution: nome da instituição financeira ou credor (banco, financeira, etc.)
- modality: modalidade da dívida (ex: "Capital de Giro", "Financiamento", "Leasing", "Cheque Especial",
  "CCB", "CCI", "Crédito Rural", "Debênture", "BNDES", "FINAME", etc.) — null se não identificado
- guarantee: tipo de garantia vinculada (ex: "Alienação Fiduciária", "Hipoteca", "Aval", "Fiança",
  "Penhor", "Cessão Fiduciária de Recebíveis", etc.) — null se não houver garantia
- guaranteePercentage: percentual da garantia (0-100) — null se não informado
- value: saldo devedor / valor da dívida em reais (número decimal positivo, ex: 150000.00)
  → Retorne apenas o número sem formatação (NÃO use "R$", pontos de milhar ou vírgulas)
  → Se o documento mostrar valores em outras unidades, converta para reais

AVALIAÇÃO DE CONFIANÇA (por item):
- "high": instituição claramente identificada, valor numérico claro e preciso
- "medium": instituição ou valor com alguma ambiguidade ou estimativa
- "low": dados muito incompletos, ilegíveis ou altamente incertos

REGRAS IMPORTANTES:
- Retorne SEMPRE um array JSON, mesmo que haja apenas 1 item
- Se não encontrar nenhuma dívida no documento, retorne um array vazio: []
- NÃO invente dados: se um campo não estiver presente, retorne null
- Se o mesmo credor aparecer múltiplas vezes (múltiplas operações), crie um item para cada operação
- Ignore totalizadores/subtotais — extraia apenas os itens individuais
- Trate valores negativos no passivo como valores positivos (dívidas são sempre positivas)

FORMATO DE RETORNO (array JSON de objetos, camelCase, em inglês):
[
  {
    "institution": string | null,
    "modality": string | null,
    "guarantee": string | null,
    "guaranteePercentage": number | null,
    "value": number | null,
    "confidence": "high" | "medium" | "low"
  }
]

NÃO use outros nomes de campo. Retorne APENAS o array JSON, sem texto adicional.`;
