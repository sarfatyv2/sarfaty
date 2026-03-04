#!/bin/bash
# Serasa Experian — Teste de API via curl
# Uso: ./scripts/serasa-api-test.sh [CNPJ] [--feature-sweep|--feature-sweep-full|--battery]
# CNPJ padrão: 50638274000189 (oficial homologação Serasa)
# Report: SERASA_REPORT=RELATORIO_AVANCADO_PJ|RELATORIO_AVANCADO_PJ_PME|RELATORIO_AVANCADO_TOP_SCORE_PJ
#
# --battery: Bateria rápida — omit, empty, 4 features
# --feature-sweep: teste de 3 features
# --feature-sweep-full: mapeia todas as 38 features (200/412/500)
#
# Auth: IAM próprio da Serasa (não OAuth2 clássico)
#   UAT:  https://uat-api.serasaexperian.com.br/security/iam/v1/client-identities/login
#   Prod: https://api.serasaexperian.com.br/security/iam/v1/client-identities/login
#   Header: Authorization: Basic base64(client_id:client_secret)
#   Token expira em ~1h; cache recomendado ~55 min

set -e

FEATURE_SWEEP=false
FEATURE_SWEEP_FULL=false
BATTERY=false
for arg in "$@"; do
  [ "$arg" = "--feature-sweep" ] && FEATURE_SWEEP=true
  [ "$arg" = "--feature-sweep-full" ] && FEATURE_SWEEP_FULL=true
  [ "$arg" = "--battery" ] && BATTERY=true
done
DEFAULT_CNPJ="50638274000189"
CNPJ_ARG="${1:-$DEFAULT_CNPJ}"
[[ "$1" = "--feature-sweep" || "$1" = "--feature-sweep-full" || "$1" = "--battery" ]] && CNPJ_ARG="${2:-$DEFAULT_CNPJ}"
[[ "$2" = "--feature-sweep" || "$2" = "--feature-sweep-full" || "$2" = "--battery" ]] && CNPJ_ARG="${1:-$DEFAULT_CNPJ}"

UAT_BASE="https://uat-api.serasaexperian.com.br"
PROD_BASE="https://api.serasaexperian.com.br"
LOGIN_PATH="/security/iam/v1/client-identities/login"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../apps/api/.env.local"
if [ -f "$ENV_FILE" ]; then
  SERASA_CLIENT_ID=$(grep '^SERASA_CLIENT_ID=' "$ENV_FILE" | cut -d= -f2- | tr -d '\r\n')
  SERASA_CLIENT_SECRET=$(grep '^SERASA_CLIENT_SECRET=' "$ENV_FILE" | cut -d= -f2- | tr -d '\r\n')
  # Valor pronto se a Serasa forneceu (ex: Basic abcd...WXYZ)
  SERASA_IAM_BASIC=$(grep '^SERASA_IAM_BASIC=' "$ENV_FILE" 2>/dev/null | cut -d= -f2- | tr -d '\r\n' || true)
fi

CLIENT_ID="${SERASA_CLIENT_ID:-}"
CLIENT_SECRET="${SERASA_CLIENT_SECRET:-}"
ENV="${SERASA_ENV:-uat}"

