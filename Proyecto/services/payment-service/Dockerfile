FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -ldflags="-w -s" -o payment-service ./server

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/payment-service .

EXPOSE 8082 8000

CMD ["./payment-service"]