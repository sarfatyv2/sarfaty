// Note: we intentionally do NOT use a strict responseJsonSchema here because
// multi-year documents produce a JSON array, not a single object.
// The Gemini response is validated item-by-item via Zod in the service.

export const FATURAMENTO_EXTRACTION_PROMPT = `Você é um especialista em análise de documentos financeiros brasileiros.

Analise o documento fornecido e extraia os dados de faturamento (receita bruta mensal).

CONTEXTO:
O documento pode ser: declaração de faturamento, relatório de receitas, extrato bancário,
planilha exportada como PDF, relatório de ERP, demonstrativo contábil, extrato de vendas, etc.
Cada empresa/banco tem seu próprio layout. Seja robusto e tente ao máximo extrair os dados.

REGRAS DE EXTRAÇÃO:
- CNPJ: retorne apenas os 14 dígitos numéricos, sem pontos, barras ou hífen (ex: "12345678000199")
  → Procure no cabeçalho, rodapé, assinatura, ou qualquer parte do documento
  → Em extratos bancários, o CNPJ pode estar no nome do titular da conta
- CPF: retorne apenas os 11 dígitos numéricos — use apenas se não houver CNPJ
- Ano: retorne o ano de competência dos valores
  → Em extratos bancários, use o ano das transações
  → Se houver múltiplos anos, veja as instruções abaixo
- Valores mensais: retorne como número decimal sem formatação (ex: 125000.50, NÃO "125.000,50")
  → Em extratos bancários: some todos os créditos (entradas) do mês como receita
  → Meses em português: janeiro=jan, fevereiro=feb, março=mar, abril=apr, maio=may, junho=jun,
    julho=jul, agosto=aug, setembro=sep, outubro=oct, novembro=nov, dezembro=dec
- Se um mês não estiver presente no documento, retorne null para esse mês
- totalAnnualRevenue: se existir total no documento, use-o; caso contrário, some os meses presentes
- documentDescription: descreva o tipo e conteúdo do documento em 1-2 frases

DOCUMENTOS COM MÚLTIPLOS ANOS:
Se o documento contiver dados de mais de um ano calendário, retorne um ARRAY JSON com um objeto
por ano, mantendo exatamente o mesmo formato de campos para cada item.
Exemplo: [ { "cnpj": "...", "year": 2022, ... }, { "cnpj": "...", "year": 2023, ... } ]

AVALIAÇÃO DE CONFIANÇA (por registro):
- "high": CNPJ/CPF identificado, ano identificado, maioria dos meses com valores claros
- "medium": identificação ou ano com incerteza, ou menos de 6 meses com dados
- "low": não foi possível identificar CNPJ/CPF, ou ano, ou qualidade muito ruim

FORMATO DE RETORNO:
- Documento de ano único: retorne um OBJETO JSON
- Documento multi-ano: retorne um ARRAY JSON de objetos

Campos de cada objeto (camelCase, em inglês):
{
  "cnpj": string | null,
  "cpf": string | null,
  "companyName": string | null,
  "year": number | null,
  "monthlyRevenues": {
    "jan": number | null, "feb": number | null, "mar": number | null, "apr": number | null,
    "may": number | null, "jun": number | null, "jul": number | null, "aug": number | null,
    "sep": number | null, "oct": number | null, "nov": number | null, "dec": number | null
  } | null,
  "totalAnnualRevenue": number | null,
  "documentDescription": string | null,
  "confidence": "high" | "medium" | "low"
}

NÃO use outros nomes de campo. Retorne APENAS o JSON (objeto ou array), sem texto adicional.`;
