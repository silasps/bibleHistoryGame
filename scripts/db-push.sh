#!/usr/bin/env bash
# Aplica as migrations de supabase/migrations no projeto configurado em .env.local.
# Monta a URL com a senha codificada em memória (nada é impresso nem gravado).
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env.local; set +a
: "${SUPABASE_DB_URL:?Defina SUPABASE_DB_URL (pooler, sem senha) no .env.local}"
: "${SUPABASE_DB_PASSWORD:?Defina SUPABASE_DB_PASSWORD no .env.local}"
enc=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$SUPABASE_DB_PASSWORD")
url="${SUPABASE_DB_URL/\[YOUR-PASSWORD\]/$enc}"
if [[ "$url" == "$SUPABASE_DB_URL" ]]; then url="${SUPABASE_DB_URL/@/:$enc@}"; fi
supabase db push --db-url "$url" "$@"
