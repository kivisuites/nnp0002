# Step 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies using npm ci for deterministic builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Step 2: Serve the application
FROM node:22-alpine AS runner

WORKDIR /app

# Install 'serve' package to serve static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose the port (Railway provides this via environment variable)
EXPOSE 3000

# Command to run the application
# We use sh -c to allow environment variable expansion for $PORT
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
