# Arquitectura del Sistema – QuetzalShip

## Visión General
QuetzalShip implementa una arquitectura de microservicios orientada a responsabilidades
de negocio claramente delimitadas, evitando el antipatrón de microservicios por capas.

La solución está compuesta por cinco componentes ejecutándose en contenedores
independientes y comunicándose bajo reglas estrictas de frontera.

## Componentes

### Frontend
- Implementado con Vite + TypeScript.
- Provee una SPA para interacción del usuario.
- Consume exclusivamente el API Gateway vía REST.
- No tiene conocimiento directo de los microservicios internos.

### API Gateway
- Implementado con NestJS.
- Expone endpoints REST documentados con OpenAPI.
- Orquesta las operaciones del sistema.
- Traduce REST → gRPC para comunicación interna.

### Orders Service
- Responsable del ciclo de vida de las órdenes.
- Mantiene las órdenes en memoria.
- Invoca al Pricing Service durante la creación de órdenes.
- Almacena el desglose tarifario y el total calculado.

### Pricing Service
- Servicio dedicado exclusivamente al cálculo tarifario.
- Implementa reglas deterministas y reproducibles.
- No mantiene estado.
- Retorna siempre el mismo resultado ante la misma entrada.

### Receipt Service
- Genera recibos estables basados en la información persistida en Orders.
- No recalcula valores.
- Garantiza consistencia con el total almacenado.

## Comunicación entre Servicios
- Frontend → Gateway: HTTP REST
- Gateway → Orders / Receipt: gRPC
- Orders → Pricing: gRPC

No se permite comunicación REST entre microservicios ni acceso directo del frontend
a servicios internos.

## Contenerización
Cada componente cuenta con su propio Dockerfile y se orquesta mediante
Docker Compose, exponiendo únicamente Frontend y Gateway al host.
