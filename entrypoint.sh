#!/bin/sh
set -e

echo "Waiting for database..."
while ! nc -z localhost "${PGPORT:-5436}" 2>/dev/null; do
  sleep 1
done
echo "Database is ready"

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting API..."
node dist/main.js
