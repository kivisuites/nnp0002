# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY start.sh ./

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Install dependencies for health check and runtime if needed
RUN apk add --no-cache curl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./
COPY start.sh ./

# Ensure start.sh is executable
RUN chmod +x start.sh

# Railway uses the PORT environment variable
ENV PORT=3000
EXPOSE 3000

CMD ["./start.sh"]
