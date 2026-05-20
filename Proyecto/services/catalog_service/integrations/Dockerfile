FROM golang:1.23

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o integrations .

EXPOSE 8082

CMD ["./integrations"]