[ -n "$CLIENT_ID" ] && [ -n "$CLIENT_SECRET" ] || [ -n "$SERASA_IAM_BASIC" ] || {
  echo "Erro: SERASA_CLIENT_ID e SERASA_CLIENT_SECRET em apps/api/.env.local, ou SERASA_IAM_BASIC (valor pronto)"; exit 1;
}
CNPJ=$(echo "$CNPJ_ARG" | tr -d '\n' | sed 's/[^0-9]//g')
[ ${#CNPJ} -eq 14 ] || { echo "CNPJ deve ter 14 dígitos"; exit 1; }

# Montar Authorization
if [ -n "$SERASA_IAM_BASIC" ]; then
  AUTH_HEADER="Basic $SERASA_IAM_BASIC"
  echo "Usando SERASA_IAM_BASIC (valor fornecido pela Serasa)"
else
  AUTH_HEADER="Basic $(printf "%s:%s" "$CLIENT_ID" "$CLIENT_SECRET" | base64 | tr -d '\n')"
  echo "Usando Basic base64(client_id:client_secret)"
fi

if [ "$ENV" = "prod" ]; then
  BASE_URL="$PROD_BASE"
else
  BASE_URL="$UAT_BASE"
fi

echo ""
echo "=== 1. Obter token (IAM client-identities/login) ==="
echo "Host: $BASE_URL"
echo ""

TOKEN_RESP=$(curl -s -X POST "$BASE_URL$LOGIN_PATH" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_HEADER" \
  -d '{}')

echo "$TOKEN_RESP" | jq . 2>/dev/null || echo "$TOKEN_RESP"

ACCESS_TOKEN=$(echo "$TOKEN_RESP" | jq -r '.accessToken // .access_token // empty' 2>/dev/null)
TOKEN_TYPE=$(echo "$TOKEN_RESP" | jq -r '.tokenType // .token_type // "Bearer"' 2>/dev/null)
EXPIRES_IN=$(echo "$TOKEN_RESP" | jq -r '.expiresIn // .expires_in // empty' 2>/dev/null)

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
  echo ""
  echo "Token obtido. TokenType=$TOKEN_TYPE (cache ~55 min recomendado; expira em ~1h)"
  echo ""
  REPORTS_PATH="/credit-services/business-information-report/v1/reports"

  do_request() {
    local report="$1"
    local mode="$2"  # omit | empty | <feature> | <feat1,feat2>
    local url
    case "$mode" in
      omit)  url="${BASE_URL}${REPORTS_PATH}?reportName=${report}" ;;
      empty) url="${BASE_URL}${REPORTS_PATH}?reportName=${report}&optionalFeatures=" ;;
      *)     url="${BASE_URL}${REPORTS_PATH}?reportName=${report}&optionalFeatures=${mode}" ;;
    esac
    curl -s -w "\n%{http_code}" --max-time 60 -X GET "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: $TOKEN_TYPE $ACCESS_TOKEN" \
      -H "X-Document-Id: $CNPJ"
  }

  if [ "$BATTERY" = true ]; then
    echo "=== 2. Bateria de testes — CNPJ $CNPJ ==="
    REPORT="${SERASA_REPORT:-RELATORIO_AVANCADO_PJ}"
    echo "Report: $REPORT"
    echo ""
    echo "1) optionalFeatures OMITIDO (param ausente na URL)"
    RESP=$(do_request "$REPORT" "omit")
    HTTP_OMIT=$(echo "$RESP" | tail -n1)
    echo "   HTTP $HTTP_OMIT"
    echo "$RESP" | sed '$d' | jq -c 'if type=="array" then .[0] else . end' 2>/dev/null | head -c 200
    echo ""
    echo ""
    echo "2) optionalFeatures VAZIO (optionalFeatures=)"
    RESP=$(do_request "$REPORT" "empty")
    HTTP_EMPTY=$(echo "$RESP" | tail -n1)
    echo "   HTTP $HTTP_EMPTY"
    echo "$RESP" | sed '$d' | jq -c 'if type=="array" then .[0] else . end' 2>/dev/null | head -c 200
    echo ""
    echo ""
    echo "3) Uma feature por vez"
    for FEAT in "LOCALIZACAO_PJ" "QSA_AVANCADO" "MAIS_ANOTACOES" "SITUACAO_FISCAL"; do
      RESP=$(do_request "$REPORT" "$FEAT")
      H=$(echo "$RESP" | tail -n1)
      echo "   $FEAT: HTTP $H"
    done
    echo ""
    echo "4) Comparação omit vs empty: omit=$HTTP_OMIT empty=$HTTP_EMPTY"
  elif [ "$FEATURE_SWEEP_FULL" = true ]; then
    ALL_FEATURES=(
      PARTICIPACOES LIMITE_CREDITO GASTO_ESTIMADO_POSITIVO SCORE_POSITIVO
      PONTUALIDADE_PAGAMENTO CAPACIDADE_MENSAL_PAGAMENTO FATURAMENTO_ESTIMADO_POSITIVO
      QSA_AVANCADO QSA_COMPLETO ANOTACOES_CONSULTAS_SPC RECOMENDACAO_LIMITE_CREDITO
      HISTORICO_PAGAMENTO_COMERCIAL_AVANCADO_PJ FEATURE_HISTORICO_PAGAMENTO_FINANCEIRO_RELATO
      PERFIL_FINANCEIRO INDICE_RELACIONAMENTO_MERCADO_SETOR_PJ RISCO_NOVAS_EMPRESAS
      MAIS_ANOTACOES CLASSIFICACAO_RISCO SCORE_FRAUDE_PJ SCORE_CUSTOMIZADO
      INDICADORES_RECEBIVEIS_SEM_CONSENTIMENTO DIVIDAS_ORGAOS_PUBLICOS LOCALIZACAO_PJ
      CONSULTAS_DETALHADAS_SERASA SCORE_DE_SOCIO_PF ANOTACOES_CONSULTAS_SPC_SOCIOS_ADMINISTRADORES
      SITUACAO_FISCAL COMPORTAMENTO_PAGAMENTO_SETOR MOSAIC_BUSINESS SCORE_DE_CREDITO_SETORIAL
      ALERTA_CAD_SOCIOS_ADMS ALERTA_CAD_EMPRESAS SCORE_EMPRESA_E_SETOR VENDAS_CARTAO
      SCORE_LONGEVIDADE_EMPRESA INDICADOR_RECUPERACAO_CREDITO_PJ AGRO_SCORE_PJ
      FATURAMENTO_RECEBIVEIS SCORE_SEGUROS
    )
    REPORT="${SERASA_REPORT:-RELATORIO_AVANCADO_PJ}"
    echo "=== 2. Feature Sweep FULL — CNPJ $CNPJ — Report $REPORT ==="
    echo ""
    echo "HTTP | Feature"
    echo "-----|--------"
    OK_200=()
    ERR_412=()
    ERR_500=()
    set +e
    for FEAT in "${ALL_FEATURES[@]}"; do
      RESP=$(do_request "$REPORT" "$FEAT" 2>/dev/null) || RESP=$'\n000'
      HTTP_CODE=$(echo "$RESP" | tail -n1)
      printf "%4s | %s\n" "$HTTP_CODE" "$FEAT"
      case "$HTTP_CODE" in
        200) OK_200+=("$FEAT") ;;
        412) ERR_412+=("$FEAT") ;;
        500|503|504) ERR_500+=("$FEAT") ;;
        *) ;;
      esac
    done
    echo ""
    echo "--- Resumo ---"
    echo "200 (OK): ${OK_200[*]:-nenhuma}"
    echo "412 (não autorizada): ${ERR_412[*]:-nenhuma}"
    echo "500/503 (erro processamento): ${ERR_500[*]:-nenhuma}"
    set -e
  elif [ "$FEATURE_SWEEP" = true ]; then
    echo "=== 2. Feature Sweep — CNPJ $CNPJ (isolando features que quebram em 503) ==="
    echo ""
    for REPORT in "RELATORIO_AVANCADO_PJ" "RELATORIO_AVANCADO_PJ_PME" "RELATORIO_AVANCADO_TOP_SCORE_PJ"; do
      echo "--- $REPORT (optionalFeatures vazio) ---"
      RESP=$(do_request "$REPORT" "empty")
      HTTP_CODE=$(echo "$RESP" | tail -n1)
      BODY=$(echo "$RESP" | sed '$d')
      echo "HTTP $HTTP_CODE"
      echo "$BODY" | jq -c 'if type=="array" then .[0] else . end' 2>/dev/null || echo "$BODY" | head -c 300
      echo ""
      [ "$HTTP_CODE" = "200" ] && echo ">>> SUCESSO com $REPORT" && break
    done
    echo ""
    echo "--- Testando optionalFeatures individuais (RELATORIO_AVANCADO_PJ) ---"
    for FEAT in "LOCALIZACAO_PJ" "QSA_AVANCADO" "MAIS_ANOTACOES"; do
      echo -n "  $FEAT: "
      RESP=$(do_request "RELATORIO_AVANCADO_PJ" "$FEAT")
      HTTP_CODE=$(echo "$RESP" | tail -n1)
      echo "HTTP $HTTP_CODE"
    done
  else
    echo "=== 2. Business Information Report — CNPJ $CNPJ ==="
    echo ""
    REPORT="${SERASA_REPORT:-RELATORIO_AVANCADO_PJ_PME}"
    echo "Report: $REPORT"
    URL="${BASE_URL}${REPORTS_PATH}?reportName=${REPORT}&optionalFeatures="
    echo "URL: $URL"
    echo ""
    RESP=$(do_request "$REPORT" "empty")
    HTTP_CODE=$(echo "$RESP" | tail -n1)
    BODY=$(echo "$RESP" | sed '$d')
    echo "HTTP $HTTP_CODE"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  fi
else
  echo ""
  echo "Falha ao obter token. Possíveis causas:"
  echo "  - SERASA_IAM_BASIC: se a Serasa passou um Basic pré-montado, use em .env.local"
  echo "  - Credenciais não ativadas no UAT"
  echo "  - IP fora da allowlist"
  echo ""
  echo "Curl manual (Opção A — Basic padrão):"
  echo "  B64=\$(printf \"%s:%s\" \"\$CLIENT_ID\" \"\$CLIENT_SECRET\" | base64 | tr -d '\\n')"
  echo "  curl -X POST \"$UAT_BASE$LOGIN_PATH\" \\"
  echo "    -H 'Content-Type: application/json' \\"
  echo "    -H \"Authorization: Basic \$B64\" \\"
  echo "    -d '{}'"
fi
