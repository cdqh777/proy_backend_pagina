FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY db/ ./db/
EXPOSE 3001
CMD ["sh", "-c", "node scripts/init-db.js && node scripts/reset-passwords.js && node dist/main"]
