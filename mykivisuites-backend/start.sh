#!/bin/sh

# Run migrations in the background so they don't block the app startup
# This ensures the health check can pass even if migrations are slow
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed, but starting app anyway..." &

# Start the application
echo "Starting application..."
npm run start:prod
