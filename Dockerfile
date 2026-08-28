# TaskForge Agent - GCP Cloud Run Production Dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full application code
COPY . .

# Build frontend production bundle
RUN npm run build

# Node runtime stage
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/.env.example ./.env

EXPOSE 8080

CMD ["node", "server/index.js"]
