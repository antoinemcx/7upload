#!/bin/sh
set -e

# Persistent data lives in /data (SQLite db, uploaded files, upload temp dir).
# backend/files and backend/tmp are symlinks into /data created at build time.
mkdir -p /data/files /data/tmp/files
export DATABASE_URL="${DATABASE_URL:-file:/data/app.db}"
export PORT="${PORT:-3000}"

cd /app/backend
./node_modules/.bin/prisma migrate deploy
exec node src/app.ts
