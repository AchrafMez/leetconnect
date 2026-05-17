#!/bin/sh
set -e

echo "Waiting for database to be ready..."
attempts=0
until pg_isready -h postgres -U "$POSTGRES_USER" -q; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge 30 ]; then
    echo "Database not reachable after 60s; aborting" >&2
    exit 1
  fi
  sleep 2
done

echo "Database is ready!"

if [ -d "prisma/migrations" ] && [ "$NODE_ENV" = "production" ]; then
  echo "Running prisma migrate deploy..."
  npx prisma migrate deploy
else
  echo "Running prisma db push (dev only)..."
  npx prisma db push
fi

echo "Prisma migration completed successfully!"

if [ "$RUN_SEED" = "true" ] && [ -f "prisma/seed.ts" ]; then
  echo "Running Prisma seed..."
  npx prisma db seed || echo "Seed failed or not configured, continuing..."
fi

echo "Database setup complete!"

exec "$@"