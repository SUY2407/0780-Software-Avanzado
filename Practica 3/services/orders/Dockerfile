# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

COPY services/orders/package*.json ./
RUN npm ci --legacy-peer-deps

# ⚠️ CRÍTICO: Copiar contracts/proto
COPY contracts/proto /contracts/proto

COPY services/orders/ ./
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

RUN apk --no-cache add curl dumb-init

COPY services/orders/package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# ⚠️ CRÍTICO: Copiar contracts/proto TAMBIÉN en production
COPY contracts/proto /contracts/proto

COPY --from=build /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 && chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 50051

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ps aux | grep node || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
