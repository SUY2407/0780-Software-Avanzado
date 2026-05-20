FROM node:18-alpine As build
WORKDIR /app

# Argumento de construcción para saber qué servicio compilar (gateway, orders, etc.)
ARG SERVICE_NAME

# 1. Copiar package.json del servicio específico
COPY services/${SERVICE_NAME}/package*.json ./

# 2. Instalar dependencias
RUN npm ci

# 3. Copiar la carpeta contracts (COMPARTIDA)
COPY contracts ./contracts

# 4. Copiar el código fuente del servicio
COPY services/${SERVICE_NAME} ./src

# 5. Build (NestJS buscará contracts en ../../contracts, lo cual ahora es correcto en /app)
# Movemos src al nivel esperado por Nest si es necesario, o ajustamos tsconfig. 
# Truco: NestJS por defecto compila lo que está en su root.
# Al copiar a ./src, estamos simulando la raiz del servicio.
# PERO: Los imports relativos ../../../contracts fallarán si no están en su lugar.
# ESTRATEGIA: Recrear estructura exacta del monorepo dentro del contenedor.

WORKDIR /usr/src/monorepo
COPY contracts ./contracts
COPY services/${SERVICE_NAME} ./services/${SERVICE_NAME}

WORKDIR /usr/src/monorepo/services/${SERVICE_NAME}
# Instalamos dependencias AQUÍ, en la carpeta del servicio
RUN npm ci
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:18-alpine As production
RUN apk --no-cache add curl
ARG SERVICE_NAME

WORKDIR /usr/src/monorepo
# Copiamos solo lo necesario para producción manteniendo estructura
COPY contracts ./contracts
COPY services/${SERVICE_NAME}/package*.json ./services/${SERVICE_NAME}/

WORKDIR /usr/src/monorepo/services/${SERVICE_NAME}
RUN npm ci --omit=dev

# Copiar el build desde la etapa anterior
COPY --from=build /usr/src/monorepo/services/${SERVICE_NAME}/dist ./dist

CMD ["node", "dist/main"]