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
npx prisma migrate deploy || {
  echo "⚠️ Migration failed, trying to reset..."
  npx prisma migrate reset --force || {
    echo "⚠️ Reset failed, trying db push as last resort..."
    npx prisma db push
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
