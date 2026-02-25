# Wiki — Agente IA de IRPF dos Sócios

> Guia operacional para analistas de crédito, compliance e onboarding.  
> Para a referência técnica completa, consulte `irpf_agente_ia_implementacao.md`.

---

## O que é o Agente de IRPF?

O Agente de IRPF é uma funcionalidade automatizada da plataforma que lê os PDFs de declaração de Imposto de Renda dos sócios e extrai os dados estruturados — rendimentos, deduções, imposto devido, patrimônio, dívidas, dependentes, entre outros — sem que o analista precise abrir o arquivo manualmente.

Assim que o comercial faz o upload do documento IRPF no checklist do cliente, o sistema processa o PDF em segundo plano usando Inteligência Artificial (modelo Google Gemini). Os dados ficam disponíveis na aba **IRPF** da página de detalhe do cliente.

---

## Como funciona o upload?

1. O comercial acessa a página do cliente e vai até a aba **Documentos**.
2. No checklist, há um item de IRPF para cada sócio ativo e para cada ano de exercício relevante (ano atual e anterior). Ex: `IRPF João Silva — Exercício 2025` e `IRPF João Silva — Exercício 2024`.
3. O comercial faz o upload do PDF (declaração, recibo ou os dois juntos no mesmo arquivo).
4. O sistema processa o documento automaticamente em segundo plano.
5. O analista acessa a aba **IRPF** da página do cliente para visualizar os dados extraídos.

> **Importante:** é possível enviar a declaração e o recibo em arquivos separados para o mesmo sócio e ano. O sistema une os dois automaticamente (veja a seção abaixo).

---

## O que o agente extrai?

O sistema organiza os dados em grupos:

**Dados pessoais**
- Nome completo, CPF, data de nascimento, ocupação, telefone, e-mail
- Naturalidade, nacionalidade
- Nome e CPF do cônjuge

**Endereço declarado**
- Rua, número, complemento, bairro, cidade, estado e CEP extraídos diretamente da declaração

**Dados da declaração**
- Tipo: Original ou Retificadora
- Modelo: Deduções Legais ou Simplificada
- Número do recibo de entrega
- Data e hora de entrega à Receita Federal

**Resumo financeiro**
| Campo | O que representa |
|-------|-----------------|
| Rendimento Tributável | Soma dos rendimentos sujeitos à tabela progressiva |
| Rendimento Isento | Rendimentos não tributados (ex: lucros distribuídos, FGTS) |
| Rendimento Exclusivo | Rendimentos tributados na fonte de forma definitiva |
| Deduções | Total de deduções (dependentes, educação, saúde, previdência) |
| Base de Cálculo | Rendimento Tributável − Deduções |
| Imposto Devido | Imposto calculado sobre a base |
| Imposto Pago | Imposto retido na fonte + carnê-leão |
| A Restituir | Imposto Pago − Imposto Devido (quando pago > devido) |
| A Pagar | Imposto Devido − Imposto Pago (quando devido > pago) |
| Patrimônio (ano atual) | Soma dos bens e direitos declarados no ano |
| Patrimônio (ano anterior) | Soma dos bens e direitos no ano anterior (comparativo) |

**Listas detalhadas**
- Dependentes (nome, CPF, parentesco)
- Rendimentos tributáveis por fonte pagadora (empresa, CNPJ, valor)
- Rendimentos isentos e exclusivos por código
- Pagamentos e deduções (planos de saúde, educação, previdência privada, etc.)
- Bens e direitos (imóveis, veículos, investimentos — com valor atual e anterior)
- Dívidas e ônus reais (saldo atual e anterior por credor)

---

## Declaração e Recibo — como o sistema une os dois?

A Receita Federal disponibiliza dois documentos distintos ao contribuinte:
- **Declaração de Ajuste Anual:** contém todos os dados financeiros, patrimônio e dependentes.
- **Recibo de Entrega:** confirma o protocolo de entrega (número do recibo e carimbo de data/hora).

O sistema reconhece automaticamente qual tipo de documento foi enviado, analisando o texto do PDF. Existem três cenários:

| Cenário | O que o sistema faz |
|---------|---------------------|
| Declaração + Recibo no mesmo PDF | Extrai tudo de uma vez |
| Somente a Declaração | Cria o registro com os dados financeiros. O número do recibo fica em branco até o recibo ser enviado. |
| Somente o Recibo | Se já existe um registro da declaração para o mesmo CPF e ano, o sistema **mescla** o número do recibo e o carimbo de entrega no registro existente. |

**Regras de mesclagem:**
- Dados de identificação (nome, endereço, etc.): preenchidos pelo primeiro documento que os contenha; não são sobrescritos.
- Dados financeiros (rendimentos, imposto, patrimônio): a **declaração** é a fonte de verdade. Se o recibo trouxer valores diferentes, o sistema registra um conflito.
- Número do recibo e data de entrega: o **recibo** é a fonte de verdade.
- Listas (bens, dívidas, dependentes): mantém a lista mais completa; não mescla item a item.

---

## Status de extração

