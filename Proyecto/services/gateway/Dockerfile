# Etapa 1: Build (Compilación)
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Instalamos git por si alguna dependencia lo necesita
RUN apk add --no-cache git

# 1. Copiamos los archivos de dependencias primero (cache layer)
COPY go.mod go.sum ./
RUN go mod download

# 2. Copiamos el código fuente
COPY . .

# 3. Compilamos el binario
# -o gateway: nombre del ejecutable
# ./cmd/main.go: ruta de tu entrypoint
RUN CGO_ENABLED=0 GOOS=linux go build -o /gateway ./cmd/main.go

# Etapa 2: Runtime (Imagen final ligera)
FROM alpine:latest

WORKDIR /root/

# Instalamos certificados CA (para poder hacer peticiones HTTPS si fuera necesario)
RUN apk --no-cache add ca-certificates curl

# Copiamos el binario desde la etapa builder
COPY --from=builder /gateway .

# Exponemos el puerto del Gateway
EXPOSE 3000

# Healthcheck para Docker (Opcional, pero buena práctica)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de arranque
CMD ["./gateway"]
