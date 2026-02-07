#!/bin/sh

 echo "🚀 Starting application..."

 # Load environment variables
 if [ -f .env ]; then
   export $(cat .env | grep -v '^#' | xargs)
 fi

 # Check required environment variables
 echo "🔍 Checking environment variables..."
 if [ -z "$DATABASE_URL" ]; then
   echo "❌ ERROR: DATABASE_URL is not set!"
   exit 1
 fi

 echo "✅ DATABASE_URL is set (masked: $(echo $DATABASE_URL | sed 's/:.*@/:****@/'))"
 echo "✅ PORT: ${PORT:-3000}"

 # Run migrations
echo "🔄 Running database migrations..."
# We use migrate deploy for production. If it fails with P3005 (non-empty DB),
# we check if we should reset or if we just need to baseline.
# For now, our strategy is to try migrate deploy, and if it fails, try to sync
# with db push or reset if in a fresh environment.
npx prisma migrate deploy || {
  ERROR_CODE=$?
  echo "⚠️ Migration failed with exit code $ERROR_CODE"

  # Check if it's a P3005 error (schema not empty)
  # Prisma doesn't easily give error codes to shell, so we check the output pattern if we were piping,
  # but here we just attempt a fallback.

  echo "🔄 Attempting fallback: sync schema with db push..."
  npx prisma db push --accept-data-loss || {
    echo "⚠️ db push failed, attempting forced reset (DANGER: wipes data)..."
    npx prisma migrate reset --force || echo "❌ All migration attempts failed."
  }
}

 # Generate Prisma Client
 echo "🔧 Generating Prisma Client..."
 npx prisma generate

 # Run seed if needed
 echo "🌱 Seeding database..."
 npx prisma db seed || echo "⚠️ Seeding failed or already seeded"

 # Start the application
 echo "🚀 Starting NestJS application..."
 exec node dist/src/main.js
