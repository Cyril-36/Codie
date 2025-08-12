#!/usr/bin/env bash
set -euo pipefail

# Ensure VAULT_ADDR and token are set for CLI
export VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
export VAULT_TOKEN="${VAULT_TOKEN:-dev-root}"

echo "Waiting for Vault at ${VAULT_ADDR} ..."
for i in {1..30}; do
  if curl -fsS "${VAULT_ADDR}/v1/sys/health?standbyok=true" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Seeding dev secrets at secret/data/codie (KV v2)..."
# KV v2: POST to /v1/secret/data/<path> with {"data":{...}}
curl -fsS -X POST \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"data":{"GEMINI_API_KEY":"changeme","OPENAI_API_KEY":"changeme","SNYK_TOKEN":"changeme","DIFFBLUE_LICENSE":"changeme"}}' \
  "${VAULT_ADDR}/v1/secret/data/codie" >/dev/null

echo "Secrets seeded."
