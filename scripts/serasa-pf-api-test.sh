#!/bin/bash
# Serasa Experian — Consumer Information Report (PF) — Teste via curl
# Consulta por CPF (pessoa física)
#
# Uso: ./scripts/serasa-pf-api-test.sh [CPF]
# CPF padrão: 11 dígitos (ex: 00000000191 para testes em homologação)
#
# Endpoint PF: /credit-services/person-information-report/v1/creditreport
# Header X-Document-Id: CPF (11 dígitos)
#
# Relatórios: RELATORIO_AVANCADO_PF | RELATORIO_AVANCADO_TOP_SCORE_PF | COMBO_CONCESSAO

set -e

DEFAULT_CPF="00000000191"
CPF_ARG="${1:-$DEFAULT_CPF}"

UAT_BASE="https://uat-api.serasaexperian.com.br"
PROD_BASE="https://api.serasaexperian.com.br"
LOGIN_PATH="/security/iam/v1/client-identities/login"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../apps/api/.env.local"
if [ -f "$ENV_FILE" ]; then
  SERASA_CLIENT_ID=$(grep '^SERASA_CLIENT_ID=' "$ENV_FILE" | cut -d= -f2- | tr -d '\r\n')
  SERASA_CLIENT_SECRET=$(grep '^SERASA_CLIENT_SECRET=' "$ENV_FILE" | cut -d= -f2- | tr -d '\r\n')
  SERASA_IAM_BASIC=$(grep '^SERASA_IAM_BASIC=' "$ENV_FILE" 2>/dev/null | cut -d= -f2- | tr -d '\r\n' || true)
fi

CLIENT_ID="${SERASA_CLIENT_ID:-}"
CLIENT_SECRET="${SERASA_CLIENT_SECRET:-}"
ENV="${SERASA_ENV:-uat}"

[ -n "$CLIENT_ID" ] && [ -n "$CLIENT_SECRET" ] || [ -n "$SERASA_IAM_BASIC" ] || {
  echo "Erro: SERASA_CLIENT_ID e SERASA_CLIENT_SECRET em apps/api/.env.local"; exit 1;
}

CPF=$(echo "$CPF_ARG" | tr -d '\n' | sed 's/[^0-9]//g')
[ ${#CPF} -eq 11 ] || { echo "CPF deve ter 11 dígitos"; exit 1; }

if [ -n "$SERASA_IAM_BASIC" ]; then
  AUTH_HEADER="Basic $SERASA_IAM_BASIC"
else
  AUTH_HEADER="Basic $(printf "%s:%s" "$CLIENT_ID" "$CLIENT_SECRET" | base64 | tr -d '\n')"
fi

if [ "$ENV" = "prod" ]; then
  BASE_URL="$PROD_BASE"
else
  BASE_URL="$UAT_BASE"
fi

REPORT="${SERASA_PF_REPORT:-RELATORIO_AVANCADO_PF}"
FEATURES="${SERASA_PF_FEATURES:-MAIS_ANOTACOES}"

echo "=== 1. Token IAM (PF usa o mesmo token do PJ) ==="
echo "Host: $BASE_URL"
echo ""

TOKEN_RESP=$(curl -s -X POST "$BASE_URL$LOGIN_PATH" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_HEADER" \
  -d '{}')

echo "$TOKEN_RESP" | jq . 2>/dev/null || echo "$TOKEN_RESP"

ACCESS_TOKEN=$(echo "$TOKEN_RESP" | jq -r '.accessToken // .access_token // empty' 2>/dev/null)
TOKEN_TYPE=$(echo "$TOKEN_RESP" | jq -r '.tokenType // .token_type // "Bearer"' 2>/dev/null)

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
  echo ""
  echo "=== 2. Consumer Information Report (PF) — CPF $CPF ==="
  echo "Report: $REPORT"
  echo "Features: $FEATURES"
  echo ""
  PF_REPORTS_PATH="/credit-services/person-information-report/v1/creditreport"
  URL="${BASE_URL}${PF_REPORTS_PATH}?reportName=${REPORT}&optionalFeatures=${FEATURES}"
  echo "URL: $URL"
  echo ""
  RESP=$(curl -s -w "\n%{http_code}" --max-time 60 -X GET "$URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: ${TOKEN_TYPE} ${ACCESS_TOKEN}" \
    -H "X-Document-Id: $CPF")
  HTTP_CODE=$(echo "$RESP" | tail -n1)
  BODY=$(echo "$RESP" | sed '$d')
  echo "HTTP $HTTP_CODE"
  echo ""
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  echo ""
  echo "Falha ao obter token."
fi