| Status | O que significa para o analista |
|--------|--------------------------------|
| **Aguardando** | O documento foi recebido, mas a extração ainda não iniciou. |
| **Processando** | A IA está lendo o PDF. Aguarde alguns segundos e recarregue a página. |
| **Concluído** | Extração finalizada com sucesso. Dados disponíveis para análise. |
| **Falhou** | Ocorreu um erro técnico durante a extração. Use o botão "Reprocessar". |
| **Revisar** | A extração foi concluída, mas o sistema encontrou inconsistências que precisam de atenção (veja abaixo). |

---

## O que significa o status "Revisar"?

O status **Revisar** indica que o sistema detectou pelo menos uma das seguintes situações:

**Conflito entre documentos**
O recibo e a declaração trouxeram valores financeiros divergentes acima de R$ 100,00 para o mesmo campo. O sistema resolve automaticamente usando a declaração como fonte, mas sinaliza a divergência para que o analista confirme.

Exemplo: a declaração indica `taxableBase = R$ 150.000,00` e o recibo indica `taxableBase = R$ 148.500,00`. O sistema usa R$ 150.000,00 e registra o conflito.

**Falha na validação de schema**
O modelo de IA retornou dados em formato inesperado para algum campo. Os dados são salvos com o que foi extraído, mas devem ser verificados.

Na aba IRPF, cada card com status "Revisar" exibe um badge com a contagem de conflitos. Ao expandir o card, é possível ver os dois valores lado a lado (recibo × declaração) para cada campo em divergência.

---

## Confiança da extração

Cada extração possui um indicador de confiança: **Alta**, **Média** ou **Baixa**.

| Nível | Significado |
|-------|-------------|
| **Alta** | O modelo extraiu os dados com alta certeza e nenhuma inconsistência financeira foi detectada. |
| **Média** | O modelo ficou em dúvida em alguns campos, ou foram encontradas inconsistências menores (tolerância de até R$ 1,00). |
| **Baixa** | O modelo teve dificuldade significativa para ler o documento (PDF escaneado de baixa qualidade, por exemplo) ou foram encontradas inconsistências relevantes. Revisar os dados manualmente. |

Quando o PDF não possui camada de texto nativa (documento escaneado), a aba IRPF exibe o badge **OCR** ao lado da confiança, indicando que a IA precisou interpretar as imagens.

---

## Como reprocessar uma extração?

Se uma extração ficou com status **Falhou** ou **Revisar**, é possível solicitar um novo processamento:

1. Na aba **IRPF** da página do cliente, localize o card do sócio/ano desejado.
2. Clique no botão **Reprocessar** (ícone de seta circular).
3. O sistema agenda o reprocessamento em segundo plano e o status muda para **Processando**.
4. Recarregue a página após alguns segundos para ver o novo resultado.

> O reprocessamento relê o PDF original já armazenado no sistema. Não é necessário fazer novo upload.

---

## Perguntas Frequentes

**O sistema aceita PDF escaneado (fotografia da declaração)?**
Sim. O sistema tenta extrair o texto nativo do PDF primeiro. Se não houver texto suficiente, aciona o modo OCR do modelo de IA, que analisa as imagens das páginas. A confiança tende a ser menor em PDFs escaneados — especialmente se a qualidade da imagem for baixa.

**Posso enviar declaração e recibo no mesmo PDF?**
Sim. O sistema identifica os dois documentos dentro do mesmo arquivo e extrai todas as informações de uma só vez. É o cenário ideal, pois evita a etapa de merge.

**O que acontece se eu enviar o mesmo arquivo duas vezes?**
Nada. O sistema calcula uma impressão digital (hash SHA-256) de cada arquivo no momento do upload. Se o arquivo já foi processado anteriormente, ele é ignorado silenciosamente e o registro existente é retornado.

**Posso enviar uma declaração retificadora?**
Sim. O campo `declarationType` indica se a declaração é `Original` ou `Retificadora`. Se o sócio enviou a declaração original e depois enviar a retificadora no mesmo exercício, o sistema mescla os dados — priorizando os valores mais recentes, pois a retificadora substitui a original. Caso haja divergências relevantes, conflitos serão registrados para revisão.

**Os dados do IRPF aparecem em algum outro lugar da plataforma?**
Por enquanto, os dados ficam disponíveis exclusivamente na aba **IRPF** da página de detalhe do cliente, acessível para analistas de crédito, compliance, aprovadores, backoffice, gestão de risco e jurídico. A integração dos dados do IRPF no fluxo automático de análise de crédito está prevista para uma fase futura.

**Quanto tempo leva para processar?**
Normalmente entre 10 e 30 segundos após o upload, dependendo do tamanho do PDF e da disponibilidade da API do Gemini. PDFs com muitas páginas ou que exigem OCR podem levar um pouco mais.

**O que fazer se o analista identificar que um valor foi extraído incorretamente?**
Atualmente não há edição manual dos valores extraídos. O fluxo recomendado é solicitar ao comercial que verifique se o PDF correto foi enviado e, se necessário, fazer novo upload do arquivo correto. Após o upload, usar o botão **Reprocessar** no card correspondente.
