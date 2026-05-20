# ---------- BUILD STAGE ----------
FROM node:18-alpine AS build

WORKDIR /app

# Copiar contracts desde la raíz del repo
COPY contracts /contracts

# Copiar package files del gateway
COPY services/gateway/package*.json ./gateway/

WORKDIR /app/gateway

# Instalar dependencias
RUN npm ci

# Copiar código del gateway
COPY services/gateway ./

# Build
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM node:18-alpine AS production

RUN apk --no-cache add curl dumb-init

WORKDIR /app

# Copiar contracts en la ruta que NestJS espera
COPY --from=build /contracts /contracts

# Copiar package files
COPY --from=build /app/gateway/package*.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev && npm cache clean --force

# Copiar build
COPY --from=build /app/gateway/dist ./dist

# Usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app /contracts

USER nestjs

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main"]
