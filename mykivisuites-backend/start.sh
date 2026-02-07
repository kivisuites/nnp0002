#!/bin/sh

# Robust environment variable verification and sanitization
echo "--- Runtime Environment Check ---"
echo "Starting Container..."

# Remove any whitespace, newlines, or carriage returns from DATABASE_URL
if [ ! -z "$DATABASE_URL" ]; then
  # Use tr to remove all whitespace/newlines
  CLEAN_URL=$(echo "$DATABASE_URL" | tr -d '[:space:]')
  export DATABASE_URL="$CLEAN_URL"
fi

# Check if DATABASE_URL is set and valid
echo "DB URL is set: ${DATABASE_URL:+Yes (masked)}"
if [ -z "$DATABASE_URL" ]; then
  echo "CRITICAL: DATABASE_URL is EMPTY!"
  exit 1
fi

VALID_URL=false
case "$DATABASE_URL" in
  postgresql://*|postgres://*) VALID_URL=true ;;
esac

if [ "$VALID_URL" = false ]; then
  if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is NOT set!"
  else
    echo "WARNING: DATABASE_URL is set but appears malformed (missing postgresql:// protocol)."
  fi

  # List all DB related vars for debugging (masking sensitive info)
  echo "Checking alternative DB variables..."
  echo "DB_HOST: ${DB_HOST:-not set}"
  echo "DB_PORT: ${DB_PORT:-not set}"
  echo "DB_NAME: ${DB_NAME:-not set}"
  echo "DB_USERNAME: ${DB_USERNAME:-not set}"

  # Try to construct DATABASE_URL if missing or malformed but components exist
  if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_PASSWORD" ]; then
    echo "Attempting to construct DATABASE_URL from components..."
    # Ensure no spaces in components either
    DB_USER=$(echo "$DB_USERNAME" | tr -d '[:space:]')
    DB_PASS=$(echo "$DB_PASSWORD" | tr -d '[:space:]')
    DB_H=$(echo "$DB_HOST" | tr -d '[:space:]')
    DB_P=$(echo "$DB_PORT" | tr -d '[:space:]')
    DB_N=$(echo "$DB_NAME" | tr -d '[:space:]')

    export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_H}:${DB_P}/${DB_N}"
    echo "DATABASE_URL constructed successfully."
  else
    echo "CRITICAL: Could not find or construct a valid DATABASE_URL. Application will likely fail."
  fi
else
  # Print first 15 chars to verify it's not empty/malformed without exposing secret
  DB_START=$(echo "$DATABASE_URL" | cut -c1-15)
  echo "DATABASE_URL is verified (starts with: ${DB_START}...)"
fi

echo "PORT is set to: ${PORT:-3000}"
echo "APP_ENV is: ${APP_ENV:-not set}"
echo "--------------------------------"

# Run migrations and seed before starting the app
echo "Running database migrations..."
npx prisma migrate deploy || echo "WARNING: Migration failed, check logs. Continuing..."

echo "Running database seed..."
npx prisma db seed || echo "WARNING: Seeding failed, check logs. Continuing..."

# Start the application
echo "Starting NestJS application..."
exec node dist/src/main.js
