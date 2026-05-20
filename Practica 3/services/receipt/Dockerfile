# --- BUILD STAGE ---
FROM node:18-alpine AS build

ARG SERVICE_NAME

WORKDIR /usr/src/monorepo

# 1. Copiar contracts (compartido)
COPY contracts ./contracts

# 2. Copiar el servicio específico
COPY services/${SERVICE_NAME} ./services/${SERVICE_NAME}

# 3. Instalar dependencias y compilar
WORKDIR /usr/src/monorepo/services/${SERVICE_NAME}
RUN npm ci
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:18-alpine AS production

# Herramienta útil para health checks
RUN apk --no-cache add curl

ARG SERVICE_NAME

WORKDIR /usr/src/monorepo

# 1. Copiar contracts
COPY contracts ./contracts

# 2. Copiar package.json del servicio
COPY services/${SERVICE_NAME}/package*.json ./services/${SERVICE_NAME}/

# 3. Instalar solo dependencias de producción
WORKDIR /usr/src/monorepo/services/${SERVICE_NAME}
RUN npm ci --omit=dev

# 4. Copiar el build desde la etapa anterior
COPY --from=build /usr/src/monorepo/services/${SERVICE_NAME}/dist ./dist

# 5. Ejecutar
CMD ["node", "dist/main"]
