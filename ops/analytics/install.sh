#!/bin/bash
# Umami (cookieless web analytics) for koyotec.digital, on the KOYOTEC VPS.
# Run from the laptop, AFTER the DNS record analytics.koyotec.digital -> 107.175.122.83 exists:
#   ssh root@107.175.122.83 'bash -s' < ~/projects/koyotecdigital/ops/analytics/install.sh
# Idempotent: re-running keeps the existing secrets and database.
set -euo pipefail
DOMAIN=analytics.koyotec.digital
DIR=/opt/umami
SERVER_IP=107.175.122.83

echo "--- DNS check"
RESOLVED=$(getent hosts "$DOMAIN" | awk '{print $1}' | head -1 || true)
if [ "$RESOLVED" != "$SERVER_IP" ]; then
  echo "!! $DOMAIN resolves to '${RESOLVED:-nothing}', expected $SERVER_IP. Add the DNS A record first, wait a few minutes, re-run."
  exit 1
fi

command -v docker >/dev/null || { echo "!! docker missing"; exit 1; }
if docker compose version >/dev/null 2>&1; then DC="docker compose"; elif command -v docker-compose >/dev/null; then DC="docker-compose"; else echo "!! docker compose missing"; exit 1; fi

mkdir -p "$DIR"
cd "$DIR"

# secrets are generated here once and never leave the server
if [ ! -f .env ]; then
  # a free local port for the app (3001 is the contact API)
  PORT=""
  for p in 3002 3003 3004 3005 3006 3007 3008; do
    if ! ss -ltn | grep -q ":$p "; then PORT=$p; break; fi
  done
  [ -n "$PORT" ] || { echo "!! no free port in 3002-3008"; exit 1; }
  umask 077
  cat > .env <<ENV
POSTGRES_PASSWORD=$(openssl rand -hex 24)
APP_SECRET=$(openssl rand -hex 32)
UMAMI_PORT=$PORT
ENV
fi
set -a; . ./.env; set +a

cat > docker-compose.yml <<'YML'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:${UMAMI_PORT}:3000"
    environment:
      DATABASE_URL: postgresql://umami:${POSTGRES_PASSWORD}@db:5432/umami
      APP_SECRET: ${APP_SECRET}
      DISABLE_TELEMETRY: "1"
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - umami-db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami -d umami"]
      interval: 5s
      timeout: 5s
      retries: 10
volumes:
  umami-db:
YML

echo "--- starting Umami (first pull can take a minute)"
$DC --env-file .env up -d

echo "--- nginx"
cat > /etc/nginx/sites-available/$DOMAIN <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    location / {
        proxy_pass http://127.0.0.1:${UMAMI_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
nginx -t
systemctl reload nginx

echo "--- HTTPS certificate (uses the existing Let's Encrypt account of api.koyotec.digital)"
if ! certbot plugins 2>/dev/null | grep -q "^\* nginx"; then
  echo "installing certbot's nginx plugin"
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq python3-certbot-nginx >/dev/null
fi
certbot --nginx -d "$DOMAIN" --non-interactive --redirect

echo "--- waiting for Umami"
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/script.js" || true)
  [ "$code" = "200" ] && break
  sleep 3
done
echo "script.js -> HTTP $code"
$DC ps
echo
echo "DONE. Next: open https://$DOMAIN , log in with the default account (admin / umami)"
echo "and CHANGE THE PASSWORD immediately (Settings > Profile). Then Settings > Websites > Add:"
echo "  name KOYOTEC, domain koyotec.digital  -> copy the Website ID."
