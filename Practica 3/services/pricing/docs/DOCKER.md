# Contenerización con Docker – QuetzalShip

## Objetivo
Docker permite ejecutar el sistema completo de forma reproducible
sin depender del entorno local del desarrollador.

## Dockerfiles
Cada componente cuenta con su propio Dockerfile:

- services/frontend/Dockerfile
- services/gateway/Dockerfile
- services/orders/Dockerfile
- services/pricing/Dockerfile
- services/receipt/Dockerfile

Se utiliza una estrategia multi-stage para reducir el tamaño final
de las imágenes.

## Docker Compose
Docker Compose orquesta los cinco servicios del sistema.

Servicios expuestos al host:
- Frontend
- API Gateway

Los servicios internos se comunican mediante una red privada.

## Healthchecks
Cada servicio define un healthcheck que permite a Docker
verificar su estado antes de aceptar tráfico.

## Ejecución
El sistema completo se ejecuta con:

docker compose up --build
