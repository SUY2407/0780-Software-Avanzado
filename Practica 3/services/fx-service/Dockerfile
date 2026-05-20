FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files DEL SERVICIO específico
COPY services/fx-service/package*.json ./

# Instalar TODAS las dependencias
RUN npm install

# Copiar código fuente DEL SERVICIO
COPY services/fx-service/ ./

# Copiar archivos proto desde contracts (si están en la raíz)
COPY contracts/proto/ ./src/proto/

# Compilar TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Herramientas
RUN apk --no-cache add curl && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/v0.4.24/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

# Copiar package files
COPY --from=builder /app/package*.json ./

# Instalar SOLO dependencias de producción
RUN npm install --omit=dev && npm cache clean --force

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Copiar archivos proto para runtime
COPY --from=builder /app/src/proto/ ./src/proto/

EXPOSE 50054

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD /bin/grpc_health_probe -addr=:50054 || exit 1

CMD ["node", "dist/main.js"]
