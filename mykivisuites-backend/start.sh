#!/bin/sh

# Robust environment variable verification
echo "--- Runtime Environment Check ---"
echo "Starting Container..."

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is NOT set!"
  # List all DB related vars for debugging (masking sensitive info)
  echo "Checking alternative DB variables..."
  echo "DB_HOST: ${DB_HOST:-not set}"
  echo "DB_PORT: ${DB_PORT:-not set}"
  echo "DB_NAME: ${DB_NAME:-not set}"
  echo "DB_USERNAME: ${DB_USERNAME:-not set}"

  # Try to construct DATABASE_URL if missing but components exist
  if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_PASSWORD" ]; then
    echo "Attempting to construct DATABASE_URL from components..."
    export DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    echo "DATABASE_URL constructed successfully."
  else
    echo "CRITICAL: Could not find or construct DATABASE_URL. Application will likely fail."
  fi
else
  # Print first 15 chars to verify it's not empty/malformed without exposing secret
  DB_START=$(echo $DATABASE_URL | cut -c1-15)
  echo "DATABASE_URL is set (starts with: ${DB_START}...)"
fi

echo "PORT is set to: ${PORT:-3000}"
echo "APP_ENV is: ${APP_ENV:-not set}"
echo "--------------------------------"

# Run migrations in the background so they don't block the app startup
echo "Running database migrations..."
npx prisma migrate deploy || echo "WARNING: Migration failed, check logs. Starting app anyway..." &

# Start the application
echo "Starting NestJS application..."
exec npm run start:prod
