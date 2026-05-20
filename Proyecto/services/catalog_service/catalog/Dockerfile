FROM golang:1.21

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY go.mod go.sum ./

# Descargar dependencias
RUN go mod download

# Copiar todo el código
COPY . .

# Compilar el proyecto
RUN go build -o catalog ./cmd/main.go

# Exponer el servicio
EXPOSE 8081

# Ejecutar
CMD ["./catalog"]