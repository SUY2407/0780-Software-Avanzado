FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

# Quitamos la config por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos nuestra config de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build generado por Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]