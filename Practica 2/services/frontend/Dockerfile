# Stage 1: Build
FROM node:18-alpine as build
WORKDIR /app
# Copiamos desde la raíz del contexto (ajustado en docker-compose)
COPY services/frontend/package*.json ./
RUN npm ci
COPY services/frontend ./
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
# Instalar curl para healthcheck
RUN apk --no-cache add curl
COPY --from=build /app/dist /usr/share/nginx/html
COPY services/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
